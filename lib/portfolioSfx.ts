/**
 * Shared SFX for in-app navigation. Uses the same cache as {@link components/Hero.tsx}
 * (`window.__portfolioSfxAudioMap`) so clips stay deduped across routes.
 */
import { getEffectiveThemeVolume, getEffectiveUiVolume } from '@/lib/portfolioAudioSettings'

declare global {
  interface Window {
    __portfolioSfxAudioMap?: Record<string, HTMLAudioElement>
    __portfolioThemeAudio?: HTMLAudioElement
    /** True while mission briefing has ducked theme volume. */
    __portfolioBriefingThemeDucked?: boolean
  }
}

/** `transition_beeps3.wav`: Halo main menu + About Intel submenu. */
export const TRANSITION_BEEPS3_PATH = '/sounds/transition_beeps3.wav'
/** `transition_beeps2.wav`: About page top row (Personnel File / Loadout / …), distinct from Intel. */
export const TRANSITION_BEEPS2_PATH = '/sounds/transition_beeps2.wav'
const TRANSITION_VOLUME = 0.8

export const BACK_TO_MENU_SOUND_PATH = '/sounds/back1.wav'
const BACK_TO_MENU_VOLUME = 1

/** About Skills capability blocks: grab (unused elsewhere in the app). */
export const SKILL_BLOCK_GRAB_PATH = '/sounds/transition_beeps4.wav'
const SKILL_BLOCK_GRAB_VOLUME = 0.65
/** About Skills capability blocks: drop after reorder (`bumper5.wav`, same asset as main-menu nav bump). */
export const SKILL_BLOCK_DROP_PATH = '/sounds/bumper5.wav'
const SKILL_BLOCK_DROP_VOLUME = 0.42

/** UI SFX that Hero does not preload - warm these on idle for instant About / Back clicks. */
export const BRIEFING_TYPE_TICK_PATH = '/sounds/buttonClick.wav'

export const PORTFOLIO_IDLE_WARM_SFX = [
  TRANSITION_BEEPS3_PATH,
  TRANSITION_BEEPS2_PATH,
  BACK_TO_MENU_SOUND_PATH,
  SKILL_BLOCK_GRAB_PATH,
  SKILL_BLOCK_DROP_PATH,
  BRIEFING_TYPE_TICK_PATH
] as const

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

/** Ensure clips exist in the shared map (no play). Safe to call repeatedly. */
export function warmPortfolioSfx(soundPaths: readonly string[]): void {
  for (const path of soundPaths) {
    getOrCreateSfx(path)
  }
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

/** Main menu (`Hero`) and About Intel submenu: `transition_beeps3.wav`. */
export function playPortfolioTransitionSound(): void {
  playCachedSfx(TRANSITION_BEEPS3_PATH, getEffectiveUiVolume(TRANSITION_VOLUME))
}

/** About page top tabs (Personnel File / Loadout / …): `transition_beeps2.wav`, distinct from Intel. */
export function playPortfolioAboutSectionTabTransitionSound(): void {
  playCachedSfx(TRANSITION_BEEPS2_PATH, getEffectiveUiVolume(TRANSITION_VOLUME))
}

/** `back1.wav`: played when leaving a sub-page for the main menu. */
export function playPortfolioBackToMenuSound(): void {
  playCachedSfx(BACK_TO_MENU_SOUND_PATH, getEffectiveUiVolume(BACK_TO_MENU_VOLUME))
}

/** Skills tab: building block picked up (drag start). */
export function playPortfolioSkillBlockGrabSound(): void {
  playCachedSfx(SKILL_BLOCK_GRAB_PATH, getEffectiveUiVolume(SKILL_BLOCK_GRAB_VOLUME))
}

/** Skills tab: block released into a new slot. */
export function playPortfolioSkillBlockDropSound(): void {
  playCachedSfx(SKILL_BLOCK_DROP_PATH, getEffectiveUiVolume(SKILL_BLOCK_DROP_VOLUME))
}

/** Mission briefing sitrep typing ticks (`buttonClick.wav`). */
const BRIEFING_TYPE_TICK_VOLUME = 0.22

/** Quiet (do not mute) theme while a briefing is open. */
const BRIEFING_THEME_DUCK = 0.28
let briefingThemeDuckDepth = 0
let briefingThemePreDuck: number | null = null

export function playPortfolioBriefingTypeTick(): void {
  // Clone so rapid ticks can overlap instead of cutting each other off.
  if (typeof window === 'undefined') return
  const vol = getEffectiveUiVolume(BRIEFING_TYPE_TICK_VOLUME)
  if (vol <= 0) return
  const base = getOrCreateSfx(BRIEFING_TYPE_TICK_PATH)
  if (!base) return
  const tick = base.cloneNode(true) as HTMLAudioElement
  tick.volume = vol
  void tick.play().catch(() => {})
}

export function duckThemeForMissionBriefing(): void {
  if (typeof window === 'undefined') return
  const theme = window.__portfolioThemeAudio
  if (!theme) return
  if (briefingThemeDuckDepth === 0) {
    briefingThemePreDuck = theme.volume
  }
  briefingThemeDuckDepth += 1
  window.__portfolioBriefingThemeDucked = true
  const base = briefingThemePreDuck ?? getEffectiveThemeVolume()
  theme.volume = Math.max(0, Math.min(1, base * BRIEFING_THEME_DUCK))
}

export function unduckThemeForMissionBriefing(): void {
  if (typeof window === 'undefined') return
  const theme = window.__portfolioThemeAudio
  briefingThemeDuckDepth = Math.max(0, briefingThemeDuckDepth - 1)
  if (briefingThemeDuckDepth > 0 || !theme) return
  theme.volume = briefingThemePreDuck ?? getEffectiveThemeVolume()
  briefingThemePreDuck = null
  window.__portfolioBriefingThemeDucked = false
}
