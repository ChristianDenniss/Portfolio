/**
 * Shared SFX for in-app navigation. Uses the same cache as {@link components/Hero.tsx}
 * (`window.__portfolioSfxAudioMap`) so clips stay deduped across routes.
 */
import { getEffectiveUiVolume } from '@/lib/portfolioAudioSettings'

declare global {
  interface Window {
    __portfolioSfxAudioMap?: Record<string, HTMLAudioElement>
  }
}

/** `transition_beeps3.wav`: Halo main menu + About “Topics” submenu. */
const TRANSITION_BEEPS3_PATH = '/sounds/transition_beeps3.wav'
/** `transition_beeps2.wav`: About page top row (About Me / Skills / …), distinct from topics. */
const TRANSITION_BEEPS2_PATH = '/sounds/transition_beeps2.wav'
const TRANSITION_VOLUME = 0.8

const BACK_TO_MENU_SOUND_PATH = '/sounds/back1.wav'
const BACK_TO_MENU_VOLUME = 1

/** About Skills capability blocks: grab (unused elsewhere in the app). */
const SKILL_BLOCK_GRAB_PATH = '/sounds/transition_beeps4.wav'
const SKILL_BLOCK_GRAB_VOLUME = 0.65
/** About Skills capability blocks: drop after reorder (`bumper5.wav`, same asset as main-menu nav bump). */
const SKILL_BLOCK_DROP_PATH = '/sounds/bumper5.wav'
const SKILL_BLOCK_DROP_VOLUME = 0.42

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

/** Main menu (`Hero`) and About “Topics” submenu: `transition_beeps3.wav`. */
export function playPortfolioTransitionSound(): void {
  playCachedSfx(TRANSITION_BEEPS3_PATH, getEffectiveUiVolume(TRANSITION_VOLUME))
}

/** About page top tabs (About Me / Skills / …): `transition_beeps2.wav`, distinct from Topics. */
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
