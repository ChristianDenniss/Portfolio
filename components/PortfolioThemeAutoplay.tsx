'use client'

import { useEffect } from 'react'

import { getEffectiveThemeVolume } from '@/lib/portfolioAudioSettings'

const THEME_SRC = '/sounds/theme.mp3'

/**
 * Starts the menu theme as soon as the document loads.
 * Browsers that block audible autoplay get a one-time resume on the next gesture.
 */
export function PortfolioThemeAutoplay() {
  useEffect(() => {
    const existing = document.getElementById('portfolio-theme')
    const audio = existing instanceof HTMLAudioElement ? existing : new Audio(THEME_SRC)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = getEffectiveThemeVolume()
    window.__portfolioThemeAudio = audio

    let removeGesture = () => {}

    const tryPlay = () => {
      if (!audio.paused) {
        removeGesture()
        return
      }
      void audio.play().then(removeGesture).catch(() => {})
    }

    const onGesture = () => {
      tryPlay()
    }

    removeGesture = () => {
      window.removeEventListener('pointerdown', onGesture, true)
      window.removeEventListener('keydown', onGesture, true)
    }

    tryPlay()
    window.addEventListener('pointerdown', onGesture, true)
    window.addEventListener('keydown', onGesture, true)

    return removeGesture
  }, [])

  return null
}
