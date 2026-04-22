'use client'

import Link from 'next/link'

export default function BackToMenuButton() {
  return (
    <div className="fixed left-4 top-4 z-50">
      <Link
        href="/?menu=1"
        className="group relative inline-flex min-h-[26px] items-center border border-[#4b5d73] bg-[linear-gradient(180deg,#3f556f_0%,#2b415d_46%,#1f3149_100%)] px-4 py-[2px] text-xs font-semibold tracking-[0.01em] text-[#d5e0ec] shadow-[inset_0_0_0_1px_rgba(15,28,44,0.72),0_2px_6px_rgba(0,0,0,0.5)] transition-all duration-150 hover:border-[#7f98b3] hover:text-[#eef5fc]"
        aria-label="Go back to main menu"
      >
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(142,166,191,0.18)_0%,rgba(71,96,125,0.1)_48%,rgba(22,39,59,0)_82%)]" />
        <span className="pointer-events-none absolute inset-x-[1px] top-[1px] h-px bg-[#c2d2e3]/36" />
        <span className="pointer-events-none absolute inset-x-[1px] bottom-[1px] h-px bg-black/55" />
        <span className="pointer-events-none absolute left-[1px] top-[1px] bottom-[1px] w-px bg-[#9aafc5]/24" />
        <span className="pointer-events-none absolute right-[1px] top-[1px] bottom-[1px] w-px bg-black/50" />
        <span className="pointer-events-none absolute inset-[1px] opacity-0 transition-opacity duration-150 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_center,rgba(174,196,220,0.2)_0%,rgba(90,120,151,0.14)_50%,rgba(19,34,51,0)_84%)]" />
        <span className="relative">Main Menu</span>
      </Link>
    </div>
  )
}
