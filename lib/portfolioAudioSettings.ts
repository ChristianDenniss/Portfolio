/**
 * User-adjustable mix levels for portfolio audio. Persisted in `localStorage`.
 * Effective gains: `clamp01(base * master * channel)` per category, or 0 when muted.
 */

declare global {
  interface Window {
    __portfolioThemeAudio?: HTMLAudioElement
  }
}

const STORAGE_KEY = 'portfolio-audio-settings-v2'
const LEGACY_STORAGE_KEY = 'portfolio-audio-settings-v1'

export const PORTFOLIO_THEME_BASE_VOLUME = 0.7

export const PORTFOLIO_AUDIO_SETTINGS_CHANGED_EVENT = 'portfolio-audio-settings-changed'

export type PortfolioAudioSettings = {
  master: number
  theme: number
  menuVo: number
  uiSounds: number
  /** When true, all effective volumes are forced to 0. Channel levels are preserved. */
  muted: boolean
}

export const DEFAULT_PORTFOLIO_AUDIO_SETTINGS: PortfolioAudioSettings = {
  master: 1,
  theme: 1,
  menuVo: 1,
  uiSounds: 1,
  muted: false
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0
  return Math.min(1, Math.max(0, n))
}

function normalizeSettings(parsed: Partial<PortfolioAudioSettings>): PortfolioAudioSettings {
  return {
    master: clamp01(typeof parsed.master === 'number' ? parsed.master : DEFAULT_PORTFOLIO_AUDIO_SETTINGS.master),
    theme: clamp01(typeof parsed.theme === 'number' ? parsed.theme : DEFAULT_PORTFOLIO_AUDIO_SETTINGS.theme),
    menuVo: clamp01(typeof parsed.menuVo === 'number' ? parsed.menuVo : DEFAULT_PORTFOLIO_AUDIO_SETTINGS.menuVo),
    uiSounds: clamp01(typeof parsed.uiSounds === 'number' ? parsed.uiSounds : DEFAULT_PORTFOLIO_AUDIO_SETTINGS.uiSounds),
    muted: typeof parsed.muted === 'boolean' ? parsed.muted : DEFAULT_PORTFOLIO_AUDIO_SETTINGS.muted
  }
}

export function readPortfolioAudioSettings(): PortfolioAudioSettings {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PORTFOLIO_AUDIO_SETTINGS }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PORTFOLIO_AUDIO_SETTINGS }
    return normalizeSettings(JSON.parse(raw) as Partial<PortfolioAudioSettings>)
  } catch {
    return { ...DEFAULT_PORTFOLIO_AUDIO_SETTINGS }
  }
}

export function writePortfolioAudioSettings(partial: Partial<PortfolioAudioSettings>): void {
  if (typeof window === 'undefined') return
  const cur = readPortfolioAudioSettings()
  const next = normalizeSettings({
    master: partial.master ?? cur.master,
    theme: partial.theme ?? cur.theme,
    menuVo: partial.menuVo ?? cur.menuVo,
    uiSounds: partial.uiSounds ?? cur.uiSounds,
    muted: partial.muted ?? cur.muted
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  // Drop legacy key after a successful v2 write so mute/schema stay authoritative.
  localStorage.removeItem(LEGACY_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(PORTFOLIO_AUDIO_SETTINGS_CHANGED_EVENT))
  applyPortfolioAudioLevelsToPlayers()
}

export function resetPortfolioAudioSettings(): void {
  writePortfolioAudioSettings({ ...DEFAULT_PORTFOLIO_AUDIO_SETTINGS })
}

export function getEffectiveThemeVolume(): number {
  const s = readPortfolioAudioSettings()
  if (s.muted) return 0
  return clamp01(PORTFOLIO_THEME_BASE_VOLUME * s.master * s.theme)
}

export function getEffectiveMenuVoVolume(clipBase = 1): number {
  const s = readPortfolioAudioSettings()
  if (s.muted) return 0
  return clamp01(clipBase * s.master * s.menuVo)
}

export function getEffectiveUiVolume(clipBase = 1): number {
  const s = readPortfolioAudioSettings()
  if (s.muted) return 0
  return clamp01(clipBase * s.master * s.uiSounds)
}

/** Re-apply theme level from saved settings (e.g. after slider change while music is playing). */
export function applyPortfolioAudioLevelsToPlayers(): void {
  if (typeof window === 'undefined') return
  const el = window.__portfolioThemeAudio
  if (!el) return
  el.volume = getEffectiveThemeVolume()
}
