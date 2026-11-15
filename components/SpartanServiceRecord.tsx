'use client'

import NextImage from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type CareerStat = { label: string; value: string }

type ServicePin = {
  id: string
  title: string
  blurb: string
  mark: string
  accent: string
}

/** Reach-style service record: pins map real education / awards. Graduate = UNB CS basic training. */
const CAREER_STATS: CareerStat[] = [
  { label: 'Specialization', value: 'AI security · full-stack' },
  { label: 'Homeworld', value: 'Saint John, NB' },
  { label: 'Posting', value: 'A10 Networks (co-op)' },
  { label: 'Height', value: `5'10"` },
  { label: 'Nationality', value: 'Canadian-born' },
  { label: 'Birthday', value: 'April 1st' }
]

const PINS: ServicePin[] = [
  {
    id: 'graduate',
    title: 'Graduate Pin',
    blurb: 'Completed basic training: Bachelor of Computer Science (co-op) at UNB Saint John, with distinction track. Enlisted Jan 2024 · estimated Apr 2027.',
    mark: 'UNB',
    accent: 'border-[#f0a05a]/70 bg-[#5a3018]/55 text-[#ffe4c4]'
  },
  {
    id: 'icpc',
    title: 'ICPC East Division',
    blurb: '3rd at the Université de Moncton site, 2026 East Division Regional Contest, Team Tomato (UNB Saint John).',
    mark: '3rd',
    accent: 'border-[#8fc2ea]/70 bg-[#1a3d5c]/70 text-[#d7ebff]'
  },
  {
    id: 'acpc',
    title: 'ACPC Site Medal',
    blurb: '3rd place, Atlantic Canadian Programming Competition 2026. Team Tomato; only team to solve problem H.',
    mark: 'H',
    accent: 'border-[#8fc2ea]/70 bg-[#1a3d5c]/70 text-[#d7ebff]'
  },
  {
    id: 'a10',
    title: 'A10 Class of 2026',
    blurb: 'Honoured after a successful internship project presentation at A10 Networks.',
    mark: 'A10',
    accent: 'border-[#f0c36a]/65 bg-[#8a5a18]/45 text-[#ffe6b0]'
  },
  {
    id: 'hack',
    title: 'Hack Atlantic',
    blurb: 'First hackathon: shipped Nibble in 24 hours at UNB Fredericton (Sept 2026).',
    mark: '24H',
    accent: 'border-[#7eb8ea]/55 bg-[#0a2a40]/65 text-[#cde3f7]'
  },
  {
    id: 'golden',
    title: 'Golden Key',
    blurb: 'Lifelong member inductee after ranking in the top 10% of field of study.',
    mark: 'GK',
    accent: 'border-[#f0c36a]/55 bg-[#6a4a18]/40 text-[#ffe6b0]'
  }
]

export default function SpartanServiceRecord() {
  const [selectedPinId, setSelectedPinId] = useState(PINS[0].id)
  const selectedPin = PINS.find((pin) => pin.id === selectedPinId) ?? PINS[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden border border-[#4d6f8f]/45 bg-[linear-gradient(180deg,rgba(12,28,48,0.82)_0%,rgba(4,14,28,0.88)_100%)] shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
      style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(157,188,231,0.35)_1px,transparent_1px)] [background-size:100%_3px]" />
      <div className="pointer-events-none absolute -inset-[2px] border border-[#7eb8ea]/25" />

      <div className="relative border-b border-[#5d79a4]/35 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden border border-[#8fc2ea]/50 bg-[#061a2c]">
            <NextImage
              src="/images/unblogo-removebg-preview.png"
              alt="UNB emblem"
              fill
              sizes="40px"
              className="object-contain p-1"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.78rem] uppercase tracking-[0.08em] text-[#cde3f7]">Christian Dennis</p>
            <h2
              className="text-2xl font-bold uppercase leading-none tracking-[0.08em] text-[#f0f7ff] sm:text-3xl"
              style={{ fontFamily: 'HaloLogo, HaloLogoOutline, "Arial Black", sans-serif' }}
            >
              Service Record
            </h2>
          </div>
        </div>
      </div>

      <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="border-b border-[#5d79a4]/30 px-4 py-5 sm:px-6 lg:border-b-0 lg:border-r">
          <div className="flex gap-4">
            <div className="relative hidden h-28 w-28 shrink-0 border border-[#8fc2ea]/45 bg-[#0a1e32] sm:block">
              <NextImage
                src="/images/unblogo-removebg-preview.png"
                alt="Service emblem"
                fill
                sizes="112px"
                className="object-contain p-3"
              />
              <span className="pointer-events-none absolute inset-[3px] border border-[#a5c0e0]/25" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg uppercase tracking-[0.06em] text-[#e8f4ff]">Christian Dennis</p>
              <p className="mt-1 text-[0.85rem] uppercase tracking-[0.1em] text-[#f0a05a]">
                Engineer Grade · BCS candidate
              </p>
              <p className="mt-3 text-[0.72rem] uppercase tracking-[0.12em] text-[#8eb2d0]">
                Spartan-IV engineer track · AI security
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-2.5 border-t border-[#4d6f8f]/35 pt-5">
            {CAREER_STATS.map((stat) => (
              <div key={stat.label} className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-3 text-sm">
                <dt className="uppercase tracking-[0.08em] text-[#9ab6d2]">{stat.label}</dt>
                <dd className="text-right uppercase tracking-[0.04em] text-[#e8f4ff]">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="relative min-h-[16rem] bg-[#020a12]/40 lg:min-h-full"
        >
          <NextImage
            src="/images/placeHolderCentrePiece.png"
            alt="Christian Dennis portrait"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-contain object-bottom p-4 sm:p-6"
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,transparent_35%,rgba(2,10,18,0.55)_100%)]" />
          <div className="pointer-events-none absolute inset-3 border border-[#7eb8ea]/20" />
        </motion.div>
      </div>

      <div className="relative border-t border-[#5d79a4]/35 bg-[#061422]/55 px-4 py-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-bar-only sm:gap-3">
          {PINS.map((pin) => {
            const active = pin.id === selectedPinId
            return (
              <button
                key={pin.id}
                type="button"
                onClick={() => setSelectedPinId(pin.id)}
                aria-pressed={active}
                className={`relative flex h-[4.25rem] w-[4.25rem] shrink-0 flex-col items-center justify-center border transition-colors ${
                  active
                    ? `${pin.accent} border-[#f0a05a]`
                    : 'border-[#3d5a78] bg-[#0a1a2c]/70 text-[#8eb2d0] hover:border-[#7eb8ea]/55 hover:text-[#d7ebff]'
                }`}
              >
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.06em]">{pin.mark}</span>
                {active ? (
                  <motion.span
                    layoutId="service-pin-underline"
                    className="absolute -bottom-[3px] left-1 right-1 h-[3px] bg-[#f0a05a]"
                  />
                ) : null}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPin.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-4 min-h-[4.5rem]"
          >
            <p className="text-base uppercase tracking-[0.08em] text-[#f0f7ff]">{selectedPin.title}</p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#b8d4ee]">{selectedPin.blurb}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
