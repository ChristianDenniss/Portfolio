/**
 * User-adjustable mix levels for portfolio audio. Persisted in `localStorage`.
 * Effective gains: `clamp01(base * master * channel)` per category.
 */

declare global {
  interface Window {
    __portfolioThemeAudio?: HTMLAudioElement
  }
}

const STORAGE_KEY = 'portfolio-audio-settings-v1'

export const PORTFOLIO_THEME_BASE_VOLUME = 0.7

export const PORTFOLIO_AUDIO_SETTINGS_CHANGED_EVENT = 'portfolio-audio-settings-changed'

export type PortfolioAudioSettings = {
  master: number
  theme: number
  menuVo: number
  uiSounds: number
}

const DEFAULT: PortfolioAudioSettings = {
  master: 1,
  theme: 1,
  menuVo: 1,
  uiSounds: 1
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0
  return Math.min(1, Math.max(0, n))
}

export function readPortfolioAudioSettings(): PortfolioAudioSettings {
  if (typeof window === 'undefined') {
    return { ...DEFAULT }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT }
    const parsed = JSON.parse(raw) as Partial<PortfolioAudioSettings>
    return {
      master: clamp01(typeof parsed.master === 'number' ? parsed.master : DEFAULT.master),
      theme: clamp01(typeof parsed.theme === 'number' ? parsed.theme : DEFAULT.theme),
      menuVo: clamp01(typeof parsed.menuVo === 'number' ? parsed.menuVo : DEFAULT.menuVo),
      uiSounds: clamp01(typeof parsed.uiSounds === 'number' ? parsed.uiSounds : DEFAULT.uiSounds)
    }
  } catch {
    return { ...DEFAULT }
  }
}

export function writePortfolioAudioSettings(partial: Partial<PortfolioAudioSettings>): void {
  if (typeof window === 'undefined') return
  const cur = readPortfolioAudioSettings()
  const next: PortfolioAudioSettings = {
    master: clamp01(partial.master ?? cur.master),
    theme: clamp01(partial.theme ?? cur.theme),
    menuVo: clamp01(partial.menuVo ?? cur.menuVo),
    uiSounds: clamp01(partial.uiSounds ?? cur.uiSounds)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(PORTFOLIO_AUDIO_SETTINGS_CHANGED_EVENT))
  applyPortfolioAudioLevelsToPlayers()
}

export function getEffectiveThemeVolume(): number {
  const s = readPortfolioAudioSettings()
  return clamp01(PORTFOLIO_THEME_BASE_VOLUME * s.master * s.theme)
}

export function getEffectiveMenuVoVolume(clipBase = 1): number {
  const s = readPortfolioAudioSettings()
  return clamp01(clipBase * s.master * s.menuVo)
}

export function getEffectiveUiVolume(clipBase = 1): number {
  const s = readPortfolioAudioSettings()
  return clamp01(clipBase * s.master * s.uiSounds)
}

/** Re-apply theme level from saved settings (e.g. after slider change while music is playing). */
export function applyPortfolioAudioLevelsToPlayers(): void {
  if (typeof window === 'undefined') return
  const el = window.__portfolioThemeAudio
  if (!el) return
  el.volume = getEffectiveThemeVolume()
}
