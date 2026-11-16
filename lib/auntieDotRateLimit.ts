/**
 * Multi-tier in-memory abuse controls for Cortana (per IP).
 * Survives panel close/reopen; resets only on server cold start.
 */
import {
  AUNTIE_DOT_BURST_MAX,
  AUNTIE_DOT_BURST_WINDOW_MS,
  AUNTIE_DOT_DAILY_MAX,
  AUNTIE_DOT_DAILY_WINDOW_MS,
  AUNTIE_DOT_HOURLY_MAX,
  AUNTIE_DOT_HOURLY_WINDOW_MS,
  AUNTIE_DOT_MIN_GAP_MS
} from '@/lib/auntieDotLimits'

type Bucket = {
  timestamps: number[]
  lastAcceptedAt: number
  recentHashes: { hash: string; at: number }[]
}

const buckets = new Map<string, Bucket>()

export type AuntieDotLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; code: 'burst' | 'hourly' | 'daily' | 'gap' | 'duplicate' }

function prune(timestamps: number[], now: number, windowMs: number): number[] {
  return timestamps.filter((t) => now - t < windowMs)
}

function countInWindow(timestamps: number[], now: number, windowMs: number): number {
  return timestamps.reduce((n, t) => (now - t < windowMs ? n + 1 : n), 0)
}

function simpleHash(text: string): string {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16)
}

export function auntieDotRateLimit(
  key: string,
  options?: { messageText?: string }
): AuntieDotLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key) ?? { timestamps: [], lastAcceptedAt: 0, recentHashes: [] }
  bucket.timestamps = prune(bucket.timestamps, now, AUNTIE_DOT_DAILY_WINDOW_MS)
  bucket.recentHashes = bucket.recentHashes.filter((entry) => now - entry.at < AUNTIE_DOT_HOURLY_WINDOW_MS)

  if (bucket.lastAcceptedAt > 0 && now - bucket.lastAcceptedAt < AUNTIE_DOT_MIN_GAP_MS) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((AUNTIE_DOT_MIN_GAP_MS - (now - bucket.lastAcceptedAt)) / 1000)
    )
    buckets.set(key, bucket)
    return { ok: false, retryAfterSec, code: 'gap' }
  }

  const normalized = options?.messageText?.trim().toLowerCase()
  if (normalized && normalized.length >= 2) {
    const hash = simpleHash(normalized)
    const dup = bucket.recentHashes.find((entry) => entry.hash === hash && now - entry.at < 30_000)
    if (dup) {
      buckets.set(key, bucket)
      return { ok: false, retryAfterSec: 30, code: 'duplicate' }
    }
  }

  const burstCount = countInWindow(bucket.timestamps, now, AUNTIE_DOT_BURST_WINDOW_MS)
  if (burstCount >= AUNTIE_DOT_BURST_MAX) {
    const oldestBurst =
      bucket.timestamps.find((t) => now - t < AUNTIE_DOT_BURST_WINDOW_MS) ?? now
    const retryAfterSec = Math.max(
      1,
      Math.ceil((AUNTIE_DOT_BURST_WINDOW_MS - (now - oldestBurst)) / 1000)
    )
    buckets.set(key, bucket)
    return { ok: false, retryAfterSec, code: 'burst' }
  }

  const hourlyCount = countInWindow(bucket.timestamps, now, AUNTIE_DOT_HOURLY_WINDOW_MS)
  if (hourlyCount >= AUNTIE_DOT_HOURLY_MAX) {
    const oldestHour =
      bucket.timestamps.find((t) => now - t < AUNTIE_DOT_HOURLY_WINDOW_MS) ?? now
    const retryAfterSec = Math.max(
      1,
      Math.ceil((AUNTIE_DOT_HOURLY_WINDOW_MS - (now - oldestHour)) / 1000)
    )
    buckets.set(key, bucket)
    return { ok: false, retryAfterSec, code: 'hourly' }
  }

  const dailyCount = bucket.timestamps.length
  if (dailyCount >= AUNTIE_DOT_DAILY_MAX) {
    const oldest = bucket.timestamps[0] ?? now
    const retryAfterSec = Math.max(
      1,
      Math.ceil((AUNTIE_DOT_DAILY_WINDOW_MS - (now - oldest)) / 1000)
    )
    buckets.set(key, bucket)
    return { ok: false, retryAfterSec, code: 'daily' }
  }

  bucket.timestamps.push(now)
  bucket.lastAcceptedAt = now
  if (normalized && normalized.length >= 2) {
    bucket.recentHashes.push({ hash: simpleHash(normalized), at: now })
    if (bucket.recentHashes.length > 40) {
      bucket.recentHashes = bucket.recentHashes.slice(-40)
    }
  }
  buckets.set(key, bucket)
  return { ok: true }
}

export function clientKeyFromRequest(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = req.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  return 'unknown'
}

export function limitMessageForCode(
  code: 'burst' | 'hourly' | 'daily' | 'gap' | 'duplicate'
): string {
  switch (code) {
    case 'gap':
      return 'Channel locked // Slow down'
    case 'burst':
      return 'Channel congested // Too many queries'
    case 'hourly':
      return 'Channel capped // Hourly limit reached'
    case 'daily':
      return 'Channel capped // Daily limit reached'
    case 'duplicate':
      return 'Echo rejected // Repeat packet'
    default:
      return 'Channel congested // Retry shortly'
  }
}
