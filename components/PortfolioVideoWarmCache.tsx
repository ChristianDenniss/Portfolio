'use client'

import { useLayoutEffect } from 'react'

import { PORTFOLIO_MENU_BACKGROUND_VIDEOS } from '@/lib/portfolioMenuVideos'

/**
 * Tiny hidden `<video>` elements with `preload="auto"` so all menu MP4s hit the network and
 * media cache as soon as the client bundle runs (root layout also emits `<link rel="preload">`).
 */
export function PortfolioVideoWarmCache() {
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return

    const warmers: HTMLVideoElement[] = []
    for (const src of PORTFOLIO_MENU_BACKGROUND_VIDEOS) {
      const v = document.createElement('video')
      v.preload = 'auto'
      v.muted = true
      v.defaultMuted = true
      v.playsInline = true
      v.setAttribute('playsinline', '')
      v.src = src
      v.tabIndex = -1
      v.setAttribute('aria-hidden', 'true')
      v.setAttribute('data-portfolio-video-warmer', '1')
      Object.assign(v.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        width: '1px',
        height: '1px',
        opacity: '0',
        pointerEvents: 'none',
        zIndex: '-1'
      })
      document.body.appendChild(v)
      v.load()
      warmers.push(v)
    }

    return () => {
      for (const v of warmers) {
        v.removeAttribute('src')
        v.load()
        v.remove()
      }
    }
  }, [])

  return null
}
