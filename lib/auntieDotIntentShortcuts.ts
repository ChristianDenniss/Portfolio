/**
 * Deterministic Cortana hops for obvious phrases — skip the model (cost + reliability).
 * Keep matches strict; ambiguous asks fall through to the API.
 */

import {
  AUNTIE_DOT_ABOUT_SECTION_LABELS,
  AUNTIE_DOT_RESUME_HREF,
  AUNTIE_DOT_ROUTE_LABELS,
  type AuntieDotAboutSection,
  type AuntieDotRoute
} from '@/lib/auntieDotLimits'
import { PORTFOLIO_PROJECT_SLUGS, projectTitleFromSlug } from '@/lib/portfolioContentTargets'

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

function includesAny(hay: string, needles: string[]): boolean {
  return needles.some((n) => hay.includes(n))
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

/** Named award phrases → openContent award id. */
const AWARD_SHORTCUTS: { needles: string[]; id: string; label: string; line: string }[] = [
  {
    needles: ['hack atlantic', 'hackathon'],
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
    needles: ['a10 class', 'class of 2026'],
    id: 'a10-class-2026',
    label: 'A10 Class of 2026',
    line: 'A10 Class of 2026.'
  }
]

/** Named projects → openContent project slug. */
const PROJECT_SHORTCUTS: { needles: string[]; slug: keyof typeof PORTFOLIO_PROJECT_SLUGS }[] = [
  { needles: ['parking', 'digital twin'], slug: 'parking-digital-twin' },
  { needles: ['volleyball', 'vb4', '4-2', '4 2'], slug: 'volleyball-4-2' },
  { needles: ['nibble'], slug: 'nibble' },
  { needles: ['local search'], slug: 'local-search-engine' },
  { needles: ['pca', 'stats 3d'], slug: 'stats-3d-pca' },
  { needles: ['chess'], slug: 'chess-engine' },
  { needles: ['database opt', 'db opt', 'typeorm'], slug: 'database-optimization' },
  { needles: ['maddy'], slug: 'maddyapp' }
]

/**
 * Returns a shortcut when the utterance is an obvious hop/ask; otherwise null.
 */
export function matchAuntieDotIntentShortcut(raw: string): AuntieDotIntentShortcut | null {
  const text = normalizeIntent(raw)
  if (!text || text.length > 120) return null

  // Session close — keep narrow.
  if (
    /^(goodbye|bye|good bye|see you|close|close panel|shut down|shutdown|dismiss|i'm done|im done|end session|go away)$/.test(
      text
    )
  ) {
    return { type: 'endSession', label: 'Sign off', line: 'Signing off.' }
  }

  // Resume / CV
  if (
    /^(resume|cv|open resume|show resume|his resume|open cv|show cv)$/.test(text) ||
    /^(open|show|pull up|bring up)\s+(his\s+)?(resume|cv)$/.test(text)
  ) {
    return {
      type: 'openResume',
      href: AUNTIE_DOT_RESUME_HREF,
      label: 'Resume',
      line: 'Resume.'
    }
  }

  // Location → map + short answer
  if (
    includesAny(text, [
      'where does he live',
      'where is he from',
      'where is christian from',
      'where does christian live',
      'where is christian',
      'his hometown',
      'hometown',
      'show the map',
      'open the map',
      'location map'
    ]) ||
    /^(where('s| is) he from|where('s| is) he live)$/.test(text)
  ) {
    return openContent(
      '/contact',
      'map=1',
      'Location map',
      "New Brunswick, Canada — Rothesay / Saint John area."
    )
  }

  // Named awards (prefer article over bare tab)
  for (const award of AWARD_SHORTCUTS) {
    if (!includesAny(text, award.needles)) continue
    if (
      includesAny(text, ['open', 'show', 'pull up', 'bring up', 'see', 'read', 'about']) ||
      text === award.needles[0]
    ) {
      return openContent(
        '/about',
        `section=awards&award=${encodeURIComponent(award.id)}`,
        award.label,
        award.line
      )
    }
  }

  // Named projects
  for (const project of PROJECT_SHORTCUTS) {
    if (!includesAny(text, project.needles)) continue
    if (
      includesAny(text, ['open', 'show', 'pull up', 'bring up', 'see', 'mission', 'project', 'about']) ||
      project.needles.some((n) => text === n)
    ) {
      const title = projectTitleFromSlug(project.slug) ?? project.slug
      return openContent(
        '/projects',
        `mission=${encodeURIComponent(project.slug)}&stage=briefing`,
        title,
        `${title}.`
      )
    }
  }

  // Skills / loadout
  if (
    includesAny(text, [
      'loadout',
      'tech stack',
      'what skills',
      'what does he know',
      'his skills',
      'show skills',
      'open skills',
      'bring me to skills',
      'go to skills',
      'take me to skills',
      'bring me to loadout',
      'go to loadout',
      'take me to loadout',
      'open loadout',
      'show loadout'
    ]) ||
    /^(skills|skill)$/.test(text)
  ) {
    return navigate('/about', 'skills', 'Loadout.')
  }

  // Jobs / campaigns
  if (
    includesAny(text, [
      'campaigns',
      'job history',
      'work history',
      'work experience',
      'job experience',
      'where he worked',
      'past jobs',
      'his jobs',
      'co-op',
      'co op',
      'internships',
      'bring me to experience',
      'go to experience',
      'take me to campaigns',
      'open campaigns',
      'show campaigns'
    ]) ||
    /^(experience|jobs|employers)$/.test(text)
  ) {
    return navigate('/about', 'experience', 'Campaigns.')
  }

  // Awards tab (generic)
  if (
    includesAny(text, [
      'commendations',
      'what awards',
      'his awards',
      'show awards',
      'open awards',
      'bring me to awards',
      'go to awards',
      'take me to awards'
    ]) ||
    /^(awards|honors|honours)$/.test(text)
  ) {
    return navigate('/about', 'awards', 'Commendations.')
  }

  // Education
  if (
    includesAny(text, [
      'education',
      'training',
      'where did he go to school',
      'where did he study',
      'his degree',
      'his school',
      'show education',
      'open education',
      'bring me to education',
      'go to education',
      'take me to education',
      'bring me to training',
      'go to training'
    ]) ||
    /^(school|degree|unb|unbsj)$/.test(text)
  ) {
    return navigate('/about', 'education', 'Training.')
  }

  // Projects / missions
  if (
    includesAny(text, [
      'what has he built',
      "what he's built",
      'what he built',
      'show his work',
      'show his projects',
      'his projects',
      'side projects',
      'portfolio projects',
      'bring me to projects',
      'go to projects',
      'take me to projects',
      'open projects',
      'show projects',
      'bring me to missions',
      'go to missions',
      'take me to missions',
      'open missions',
      'show missions'
    ]) ||
    /^(projects|missions|demos)$/.test(text)
  ) {
    return navigate('/projects', undefined, 'Missions.')
  }

  // About / personnel
  if (
    includesAny(text, [
      'personnel',
      'who is he',
      'his story',
      'about him',
      'bring me to about',
      'go to about',
      'take me to about',
      'open about',
      'show about'
    ]) ||
    /^(about|bio)$/.test(text)
  ) {
    return navigate('/about', 'about', 'Personnel.')
  }

  // Contact
  if (
    includesAny(text, [
      'uplink',
      'reach out',
      'hire him',
      'contact him',
      'bring me to contact',
      'go to contact',
      'take me to contact',
      'open contact',
      'show contact'
    ]) ||
    /^(contact|email|hire)$/.test(text)
  ) {
    return navigate('/contact', undefined, 'Uplink.')
  }

  // Settings
  if (
    includesAny(text, [
      'bring me to settings',
      'go to settings',
      'take me to settings',
      'open settings',
      'show settings',
      'audio settings'
    ]) ||
    /^(settings|audio|volume|sound)$/.test(text)
  ) {
    return navigate('/settings', undefined, 'Audio.')
  }

  // Home
  if (
    includesAny(text, [
      'main menu',
      'title screen',
      'bring me home',
      'go home',
      'take me home',
      'go to home',
      'open menu'
    ]) ||
    /^(home|menu)$/.test(text)
  ) {
    return navigate('/', undefined, 'Main menu.')
  }

  return null
}
