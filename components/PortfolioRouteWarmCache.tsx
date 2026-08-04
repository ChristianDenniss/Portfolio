'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Soft-nav targets for the Halo menu (small surface area - warm all on boot). */
export const PORTFOLIO_APP_ROUTES = [
  '/',
  '/?menu=1',
  '/about',
  '/projects',
  '/contact',
  '/settings'
] as const

/**
 * Prefetch every app route on first mount so menu swaps hit a warm App Router cache.
 */
export function PortfolioRouteWarmCache() {
  const router = useRouter()

  useEffect(() => {
    for (const href of PORTFOLIO_APP_ROUTES) {
      router.prefetch(href)
    }
  }, [router])

  return null
}
