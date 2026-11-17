/** Shared contact-form draft bridge between Cortana and Contact. */

export const PORTFOLIO_CONTACT_DRAFT_KEY = 'portfolio-contact-draft'
export const PORTFOLIO_CONTACT_DRAFT_EVENT = 'portfolio-contact-draft'

export type PortfolioContactDraft = {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export function sanitizeContactDraft(raw: unknown): PortfolioContactDraft | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const draft: PortfolioContactDraft = {}
  if (typeof o.name === 'string' && o.name.trim()) draft.name = o.name.trim().slice(0, 80)
  if (typeof o.email === 'string' && o.email.trim()) draft.email = o.email.trim().slice(0, 120)
  if (typeof o.subject === 'string' && o.subject.trim()) draft.subject = o.subject.trim().slice(0, 140)
  if (typeof o.message === 'string' && o.message.trim()) draft.message = o.message.trim().slice(0, 2000)
  return draft.name || draft.email || draft.subject || draft.message ? draft : null
}

export function writeContactDraft(draft: PortfolioContactDraft): PortfolioContactDraft | null {
  const clean = sanitizeContactDraft(draft)
  if (!clean || typeof window === 'undefined') return null
  try {
    sessionStorage.setItem(PORTFOLIO_CONTACT_DRAFT_KEY, JSON.stringify(clean))
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(new CustomEvent(PORTFOLIO_CONTACT_DRAFT_EVENT, { detail: clean }))
  return clean
}

export function readContactDraft(): PortfolioContactDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(PORTFOLIO_CONTACT_DRAFT_KEY)
    if (!raw) return null
    return sanitizeContactDraft(JSON.parse(raw) as unknown)
  } catch {
    return null
  }
}

export function clearContactDraftStorage(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(PORTFOLIO_CONTACT_DRAFT_KEY)
  } catch {
    /* ignore */
  }
}
