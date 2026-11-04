/**
 * Hide page scrollbars while a full-screen modal is open.
 * Locks html/body plus any scrollable descendants under `rootSelector`
 * (e.g. About/Projects overflow panes) so the page chrome doesn't sit
 * beside the modal scrollbar.
 */
export function lockPageScroll(rootSelector?: string): () => void {
  const locked: { el: HTMLElement; overflow: string; overflowY: string; overflowX: string }[] = []
  const candidates = new Set<HTMLElement>([document.documentElement, document.body])

  const main = document.querySelector('main')
  if (main instanceof HTMLElement) candidates.add(main)

  if (rootSelector) {
    const root = document.querySelector(rootSelector)
    if (root instanceof HTMLElement) {
      candidates.add(root)
      root.querySelectorAll('*').forEach((node) => {
        if (!(node instanceof HTMLElement)) return
        const style = getComputedStyle(node)
        if (/(auto|scroll)/.test(style.overflowY) || /(auto|scroll)/.test(style.overflowX)) {
          candidates.add(node)
        }
      })
    }
  }

  for (const el of candidates) {
    locked.push({
      el,
      overflow: el.style.overflow,
      overflowY: el.style.overflowY,
      overflowX: el.style.overflowX
    })
    el.style.overflow = 'hidden'
    el.style.overflowY = 'hidden'
    el.style.overflowX = 'hidden'
  }

  document.documentElement.dataset.portfolioModalOpen = 'true'

  return () => {
    delete document.documentElement.dataset.portfolioModalOpen
    for (const { el, overflow, overflowY, overflowX } of locked) {
      el.style.overflow = overflow
      el.style.overflowY = overflowY
      el.style.overflowX = overflowX
    }
  }
}
