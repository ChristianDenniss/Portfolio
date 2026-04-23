'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import {
  readPortfolioAudioSettings,
  writePortfolioAudioSettings,
  type PortfolioAudioSettings
} from '@/lib/portfolioAudioSettings'

type SliderId = keyof PortfolioAudioSettings

const SETTINGS_MENU_VIDEO_SRC = '/4K%20Videos/Halo%20Cross-Game%20Menu.mp4'

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

  const update = useCallback((id: SliderId, value: number) => {
    writePortfolioAudioSettings({ [id]: value })
    setSettings(readPortfolioAudioSettings())
  }, [])

  if (!settings) {
    return (
      <section
        className="relative flex flex-1 flex-col overflow-hidden px-4 pb-10 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36"
        style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
      >
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          src={SETTINGS_MENU_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
        <div className="absolute inset-0 bg-[#03101c]/72" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(66,141,193,0.14)_0%,transparent_58%)]" />
        <p className="relative z-10 mt-5 text-sm uppercase tracking-[0.12em] text-[#8ea7c0] sm:mt-8">Loading…</p>
      </section>
    )
  }

  return (
    <section
      className="relative flex flex-1 flex-col overflow-hidden px-4 pb-10 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36"
      style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-35"
        src={SETTINGS_MENU_VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#03101c]/72" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(66,141,193,0.14)_0%,transparent_58%)]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 mx-auto mt-3 w-full max-w-5xl flex-1 sm:mt-6"
      >
        <p className="mb-1 text-[0.72rem] font-normal uppercase tracking-[0.2em] text-[#7a96b4]">Main menu / Settings</p>
        <h1 className="mb-8 text-2xl font-normal uppercase tracking-[0.14em] text-[#d7ebff] sm:text-3xl">Audio</h1>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
          <div className="relative border border-[#2a4a68]/90 bg-[linear-gradient(180deg,rgba(14,29,49,0.92)_0%,rgba(6,18,33,0.94)_100%)] px-4 py-5 shadow-[0_10px_28px_rgba(0,0,0,0.45)] sm:px-6 sm:py-6">
            <div className="pointer-events-none absolute -inset-[2px] border border-[#4d6f8f]/35" />
            <div className="pointer-events-none absolute left-4 top-[3px] h-px w-10 bg-[#a3bedf]/30" />
            <div className="pointer-events-none absolute right-4 top-[3px] h-px w-10 bg-[#a3bedf]/30" />

            <div className="space-y-7">
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
                      <span className="text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-[#b8d4ee]">
                        {row.label}
                      </span>
                      <span className="min-w-[3rem] border border-[#3d5a78] bg-[#061a2c]/80 px-2 py-0.5 text-center text-[0.75rem] tabular-nums tracking-wide text-[#e2f0ff]">
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
                        className="portfolio-audio-slider flex-1 cursor-pointer"
                        aria-valuetext={formatPct(value)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative hidden min-h-[200px] border-l border-[#4d6f8f]/45 pl-8 lg:block">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#6d8aad]">Description</p>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-[#a8c7e2]">{activeHint}</p>
          </div>
        </div>

        <p className="mt-8 text-[0.72rem] uppercase tracking-[0.1em] text-[#5f7a96] lg:hidden">{activeHint}</p>
      </motion.div>
    </section>
  )
}
