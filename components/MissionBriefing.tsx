'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

type MissionBriefingProps = {
  title: string
  intel: string
  categories?: string[]
  featured?: boolean
  image?: string | null
  imageLabel?: string
  objectives?: string[]
  onContinue: () => void
}

const TYPE_MS = 12
const INTEL_CAP = 320
const PLACEHOLDER = '/api/placeholder/400/250'

function missionCode(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash * 31 + title.charCodeAt(i)) >>> 0
  }
  const mission = String((hash % 12) + 1).padStart(2, '0')
  const sector = String((hash % 90) + 10)
  return `UNSC-${mission}-${sector}`
}

export default function MissionBriefing({
  title,
  intel,
  categories = [],
  featured = false,
  image = null,
  imageLabel,
  objectives = [],
  onContinue
}: MissionBriefingProps) {
  const code = useMemo(() => missionCode(title), [title])
  const theater = categories.length > 0 ? categories.join(' / ') : 'Unclassified theater'
  const primaryObjectives = objectives.slice(0, 4)

  const briefingText = useMemo(() => {
    const trimmed = intel.trim()
    if (trimmed.length <= INTEL_CAP) return trimmed
    const cut = trimmed.slice(0, INTEL_CAP)
    const lastSpace = cut.lastIndexOf(' ')
    return `${(lastSpace > 140 ? cut.slice(0, lastSpace) : cut).trim()}…`
  }, [intel])

  const [visibleCount, setVisibleCount] = useState(0)
  const done = visibleCount >= briefingText.length
  const hasArt = Boolean(image && image !== PLACEHOLDER)

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
      className="fixed inset-0 z-[70] flex items-stretch justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-briefing-title"
      onClick={onContinue}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="absolute inset-0 bg-[#020a12]/92"
        aria-hidden
      />

      {/* Full-bleed recon plate */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {hasArt ? (
          <Image src={image!} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(66,120,170,0.35)_0%,rgba(2,10,18,0.2)_45%,rgba(1,6,12,0.95)_100%)]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,10,18,0.92)_0%,rgba(2,10,18,0.55)_42%,rgba(2,10,18,0.78)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba_0%,rgba(2,10,18,0.55)_70%,rgba(2,10,18,0.92)_100%)]" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:repeating-linear-gradient(180deg,rgba(157,188,231,0.22)_0px,rgba(157,188,231,0.22)_0.8px,transparent_1.2px,transparent_3px)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(160,208,248,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(160,208,248,0.35)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.22 }}
        className="relative z-10 flex h-full w-full max-w-6xl flex-col justify-end px-4 pb-5 pt-16 sm:px-8 sm:pb-8 sm:pt-20 lg:justify-center lg:px-10"
        style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid w-full gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] lg:gap-8">
          {/* Primary brief column */}
          <div className="relative border border-[#2a4461] bg-[linear-gradient(180deg,rgba(10,24,43,0.88)_0%,rgba(4,14,28,0.92)_100%)] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="pointer-events-none absolute -inset-[3px] border border-[#5d79a4]/40" aria-hidden />
            <div className="pointer-events-none absolute left-4 top-[3px] h-px w-12 bg-[#a5c0e0]/45" aria-hidden />
            <div className="pointer-events-none absolute right-4 top-[3px] h-px w-12 bg-[#a5c0e0]/45" aria-hidden />
            <div className="pointer-events-none absolute bottom-[3px] left-4 h-px w-12 bg-[#a5c0e0]/30" aria-hidden />
            <div className="pointer-events-none absolute bottom-[3px] right-4 h-px w-12 bg-[#a5c0e0]/30" aria-hidden />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-[#f6a158]" aria-hidden />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#8ea7c0]">
                Mission briefing // {code}
              </p>
              <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[#c48a4a]">
                {featured ? 'Priority deployment' : 'Standard deployment'}
              </p>
            </div>

            <h2
              id="mission-briefing-title"
              className="mt-3 text-3xl font-normal uppercase leading-none tracking-[0.06em] text-[#e8f4ff] sm:text-4xl md:text-5xl"
            >
              {title}
            </h2>

            <div className="mt-4 grid gap-3 border-y border-[#3d5a78]/55 py-3 text-[0.72rem] uppercase tracking-[0.12em] text-[#9ab6d2] sm:grid-cols-2">
              <div>
                <p className="text-[#6d8aad]">Theater</p>
                <p className="mt-1 text-[#d7ebff]">{theater}</p>
              </div>
              <div>
                <p className="text-[#6d8aad]">Classification</p>
                <p className="mt-1 text-[#d7ebff]">{featured ? 'Priority // Featured' : 'Open // Available'}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#6d8aad]">Sitrep</p>
              <p className="mt-2 min-h-[5.5rem] text-sm leading-relaxed text-[#c8def2] sm:text-[0.95rem]">
                {briefingText.slice(0, visibleCount)}
                <span
                  className={`ml-0.5 inline-block h-[1em] w-[0.45em] translate-y-[0.1em] bg-[#f6a158] align-baseline ${
                    done ? 'opacity-0' : 'animate-pulse'
                  }`}
                  aria-hidden
                />
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[#7a96b4]">
                Esc / Enter / tap overlay to skip
              </p>
              <button
                type="button"
                onClick={onContinue}
                className="touch-hit relative overflow-hidden border border-[#f0b57a]/55 bg-[linear-gradient(90deg,rgba(172,95,36,0.85)_0%,rgba(145,77,30,0.72)_70%,rgba(20,30,45,0.9)_100%)] px-5 py-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-[#ffe8c8] shadow-[0_8px_22px_rgba(0,0,0,0.35)] transition-colors hover:border-[#ffd19a]/7 hover:text-white"
              >
                <span className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-[#f6a158]" aria-hidden />
                Launch mission
              </button>
            </div>
          </div>

          {/* Side intel / objectives rack */}
          <div className="flex flex-col gap-3">
            <div className="relative overflow-hidden border border-[#2a4461] bg-[#030d18]/80 shadow-[0_10px_28px_rgba(0,0,0,0.4)]">
              <div className="pointer-events-none absolute -inset-[3px] border border-[#56739d]/35" aria-hidden />
              <div className="relative h-40 w-full sm:h-48 lg:h-56">
                {hasArt ? (
                  <Image
                    src={image!}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 360px"
                    className="object-cover opacity-90"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#1c3d5d]/55">
                    <span className="text-4xl font-bold uppercase tracking-[0.12em] text-[#d7ebff]">
                      {imageLabel || title.split(' ')[0]}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(3,13,24,0.85)_0%,transparent_55%)]" />
                <p className="absolute bottom-2 left-3 text-[0.65rem] uppercase tracking-[0.16em] text-[#9ab6d2]">
                  Recon feed // Live
                </p>
              </div>
            </div>

            <div className="relative flex-1 border border-[#2a4461] bg-[linear-gradient(180deg,rgba(14,29,49,0.9)_0%,rgba(6,18,33,0.94)_100%)] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.4)]">
              <div className="pointer-events-none absolute -inset-[3px] border border-[#5d79a4]/35" aria-hidden />
              <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#6d8aad]">Primary objectives</p>
              {primaryObjectives.length > 0 ? (
                <ul className="mt-3 space-y-2.5">
                  {primaryObjectives.map((objective, index) => (
                    <li key={`${index}-${objective.slice(0, 24)}`} className="flex gap-3 text-sm text-[#c8def2]">
                      <span className="mt-[0.15rem] shrink-0 text-[0.68rem] uppercase tracking-[0.1em] text-[#f0b57a]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="leading-snug">{objective}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#8ea7c0]">No objective packet attached. Proceed to full dossier.</p>
              )}

              <div className="mt-5 border-t border-[#3d5a78]/45 pt-3 text-[0.65rem] uppercase tracking-[0.14em] text-[#7a96b4]">
                Auntie Dot // Packet ready
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
