'use client'

import { motion, useTransform, type MotionValue } from 'framer-motion'
import { Code2, Dumbbell, Fish, Gamepad2, Flag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

type SvgGlyphProps = SVGProps<SVGSVGElement>

/** Minimal maple leaf — Canada */
function MapleGlyph({ className, strokeWidth = 1.35, ...rest }: SvgGlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...rest}>
      <path
        d="M12 2.5 13.2 7.2 17.8 6l-3.1 4 3.8 2.3-4.6-.6L12 17.2l-1.9-5.5-4.6.6 3.8-2.3-3.1-4 4.6 1.2L12 2.5z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path d="M12 17v4.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

/** Simple basketball seams */
function BasketballGlyph({ className, strokeWidth = 1.35, ...rest }: SvgGlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...rest}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={strokeWidth} />
      <path
        d="M12 3v18M4.8 7.5c2.8 2.2 5.5 3.3 12.4 9M19.2 7.5c-2.8 2.2-5.5 3.3-12.4 9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Fishing rod + hook */
function FishingGlyph({ className, strokeWidth = 1.35, ...rest }: SvgGlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden {...rest}>
      <path
        d="M5 20c2.5-1.2 6-4.5 7-9 .8-3.5.5-6-.2-7.8"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M11.8 3.2 14 5.4l-1.2 1.2"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 15.5c0 1.9-1.1 3.5-2.5 3.5s-2.5-1-2.5-3c0-2 2-2.5 2.5-5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  )
}

type MotifIcon = LucideIcon | ComponentType<SvgGlyphProps>

const SCATTER: readonly {
  mx: number
  my: number
  className: string
  Icon: MotifIcon
}[] = [
  { mx: 50, my: 42, className: 'left-[4%] top-[16%] h-[3.25rem] w-[3.25rem] -rotate-10 sm:h-14 sm:w-14', Icon: MapleGlyph },
  { mx: -44, my: 36, className: 'right-[6%] top-[22%] h-12 w-12 rotate-[10deg] sm:h-14 sm:w-14', Icon: Flag },
  { mx: 38, my: -40, className: 'left-[8%] bottom-[24%] h-12 w-12 -rotate-6 sm:h-[3.35rem] sm:w-[3.35rem]', Icon: FishingGlyph },
  { mx: -46, my: 34, className: 'right-[4%] bottom-[20%] h-[3.25rem] w-[3.25rem] rotate-[12deg] sm:h-14 sm:w-14', Icon: BasketballGlyph },
  { mx: 28, my: 28, className: 'left-1/2 top-[11%] h-11 w-11 -translate-x-1/2 rotate-[6deg] sm:h-12 sm:w-12', Icon: Code2 },
  { mx: -30, my: -24, className: 'left-[18%] top-[46%] h-11 w-11 -rotate-[14deg]', Icon: Gamepad2 },
  { mx: 36, my: 20, className: 'right-[16%] top-[50%] h-11 w-11 rotate-[18deg]', Icon: Dumbbell },
  { mx: -22, my: -38, className: 'left-[2%] top-[58%] h-10 w-10 rotate-3 sm:h-12 sm:w-12', Icon: Fish },
]

const ORBIT: readonly MotifIcon[] = [
  MapleGlyph,
  Flag,
  FishingGlyph,
  BasketballGlyph,
  Code2,
  Gamepad2,
  Dumbbell,
  Fish,
]

export function ParallaxInterestMotif({
  sx,
  sy,
  mx,
  my,
  className,
  reduced,
  Icon,
}: {
  sx: MotionValue<number>
  sy: MotionValue<number>
  mx: number
  my: number
  className: string
  reduced: boolean
  Icon: MotifIcon
}) {
  const x = useTransform(sx, (v) => v * mx)
  const y = useTransform(sy, (v) => v * my)

  const base =
    'pointer-events-none absolute z-[1] text-wood-700/30 dark:text-wood-400/20'

  const glyph = <Icon className="h-full w-full" strokeWidth={1.15} />

  if (reduced) {
    return (
      <div className={`${base} ${className}`} aria-hidden>
        {glyph}
      </div>
    )
  }

  return (
    <motion.div className={`${base} ${className}`} style={{ x, y }} aria-hidden>
      {glyph}
    </motion.div>
  )
}

export function HeroInterestOrbit({
  reduced,
  ringX,
  ringY,
}: {
  reduced: boolean
  ringX: MotionValue<number>
  ringY: MotionValue<number>
}) {
  const n = ORBIT.length

  const wheel = (
    <div className="relative mx-auto h-[min(88vw,500px)] w-[min(88vw,500px)]">
      {ORBIT.map((Icon, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2
        const rPct = 44
        const x = 50 + rPct * Math.cos(angle)
        const y = 50 + rPct * Math.sin(angle)
        return (
          <div
            key={i}
            className="absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 text-wood-600/35 dark:text-wood-500/22 sm:h-12 sm:w-12"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <Icon className="h-full w-full" strokeWidth={1.1} />
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
      {reduced ? (
        wheel
      ) : (
        <motion.div className="pointer-events-none" style={{ x: ringX, y: ringY }}>
          {wheel}
        </motion.div>
      )}
    </div>
  )
}

export { SCATTER as HERO_SCATTER_MOTIFS }
