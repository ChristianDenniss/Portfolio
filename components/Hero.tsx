'use client'

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion'
import { ArrowDown, Github, Linkedin, Mail } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

const PLANKS = [
  { mx: 52, my: 40, className: 'left-[4%] top-[18%] h-3 w-44 -rotate-6 sm:w-56' },
  { mx: -40, my: 32, className: 'right-[8%] top-[26%] h-3.5 w-40 rotate-[14deg] sm:w-48' },
  { mx: 36, my: -44, className: 'left-[10%] bottom-[26%] h-2.5 w-32 rotate-4 sm:w-40' },
  { mx: -48, my: 36, className: 'right-[4%] bottom-[22%] h-3 w-48 -rotate-[11deg] sm:w-60' },
  { mx: 26, my: 26, className: 'left-1/2 top-[10%] h-2 w-28 -translate-x-1/2 rotate-[5deg] sm:w-36' },
  { mx: -28, my: -22, className: 'left-[20%] top-[48%] h-2 w-20 -rotate-[18deg]' },
  { mx: 34, my: 18, className: 'right-[18%] top-[52%] h-2.5 w-24 rotate-[22deg]' },
  { mx: -20, my: -36, className: 'left-[2%] top-[62%] h-3 w-36 rotate-2 sm:w-44' },
] as const

const EMBERS = Array.from({ length: 48 }, (_, i) => ({
  left: (i * 37 + 7) % 93,
  top: (i * 59 + 11) % 87,
  delay: ((i * 0.31) % 4.8).toFixed(2),
  dur: (3.4 + (i % 9) * 0.28).toFixed(2),
  size: 3 + (i % 4),
}))

function ParallaxPlank({
  sx,
  sy,
  mx,
  my,
  className,
  reduced,
}: {
  sx: MotionValue<number>
  sy: MotionValue<number>
  mx: number
  my: number
  className: string
  reduced: boolean
}) {
  const x = useTransform(sx, (v) => v * mx)
  const y = useTransform(sy, (v) => v * my)

  const base =
    'wood-panel cabin-border pointer-events-none absolute z-[1] rounded-sm shadow-lg opacity-95 dark:opacity-85'

  if (reduced) {
    return <div className={`${base} ${className}`} aria-hidden />
  }

  return <motion.div className={`${base} ${className}`} style={{ x, y }} aria-hidden />
}

function TreeRings({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      pointerEvents="none"
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="200" cy="200" r="195" fill="none" className="stroke-wood-600/15 dark:stroke-wood-500/10" strokeWidth="0.75" />
      <circle cx="200" cy="200" r="185" fill="none" className="stroke-wood-600/25 dark:stroke-wood-500/15" strokeWidth="1" />
      <circle cx="200" cy="200" r="155" fill="none" className="stroke-wood-600/30 dark:stroke-wood-500/18" strokeWidth="1" />
      <circle cx="200" cy="200" r="125" fill="none" className="stroke-wood-600/28 dark:stroke-wood-500/15" strokeWidth="1" />
      <circle cx="200" cy="200" r="95" fill="none" className="stroke-wood-600/35 dark:stroke-wood-500/20" strokeWidth="1" />
      <circle cx="200" cy="200" r="65" fill="none" className="stroke-wood-600/40 dark:stroke-wood-500/22" strokeWidth="1" />
      <circle cx="200" cy="200" r="38" fill="none" className="stroke-wood-700/40 dark:stroke-wood-400/25" strokeWidth="1" />
      <ellipse
        cx="200"
        cy="200"
        rx="12"
        ry="18"
        className="fill-wood-800/10 dark:fill-wood-400/10"
        transform="rotate(-12 200 200)"
      />
    </svg>
  )
}

const block = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 440, damping: 24, mass: 0.9 },
  },
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.085, delayChildren: 0.05 },
  },
}

export default function Hero() {
  const reduced = useReducedMotion()
  const [spot, setSpot] = useState({ x: 50, y: 42 })
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 90, damping: 14, mass: 0.22 })
  const sy = useSpring(my, { stiffness: 90, damping: 14, mass: 0.22 })

  const ringX = useTransform(sx, (v) => v * 22)
  const ringY = useTransform(sy, (v) => v * 18)
  const slashX = useTransform(sx, (v) => v * 14)
  const slashY = useTransform(sy, (v) => v * 11)
  const slash2X = useTransform(sx, (v) => v * -12)
  const slash2Y = useTransform(sy, (v) => v * 9)

  /* Extreme card bend — perspective + multi-axis */
  const rotateX = useTransform(sy, [-0.5, 0.5], [34, -34])
  const rotateY = useTransform(sx, [-0.5, 0.5], [-38, 38])
  const rotateZ = useTransform([sx, sy], ([x, y]: number[]) => (x - y) * 22)
  /* Keep translateZ at 0 — large 3D Z breaks hit-testing on tilted card (links/buttons). */
  const translateZ = 0

  /* Light: normal blend so the beam reads on pale wood (soft-light was invisible) */
  const spotlightLight = useMemo(
    () =>
      ({
        background: `radial-gradient(circle 200px at ${spot.x}% ${spot.y}%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 244, 228, 0.28) 40%, transparent 54%)`,
      }) as React.CSSProperties,
    [spot.x, spot.y]
  )

  /* Dark: narrow “beam” — small radius, subtle center */
  const spotlightDark = useMemo(
    () =>
      ({
        background: `radial-gradient(circle 115px at ${spot.x}% ${spot.y}%, rgba(255, 232, 200, 0.22) 0%, rgba(255, 210, 160, 0.08) 52%, transparent 68%)`,
      }) as React.CSSProperties,
    [spot.x, spot.y]
  )

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect()
      const px = ((e.clientX - r.left) / r.width) * 100
      const py = ((e.clientY - r.top) / r.height) * 100
      setSpot({ x: px, y: py })
      if (reduced) return
      mx.set((e.clientX - r.left) / r.width - 0.5)
      my.set((e.clientY - r.top) / r.height - 0.5)
    },
    [mx, my, reduced]
  )

  const onLeave = useCallback(() => {
    setSpot({ x: 50, y: 42 })
    mx.set(0)
    my.set(0)
  }, [mx, my])

  return (
    <section
      id="home"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-32 sm:px-6 sm:pb-36"
    >
      <div className="wood-panel pointer-events-none absolute inset-0" />
      <div className="hero-mesh" aria-hidden />
      <div className="hero-noise" aria-hidden />
      <div className="hero-vignette pointer-events-none z-[1]" aria-hidden />
      <div
        className="wood-texture pointer-events-none absolute inset-0 z-[1] opacity-[0.32] dark:opacity-[0.2]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.16] dark:opacity-[0.09]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' x='0' y='0' width='200' height='200' patternUnits='userSpaceOnUse'%3E%3Crect width='200' height='200' fill='%23b8764a' opacity='0.08'/%3E%3Cpath d='M0 15 Q50 10 100 15 T200 15 L200 20 Q150 25 100 20 T0 20 Z' fill='%23a5623e' opacity='0.12'/%3E%3Cpath d='M0 55 Q50 50 100 55 T200 55 L200 60 Q150 65 100 60 T0 60 Z' fill='%23a5623e' opacity='0.12'/%3E%3Cpath d='M0 95 Q50 90 100 95 T200 95 L200 100 Q150 105 100 100 T0 100 Z' fill='%23a5623e' opacity='0.12'/%3E%3Cpath d='M0 135 Q50 130 100 135 T200 135 L200 140 Q150 145 100 140 T0 140 Z' fill='%23a5623e' opacity='0.12'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23g)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      {/* Cursor spotlight — separate tuning for light vs dark */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] dark:hidden"
        style={spotlightLight}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] hidden mix-blend-normal dark:block"
        style={spotlightDark}
        aria-hidden
      />

      {/* Floating embers */}
      {!reduced &&
        EMBERS.map((e, i) => (
          <div
            key={i}
            className="pointer-events-none absolute z-[4] animate-ember rounded-full bg-gradient-to-t from-amber-400/60 to-orange-200/30 shadow-[0_0_12px_rgba(251,191,36,0.45)] dark:from-amber-500/35 dark:to-orange-400/15 dark:shadow-[0_0_14px_rgba(251,191,36,0.2)]"
            style={{
              left: `${e.left}%`,
              top: `${e.top}%`,
              width: e.size,
              height: e.size,
              animationDelay: `${e.delay}s`,
              animationDuration: `${e.dur}s`,
            }}
            aria-hidden
          />
        ))}

      {/* Light slashes */}
      {!reduced ? (
        <>
          <motion.div
            style={{ x: slashX, y: slashY }}
            className="pointer-events-none absolute -left-[22%] top-[12%] z-[3] h-[130%] w-[2px] rotate-[16deg] bg-gradient-to-b from-transparent via-amber-100/70 to-transparent shadow-[0_0_20px_rgba(253,230,138,0.35)] dark:via-wood-400/30"
            aria-hidden
          />
          <motion.div
            style={{ x: slash2X, y: slash2Y }}
            className="pointer-events-none absolute -right-[18%] top-[20%] z-[3] h-[110%] w-px -rotate-[12deg] bg-gradient-to-b from-transparent via-amber-200/60 to-transparent dark:via-wood-400/35"
            aria-hidden
          />
        </>
      ) : (
        <>
          <div
            className="pointer-events-none absolute -left-[22%] top-[12%] z-[3] h-[130%] w-[2px] rotate-[16deg] bg-gradient-to-b from-transparent via-amber-100/70 to-transparent dark:via-wood-400/30"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-[18%] top-[20%] z-[3] h-[110%] w-px -rotate-[12deg] bg-gradient-to-b from-transparent via-amber-200/60 to-transparent dark:via-wood-400/35"
            aria-hidden
          />
        </>
      )}

      {PLANKS.map((p, i) => (
        <ParallaxPlank key={i} sx={sx} sy={sy} reduced={!!reduced} {...p} />
      ))}

      {/* Tree rings: outer slow spin + inner parallax */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
        {!reduced ? (
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 220, repeat: Infinity, ease: 'linear' }}
          >
            <TreeRings className="h-[min(120vw,640px)] w-[min(120vw,640px)] opacity-[0.35] dark:opacity-[0.22]" />
          </motion.div>
        ) : (
          <TreeRings className="h-[min(120vw,640px)] w-[min(120vw,640px)] opacity-[0.35] dark:opacity-[0.22]" />
        )}
        {!reduced ? (
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ x: ringX, y: ringY }}
          >
            <motion.div
              className="pointer-events-none"
              animate={{ rotate: -360 }}
              transition={{ duration: 340, repeat: Infinity, ease: 'linear' }}
            >
              <TreeRings className="h-[min(100vw,520px)] w-[min(100vw,520px)] opacity-90" />
            </motion.div>
          </motion.div>
        ) : (
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <TreeRings className="h-[min(100vw,520px)] w-[min(100vw,520px)] opacity-90" />
          </div>
        )}
      </div>

      <div
        className="relative z-20 mx-auto w-full max-w-lg sm:max-w-xl"
        style={{ perspective: 620 }}
      >
        {!reduced && (
          <div
            className="animate-hero-pulse-glow pointer-events-none absolute -inset-10 -z-10 rounded-3xl bg-gradient-to-br from-wood-500/35 via-wood-400/25 to-amber-200/30 blur-3xl dark:from-wood-700/25 dark:via-bark-800/20 dark:to-amber-950/25"
            aria-hidden
          />
        )}

        <motion.div
          className="pointer-events-auto"
            style={{
            rotateX: reduced ? 0 : rotateX,
            rotateY: reduced ? 0 : rotateY,
            rotateZ: reduced ? 0 : rotateZ,
            translateZ,
            transformStyle: 'preserve-3d',
            willChange: reduced ? undefined : 'transform',
          }}
        >
          <div className="hero-aurora-wrap pointer-events-auto">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="cabin-border pointer-events-auto relative overflow-hidden rounded-sm border-wood-400/60 bg-white/50 p-8 shadow-[0_28px_70px_-18px_rgba(90,54,42,0.45),0_0_0_1px_rgba(255,255,255,0.08)_inset] backdrop-blur-md dark:border-wood-600/40 dark:bg-stone-900/65 dark:shadow-[0_32px_80px_-20px_rgba(0,0,0,0.65)] sm:p-10"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border-2 border-wood-400/25 dark:border-wood-600/25"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-gradient-to-tr from-amber-200/30 to-transparent blur-2xl dark:from-wood-600/20"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-wood-200/15 dark:from-white/[0.04] dark:to-stone-800/40"
                aria-hidden
              />

              <div className="relative z-[1] space-y-5 text-center sm:space-y-6">
                <motion.p variants={block} className="text-sm text-bark-600 dark:text-wood-400">
                  Full-stack developer · Canada
                </motion.p>

                <motion.div variants={block} className="relative font-display">
                  <h1 className="text-[clamp(2.75rem,10vw,4.25rem)] font-bold leading-[0.92] tracking-tight">
                    <span className="block gradient-text">Christian</span>
                    <span className="mt-1 block text-bark-900 sm:pl-[8%] dark:text-wood-50">
                      Dennis
                    </span>
                  </h1>
                </motion.div>

                <motion.div
                  variants={block}
                  className="mx-auto h-[2px] max-w-[220px] bg-gradient-to-r from-transparent via-wood-600/80 to-transparent shadow-[0_0_12px_rgba(165,98,62,0.35)] dark:via-wood-400/55 dark:shadow-[0_0_16px_rgba(165,98,62,0.2)]"
                  aria-hidden
                />

                <motion.p
                  variants={block}
                  className="text-base leading-relaxed text-bark-700 dark:text-wood-300"
                >
                  Portfolio site. Each project opens a modal with details and links to the repo or live app.
                </motion.p>

                <motion.div
                  variants={block}
                  className="flex flex-col items-stretch gap-3 pt-1 sm:flex-row sm:justify-center sm:gap-4"
                >
                  <motion.a
                    href="#projects"
                    className="group cabin-border relative overflow-hidden rounded-sm bg-wood-800 px-8 py-3 text-center text-sm font-semibold text-wood-50 shadow-[0_8px_24px_-4px_rgba(90,54,42,0.55)] transition-colors hover:bg-wood-900 dark:bg-wood-700 dark:hover:bg-wood-600"
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="relative z-10">Projects</span>
                    <span
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[650ms] ease-out group-hover:translate-x-full"
                      aria-hidden
                    />
                  </motion.a>
                  <motion.a
                    href="https://github.com/ChristianDenniss"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cabin-border rounded-sm bg-wood-100/90 px-8 py-3 text-center text-sm font-semibold text-bark-900 transition-colors hover:bg-wood-200 dark:bg-stone-800/95 dark:text-wood-100 dark:hover:bg-stone-700"
                    whileHover={{ scale: 1.03, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    GitHub
                  </motion.a>
                </motion.div>

                <motion.div variants={block} className="flex justify-center gap-8 pt-2">
                  <motion.a
                    href="https://github.com/ChristianDenniss"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bark-600 transition-colors hover:text-wood-700 dark:text-wood-400 dark:hover:text-wood-200"
                    aria-label="GitHub"
                    whileHover={{ y: -4, scale: 1.08 }}
                  >
                    <Github size={22} strokeWidth={1.75} />
                  </motion.a>
                  <motion.a
                    href="https://www.linkedin.com/in/christian-dennis-43601a2a1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bark-600 transition-colors hover:text-wood-700 dark:text-wood-400 dark:hover:text-wood-200"
                    aria-label="LinkedIn"
                    whileHover={{ y: -4, scale: 1.08 }}
                  >
                    <Linkedin size={22} strokeWidth={1.75} />
                  </motion.a>
                  <motion.a
                    href="mailto:aottgpvp@gmail.com"
                    className="text-bark-600 transition-colors hover:text-wood-700 dark:text-wood-400 dark:hover:text-wood-200"
                    aria-label="Email"
                    whileHover={{ y: -4, scale: 1.08 }}
                  >
                    <Mail size={22} strokeWidth={1.75} />
                  </motion.a>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] h-16 text-wood-200 dark:text-stone-900 sm:h-[4.5rem]">
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden
        >
          <path d="M0,40 C200,12 400,56 600,32 C800,8 1000,60 1200,36 C1320,20 1380,28 1440,22 L1440,72 L0,72 Z" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="pointer-events-none absolute bottom-[4.25rem] left-1/2 z-20 -translate-x-1/2 sm:bottom-[5rem]"
        aria-hidden
      >
        <motion.div
          animate={reduced ? undefined : { y: [0, 9, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown className="text-wood-900 dark:text-wood-400" size={26} strokeWidth={2} />
        </motion.div>
      </motion.div>
    </section>
  )
}
