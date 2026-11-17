/**
 * Deterministic Cortana hops for *explicit* navigation phrases only.
 * Fact questions ("what skills…", "tell me about…") always hit the model.
 * Prefer false negatives over wrong hops.
 */

import {
  AUNTIE_DOT_ABOUT_SECTION_LABELS,
  AUNTIE_DOT_RESUME_HREF,
  AUNTIE_DOT_ROUTE_LABELS,
  type AuntieDotAboutSection,
  type AuntieDotRoute
} from '@/lib/auntieDotLimits'
import {
  PORTFOLIO_PROJECT_SLUGS,
  projectTitleFromSlug,
  type PortfolioProjectSlug
} from '@/lib/portfolioContentTargets'

export type AuntieDotIntentShortcut =
  | {
      type: 'navigate'
      path: AuntieDotRoute
      section?: AuntieDotAboutSection
      label: string
      line: string
    }
  | {
      type: 'openContent'
      path: string
      search: string
      label: string
      line: string
    }
  | {
      type: 'openResume'
      href: string
      label: string
      line: string
    }
  | {
      type: 'endSession'
      label: string
      line: string
    }

function normalizeIntent(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9'\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Explicit hop / open verbs — required for almost every shortcut. */
function hasHopVerb(text: string): boolean {
  return (
    /^(bring me to|take me to|go to|go home|bring me home|take me home|open|show|pull up|bring up|navigate to|take me|bring me)\b/.test(
      text
    ) ||
    /\b(bring me to|take me to|go to|open|show me|pull up|bring up)\b/.test(text)
  )
}

function navigate(
  path: AuntieDotRoute,
  section: AuntieDotAboutSection | undefined,
  line: string
): AuntieDotIntentShortcut {
  const label =
    path === '/about' && section
      ? AUNTIE_DOT_ABOUT_SECTION_LABELS[section]
      : AUNTIE_DOT_ROUTE_LABELS[path]
  return { type: 'navigate', path, section, label, line }
}

function openContent(
  path: string,
  search: string,
  label: string,
  line: string
): AuntieDotIntentShortcut {
  return { type: 'openContent', path, search, label, line }
}

const AWARD_SHORTCUTS: { needles: string[]; id: string; label: string; line: string }[] = [
  {
    needles: ['hack atlantic'],
    id: 'hack-atlantic-2026',
    label: 'Hack Atlantic',
    line: 'Hack Atlantic.'
  },
  {
    needles: ["dean's list", 'deans list'],
    id: 'deans-list-2026',
    label: "Dean's List",
    line: "Dean's List."
  },
  {
    needles: ['icpc'],
    id: 'icpc-nena-2026-moncton',
    label: 'ICPC',
    line: 'ICPC.'
  },
  {
    needles: ['golden key'],
    id: 'golden-key-2026',
    label: 'Golden Key',
    line: 'Golden Key.'
  },
  {
    needles: ['a10 class'],
    id: 'a10-class-2026',
    label: 'A10 Class of 2026',
    line: 'A10 Class of 2026.'
  }
]

const PROJECT_SHORTCUTS: { needles: string[]; slug: PortfolioProjectSlug }[] = [
  { needles: ['parking digital twin', 'digital twin', 'parking'], slug: 'parking-digital-twin' },
  { needles: ['volleyball', 'vb4'], slug: 'volleyball-4-2' },
  { needles: ['nibble'], slug: 'nibble' },
  { needles: ['local search'], slug: 'local-search-engine' },
  { needles: ['stats 3d', 'pca'], slug: 'stats-3d-pca' },
  { needles: ['chess engine', 'chess'], slug: 'chess-engine' },
  { needles: ['database optimization', 'db optimization'], slug: 'database-optimization' },
  { needles: ['maddyapp', 'maddy app', 'maddy'], slug: 'maddyapp' }
]

function destinationOf(
  text: string,
  aliases: string[]
): boolean {
  return aliases.some((alias) => {
    // "... to loadout" / "open loadout" / exact "loadout" only with hop verb already checked
    return (
      new RegExp(`\\b(to|open|show|up)\\s+${alias.replace(/\s+/g, '\\s+')}\\b`).test(text) ||
      new RegExp(`\\b(open|show|pull up|bring up)\\s+(his\\s+|the\\s+)?${alias.replace(/\s+/g, '\\s+')}\\b`).test(
        text
      ) ||
      text === alias
    )
  })
}

/**
 * Returns a shortcut only for clear navigation commands; otherwise null (use the model).
 */
export function matchAuntieDotIntentShortcut(raw: string): AuntieDotIntentShortcut | null {
  const text = normalizeIntent(raw)
  if (!text || text.length > 100) return null

  // Sign-off — exact phrases only (not bare "close").
  if (
    /^(goodbye|bye|good bye|see you|close the panel|shut down|shutdown|dismiss|i'm done|im done|end session|sign off)$/.test(
      text
    )
  ) {
    return { type: 'endSession', label: 'Sign off', line: 'Signing off.' }
  }

  // Resume — must ask to open/show, or exact "resume"/"cv" alone.
  if (
    /^(resume|cv|his resume|his cv)$/.test(text) ||
    /^(open|show|pull up|bring up)\s+(his\s+|the\s+)?(resume|cv)\b/.test(text)
  ) {
    return {
      type: 'openResume',
      href: AUNTIE_DOT_RESUME_HREF,
      label: 'Resume',
      line: 'Resume.'
    }
  }

  // Location map — only clear live/from/map asks (still answer+open; very high confidence).
  if (
    /^(where does (he|christian) live|where is (he|christian) from|where('s| is) he from)$/.test(
      text
    ) ||
    /^(open|show|pull up|bring up)\s+(the\s+)?(map|location map)\b/.test(text) ||
    /^(show|open)\s+(me\s+)?(the\s+)?map$/.test(text)
  ) {
    return openContent(
      '/contact',
      'map=1',
      'Location map',
      'New Brunswick, Canada — Rothesay / Saint John area.'
    )
  }

  // Everything below requires an explicit hop verb (bring me to / open / show / …).
  if (!hasHopVerb(text)) return null

  // Named award articles — only with hop verb + award name.
  for (const award of AWARD_SHORTCUTS) {
    if (award.needles.some((n) => text.includes(n))) {
      return openContent(
        '/about',
        `section=awards&award=${encodeURIComponent(award.id)}`,
        award.label,
        award.line
      )
    }
  }

  // Named project briefings — hop verb + project name (not "tell me about").
  for (const project of PROJECT_SHORTCUTS) {
    if (!project.needles.some((n) => text.includes(n))) continue
    const title = projectTitleFromSlug(project.slug) ?? project.slug
    return openContent(
      '/projects',
      `mission=${encodeURIComponent(project.slug)}&stage=briefing`,
      title,
      `${title}.`
    )
  }

  // Page / tab destinations
  if (destinationOf(text, ['loadout', 'skills', 'skill', 'tech stack'])) {
    return navigate('/about', 'skills', 'Loadout.')
  }
  if (
    destinationOf(text, [
      'campaigns',
      'experience',
      'job history',
      'work history',
      'work experience',
      'jobs'
    ])
  ) {
    return navigate('/about', 'experience', 'Campaigns.')
  }
  if (destinationOf(text, ['awards', 'commendations', 'honors', 'honours'])) {
    return navigate('/about', 'awards', 'Commendations.')
  }
  if (destinationOf(text, ['education', 'training', 'school'])) {
    return navigate('/about', 'education', 'Training.')
  }
  if (destinationOf(text, ['projects', 'missions', 'demos'])) {
    return navigate('/projects', undefined, 'Missions.')
  }
  if (destinationOf(text, ['about', 'personnel', 'bio'])) {
    return navigate('/about', 'about', 'Personnel.')
  }
  if (destinationOf(text, ['contact', 'uplink'])) {
    return navigate('/contact', undefined, 'Uplink.')
  }
  if (destinationOf(text, ['settings', 'audio settings'])) {
    return navigate('/settings', undefined, 'Audio.')
  }
  if (
    destinationOf(text, ['home', 'main menu', 'menu', 'title screen']) ||
    /^(bring me|take me)\s+home$/.test(text) ||
    /^go home$/.test(text)
  ) {
    return navigate('/', undefined, 'Main menu.')
  }

  return null
}
