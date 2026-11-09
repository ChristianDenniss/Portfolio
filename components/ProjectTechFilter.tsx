'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Filter, Layers, Search, type LucideIcon } from 'lucide-react'

import { usePortalDropdown } from '@/hooks/usePortalDropdown'

type ProjectTechFilterProps = {
  options: string[]
  selected: Set<string>
  onChange: (next: Set<string>) => void
  /** Short idle label (mobile). Default: Filter */
  idleLabel?: string
  /** Full idle / all-selected label (desktop). Default: All filters */
  allLabel?: string
  searchPlaceholder?: string
  emptyMatchLabel?: string
  icon?: LucideIcon
}

const OPTION_HEIGHT = 34
const DROPDOWN_PADDING = 96
const SEARCH_BAR_HEIGHT = 44
const MAX_DROPDOWN_HEIGHT = 380
const WIDTH = 260

/**
 * Troj-dashboard-style multi-checkbox filter (DetailMultiSelect pattern),
 * restyled for the Halo portfolio chrome.
 */
export function ProjectTechFilter({
  options,
  selected,
  onChange,
  idleLabel = 'Filter',
  allLabel = 'All filters',
  searchPlaceholder = 'Search…',
  emptyMatchLabel = 'No matches',
  icon: Icon = Filter
}: ProjectTechFilterProps) {
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const { open, setOpen, dropdownStyle, triggerRef, dropdownRef } = usePortalDropdown(
    Math.min(options.length * OPTION_HEIGHT + DROPDOWN_PADDING + SEARCH_BAR_HEIGHT, MAX_DROPDOWN_HEIGHT),
    WIDTH
  )

  useEffect(() => {
    if (!open) return
    searchRef.current?.focus({ preventScroll: true })
  }, [open])

  const filtered = query
    ? options.filter((id) => id.toLowerCase().includes(query.toLowerCase()))
    : options

  const allSelected = selected.size === options.length && options.length > 0
  const noneSelected = selected.size === 0
  const label =
    options.length === 0
      ? idleLabel
      : noneSelected
        ? 'None'
        : allSelected
          ? idleLabel
          : `${selected.size} selected`
  const labelFull =
    options.length === 0
      ? idleLabel
      : noneSelected
        ? 'None selected'
        : allSelected
          ? allLabel
          : `${selected.size} of ${options.length} selected`

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef as RefObject<HTMLButtonElement>}
        type="button"
        onClick={() => {
          setQuery('')
          setOpen((v) => !v)
        }}
        className="touch-hit inline-flex h-9 max-w-[min(100vw-2rem,11rem)] items-center gap-1.5 border border-[#7eb6e2]/40 bg-[#3c79ad]/34 px-3 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#d7ebff] shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition-colors hover:border-[#b0daff]/55 hover:bg-[#4f8fc7]/40 sm:max-w-[min(100vw-2rem,16rem)]"
        style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={labelFull}
        title={labelFull}
      >
        <Icon size={13} className="shrink-0 text-[#9ab6d2]" aria-hidden />
        <span className="truncate sm:hidden">{label}</span>
        <span className="hidden truncate sm:inline">{labelFull}</span>
        <ChevronDown
          size={13}
          className={`shrink-0 text-[#9ab6d2] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open
        ? createPortal(
            <div
              ref={dropdownRef}
              style={{
                ...dropdownStyle,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                fontFamily: 'HaloMenu, "Arial Narrow", sans-serif'
              }}
              className="border border-[#7fb6de]/40 bg-[#0c2236] text-[#e2f0ff] shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
              role="listbox"
              aria-multiselectable="true"
            >
              <div className="shrink-0 border-b border-[#7fb6de]/25 px-2 pb-1.5 pt-2">
                <div className="relative">
                  <Search
                    size={12}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8ea7c0]"
                    aria-hidden
                  />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full rounded-sm border border-[#7fb6de]/28 bg-[#061a2c] py-1.5 pl-7 pr-2 text-xs text-[#e2f0ff] outline-none placeholder:text-[#647d95] focus:border-[#b0daff]/50"
                  />
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 border-b border-[#7fb6de]/25 px-3 py-2">
                <button
                  type="button"
                  onClick={() => onChange(new Set(options))}
                  className="cursor-pointer text-[11px] uppercase tracking-[0.08em] text-[#9fcdf1] hover:underline"
                >
                  Select all
                </button>
                <span className="text-[11px] text-[#6d8aad]">·</span>
                <button
                  type="button"
                  onClick={() => onChange(new Set())}
                  className="cursor-pointer text-[11px] uppercase tracking-[0.08em] text-[#8ea7c0] hover:underline"
                >
                  Clear
                </button>
                {query ? (
                  <>
                    <span className="text-[11px] text-[#6d8aad]">·</span>
                    <span className="text-[11px] text-[#6d8aad]">
                      {filtered.length} match{filtered.length === 1 ? '' : 'es'}
                    </span>
                  </>
                ) : null}
              </div>

              <div className="flex-1 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <p className="px-3 py-3 text-center text-xs text-[#8ea7c0]">
                    {emptyMatchLabel} “{query}”
                  </p>
                ) : (
                  filtered.map((id) => {
                    const checked = selected.has(id)
                    return (
                      <button
                        key={id}
                        type="button"
                        role="option"
                        aria-selected={checked}
                        onClick={() => toggle(id)}
                        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs text-[#c5dcf2] transition-colors hover:bg-[#1a3d5c]/80"
                      >
                        <span
                          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                            checked ? 'border-[#9fcdf1] bg-[#4f8fc7]' : 'border-[#7eb6e2]/45'
                          }`}
                        >
                          {checked ? <Check size={9} className="text-[#e8f4ff]" aria-hidden /> : null}
                        </span>
                        <span className="truncate uppercase tracking-[0.06em]">{id}</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}

export { Layers as ProjectCategoryFilterIcon }
