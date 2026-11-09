'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

function computeDropdownStyle(
  trigger: HTMLElement,
  estimatedHeight: number,
  minWidth: number
): CSSProperties {
  const rect = trigger.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const clampedH = Math.min(estimatedHeight, 320)
  const openUpward = spaceBelow < clampedH + 8 && rect.top > clampedH + 8
  const margin = 8
  const width = Math.min(Math.max(rect.width, minWidth), window.innerWidth - margin * 2)
  const left = Math.min(Math.max(rect.left, margin), window.innerWidth - width - margin)
  return {
    position: 'fixed',
    top: openUpward ? rect.top - clampedH - 4 : rect.bottom + 4,
    left,
    width,
    maxHeight: Math.min(clampedH, openUpward ? rect.top - 8 : spaceBelow - 8),
    zIndex: 9999
  }
}

/** Fixed-position portal dropdown — same pattern as the Troj dashboard `usePortalDropdown`. */
export function usePortalDropdown(estimatedHeight: number, minWidth = 160, closeOnScroll = true) {
  const [open, setOpenState] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({
    position: 'fixed',
    top: -9999,
    left: -9999,
    zIndex: 9999
  })
  const triggerRef = useRef<HTMLElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const ignoreScrollUntilRef = useRef(0)

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const style = computeDropdownStyle(triggerRef.current, estimatedHeight, minWidth)
    if (dropdownRef.current) {
      dropdownRef.current.style.top = `${style.top}px`
      dropdownRef.current.style.left = `${style.left}px`
      dropdownRef.current.style.width = `${style.width}px`
      dropdownRef.current.style.maxHeight = `${style.maxHeight}px`
    }
    setDropdownStyle(style)
  }, [estimatedHeight, minWidth])

  const setOpen = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      setOpenState((prev) => {
        const value = typeof next === 'function' ? next(prev) : next
        if (value && triggerRef.current) {
          // Position before paint so the portal never lands in document flow / scrolls the page.
          const style = computeDropdownStyle(triggerRef.current, estimatedHeight, minWidth)
          setDropdownStyle(style)
          ignoreScrollUntilRef.current = performance.now() + 150
        }
        return value
      })
    },
    [estimatedHeight, minWidth]
  )

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return
    const onMouse = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      ) {
        return
      }
      setOpenState(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenState(false)
    }
    const onScroll = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return
      if (performance.now() < ignoreScrollUntilRef.current) {
        updatePosition()
        return
      }
      if (closeOnScroll) {
        setOpenState(false)
        return
      }
      updatePosition()
    }
    document.addEventListener('mousedown', onMouse)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onMouse)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, closeOnScroll, updatePosition])

  return { open, setOpen, dropdownStyle, triggerRef, dropdownRef }
}
