/**
 * Mission briefing sitrep narration via the browser Web Speech API.
 * Prefers Microsoft Zira (Cortana-like); hard-cancelable on briefing exit.
 */
import { getEffectiveMenuVoVolume } from '@/lib/portfolioAudioSettings'

const SPEECH_RATE = 1.08
const SPEECH_PITCH = 1.02

/** Higher score = clearer UNSC sitrep VO (same Web Speech stack as mission briefs). */
function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = `${voice.name} ${voice.voiceURI}`.toLowerCase()
  const lang = voice.lang.toLowerCase()
  let score = 0

  // Prefer natural / neural voices when the OS exposes them; Zira remains a strong fallback.
  if (name.includes('neural') || name.includes('natural')) score += 110
  else if (name.includes('aria') || name.includes('jenny') || name.includes('sara')) score += 100
  else if (name.includes('cortana')) score += 95
  else if (name.includes('zira')) score += 88
  else if (name.includes('linda') || name.includes('hazel') || name.includes('susan')) score += 70
  else if (name.includes('natasha') || name.includes('samantha') || name.includes('karen')) score += 60
  else if (name.includes('google') && name.includes('female')) score += 75

  if (lang.startsWith('en-us')) score += 20
  else if (lang.startsWith('en-gb') || lang.startsWith('en-ca') || lang.startsWith('en-au')) score += 12
  else if (lang.startsWith('en')) score += 8

  if (name.includes('microsoft')) score += 10
  if (name.includes('google')) score += 8
  // Online voices are often clearer than locked desktop SAPI voices.
  if (!voice.localService) score += 18
  else score += 6
  if (/\b(female|zira|aria|jenny|sara|hazel|susan|linda|samantha|karen)\b/.test(name)) score += 8

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

/**
 * Rewrite reply text so Web Speech does not spell URLs, paths, or filenames
 * character-by-character (sounds like a screen reader / bot).
 */
export function sanitizeForSpeech(text: string): string {
  let s = text

  s = s.replace(/https?:\/\/christiandennis\.vercel\.app\/?/gi, "Christian's portfolio site")
  s = s.replace(/https?:\/\/github\.com\/ChristianDenniss\/?/gi, 'his GitHub')
  s = s.replace(/https?:\/\/volleyball4-2\.com\/?/gi, 'the Volleyball 4-2 site')
  s = s.replace(/https?:\/\/unbsj-parking\.vercel\.app\/?/gi, 'the parking digital twin demo')
  s = s.replace(
    /https?:\/\/statnormalizevectorize3dpca\.vercel\.app\/?/gi,
    'the Stats 3D PCA demo'
  )
  s = s.replace(/https?:\/\/zenodo\.org\/records\/\d+\/?/gi, 'his Zenodo paper')
  s = s.replace(
    /https?:\/\/apps\.apple\.com\/[^\s)]+/gi,
    'the MaddyApp listing on the App Store'
  )
  s = s.replace(
    /\/assets\/ChristianDennis_SoftwareEngineer_Resume2026\.pdf/gi,
    'his resume PDF'
  )
  s = s.replace(/ChristianDennis_SoftwareEngineer_Resume2026\.pdf/gi, 'his resume PDF')

  // Generic http(s) links → host spoken as words, not slash-by-slash.
  s = s.replace(/https?:\/\/[^\s)\]>'"]+/gi, (url) => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, '')
      return `a link to ${host.replace(/\./g, ' dot ')}`
    } catch {
      return 'a link'
    }
  })

  // Bare file paths / extensions the model sometimes dumps.
  s = s.replace(/\/(?:assets|images|models|sounds|files)\/[\w./-]+/gi, (path) => {
    const base = path.split('/').pop() || 'file'
    return base.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ')
  })
  s = s.replace(/\b[\w-]+\.(?:pdf|png|jpe?g|webp|glb|mp3|mp4|tsx?|jsx?)\b/gi, (file) =>
    file.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ')
  )

  // Route crumbs — speak the page, not the path.
  s = s.replace(/\/about\?section=experience\b/gi, 'Campaigns')
  s = s.replace(/\/about\?section=skills\b/gi, 'Loadout')
  s = s.replace(/\/about\?section=education\b/gi, 'Training')
  s = s.replace(/\/about\?section=awards\b/gi, 'Commendations')
  s = s.replace(/\/about\?section=about\b/gi, 'About')
  s = s.replace(/\b\/projects\b/gi, 'Missions')
  s = s.replace(/\b\/contact\b/gi, 'Contact')
  s = s.replace(/\b\/settings\b/gi, 'Settings')

  s = s.replace(/[\w.+-]+@[\w.-]+\.\w+/g, (email) => {
    const [user, domain] = email.split('@')
    if (!user || !domain) return 'an email address'
    return `${user.replace(/\./g, ' dot ')} at ${domain.replace(/\./g, ' dot ')}`
  })

  // Phone: keep digits grouped, avoid digit-spam cadence a bit.
  s = s.replace(/\+?1?\s*\(?\d{3}\)?[\s.-]*\d{3}[\s.-]*\d{4}/g, (phone) => {
    const d = phone.replace(/\D/g, '')
    if (d.length === 11 && d.startsWith('1')) {
      return `${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7)}`
    }
    if (d.length === 10) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
    return phone
  })

  return s.replace(/\s+/g, ' ').trim()
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

/** Slice the current spoken word from sitrep text using a Web Speech boundary. */
export function wordFromBoundary(text: string, charIndex: number, charLength: number): string {
  if (charLength > 0) {
    return text.slice(charIndex, charIndex + charLength)
  }
  const end = revealIndexFromBoundary(text, charIndex, 0)
  return text.slice(charIndex, end)
}

/**
 * Rough English syllable count for jaw pulses (not a full phonology parser).
 * "industry" → 3, "roles" → 1, "facial" → 2.
 */
export function countSyllables(word: string): number {
  const w = word
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '')
  if (!w) return 1
  const groups = w.match(/[aeiouy]{1,2}/g)
  return Math.max(1, groups?.length ?? 1)
}
