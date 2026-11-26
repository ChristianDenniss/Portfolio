'use client'

import { useEffect, useRef, type VideoHTMLAttributes } from 'react'

type PortfolioMenuBackgroundVideoProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  'autoPlay' | 'muted' | 'controls' | 'playsInline' | 'src'
> & {
  src: string
}

/**
 * Full-bleed muted menu loop. Hardens iOS/Android autoplay (defaultMuted +
 * imperative mute + gesture retry) and never shows native play/pause chrome.
 */
export function PortfolioMenuBackgroundVideo({
  src,
  className,
  onError,
  preload = 'auto',
  ...rest
}: PortfolioMenuBackgroundVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.controls = false
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.removeAttribute('controls')

    const tryPlay = () => {
      if (!video.paused) return
      void video.play().catch(() => {})
    }

    const onGesture = () => tryPlay()

    tryPlay()
    video.addEventListener('loadeddata', tryPlay)
    video.addEventListener('canplay', tryPlay)
    window.addEventListener('pointerdown', onGesture, true)
    window.addEventListener('touchstart', onGesture, true)
    window.addEventListener('keydown', onGesture, true)

    return () => {
      video.removeEventListener('loadeddata', tryPlay)
      video.removeEventListener('canplay', tryPlay)
      window.removeEventListener('pointerdown', onGesture, true)
      window.removeEventListener('touchstart', onGesture, true)
      window.removeEventListener('keydown', onGesture, true)
    }
  }, [src])

  return (
    <video
      ref={ref}
      className={['portfolio-menu-bg', className].filter(Boolean).join(' ')}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload={preload}
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden
      onError={onError}
      {...rest}
    />
  )
}
