'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

type MissionBriefingProps = {
  title: string
  intel: string
  categories?: string[]
  featured?: boolean
  onContinue: () => void
}

const TYPE_MS = 14
const INTEL_CAP = 280

export default function MissionBriefing({
  title,
  intel,
  categories = [],
  featured = false,
  onContinue
}: MissionBriefingProps) {
  const briefingText = useMemo(() => {
    const trimmed = intel.trim()
    if (trimmed.length <= INTEL_CAP) return trimmed
    const cut = trimmed.slice(0, INTEL_CAP)
    const lastSpace = cut.lastIndexOf(' ')
    return `${(lastSpace > 120 ? cut.slice(0, lastSpace) : cut).trim()}…`
  }, [intel])

  const [visibleCount, setVisibleCount] = useState(0)
  const done = visibleCount >= briefingText.length

  useEffect(() => {
    setVisibleCount(0)
    if (!briefingText) return

    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setVisibleCount(i)
      if (i >= briefingText.length) window.clearInterval(id)
    }, TYPE_MS)

    return () => window.clearInterval(id)
  }, [briefingText, title])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onContinue()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onContinue])

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-briefing-title"
      onClick={onContinue}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        className="absolute inset-0 bg-[#03101c]/82 backdrop-blur-[2px]"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-xl border border-[#7eb8ea]/35 bg-[linear-gradient(180deg,rgba(14,29,49,0.94)_0%,rgba(6,18,33,0.96)_100%)] px-5 py-5 shadow-[0_16px_40px_rgba(0,0,0,0.45)] sm:px-7 sm:py-6"
        style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute -inset-[3px] border border-[#5d79a4]/40" aria-hidden />
        <div className="pointer-events-none absolute left-4 top-[3px] h-px w-10 bg-[#a5c0e0]/40" aria-hidden />
        <div className="pointer-events-none absolute right-4 top-[3px] h-px w-10 bg-[#a5c0e0]/40" aria-hidden />
        <div className="pointer-events-none absolute bottom-[3px] left-4 h-px w-10 bg-[#a5c0e0]/30" aria-hidden />
        <div className="pointer-events-none absolute bottom-[3px] right-4 h-px w-10 bg-[#a5c0e0]/30" aria-hidden />

        <p className="text-[0.7rem] font-normal uppercase tracking-[0.18em] text-[#7a96b4]">
          Mission briefing
          {featured ? ' // Priority' : ''}
        </p>
        <h2
          id="mission-briefing-title"
          className="mt-2 text-xl font-normal uppercase tracking-[0.08em] text-[#e8f4ff] sm:text-2xl"
        >
          {title}
        </h2>

        {categories.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="border border-[#7eb8ea]/28 bg-[#061a2c]/55 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.12em] text-[#9ab6d2]"
              >
                {category}
              </span>
            ))}
          </div>
        ) : null}

        <p className="mt-5 min-h-[5.5rem] text-sm leading-relaxed text-[#c8def2] sm:text-[0.95rem]">
          {briefingText.slice(0, visibleCount)}
          <span
            className={`ml-0.5 inline-block h-[1em] w-[0.45em] translate-y-[0.1em] bg-[#9fcdf1] align-baseline ${
              done ? 'opacity-0' : 'animate-pulse'
            }`}
            aria-hidden
          />
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#7eb8ea]/22 pt-4">
          <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[#7a96b4]">
            Tap / click anywhere · Esc or Enter to skip
          </p>
          <button
            type="button"
            onClick={onContinue}
            className="touch-hit border border-[#7eb8ea]/40 bg-[#3c79ad]/34 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#d7ebff] transition-colors hover:border-[#b0daff]/55 hover:bg-[#4f8fc7]/40"
          >
            Open dossier
          </button>
        </div>
      </motion.div>
    </div>
  )
}
