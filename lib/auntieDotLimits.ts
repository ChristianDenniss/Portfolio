/** Shared Cortana (portfolio AI) guardrails (client + API). */

export const AUNTIE_DOT_ROUTES = ['/', '/projects', '/about', '/contact', '/settings'] as const
export type AuntieDotRoute = (typeof AUNTIE_DOT_ROUTES)[number]

/** About page tabs (Campaigns = work history). */
export const AUNTIE_DOT_ABOUT_SECTIONS = [
  'about',
  'skills',
  'experience',
  'education',
  'awards'
] as const
export type AuntieDotAboutSection = (typeof AUNTIE_DOT_ABOUT_SECTIONS)[number]

export const AUNTIE_DOT_ROUTE_LABELS: Record<AuntieDotRoute, string> = {
  '/': 'Main menu',
  '/projects': 'Missions',
  '/about': 'Personnel',
  '/contact': 'Uplink',
  '/settings': 'Audio'
}

export const AUNTIE_DOT_ABOUT_SECTION_LABELS: Record<AuntieDotAboutSection, string> = {
  about: 'Personnel',
  skills: 'Loadout',
  experience: 'Campaigns',
  education: 'Training',
  awards: 'Commendations'
}

export function isAuntieDotAboutSection(value: string): value is AuntieDotAboutSection {
  return (AUNTIE_DOT_ABOUT_SECTIONS as readonly string[]).includes(value)
}

/** Resume PDF opened from main menu and Cortana `openResume`. */
export const AUNTIE_DOT_RESUME_HREF =
  '/assets/ChristianDennis_SoftwareEngineer_Resume2026.pdf'

/** Max characters in a single user message. */
export const AUNTIE_DOT_MAX_CHARS = 280

/** Max messages kept in the model context (user + assistant). */
export const AUNTIE_DOT_MAX_CONTEXT_MESSAGES = 10

/** Hard cap on model completion tokens per reply (API `maxOutputTokens`). */
export const AUNTIE_DOT_MAX_OUTPUT_TOKENS = 400

/** Burst: requests per IP per minute. */
export const AUNTIE_DOT_BURST_MAX = 8
export const AUNTIE_DOT_BURST_WINDOW_MS = 60_000

/** Sustained: requests per IP per hour (does not reset on panel close). */
export const AUNTIE_DOT_HOURLY_MAX = 25
export const AUNTIE_DOT_HOURLY_WINDOW_MS = 60 * 60_000

/** Daily ceiling per IP. */
export const AUNTIE_DOT_DAILY_MAX = 60
export const AUNTIE_DOT_DAILY_WINDOW_MS = 24 * 60 * 60_000

/** Minimum gap between accepted requests from the same IP. */
export const AUNTIE_DOT_MIN_GAP_MS = 4_000

export function isAuntieDotRoute(value: string): value is AuntieDotRoute {
  return (AUNTIE_DOT_ROUTES as readonly string[]).includes(value)
}

export function textFromUiParts(parts: unknown): string {
  if (!Array.isArray(parts)) return ''
  return parts
    .filter((part): part is { type: 'text'; text: string } => {
      if (!part || typeof part !== 'object') return false
      const p = part as { type?: unknown; text?: unknown }
      return p.type === 'text' && typeof p.text === 'string'
    })
    .map((part) => part.text)
    .join('')
}
