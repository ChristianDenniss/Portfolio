'use client'

import { motion } from 'framer-motion'

type Vital = { label: string; value: string }
type Campaign = { theater: string; role: string; dates: string }
type Commendation = { name: string; issuer: string; date: string }

/** Curated dossier rows mirrored from About experience / awards (no inventing). */
const VITALS: Vital[] = [
  { label: 'Nationality', value: 'Canadian-born' },
  { label: 'Height', value: `5'10"` },
  { label: 'Hair', value: 'Brown; Curly' },
  { label: 'Eyes', value: 'Dark-Brown' },
  { label: 'Birthday', value: 'April 1st (APRIL FOOLS!)' }
]

const CAMPAIGNS: Campaign[] = [
  {
    theater: 'A10 Networks',
    role: 'AI Security Engineer (Co-op)',
    dates: 'June 2026 - Sept 2026'
  },
  {
    theater: 'TrojAI',
    role: 'AI Security Engineer (Co-op)',
    dates: 'March 2026 - June 2026'
  },
  {
    theater: 'Red Thread Innovations',
    role: 'Software Engineer (Co-op)',
    dates: 'April 2025 - Sept 2025'
  },
  {
    theater: 'Full Frame Freelance',
    role: 'Full-stack software developer',
    dates: 'January 2025 - June 2025'
  }
]

const COMMENDATIONS: Commendation[] = [
  {
    name: '3rd Place (Site) | ICPC East Division Regional 2026',
    issuer: 'ICPC · Université de Moncton site',
    date: 'Nov 2026'
  },
  {
    name: '3rd Place | Atlantic Canadian Programming Competition',
    issuer: 'Science Atlantic · Team Tomato',
    date: 'Oct 2026'
  },
  {
    name: 'A10 Class of 2026',
    issuer: 'A10 Networks',
    date: 'Aug 2026'
  },
  {
    name: 'Hack Atlantic · Nibble',
    issuer: 'First hackathon, 24-hour build',
    date: 'Sept 2026'
  },
  {
    name: 'Golden Key Lifelong Member',
    issuer: 'Top 10% of field of study',
    date: 'Sept 2026'
  },
  {
    name: 'Fisher Foundation Scholarship',
    issuer: 'UNB · $1,500 (second award)',
    date: 'Fall 2026'
  }
]

function FrameCorners({ className = '' }: { className?: string }) {
  return (
    <>
      <span className={`pointer-events-none absolute left-2 top-[3px] h-px w-8 bg-[#a5c0e0]/45 ${className}`} />
      <span className="pointer-events-none absolute right-2 top-[3px] h-px w-8 bg-[#a5c0e0]/45" />
      <span className="pointer-events-none absolute bottom-[3px] left-2 h-px w-8 bg-[#a5c0e0]/35" />
      <span className="pointer-events-none absolute bottom-[3px] right-2 h-px w-8 bg-[#a5c0e0]/35" />
    </>
  )
}

export default function SpartanServiceRecord() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
      style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
    >
      <div className="relative border border-[#2a4461] bg-[linear-gradient(180deg,rgba(14,29,49,0.72)_0%,rgba(6,18,33,0.78)_100%)] px-3 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:px-4">
        <div className="pointer-events-none absolute -inset-[2px] border border-[#5d79a4]/40" />
        <FrameCorners />

        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#7a96b4]">UNSC personnel file</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3
              className="text-xl font-bold uppercase leading-none tracking-[0.1em] text-[#e8f4ff] drop-shadow-[0_0_14px_rgba(145,201,255,0.45)] sm:text-2xl"
              style={{ fontFamily: 'HaloLogo, HaloLogoOutline, "Arial Black", sans-serif' }}
            >
              Christian Dennis
            </h3>
            <p className="mt-2 text-[0.78rem] uppercase tracking-[0.12em] text-[#9ab6d2]">
              Service tag · Spartan-IV engineer track
            </p>
          </div>
          <div className="border border-[#7eb8ea]/28 bg-[#061a2c]/45 px-3 py-2 text-right backdrop-blur-[1px]">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-[#6d8aad]">Specialization</p>
            <p className="mt-1 text-[0.82rem] uppercase tracking-[0.08em] text-[#d7ebff]">AI security · full-stack</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 border-t border-[#4d6f8f]/35 pt-3 sm:grid-cols-3">
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[#6d8aad]">Homeworld</p>
            <p className="mt-1 text-sm text-[#cde3f7]">Saint John, NB · Canada</p>
          </div>
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[#6d8aad]">Current posting</p>
            <p className="mt-1 text-sm text-[#cde3f7]">A10 Networks · co-op</p>
          </div>
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-[#6d8aad]">Doctrine</p>
            <p className="mt-1 text-sm text-[#cde3f7]">Ship thin · measure · iterate</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="relative border border-[#2a4461] bg-[#030d18]/55 px-3 py-3 sm:px-4"
      >
        <div className="pointer-events-none absolute -inset-[2px] border border-[#56739d]/30" />
        <FrameCorners />
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8eb2d0]">Biometric vitals</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {VITALS.map((vital, index) => (
            <motion.div
              key={vital.label}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.12 + index * 0.04 }}
              className="border border-[#3d5a78]/70 bg-[#061a2c]/40 px-2.5 py-2"
            >
              <p className="text-[0.58rem] uppercase tracking-[0.14em] text-[#6d8aad]">{vital.label}</p>
              <p className="mt-1 text-[0.8rem] leading-snug text-[#e2f0ff]">{vital.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.14 }}
          className="relative border border-[#2a4461] bg-[#030d18]/55 px-3 py-3 sm:px-4"
        >
          <div className="pointer-events-none absolute -inset-[2px] border border-[#56739d]/30" />
          <FrameCorners />
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8eb2d0]">Career campaigns</p>
          <ul className="mt-3 space-y-2">
            {CAMPAIGNS.map((campaign) => (
              <li
                key={campaign.theater}
                className="border-l-2 border-[#f6a158]/80 bg-[linear-gradient(90deg,rgba(172,95,36,0.22)_0%,transparent_70%)] px-3 py-2"
              >
                <p className="text-[0.82rem] uppercase tracking-[0.06em] text-[#e8f4ff]">{campaign.theater}</p>
                <p className="mt-0.5 text-[0.75rem] text-[#b8d4ee]">{campaign.role}</p>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.1em] text-[#7a96b4]">{campaign.dates}</p>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
          className="relative border border-[#2a4461] bg-[#030d18]/55 px-3 py-3 sm:px-4"
        >
          <div className="pointer-events-none absolute -inset-[2px] border border-[#56739d]/30" />
          <FrameCorners />
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8eb2d0]">Commendations</p>
          <ul className="mt-3 space-y-2">
            {COMMENDATIONS.map((item) => (
              <li
                key={item.name}
                className="flex gap-3 border border-[#3d5a78]/55 bg-[#061a2c]/35 px-2.5 py-2"
              >
                <span
                  className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center border border-[#f0c36a]/55 bg-[#8a5a18]/45 text-[0.65rem] text-[#ffe6b0]"
                  aria-hidden
                >
                  ★
                </span>
                <div className="min-w-0">
                  <p className="text-[0.78rem] leading-snug text-[#e8f4ff]">{item.name}</p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.08em] text-[#8eb2d0]">
                    {item.issuer} · {item.date}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[#6d8aad]">
        Dossier mirrors Experience and Awards. Open those tabs for full after-action reports.
      </p>
    </motion.div>
  )
}
