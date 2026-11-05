'use client'

import { useEffect } from 'react'
import { getImageProps } from 'next/image'

import {
  PORTFOLIO_WARM_CONTENT_IMAGES,
  PORTFOLIO_WARM_CURSORS,
  PORTFOLIO_WARM_FONTS,
  PORTFOLIO_WARM_LOGOS,
  PORTFOLIO_WARM_RESUME,
  type PortfolioWarmImage
} from '@/lib/portfolioWarmAssets'
import { PORTFOLIO_IDLE_WARM_SFX, warmPortfolioSfx } from '@/lib/portfolioSfx'

const CONCURRENCY = 4

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
    const img = new window.Image()
    img.decoding = 'async'
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

/** Warm the same optimized URL next/image will request, not the raw file. */
function warmOptimizedImage(image: PortfolioWarmImage): Promise<void> {
  return new Promise((resolve) => {
    let src = image.src
    let srcSet: string | undefined
    let sizes: string | undefined
    try {
      const { props } = getImageProps({
        src: image.src,
        alt: '',
        width: image.width,
        height: image.height,
        sizes: image.sizes
      })
      src = props.src
      srcSet = props.srcSet
      sizes = props.sizes
    } catch {
      // Fall back to the original file if the optimizer props cannot be built.
    }

    const img = new window.Image()
    img.decoding = 'async'
    if (sizes) img.sizes = sizes
    if (srcSet) img.srcset = srcSet
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

async function runQueue(
  images: readonly PortfolioWarmImage[],
  cancelled: () => boolean
): Promise<void> {
  let i = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, images.length) }, async () => {
    while (!cancelled() && i < images.length) {
      const image = images[i++]
      if (!image) break
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
      await warmOptimizedImage(image)
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
    const idleCancel = scheduleIdle(() => {
      void (async () => {
        if (cancelled) return

        // Small SFX first - shared map with Hero / portfolioSfx.
        warmPortfolioSfx(PORTFOLIO_IDLE_WARM_SFX)

        for (const href of PORTFOLIO_WARM_CURSORS) {
          if (cancelled) return
          await warmImage(href)
        }

        // Fonts + resume via fetch (not Image()).
        for (const font of PORTFOLIO_WARM_FONTS) {
          if (cancelled) return
          await warmFetch(font.href)
        }
        if (cancelled) return
        await warmFetch(PORTFOLIO_WARM_RESUME)

        await runQueue(PORTFOLIO_WARM_LOGOS, () => cancelled)
        if (cancelled || shouldSkipHeavyWarm()) return
        await runQueue(PORTFOLIO_WARM_CONTENT_IMAGES, () => cancelled)
      })()
    })

    return () => {
      cancelled = true
      idleCancel()
    }
  }, [])

  return null
}
