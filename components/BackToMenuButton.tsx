'use client'

import Link from 'next/link'

import { playPortfolioBackToMenuSound } from '@/lib/portfolioSfx'

export default function BackToMenuButton() {
  return (
    <div className="fixed left-3 top-3 z-50 sm:left-4 sm:top-4">
      <Link
        href="/?menu=1"
        onClick={() => {
          playPortfolioBackToMenuSound()
        }}
        aria-label="Go back to main menu"
        className="group relative inline-flex min-h-[34px] items-center gap-2.5 overflow-hidden border border-[#2a4a68] bg-[linear-gradient(180deg,rgba(14,29,49,0.94)_0%,rgba(6,18,33,0.96)_100%)] px-3.5 py-1.5 text-[#9ab6d2] shadow-[0_8px_22px_rgba(0,0,0,0.45)] backdrop-blur-[2px] transition-colors duration-150 hover:border-[#7eb8ea]/70 hover:text-[#e8f4ff]"
        style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
      >
        {/* Outer HUD frame */}
        <span className="pointer-events-none absolute -inset-[2px] border border-[#5d79a4]/40" aria-hidden />
        <span className="pointer-events-none absolute left-2 top-[2px] h-px w-5 bg-[#a5c0e0]/50" aria-hidden />
        <span className="pointer-events-none absolute right-2 top-[2px] h-px w-5 bg-[#a5c0e0]/50" aria-hidden />
        <span className="pointer-events-none absolute bottom-[2px] left-2 h-px w-5 bg-[#a5c0e0]/35" aria-hidden />
        <span className="pointer-events-none absolute bottom-[2px] right-2 h-px w-5 bg-[#a5c0e0]/35" aria-hidden />

        {/* Selection rail (idle cyan → hover amber like menu focus) */}
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-[#4d7fad] transition-colors duration-150 group-hover:bg-[#f6a158]"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100 bg-[linear-gradient(90deg,rgba(172,95,36,0.45)_0%,rgba(145,77,30,0.22)_55%,transparent_100%)]"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:repeating-linear-gradient(180deg,rgba(157,188,231,0.35)_0px,rgba(157,188,231,0.35)_0.8px,transparent_1.2px,transparent_3px)]"
          aria-hidden
        />

        <span
          className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center border border-[#6d91b5]/55 bg-[#0a1a2c]/70 text-[#b5cee7] transition-colors duration-150 group-hover:border-[#f0b57a]/70 group-hover:text-[#ffe8c8]"
          aria-hidden
        >
          <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current" aria-hidden="true">
            <path d="M10.2 2.4 4.6 8l5.6 5.6.9-.9L6.4 8l4.7-4.7-.9-.9z" />
          </svg>
        </span>
        <span className="relative text-[0.78rem] font-normal uppercase leading-none tracking-[0.14em]">
          Main Menu
        </span>
      </Link>
    </div>
  )
}
