'use client'

import NextImage from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type CareerStat = { label: string; value: string }

type ServicePin = {
  id: string
  title: string
  blurb: string
  icon: string
  iconAlt: string
}

/** Reach-faithful career readout; values mapped from real academics / service time. */
const CAREER_STATS: CareerStat[] = [
  { label: 'Highest Skill Achieved', value: '3.7' },
  { label: 'Experience (EXP)', value: '20' },
  { label: 'Next Promotion', value: 'Graduation' }
]

/** Pin icons are real logos under /public/images. Graduate = UNB CS basic training. */
const PINS: ServicePin[] = [
  {
    id: 'graduate',
    title: 'Graduate Pin',
    blurb: 'Completed basic training: Bachelor of Computer Science (co-op) at UNB Saint John. Enlisted Jan 2024 · estimated Apr 2027.',
    icon: '/images/unblogo-removebg-preview.png',
    iconAlt: 'University of New Brunswick'
  },
  {
    id: 'icpc',
    title: 'ICPC East Division',
    blurb: '3rd at the Université de Moncton site, 2026 East Division Regional Contest, Team Tomato (UNB Saint John).',
    icon: '/images/awards/icpc-logo.png',
    iconAlt: 'ICPC'
  },
  {
    id: 'acpc',
    title: 'ACPC Site Medal',
    blurb: '3rd place, Atlantic Canadian Programming Competition 2026. Team Tomato; only team to solve problem H.',
    icon: '/images/ScienceAtlanticLogo.png',
    iconAlt: 'Science Atlantic'
  },
  {
    id: 'a10',
    title: 'A10 Class of 2026',
    blurb: 'Honoured after a successful internship project presentation at A10 Networks.',
    icon: '/images/A10Logo.png',
    iconAlt: 'A10 Networks'
  },
  {
    id: 'hack',
    title: 'Hack Atlantic',
    blurb: 'First hackathon: shipped Nibble in 24 hours at UNB Fredericton (Sept 2026).',
    icon: '/images/HackAtlanticLogo.png',
    iconAlt: 'Hack Atlantic'
  },
  {
    id: 'golden',
    title: 'Golden Key',
    blurb: 'Lifelong member inductee after ranking in the top 10% of field of study.',
    icon: '/images/GoldenKeyLogo.png',
    iconAlt: 'Golden Key International Honour Society'
  }
]

export default function SpartanServiceRecord() {
  const [selectedPinId, setSelectedPinId] = useState(PINS[0].id)
  const selectedPin = PINS.find((pin) => pin.id === selectedPinId) ?? PINS[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden border border-[#4d6f8f]/45 bg-[linear-gradient(180deg,rgba(12,28,48,0.88)_0%,rgba(4,14,28,0.92)_100%)] shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
      style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.1] [background-image:linear-gradient(rgba(157,188,231,0.35)_1px,transparent_1px)] [background-size:100%_3px]" />
      <div className="pointer-events-none absolute -inset-[2px] border border-[#7eb8ea]/22" />

      <div className="relative flex items-center gap-2.5 border-b border-[#5d79a4]/35 px-3 py-1.5 sm:px-4">
        <div className="relative h-7 w-7 shrink-0 overflow-hidden border border-[#8fc2ea]/45 bg-[#061a2c]">
          <NextImage
            src="/images/unblogo-removebg-preview.png"
            alt="UNB emblem"
            fill
            sizes="28px"
            className="object-contain p-0.5"
          />
        </div>
        <div className="min-w-0 leading-none">
          <p className="truncate text-[0.68rem] uppercase tracking-[0.08em] text-[#b8d4ee]">Christian Dennis</p>
          <h2
            className="mt-0.5 text-xl font-bold uppercase tracking-[0.06em] text-[#f0f7ff] sm:text-2xl"
            style={{ fontFamily: 'HaloLogo, HaloLogoOutline, "Arial Black", sans-serif' }}
          >
            Service Record
          </h2>
        </div>
      </div>

      {/* Main: compact dossier left, large portrait right (Reach composition) */}
      <div className="relative grid min-h-[18rem] sm:min-h-[22rem] lg:min-h-[26rem] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)]">
        <div className="relative z-10 flex flex-col justify-between border-b border-[#5d79a4]/30 bg-[#061422]/55 px-3 py-3 sm:px-4 lg:border-b-0 lg:border-r lg:bg-[#061422]/35">
          <div className="flex items-start gap-2.5">
            <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 border border-[#8fc2ea]/45 bg-[#0a1e32] sm:h-[5.25rem] sm:w-[5.25rem]">
              <NextImage
                src="/images/unblogo-removebg-preview.png"
                alt="Service emblem"
                fill
                sizes="84px"
                className="object-contain p-1.5"
              />
              <span className="pointer-events-none absolute inset-[2px] border border-[#a5c0e0]/20" />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="text-[0.95rem] uppercase leading-tight tracking-[0.04em] text-[#e8f4ff] sm:text-base">
                Christian Dennis
              </p>
              <p className="mt-1 text-[0.72rem] uppercase tracking-[0.08em] text-[#f0a05a]">
                Engineer Grade · BCS candidate
              </p>
            </div>
          </div>

          <dl className="mt-3 space-y-1 sm:mt-4">
            {CAREER_STATS.map((stat) => (
              <div
                key={stat.label}
                className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] items-baseline gap-2"
              >
                <dt className="text-[0.8rem] uppercase leading-tight tracking-[0.03em] text-[#e8f4ff] sm:text-[0.88rem]">
                  {stat.label}
                </dt>
                <dd className="text-right text-[0.8rem] uppercase tracking-[0.03em] text-[#e8f4ff] sm:text-[0.88rem]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="relative min-h-[14rem] bg-[#020a12] sm:min-h-[18rem] lg:min-h-0"
        >
          <NextImage
            src="/images/placeHolderCentrePiece.png"
            alt="Christian Dennis portrait"
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover object-[center_20%] sm:object-contain sm:object-bottom sm:p-2"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,20,34,0.55)_0%,transparent_28%)] lg:bg-[linear-gradient(90deg,rgba(6,20,34,0.65)_0%,transparent_22%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(2,10,18,0.5)_100%)]" />
          <div className="pointer-events-none absolute inset-2 border border-[#7eb8ea]/18" />
        </motion.div>
      </div>

      <div className="relative border-t border-[#5d79a4]/35 bg-[#061422]/70 px-3 py-2.5 sm:px-4">
        <div className="flex items-end gap-3 sm:gap-4">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-bar-only sm:gap-2">
            {PINS.map((pin) => {
              const active = pin.id === selectedPinId
              return (
                <button
                  key={pin.id}
                  type="button"
                  onClick={() => setSelectedPinId(pin.id)}
                  aria-pressed={active}
                  aria-label={pin.title}
                  className={`relative flex h-12 w-12 shrink-0 items-center justify-center border bg-[#0a1a2c]/90 p-1 transition-colors sm:h-14 sm:w-14 ${
                    active
                      ? 'border-[#f0a05a]'
                      : 'border-[#3d5a78] hover:border-[#7eb8ea]/55'
                  }`}
                >
                  <span className="relative h-full w-full">
                    <NextImage src={pin.icon} alt={pin.iconAlt} fill sizes="48px" className="object-contain p-0.5" />
                  </span>
                  {active ? (
                    <motion.span
                      layoutId="service-pin-underline"
                      className="absolute -bottom-[2px] left-0.5 right-0.5 h-[2px] bg-[#f0a05a]"
                    />
                  ) : null}
                </button>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPin.id}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.18 }}
              className="min-w-0 flex-1 pb-0.5"
            >
              <p className="text-[0.85rem] uppercase leading-tight tracking-[0.06em] text-[#f0f7ff] sm:text-[0.95rem]">
                {selectedPin.title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[0.72rem] leading-snug text-[#9ab6d2] sm:text-[0.78rem]">
                {selectedPin.blurb}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
