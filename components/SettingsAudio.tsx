'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import {
  DEFAULT_PORTFOLIO_AUDIO_SETTINGS,
  readPortfolioAudioSettings,
  resetPortfolioAudioSettings,
  writePortfolioAudioSettings,
  type PortfolioAudioSettings
} from '@/lib/portfolioAudioSettings'
import { PORTFOLIO_SETTINGS_MENU_VIDEO_SRC } from '@/lib/portfolioMenuVideos'

type SliderId = Exclude<keyof PortfolioAudioSettings, 'muted'>

const SLIDERS: { id: SliderId; label: string; hint: string }[] = [
  {
    id: 'master',
    label: 'Master volume',
    hint: 'Overall loudness for all portfolio audio.'
  },
  {
    id: 'theme',
    label: 'Theme music',
    hint: 'Background loop on the main menu (Halo-style theme).'
  },
  {
    id: 'menuVo',
    label: 'Menu voice & cues',
    hint: 'Announcer-style clips when choosing menu items (for example About, Projects).'
  },
  {
    id: 'uiSounds',
    label: 'UI sounds',
    hint: 'Navigation beeps, transitions between pages, and the Main Menu back sound.'
  }
]

function formatPct(value: number): string {
  return `${Math.round(value * 100)}%`
}

export default function SettingsAudio() {
  const [settings, setSettings] = useState<PortfolioAudioSettings | null>(null)
  const [activeId, setActiveId] = useState<SliderId>('master')

  useEffect(() => {
    setSettings(readPortfolioAudioSettings())
  }, [])

  const activeHint = useMemo(() => SLIDERS.find((s) => s.id === activeId)?.hint ?? '', [activeId])

  const refresh = useCallback(() => {
    setSettings(readPortfolioAudioSettings())
  }, [])

  const update = useCallback(
    (id: SliderId, value: number) => {
      writePortfolioAudioSettings({ [id]: value })
      refresh()
    },
    [refresh]
  )

  const toggleMute = useCallback(() => {
    const cur = readPortfolioAudioSettings()
    writePortfolioAudioSettings({ muted: !cur.muted })
    refresh()
  }, [refresh])

  const onReset = useCallback(() => {
    resetPortfolioAudioSettings()
    refresh()
  }, [refresh])

  if (!settings) {
    return (
      <section
        className="relative flex flex-1 flex-col overflow-hidden px-4 pb-10 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36"
        style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
      >
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          src={PORTFOLIO_SETTINGS_MENU_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[#03101c]/28" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(66,141,193,0.1)_0%,transparent_58%)]" />
        <p className="relative z-10 mt-5 text-sm uppercase tracking-[0.12em] text-[#8ea7c0] drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)] sm:mt-8">
          Loading…
        </p>
      </section>
    )
  }

  return (
    <section
      className="relative flex flex-1 flex-col overflow-hidden px-4 pb-10 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36"
      style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-70"
        src={PORTFOLIO_SETTINGS_MENU_VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#03101c]/28" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(66,141,193,0.1)_0%,transparent_58%)]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="relative z-10 mx-auto mt-3 w-full max-w-5xl flex-1 sm:mt-6"
      >
        <p className="mb-1 text-[0.72rem] font-normal uppercase tracking-[0.2em] text-[#9ab6d2] drop-shadow-[0_1px_10px_rgba(0,0,0,0.7)]">
          Main menu / Settings
        </p>
        <h1 className="mb-8 text-2xl font-normal uppercase tracking-[0.14em] text-[#e8f4ff] drop-shadow-[0_2px_14px_rgba(0,0,0,0.75)] sm:text-3xl">
          Audio
        </h1>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={toggleMute}
            aria-pressed={settings.muted}
            className={`touch-hit inline-flex items-center justify-center px-4 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
              settings.muted
                ? 'text-[#ffe4c4] hover:text-[#fff0dc]'
                : 'text-[#d7ebff] hover:text-[#e8f4ff]'
            } drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]`}
          >
            {settings.muted ? 'Unmute all' : 'Mute all'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="touch-hit inline-flex items-center justify-center px-4 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#d7ebff] drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)] transition-colors hover:text-[#e8f4ff]"
          >
            Reset to defaults
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
          <div className={`space-y-7 ${settings.muted ? 'opacity-55' : ''}`}>
            {SLIDERS.map((row) => {
              const value = settings[row.id]
              return (
                <div
                  key={row.id}
                  role="presentation"
                  onMouseEnter={() => setActiveId(row.id)}
                  onFocusCapture={() => setActiveId(row.id)}
                  className="space-y-2"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-[#e2f0ff] drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
                      {row.label}
                    </span>
                    <span className="min-w-[3rem] px-1 text-right text-[0.75rem] tabular-nums tracking-wide text-[#e2f0ff] drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
                      {formatPct(value)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round(value * 100)}
                      onChange={(e) => update(row.id, Number(e.target.value) / 100)}
                      onFocus={() => setActiveId(row.id)}
                      disabled={settings.muted}
                      className="portfolio-audio-slider flex-1 cursor-pointer disabled:cursor-not-allowed"
                      aria-valuetext={formatPct(value)}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="relative hidden min-h-[200px] lg:block">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#9ab6d2] drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
              Description
            </p>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-[#d7ebff] drop-shadow-[0_1px_10px_rgba(0,0,0,0.7)]">
              {activeHint}
            </p>
            <p className="mt-6 text-[0.78rem] leading-relaxed text-[#b8d4ee]/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
              Defaults: master / theme / menu voice / UI at {formatPct(DEFAULT_PORTFOLIO_AUDIO_SETTINGS.master)}. Mute
              keeps your slider levels and silences playback until you unmute.
            </p>
          </div>
        </div>

        <p className="mt-8 text-[0.72rem] uppercase tracking-[0.1em] text-[#cde3f7] drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)] lg:hidden">
          {activeHint}
        </p>
      </motion.div>
    </section>
  )
}
