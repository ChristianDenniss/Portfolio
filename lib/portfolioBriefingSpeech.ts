/**
 * Mission briefing sitrep narration via the browser Web Speech API.
 * Prefers Microsoft Zira (Cortana-like); hard-cancelable on briefing exit.
 */
import { getEffectiveMenuVoVolume } from '@/lib/portfolioAudioSettings'

const SPEECH_RATE = 1.2
const SPEECH_PITCH = 1

/** Higher score = better Cortana-mimic for UNSC sitrep VO. */
function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = `${voice.name} ${voice.voiceURI}`.toLowerCase()
  const lang = voice.lang.toLowerCase()
  let score = 0

  if (name.includes('zira')) score += 100
  else if (name.includes('cortana')) score += 95
  else if (name.includes('aria') || name.includes('jenny')) score += 80
  else if (name.includes('sara') || name.includes('natasha') || name.includes('linda')) score += 55

  if (lang.startsWith('en-us')) score += 20
  else if (lang.startsWith('en-gb') || lang.startsWith('en-ca')) score += 12
  else if (lang.startsWith('en')) score += 8

  if (name.includes('microsoft')) score += 10
  if (voice.localService) score += 15
  // Prefer female-coded names when gender is not exposed by the API.
  if (/\b(female|zira|aria|jenny|sara|hazel|susan|linda)\b/.test(name)) score += 8

  return score
}

function pickBriefingVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null
  const ranked = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))
  return ranked[0] ?? null
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return Promise.resolve([])
  }

  const synth = window.speechSynthesis
  const existing = synth.getVoices()
  if (existing.length > 0) return Promise.resolve(existing)

  return new Promise((resolve) => {
    let settled = false
    const finish = (list: SpeechSynthesisVoice[]) => {
      if (settled) return
      settled = true
      synth.removeEventListener('voiceschanged', onChanged)
      resolve(list)
    }
    const onChanged = () => finish(synth.getVoices())
    synth.addEventListener('voiceschanged', onChanged)
    window.setTimeout(() => finish(synth.getVoices()), 400)
  })
}

export type SpeakBriefingSitrepOptions = {
  text: string
  onBoundary?: (charIndex: number, charLength: number) => void
  onEnd?: () => void
  onError?: () => void
}

let speakGeneration = 0

export function cancelBriefingSpeech(): void {
  speakGeneration += 1
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    // ignore
  }
}

export function isBriefingSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined'
}

/**
 * Speaks sitrep text. Returns false if speech was skipped (no API / muted / empty).
 * Call {@link cancelBriefingSpeech} on every briefing exit path.
 */
export async function speakBriefingSitrep(options: SpeakBriefingSitrepOptions): Promise<boolean> {
  const text = options.text.trim()
  // Skip without onError — caller falls back to typewriter. Avoids double-start on mute.
  if (!text || !isBriefingSpeechAvailable()) {
    return false
  }

  const volume = getEffectiveMenuVoVolume(1)
  if (volume <= 0) {
    return false
  }

  cancelBriefingSpeech()
  const generation = speakGeneration
  const voices = await loadVoices()

  // Canceled while waiting for voices.
  if (generation !== speakGeneration) return false

  const utterance = new SpeechSynthesisUtterance(text)
  const voice = pickBriefingVoice(voices)
  if (voice) utterance.voice = voice
  utterance.rate = SPEECH_RATE
  utterance.pitch = SPEECH_PITCH
  utterance.volume = volume
  utterance.lang = voice?.lang || 'en-US'

  const stillCurrent = () => generation === speakGeneration

  utterance.onboundary = (event) => {
    if (!stillCurrent()) return
    // Zira emits a leading `sentence` boundary; only drive reveal from words.
    if (event.name && event.name !== 'word') return
    const charIndex = typeof event.charIndex === 'number' ? event.charIndex : 0
    const charLength = typeof event.charLength === 'number' ? event.charLength : 0
    options.onBoundary?.(charIndex, charLength)
  }

  utterance.onend = () => {
    if (!stillCurrent()) return
    options.onEnd?.()
  }

  utterance.onerror = (event) => {
    if (!stillCurrent()) return
    // `cancel()` surfaces as interrupted/canceled — not a real failure.
    const err = typeof event.error === 'string' ? event.error : ''
    if (err === 'interrupted' || err === 'canceled') return
    options.onError?.()
  }

  try {
    window.speechSynthesis.speak(utterance)
    // Chrome can stall utterances in a paused state; nudge if needed.
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
    return true
  } catch {
    options.onError?.()
    return false
  }
}

/** Reveal through the end of the current spoken word (or to charIndex if length unknown). */
export function revealIndexFromBoundary(
  text: string,
  charIndex: number,
  charLength: number
): number {
  if (charLength > 0) {
    return Math.min(text.length, charIndex + charLength)
  }
  let end = charIndex
  while (end < text.length && !/\s/.test(text[end]!)) end += 1
  return end > charIndex ? end : Math.min(text.length, charIndex)
}
