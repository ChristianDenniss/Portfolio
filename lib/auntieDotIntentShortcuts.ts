/**
 * Deterministic Cortana hops for navigation phrases.
 * Fact questions still hit the model; hop verb / bare destination + synonym = free shortcut.
 * Prefer false negatives over wrong hops — never ask the visitor to confirm a clear hop.
 */

import {
  AUNTIE_DOT_ABOUT_SECTION_LABELS,
  AUNTIE_DOT_RESUME_HREF,
  AUNTIE_DOT_ROUTE_LABELS,
  type AuntieDotAboutSection,
  type AuntieDotRoute
} from '@/lib/auntieDotLimits'
import {
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

/** Explicit hop / open verbs — required for page/tab shortcuts (unless bare destination). */
function hasHopVerb(text: string): boolean {
  return (
    /^(bring me to|take me to|go to|go home|bring me home|take me home|open|show|pull up|bring up|navigate to|take me|bring me|let me see|i want to see|i wanna see|i('d| would) like to see|can you (?:open|show|pull up|bring up|take me|bring me)|could you (?:open|show|pull up|bring up|take me|bring me)|would you (?:open|show|pull up|take me)|please (?:open|show|pull up|take me|bring me)|want to (?:see|open|go)|wanna (?:see|open|go))\b/.test(
      text
    ) ||
    /\b(bring me to|take me to|go to|open|show me|pull up|bring up|navigate to|let me see)\b/.test(
      text
    )
  )
}

/** Whole utterance is just a destination (optional his/the) — treat as hop. */
function isBareDestination(text: string, aliases: readonly string[]): boolean {
  return aliases.some((alias) => {
    const a = escapeRe(alias)
    return new RegExp(`^(?:(?:his|her|the|christian(?:'s)?)\\s+)?${a}$`).test(text)
  })
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

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
}

/** True if any alias appears as the destination of a hop (not just somewhere in a sentence). */
function mentionsDestination(text: string, aliases: readonly string[]): boolean {
  return aliases.some((alias) => {
    const a = escapeRe(alias)
    // Exact destination alone (only used when hop verb already matched, e.g. "open loadout")
    if (text === alias) return true
    // "to X" / "open X" / "show his X" / "pull up the X"
    return new RegExp(
      `\\b(?:to|open|show|up)\\s+(?:me\\s+)?(?:his\\s+|her\\s+|the\\s+|christian(?:'s)?\\s+)?${a}\\b`
    ).test(text)
  })
}

/** Page + About-tab destinations — Halo labels and natural phrasing. */
const DESTINATIONS: {
  aliases: readonly string[]
  path: AuntieDotRoute
  section?: AuntieDotAboutSection
  line: string
}[] = [
  // Skills / Loadout
  {
    path: '/about',
    section: 'skills',
    line: 'Loadout.',
    aliases: [
      'loadout',
      'skills',
      'skill',
      'tech stack',
      'techstack',
      'stack',
      'technologies',
      'tools he knows',
      'what he knows'
    ]
  },
  // Jobs / Campaigns — visitors say job exp, not "campaigns"
  {
    path: '/about',
    section: 'experience',
    line: 'Campaigns.',
    aliases: [
      'campaigns',
      'experience',
      'job experience',
      'job exp',
      'jobs',
      'job history',
      'job hist',
      'work history',
      'work experience',
      'work exp',
      'past jobs',
      'past work',
      'employers',
      'employment',
      'career',
      'co ops',
      'co-ops',
      'coops',
      'internships',
      'internship',
      'where he worked',
      'places he worked',
      'work history tab',
      'professional experience'
    ]
  },
  // Awards / Commendations
  {
    path: '/about',
    section: 'awards',
    line: 'Commendations.',
    aliases: [
      'awards',
      'award',
      'commendations',
      'commendation',
      'honors',
      'honours',
      'scholarships',
      'scholarship',
      'achievements',
      'accolades'
    ]
  },
  // Education / Training
  {
    path: '/about',
    section: 'education',
    line: 'Training.',
    aliases: [
      'education',
      'training',
      'school',
      'schools',
      'degree',
      'degrees',
      'university',
      'college',
      'unb',
      'unbsj',
      'academia',
      'academic background',
      'schooling'
    ]
  },
  // About / Personnel
  {
    path: '/about',
    section: 'about',
    line: 'Personnel.',
    aliases: [
      'about',
      'personnel',
      'personnel file',
      'bio',
      'biography',
      'profile',
      'his story',
      'story',
      'about page',
      'about section'
    ]
  },
  // Projects / Missions
  {
    path: '/projects',
    line: 'Missions.',
    aliases: [
      'projects',
      'project',
      'missions',
      'mission',
      'demos',
      'demo',
      'side projects',
      'portfolio projects',
      'his work',
      'his projects',
      'what he built',
      "what he's built"
    ]
  },
  // Contact / Uplink
  {
    path: '/contact',
    line: 'Uplink.',
    aliases: [
      'contact',
      'contact page',
      'uplink',
      'reach out',
      'get in touch',
      'email page',
      'hire page',
      'contact form'
    ]
  },
  // Settings / Audio
  {
    path: '/settings',
    line: 'Audio.',
    aliases: [
      'settings',
      'setting',
      'audio',
      'audio settings',
      'volume',
      'sound',
      'sound settings'
    ]
  },
  // Home / Main menu
  {
    path: '/',
    line: 'Main menu.',
    aliases: [
      'home',
      'main menu',
      'menu',
      'title screen',
      'start',
      'start screen',
      'main page',
      'homepage',
      'home page'
    ]
  }
]

const AWARD_SHORTCUTS: { needles: string[]; id: string; label: string; line: string }[] = [
  {
    needles: ['hack atlantic'],
    id: 'hack-atlantic-2026',
    label: 'Hack Atlantic',
    line: 'Hack Atlantic.'
  },
  {
    needles: ['mackay scholarship', 'mackay award', 'mackay bursary', 'mackay', 'mac kay'],
    id: 'mackay-scholarship-2026',
    label: 'MacKay Scholarship',
    line: 'MacKay Scholarship.'
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
  { needles: ['volleyball', 'vb4', 'volleyball 4 2'], slug: 'volleyball-4-2' },
  { needles: ['nibble'], slug: 'nibble' },
  { needles: ['local search'], slug: 'local-search-engine' },
  { needles: ['stats 3d', 'pca'], slug: 'stats-3d-pca' },
  { needles: ['chess engine', 'chess'], slug: 'chess-engine' },
  { needles: ['database optimization', 'db optimization'], slug: 'database-optimization' },
  { needles: ['maddyapp', 'maddy app', 'maddy'], slug: 'maddyapp' }
]

/**
 * Returns a shortcut only for clear navigation commands; otherwise null (use the model).
 */
export function matchAuntieDotIntentShortcut(raw: string): AuntieDotIntentShortcut | null {
  const text = normalizeIntent(raw)
  if (!text || text.length > 120) return null

  // Sign-off — exact phrases only.
  if (
    /^(goodbye|bye|good bye|see you|close the panel|shut down|shutdown|dismiss|i'm done|im done|end session|sign off)$/.test(
      text
    )
  ) {
    return { type: 'endSession', label: 'Sign off', line: 'Signing off.' }
  }

  // Resume / CV
  if (
    /^(resume|cv|his resume|his cv)$/.test(text) ||
    /^(open|show|pull up|bring up)\s+(?:me\s+)?(?:his\s+|the\s+|christian(?:'s)?\s+)?(resume|cv)\b/.test(
      text
    )
  ) {
    return {
      type: 'openResume',
      href: AUNTIE_DOT_RESUME_HREF,
      label: 'Resume',
      line: 'Resume.'
    }
  }

  // Location map — clear live/from/map asks only.
  if (
    /^(where does (he|christian) live|where is (he|christian) from|where('s| is) he from)$/.test(
      text
    ) ||
    /^(open|show|pull up|bring up)\s+(?:me\s+)?(?:the\s+)?(map|location map|location)\b/.test(
      text
    )
  ) {
    return openContent(
      '/contact',
      'map=1',
      'Location map',
      'New Brunswick, Canada — Rothesay / Saint John area.'
    )
  }

  // Home without "to"
  if (/^(go home|bring me home|take me home)$/.test(text)) {
    return navigate('/', undefined, 'Main menu.')
  }

  const hop = hasHopVerb(text)

  // Prefer longer aliases first so "job experience" wins over "experience"
  const ranked = [...DESTINATIONS].sort(
    (a, b) =>
      Math.max(...b.aliases.map((x) => x.length)) - Math.max(...a.aliases.map((x) => x.length))
  )

  // Bare destination alone ("loadout", "his projects") — hop immediately, no LLM confirm.
  if (!hop) {
    for (const dest of ranked) {
      if (!isBareDestination(text, dest.aliases)) continue
      return navigate(dest.path, dest.section, dest.line)
    }
    return null
  }

  // Named award articles (more specific than awards tab)
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

  // Named project briefings
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

  for (const dest of ranked) {
    if (!mentionsDestination(text, dest.aliases)) continue
    return navigate(dest.path, dest.section, dest.line)
  }

  return null
}
