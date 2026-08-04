'use client'

import { useEffect } from 'react'

import {
  PORTFOLIO_WARM_CURSORS,
  PORTFOLIO_WARM_FONTS,
  PORTFOLIO_WARM_LOGOS,
  PORTFOLIO_WARM_PROJECT_IMAGES,
  PORTFOLIO_WARM_RESUME,
  PORTFOLIO_WARM_STORY_IMAGES
} from '@/lib/portfolioWarmAssets'
import { PORTFOLIO_IDLE_WARM_SFX, warmPortfolioSfx } from '@/lib/portfolioSfx'

const START_DELAY_MS = 1800
const STAGGER_MS = 45
const CONCURRENCY = 3

type NetworkInformationLike = {
  saveData?: boolean
  effectiveType?: string
}

function shouldSkipHeavyWarm(): boolean {
  if (typeof navigator === 'undefined') return false
  const conn = (navigator as Navigator & { connection?: NetworkInformationLike }).connection
  if (conn?.saveData) return true
  const type = conn?.effectiveType
  return type === 'slow-2g' || type === '2g'
}

function scheduleIdle(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(() => cb(), { timeout: 2500 })
    return () => window.cancelIdleCallback(id)
  }
  const t = window.setTimeout(cb, 400)
  return () => window.clearTimeout(t)
}

function warmImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

function warmFetch(url: string): Promise<void> {
  return fetch(url, { cache: 'force-cache', credentials: 'same-origin' })
    .then(() => undefined)
    .catch(() => undefined)
}

async function runQueue(urls: readonly string[], cancelled: () => boolean): Promise<void> {
  let i = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, urls.length) }, async () => {
    while (!cancelled() && i < urls.length) {
      const idx = i++
      const url = urls[idx]
      if (!url) break
      if (document.visibilityState === 'hidden') {
        await new Promise<void>((r) => {
          const onVis = () => {
            if (document.visibilityState === 'visible') {
              document.removeEventListener('visibilitychange', onVis)
              r()
            }
          }
          document.addEventListener('visibilitychange', onVis)
        })
      }
      if (cancelled()) break
      await warmImage(url)
      if (STAGGER_MS > 0) {
        await new Promise((r) => setTimeout(r, STAGGER_MS))
      }
    }
  })
  await Promise.all(workers)
}

/**
 * After first paint, warm remaining SFX + images + fonts + resume into the HTTP cache.
 * Routes and menu videos are warmed by sibling components; theme/menu VO stay owned by Hero.
 */
export function PortfolioAssetWarmCache() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let cancelled = false
    let idleCancel = () => {}
    const startTimer = window.setTimeout(() => {
      idleCancel = scheduleIdle(() => {
        void (async () => {
          if (cancelled) return

          // Small SFX first - shared map with Hero / portfolioSfx.
          warmPortfolioSfx(PORTFOLIO_IDLE_WARM_SFX)

          // Fonts + resume via fetch (not Image()).
          for (const font of PORTFOLIO_WARM_FONTS) {
            if (cancelled) return
            await warmFetch(font.href)
          }
          if (cancelled) return
          await warmFetch(PORTFOLIO_WARM_RESUME)

          const lightImages = [...PORTFOLIO_WARM_CURSORS, ...PORTFOLIO_WARM_LOGOS]
          await runQueue(lightImages, () => cancelled)
          if (cancelled) return

          if (shouldSkipHeavyWarm()) return

          await runQueue(PORTFOLIO_WARM_PROJECT_IMAGES, () => cancelled)
          if (cancelled) return
          await runQueue(PORTFOLIO_WARM_STORY_IMAGES, () => cancelled)
        })()
      })
    }, START_DELAY_MS)

    return () => {
      cancelled = true
      window.clearTimeout(startTimer)
      idleCancel()
    }
  }, [])

  return null
}
