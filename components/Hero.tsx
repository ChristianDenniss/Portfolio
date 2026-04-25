'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'

import {
  PORTFOLIO_AUDIO_SETTINGS_CHANGED_EVENT,
  getEffectiveMenuVoVolume,
  getEffectiveThemeVolume,
  getEffectiveUiVolume
} from '@/lib/portfolioAudioSettings'
import { playPortfolioTransitionSound } from '@/lib/portfolioSfx'

declare global {
  interface Window {
    __portfolioThemeAudio?: HTMLAudioElement
    __portfolioSfxAudioMap?: Record<string, HTMLAudioElement>
  }
}

type MainMenuItem = {
  label: string
  href: string
  sound?: string
  external?: boolean
  quit?: boolean
}

export default function Hero() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const themeAudioRef = useRef<HTMLAudioElement | null>(null)
  const buttonAudioMapRef = useRef<Record<string, HTMLAudioElement>>({})
  const navAudioRef = useRef<HTMLAudioElement | null>(null)
  const themeDuckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const themePreDuckVolumeRef = useRef<number | null>(null)
  const [hasEntered, setHasEntered] = useState(false)
  const [activeMenuIndex, setActiveMenuIndex] = useState(0)
  const getTimestamp = () => new Date().toISOString()

  const tryCloseTab = useCallback(() => {
    window.close()

    // Some browsers only allow close after self-target.
    if (!window.closed) {
      window.open('', '_self')
      window.close()
    }
  }, [])

  const menuItems = useMemo<MainMenuItem[]>(
    () => [
      { label: 'PROJECTS', href: '/projects', sound: '/sounds/projects.mp3' },
      { label: 'ABOUT', href: '/about', sound: '/sounds/about.mp3' },
      { label: 'RESUME', href: '/assets/Editable%20Resume%20%282026%29.pdf', sound: '/sounds/resume.mp3', external: true },
      { label: 'CONTACT', href: '/contact', sound: '/sounds/Contact.mp3' },
      { label: 'SETTINGS', href: '/settings', sound: '/sounds/settings.mp3' },
      { label: 'QUIT', href: '#', sound: '/sounds/betrayal_EKW4y6T.mp3', quit: true }
    ],
    []
  )

  const getOrCreateThemeAudio = useCallback(() => {
    if (typeof window === 'undefined') {
      return null
    }

    if (!window.__portfolioThemeAudio) {
      const audio = new Audio('/sounds/theme.mp3')
      audio.loop = true
      audio.preload = 'auto'
      audio.load()
      window.__portfolioThemeAudio = audio
    }

    window.__portfolioThemeAudio.volume = getEffectiveThemeVolume()
    return window.__portfolioThemeAudio
  }, [])

  const getOrCreateSfxAudio = useCallback((soundPath: string) => {
    if (typeof window === 'undefined') {
      return null
    }

    if (!window.__portfolioSfxAudioMap) {
      window.__portfolioSfxAudioMap = {}
    }

    if (!window.__portfolioSfxAudioMap[soundPath]) {
      const audio = new Audio(soundPath)
      audio.preload = 'auto'
      audio.load()
      window.__portfolioSfxAudioMap[soundPath] = audio
    }

    return window.__portfolioSfxAudioMap[soundPath]
  }, [])

  const playTheme = useCallback(() => {
    themeAudioRef.current = getOrCreateThemeAudio()
    if (!themeAudioRef.current) return

    const themeAudio = themeAudioRef.current
    console.log(
      `[${getTimestamp()}] [Hero Audio] playTheme() called.`,
      {
        paused: themeAudio.paused,
        currentTime: themeAudio.currentTime,
        readyState: themeAudio.readyState,
        networkState: themeAudio.networkState,
        volume: themeAudio.volume
      }
    )

    void themeAudioRef.current
      .play()
      .then(() => {
        console.log(`[${getTimestamp()}] [Hero Audio] Theme playback started.`, {
          paused: themeAudio.paused,
          currentTime: themeAudio.currentTime,
          readyState: themeAudio.readyState,
          networkState: themeAudio.networkState,
          volume: themeAudio.volume
        })
      })
      .catch((error) => {
        console.log(`[${getTimestamp()}] [Hero Audio] Theme playback blocked or failed.`, error)
      })
  }, [getOrCreateThemeAudio])

  const playButtonSound = (soundPath: string) => {
    const clickAudio = buttonAudioMapRef.current[soundPath]
    if (!clickAudio) {
      return
    }

    clickAudio.currentTime = 0
    clickAudio.volume = getEffectiveMenuVoVolume(1)
    void clickAudio.play().catch(() => {
      // Ignore play interruption if user rapidly clicks.
    })
  }

  const playNavSound = () => {
    const navAudio = navAudioRef.current
    if (!navAudio) {
      return
    }

    navAudio.currentTime = 0
    navAudio.volume = getEffectiveUiVolume(0.7)
    void navAudio.play().catch(() => {
      // Ignore interruption when key repeats quickly.
    })
  }

  useEffect(() => {
    console.log(`[${getTimestamp()}] [Hero] Site initialized: Hero mounted.`)

    const map: Record<string, HTMLAudioElement> = {}
    const themeAudio = getOrCreateThemeAudio()
    if (!themeAudio) {
      return
    }

    const onThemeCanPlayThrough = () => {
      console.log(`[${getTimestamp()}] [Hero Audio] Theme canplaythrough fired.`)
    }
    const onThemePlaying = () => {
      console.log(`[${getTimestamp()}] [Hero Audio] Theme playing event.`, {
        currentTime: themeAudio.currentTime
      })
    }
    themeAudio.addEventListener('canplaythrough', onThemeCanPlayThrough)
    themeAudio.addEventListener('playing', onThemePlaying)
    themeAudioRef.current = themeAudio
    console.log(`[${getTimestamp()}] [Hero Audio] Theme audio preloaded.`)

    for (const item of menuItems) {
      if (!item.sound) continue
      const audio = getOrCreateSfxAudio(item.sound)
      if (audio) {
        map[item.sound] = audio
      }
    }

    const navAudio = getOrCreateSfxAudio('/sounds/bumper5.wav')
    if (!navAudio) {
      return
    }
    navAudioRef.current = navAudio

    buttonAudioMapRef.current = map

    return () => {
      themeAudio.removeEventListener('canplaythrough', onThemeCanPlayThrough)
      themeAudio.removeEventListener('playing', onThemePlaying)

      // Keep shared theme audio alive across route changes.
      themeAudioRef.current = null

      if (themeDuckTimeoutRef.current) {
        clearTimeout(themeDuckTimeoutRef.current)
      }
      themeDuckTimeoutRef.current = null
      themePreDuckVolumeRef.current = null

      if (typeof window !== 'undefined' && window.__portfolioThemeAudio) {
        window.__portfolioThemeAudio.volume = getEffectiveThemeVolume()
      }

      // Keep shared SFX alive across route changes.
      buttonAudioMapRef.current = {}

      navAudioRef.current = null
    }
  }, [menuItems, playTheme, getOrCreateThemeAudio, getOrCreateSfxAudio])

  useEffect(() => {
    const onSettingsChanged = () => {
      const theme = themeAudioRef.current
      if (!theme || themePreDuckVolumeRef.current !== null) return
      theme.volume = getEffectiveThemeVolume()
    }
    window.addEventListener(PORTFOLIO_AUDIO_SETTINGS_CHANGED_EVENT, onSettingsChanged)
    return () => window.removeEventListener(PORTFOLIO_AUDIO_SETTINGS_CHANGED_EVENT, onSettingsChanged)
  }, [])

  const duckThemeForMenuSfx = useCallback(() => {
    const themeAudio = themeAudioRef.current
    if (!themeAudio) {
      return
    }

    if (themePreDuckVolumeRef.current === null) {
      themePreDuckVolumeRef.current = themeAudio.volume
    }

    themeAudio.volume = themeAudio.volume * 0.5

    if (themeDuckTimeoutRef.current) {
      clearTimeout(themeDuckTimeoutRef.current)
    }

    themeDuckTimeoutRef.current = setTimeout(() => {
      if (themeAudioRef.current) {
        const restoreVolume = themePreDuckVolumeRef.current ?? getEffectiveThemeVolume()
        themeAudioRef.current.volume = restoreVolume
      }
      themePreDuckVolumeRef.current = null
      themeDuckTimeoutRef.current = null
    }, 1200)
  }, [])

  const startExperience = useCallback(() => {
    if (hasEntered) {
      return
    }

    console.log(`[${getTimestamp()}] [Hero Audio] Enter pressed/clicked. Starting theme.`)
    playTheme()
    setHasEntered(true)
  }, [hasEntered, playTheme])

  useEffect(() => {
    if (searchParams.get('menu') === '1') {
      setHasEntered(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (hasEntered) {
      return
    }

    const onFirstKey = () => {
      startExperience()
    }

    window.addEventListener('keydown', onFirstKey)
    return () => {
      window.removeEventListener('keydown', onFirstKey)
    }
  }, [hasEntered, startExperience])

  const runMenuAction = useCallback((item: (typeof menuItems)[number]) => {
    playTheme()
    duckThemeForMenuSfx()

    if (item.quit) {
      const quitPath = item.sound
      if (!quitPath) {
        tryCloseTab()
        return
      }
      const quitAudio = buttonAudioMapRef.current[quitPath]
      if (!quitAudio) {
        tryCloseTab()
        return
      }

      // Let the betrayal cue play fully before closing.
      quitAudio.currentTime = 0
      quitAudio.volume = getEffectiveMenuVoVolume(1)
      quitAudio.onended = () => {
        tryCloseTab()
        quitAudio.onended = null
      }
      void quitAudio.play().catch(() => {
        tryCloseTab()
        quitAudio.onended = null
      })
      return
    }

    if (item.sound) {
      playButtonSound(item.sound)
    }
    playPortfolioTransitionSound()

    if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer')
      return
    }

    router.push(item.href)
  }, [duckThemeForMenuSfx, playTheme, router, tryCloseTab])

  const onMenuClick = (item: (typeof menuItems)[number], event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    runMenuAction(item)
  }

  return (
    <section
      id="home"
      tabIndex={0}
      onKeyDown={(event) => {
        if (!hasEntered) {
          event.preventDefault()
          startExperience()
          return
        }

        if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') {
          event.preventDefault()
          playNavSound()
          setActiveMenuIndex((prev) => (prev + 1) % menuItems.length)
          return
        }

        if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
          event.preventDefault()
          playNavSound()
          setActiveMenuIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length)
          return
        }

        if (event.key === 'Enter') {
          event.preventDefault()
          runMenuAction(menuItems[activeMenuIndex])
        }
      }}
      className="relative min-h-screen overflow-hidden bg-[#01080e] text-[#bbdbff]"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-55"
        src="/HaloAssetMimic/FMS_MainMenu_v2.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(66,141,193,0.24)_0%,rgba(2,17,28,0.62)_58%,rgba(1,8,14,0.66)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(160,224,255,0.2)_0%,transparent_42%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(1,8,14,0.68)_80%)]" />
      <div className="absolute inset-0 opacity-5 [background-image:linear-gradient(rgba(173,216,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(173,216,255,0.08)_1px,transparent_1px)] [background-size:140px_140px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-end justify-start px-4 pb-10 sm:px-8 sm:pb-14 md:px-12 md:pb-16">
        {!hasEntered ? (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            onClick={startExperience}
            className="mx-auto flex flex-col items-center bg-transparent px-8 py-4 text-center"
          >
            <span
              className="text-6xl font-bold uppercase leading-none tracking-[0.18em] text-[#dbeeff] drop-shadow-[0_0_20px_rgba(145,201,255,0.78)] sm:text-7xl"
              style={{ fontFamily: 'HaloLogo, HaloLogoOutline, "Arial Black", sans-serif' }}
            >
              CHRISTIAN
            </span>
            <span
              className="mt-3 text-sm font-normal uppercase tracking-[0.11em] text-[#95b5d6] transition-colors duration-200 hover:text-[#c5dcf2]"
              style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
            >
              PRESS ANY KEY TO CONTINUE
            </span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-md"
          >
            <div className="relative mb-1 w-full border border-[#2a4461] bg-[linear-gradient(180deg,rgba(14,29,49,0.92)_0%,rgba(6,18,33,0.92)_100%)] px-3 py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.35)]">
              <div className="pointer-events-none absolute -inset-[3px] border border-[#5d79a4]/45" />
              <div className="pointer-events-none absolute left-3 top-[2px] h-px w-8 bg-[#a5c0e0]/45" />
              <div className="pointer-events-none absolute right-3 top-[2px] h-px w-8 bg-[#a5c0e0]/45" />
              <div className="pointer-events-none absolute bottom-[2px] left-3 h-px w-8 bg-[#a5c0e0]/35" />
              <div className="pointer-events-none absolute bottom-[2px] right-3 h-px w-8 bg-[#a5c0e0]/35" />
              <p
                className="text-[0.92rem] font-normal uppercase tracking-[0.04em] text-[#8ea7c0]"
                style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
              >
                MAIN MENU // Christian
              </p>
            </div>

            <div className="relative w-full overflow-hidden rounded-sm border border-[#1d3650] bg-[#030d18]/78 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-[1px] [background-image:linear-gradient(180deg,rgba(39,67,112,0.2)_0%,rgba(16,31,62,0.16)_45%,rgba(10,20,43,0.22)_100%)]">
              <div className="pointer-events-none absolute -inset-[3px] border border-[#56739d]/40" />
              <div className="pointer-events-none absolute left-3 top-[3px] h-px w-10 bg-[#a3bedf]/35" />
              <div className="pointer-events-none absolute right-3 top-[3px] h-px w-10 bg-[#a3bedf]/35" />
              <div className="pointer-events-none absolute bottom-[3px] left-3 h-px w-10 bg-[#a3bedf]/32" />
              <div className="pointer-events-none absolute bottom-[3px] right-3 h-px w-10 bg-[#a3bedf]/32" />
              <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:repeating-linear-gradient(180deg,rgba(157,188,231,0.16)_0px,rgba(157,188,231,0.16)_0.8px,rgba(0,0,0,0)_1.2px,rgba(0,0,0,0)_3px)] [mask-image:linear-gradient(90deg,black_0%,black_10%,transparent_22%,transparent_78%,black_90%,black_100%)]" />
              {menuItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  onClick={(event) => onMenuClick(item, event)}
                  onMouseMove={() => setActiveMenuIndex(index)}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 + index * 0.09 }}
                  className={`group relative block w-full border-b border-[#17304a]/90 px-4 py-2 text-left text-[1.02rem] font-normal uppercase leading-none tracking-[0.045em] transition-all duration-150 last:border-b-0 last:py-3 ${
                    activeMenuIndex === index
                      ? 'bg-[linear-gradient(90deg,rgba(172,95,36,0.72)_0%,rgba(145,77,30,0.55)_68%,rgba(5,18,33,0.88)_100%)] text-[#d7e4f1]'
                      : 'text-[#8eaac4]'
                  }`}
                  style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
                >
                  <span
                    className={`absolute inset-y-0 left-0 opacity-85 transition-all duration-150 ${
                      activeMenuIndex === index ? 'w-[4px] bg-[#f6a158]' : 'w-[2px] bg-[#284764]'
                    }`}
                  />
                  <span
                    className={`absolute inset-y-0 left-0 right-0 transition-opacity duration-150 [background-image:linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_100%)] ${
                      activeMenuIndex === index ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {item.label}
                </motion.a>
              ))}
            </div>

            <div className="relative mt-1 w-full border border-[#23415f] bg-[linear-gradient(180deg,rgba(10,24,43,0.92)_0%,rgba(4,14,28,0.92)_100%)] px-3 py-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
              <div className="pointer-events-none absolute -inset-[3px] border border-[#5a76a0]/35" />
              <div className="flex items-center gap-3 text-[0.9rem] uppercase tracking-[0.035em] text-[#9ab6d2]" style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#8eb0d1] text-[0.72rem]">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#b5cee7]" aria-hidden="true">
                    <path d="M4.3 2.7a.8.8 0 0 1 .82-.14l13 5.2a.8.8 0 0 1-.02 1.49l-5.15 1.88 3.32 6.08a.8.8 0 0 1-.32 1.08l-1.41.77a.8.8 0 0 1-1.08-.32l-3.32-6.08-3.1 4.48a.8.8 0 0 1-1.45-.47V3.3a.8.8 0 0 1 .23-.6z" />
                  </svg>
                </span>
                <span>Click or Enter to select</span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-[0.9rem] uppercase tracking-[0.035em] text-[#88a6c4]" style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#7e9fc1] text-[0.62rem]">↑↓</span>
                <span>Up and Down to navigate</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {hasEntered && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="pointer-events-none absolute bottom-28 right-4 z-10 sm:bottom-32 sm:right-10 md:bottom-36 md:right-16"
        >
          <h1
            className="text-5xl font-bold uppercase leading-none tracking-[0.18em] text-[#d8ebff] drop-shadow-[0_0_18px_rgba(143,198,255,0.75)] sm:text-6xl md:text-7xl"
            style={{ fontFamily: 'HaloLogo, HaloLogoOutline, "Arial Black", sans-serif' }}
          >
            CHRISTIAN
          </h1>
        </motion.div>
      )}
    </section>
  )
} 