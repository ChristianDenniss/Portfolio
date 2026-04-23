/**
 * Shared SFX for in-app navigation. Uses the same cache as {@link components/Hero.tsx}
 * (`window.__portfolioSfxAudioMap`) so clips stay deduped across routes.
 */
declare global {
  interface Window {
    __portfolioSfxAudioMap?: Record<string, HTMLAudioElement>
  }
}

/** `transition_beeps3.wav` — Halo main menu + About “Topics” submenu. */
const TRANSITION_BEEPS3_PATH = '/sounds/transition_beeps3.wav'
/** `transition_beeps2.wav` — About page top row (About Me / Skills / …), distinct from topics. */
const TRANSITION_BEEPS2_PATH = '/sounds/transition_beeps2.wav'
const TRANSITION_VOLUME = 0.8

const BACK_TO_MENU_SOUND_PATH = '/sounds/back1.wav'
const BACK_TO_MENU_VOLUME = 1

function getOrCreateSfx(soundPath: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  if (!window.__portfolioSfxAudioMap) {
    window.__portfolioSfxAudioMap = {}
  }
  if (!window.__portfolioSfxAudioMap[soundPath]) {
    const audio = new Audio(soundPath)
    audio.preload = 'auto'
    audio.load()
    window.__portfolioSfxAudioMap[soundPath] = audio
  }
  return window.__portfolioSfxAudioMap[soundPath] ?? null
}

function playCachedSfx(soundPath: string, volume: number): void {
  const audio = getOrCreateSfx(soundPath)
  if (!audio) return
  audio.currentTime = 0
  audio.volume = volume
  void audio.play().catch(() => {
    // Ignore rapid clicks / autoplay policies.
  })
}

/** Main menu (`Hero`) and About “Topics” submenu — `transition_beeps3.wav`. */
export function playPortfolioTransitionSound(): void {
  playCachedSfx(TRANSITION_BEEPS3_PATH, TRANSITION_VOLUME)
}

/** About page top tabs (About Me / Skills / …) — `transition_beeps2.wav`, distinct from Topics. */
export function playPortfolioAboutSectionTabTransitionSound(): void {
  playCachedSfx(TRANSITION_BEEPS2_PATH, TRANSITION_VOLUME)
}

/** `back1.wav` — played when leaving a sub-page for the main menu. */
export function playPortfolioBackToMenuSound(): void {
  playCachedSfx(BACK_TO_MENU_SOUND_PATH, BACK_TO_MENU_VOLUME)
}
