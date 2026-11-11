'use client'

import { useCallback, useState } from 'react'
import { Share2 } from 'lucide-react'

const SHARE_TITLE = 'Christian Dennis'
const SHARE_TEXT =
  'Portfolio of Christian Dennis, software engineer and AI security co-op (TrojAI / A10 Networks).'

type SharePortfolioButtonProps = {
  className?: string
  /** Absolute or site-relative URL to share. Defaults to the live site root. */
  url?: string
}

export function SharePortfolioButton({
  className = '',
  url = 'https://christiandennis.vercel.app/'
}: SharePortfolioButtonProps) {
  const [status, setStatus] = useState<string | null>(null)

  const onShare = useCallback(async () => {
    const shareUrl = url.startsWith('http')
      ? url
      : typeof window !== 'undefined'
        ? new URL(url, window.location.origin).toString()
        : url

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: shareUrl })
        setStatus('Shared.')
        return
      }
    } catch (err) {
      // User cancel should not fall through to clipboard noise.
      if (err instanceof DOMException && err.name === 'AbortError') return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setStatus('Link copied.')
    } catch {
      setStatus('Could not share. Copy the URL from the address bar.')
    }
  }, [url])

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => {
          void onShare()
        }}
        className="touch-hit group relative inline-flex items-center gap-2 overflow-hidden border border-[#7eb6e2]/35 bg-[#3c79ad]/34 px-4 py-2 text-left text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-[#e2f0ff] transition-all duration-150 hover:border-[#b0daff]/50 hover:bg-[#4f8fc7]/38 hover:text-white"
        style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
      >
        <Share2 className="h-4 w-4 shrink-0" aria-hidden />
        Share portfolio
      </button>
      {status ? (
        <p className="mt-2 text-[0.7rem] uppercase tracking-[0.1em] text-[#8eb2d0]" role="status">
          {status}
        </p>
      ) : null}
    </div>
  )
}
