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

/** Halo service-record labels; values mapped from real academics / service. */
const CAREER_STATS: CareerStat[] = [
  { label: 'Highest Skill Achieved', value: '3.7' },
  { label: 'Experience (EXP)', value: '20' },
  { label: 'Next Promotion', value: 'Graduation' },
  { label: 'Nationality', value: 'Canadian-born' }
]

/** Pin icons are logos under /public/images. Graduate = UNB CS basic training. */
const PINS: ServicePin[] = [
  {
    id: 'graduate',
    title: 'Graduate Pin',
    blurb: 'Completed basic training.',
    icon: '/images/unblogo-removebg-preview.png',
    iconAlt: 'University of New Brunswick'
  },
  {
    id: 'icpc',
    title: 'ICPC East Division',
    blurb: '3rd at Université de Moncton site, Team Tomato.',
    icon: '/images/awards/icpc-logo.png',
    iconAlt: 'ICPC'
  },
  {
    id: 'acpc',
    title: 'ACPC Site Medal',
    blurb: '3rd place ACPC 2026; only team to solve H.',
    icon: '/images/ScienceAtlanticLogo.png',
    iconAlt: 'Science Atlantic'
  },
  {
    id: 'a10',
    title: 'A10 Class of 2026',
    blurb: 'Honoured after internship project presentation.',
    icon: '/images/A10Logo.png',
    iconAlt: 'A10 Networks'
  },
  {
    id: 'hack',
    title: 'Hack Atlantic',
    blurb: 'First hackathon; shipped Nibble in 24 hours.',
    icon: '/images/HackAtlanticLogo.png',
    iconAlt: 'Hack Atlantic'
  },
  {
    id: 'golden',
    title: 'Golden Key',
    blurb: 'Lifelong member; top 10% of field of study.',
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
      className="relative overflow-hidden border border-[#4d6f8f]/40 bg-[#0b1a2c]/90 shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
      style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(157,188,231,0.4)_1px,transparent_1px)] [background-size:100%_3px]" />
      <div className="pointer-events-none absolute -inset-[2px] border border-[#7eb8ea]/20" />

      {/* Halo 3 composition: dense left dossier, full-height portrait right */}
      <div className="relative grid lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)] lg:min-h-[28rem]">
        <div className="relative z-10 flex flex-col bg-[#0d1f33]/75 px-3 py-3 sm:px-4 sm:py-3.5 lg:border-r lg:border-[#5d79a4]/30">
          <div className="flex items-start gap-2.5">
            <div className="relative h-14 w-14 shrink-0 border border-[#8fc2ea]/40 bg-[#081624] sm:h-16 sm:w-16">
              <NextImage
                src="/images/unblogo-removebg-preview.png"
                alt="Service emblem"
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </div>
            <div className="min-w-0 leading-none">
              <p className="text-[1.05rem] uppercase tracking-[0.04em] text-[#f2f7fc] sm:text-[1.15rem]">
                Christian Dennis
              </p>
              <p className="mt-1 text-[0.72rem] uppercase tracking-[0.1em] text-[#8eb8d8]">
                Spartan · Engineer track
              </p>
              <p className="mt-2 text-[0.78rem] uppercase tracking-[0.06em] text-[#c5d8ea]">
                Engineer Grade · BCS candidate
              </p>
            </div>
          </div>

          <dl className="mt-4 space-y-1">
            {CAREER_STATS.map((stat) => (
              <div
                key={stat.label}
                className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,0.7fr)] items-baseline gap-2"
              >
                <dt className="text-[0.82rem] uppercase leading-tight tracking-[0.02em] text-[#e8f2fa]">
                  {stat.label}
                </dt>
                <dd className="text-right text-[0.82rem] uppercase tracking-[0.02em] text-[#e8f2fa]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto pt-4">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-bar-only">
              {PINS.map((pin) => {
                const active = pin.id === selectedPinId
                return (
                  <button
                    key={pin.id}
                    type="button"
                    onClick={() => setSelectedPinId(pin.id)}
                    aria-pressed={active}
                    aria-label={pin.title}
                    className={`relative flex h-11 w-11 shrink-0 items-center justify-center border bg-[#081624] p-0.5 transition-colors sm:h-12 sm:w-12 ${
                      active ? 'border-[#e8943a]' : 'border-[#3d5a78]/80 hover:border-[#7eb8ea]/50'
                    }`}
                  >
                    <span className="relative h-full w-full">
                      <NextImage
                        src={pin.icon}
                        alt={pin.iconAlt}
                        fill
                        sizes="48px"
                        className="object-contain p-0.5"
                      />
                    </span>
                    {active ? (
                      <motion.span
                        layoutId="service-pin-underline"
                        className="absolute -bottom-[3px] left-0 right-0 h-[2px] bg-[#e8943a]"
                      />
                    ) : null}
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPin.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="mt-2"
              >
                <p className="text-[0.9rem] uppercase leading-none tracking-[0.06em] text-[#f2f7fc]">
                  {selectedPin.title}
                </p>
                <p className="mt-1 text-[0.75rem] leading-snug text-[#9ab4c8]">{selectedPin.blurb}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="relative min-h-[16rem] bg-[#060e18] sm:min-h-[20rem] lg:min-h-full"
        >
          <NextImage
            src="/images/placeHolderCentrePiece.png"
            alt="Christian Dennis portrait"
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover object-[center_18%] lg:object-[center_12%]"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(13,31,51,0.75)_0%,transparent_18%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,14,24,0.25)_0%,transparent_30%,rgba(6,14,24,0.35)_100%)]" />
        </motion.div>
      </div>
    </motion.div>
  )
}
