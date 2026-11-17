import { tool } from 'ai'
import { z } from 'zod'

import {
  AUNTIE_DOT_ABOUT_SECTION_LABELS,
  AUNTIE_DOT_ABOUT_SECTIONS,
  AUNTIE_DOT_RESUME_HREF,
  AUNTIE_DOT_ROUTE_LABELS,
  AUNTIE_DOT_ROUTES,
  type AuntieDotAboutSection
} from '@/lib/auntieDotLimits'
import {
  PORTFOLIO_ABOUT_TOPIC_IDS,
  PORTFOLIO_AWARD_IDS,
  PORTFOLIO_OPEN_KINDS,
  PORTFOLIO_PROJECT_SLUGS,
  PORTFOLIO_SKILL_IDS,
  projectTitleFromSlug,
  type PortfolioProjectSlug
} from '@/lib/portfolioContentTargets'

const PROJECT_SLUG_KEYS = Object.keys(PORTFOLIO_PROJECT_SLUGS) as [
  PortfolioProjectSlug,
  ...PortfolioProjectSlug[]
]

export const auntieDotNavigateTool = tool({
  description:
    'REQUIRED whenever the visitor asks to go/open/show/bring them somewhere. Never describe a hop without calling this. Match intent carefully: jobs/work history/employers/co-ops/internships/Campaigns → /about + section experience. Portfolio projects/missions/demos/side projects → /projects (never for jobs). Bio/story → /about. Skills/stack/loadout/"what skills does he have" → /about + skills (always; do not answer skills talk-only). School/degree/UNB → /about + education. Awards/Dean\'s List → /about + awards. Contact/hire → /contact. Audio/settings → /settings. Home/menu → /. After calling, say almost nothing (UI already moved) — no "coming up" / "navigating/opening/taking you to…" monologue or skill-cluster menus. Do NOT use for resume PDF — use openResume. Do NOT use to dismiss Cortana — use endSession.',
  inputSchema: z.object({
    path: z
      .enum(AUNTIE_DOT_ROUTES)
      .describe(
        '/ = menu; /projects = missions/projects only; /about = personnel (add section for tabs); /contact = uplink; /settings = audio'
      ),
    section: z
      .enum(AUNTIE_DOT_ABOUT_SECTIONS)
      .optional()
      .describe(
        'Required for About deep-links: experience=jobs/Campaigns; skills=Loadout; education=Training; awards=Commendations; about=bio. Omit unless path is /about.'
      ),
    reason: z
      .string()
      .max(80)
      .optional()
      .describe('Brief reason for the hop (not shown as a site map)')
  }),
  execute: async ({ path, section, reason }) => {
    const aboutSection: AuntieDotAboutSection | undefined =
      path === '/about' ? section : undefined
    const label =
      path === '/about' && aboutSection
        ? AUNTIE_DOT_ABOUT_SECTION_LABELS[aboutSection]
        : AUNTIE_DOT_ROUTE_LABELS[path]
    return {
      ok: true as const,
      path,
      section: aboutSection,
      label,
      reason: reason?.trim() || undefined
    }
  }
})

export const auntieDotOpenResumeTool = tool({
  description:
    'Open Christian\'s resume PDF in a new tab (same as Main Menu → RESUME). Use when they ask for the resume, CV, or PDF. Do not navigate to a page instead. After calling, stay nearly silent — no long "opening his resume" narration.',
  inputSchema: z.object({
    reason: z
      .string()
      .max(80)
      .optional()
      .describe('Brief reason (not spoken as a path)')
  }),
  execute: async ({ reason }) => ({
    ok: true as const,
    href: AUNTIE_DOT_RESUME_HREF,
    label: 'Resume',
    reason: reason?.trim() || undefined
  })
})

export const auntieDotEndSessionTool = tool({
  description:
    'Close Cortana\'s hologram panel and end the chat session. Use when they say goodbye, done, close, shut down, end session, dismiss you, or ask you to leave/go away. Say one short goodbye line, then call this.',
  inputSchema: z.object({
    reason: z
      .string()
      .max(80)
      .optional()
      .describe('Brief reason for signing off')
  }),
  execute: async ({ reason }) => ({
    ok: true as const,
    close: true as const,
    reason: reason?.trim() || undefined
  })
})

export const auntieDotOpenContentTool = tool({
  description:
    'Open a specific on-site modal or article: award write-up, skill cluster detail, About topic panel, project mission briefing/dossier, or Contact location map. Use when they ask to open/show/read a specific award, project, skill block, bio topic, or the map — not for bare page hops (use navigate) or the resume PDF (use openResume). REQUIRED for any where-he-lives / where-he-is-from / hometown / location question: always call with kind contactMap (plus a short spoken answer) — never answer location without this tool. After calling, stay nearly silent — the UI already opened; do not narrate the hop.',
  inputSchema: z.object({
    kind: z.enum(PORTFOLIO_OPEN_KINDS).describe(
      'award=Commendations article; skill=Loadout cluster modal; aboutTopic=Personnel topic panel; project=Missions briefing/dossier; contactMap=REQUIRED for where he lives/is from/hometown/location map'
    ),
    id: z
      .string()
      .max(80)
      .optional()
      .describe(
        'Required except contactMap. award id, skill id, aboutTopic id, or project slug (e.g. parking-digital-twin, volleyball-4-2, nibble, hack-atlantic-2026, deans-list-2026, ai-agents-security, my-story).'
      ),
    stage: z
      .enum(['briefing', 'dossier'])
      .optional()
      .describe('Projects only. Default briefing; dossier opens the full mission modal.')
  }),
  execute: async ({ kind, id, stage }) => {
    const trimmed = id?.trim() || ''

    if (kind === 'contactMap') {
      return {
        ok: true as const,
        kind,
        path: '/contact' as const,
        search: 'map=1',
        label: 'Location map'
      }
    }

    if (kind === 'award') {
      if (!(PORTFOLIO_AWARD_IDS as readonly string[]).includes(trimmed)) {
        return { ok: false as const, error: 'Unknown award id' }
      }
      return {
        ok: true as const,
        kind,
        id: trimmed,
        path: '/about' as const,
        search: `section=awards&award=${encodeURIComponent(trimmed)}`,
        label: 'Commendation article'
      }
    }

    if (kind === 'skill') {
      if (!(PORTFOLIO_SKILL_IDS as readonly string[]).includes(trimmed)) {
        return { ok: false as const, error: 'Unknown skill id' }
      }
      return {
        ok: true as const,
        kind,
        id: trimmed,
        path: '/about' as const,
        search: `section=skills&skill=${encodeURIComponent(trimmed)}`,
        label: 'Loadout cluster'
      }
    }

    if (kind === 'aboutTopic') {
      if (!(PORTFOLIO_ABOUT_TOPIC_IDS as readonly string[]).includes(trimmed)) {
        return { ok: false as const, error: 'Unknown about topic id' }
      }
      return {
        ok: true as const,
        kind,
        id: trimmed,
        path: '/about' as const,
        search: `topic=${encodeURIComponent(trimmed)}`,
        label: 'Personnel topic'
      }
    }

    // project
    if (!(PROJECT_SLUG_KEYS as readonly string[]).includes(trimmed)) {
      return { ok: false as const, error: 'Unknown project slug' }
    }
    const title = projectTitleFromSlug(trimmed)
    if (!title) return { ok: false as const, error: 'Unknown project slug' }
    const projectStage = stage === 'dossier' ? 'dossier' : 'briefing'
    return {
      ok: true as const,
      kind,
      id: trimmed,
      title,
      stage: projectStage,
      path: '/projects' as const,
      search: `mission=${encodeURIComponent(trimmed)}&stage=${projectStage}`,
      label: title
    }
  }
})

export const auntieDotFillContactTool = tool({
  description:
    'Prefill the Contact (Uplink) form fields and open /contact. Use when the visitor asks you to draft/write/fill a message, subject, name, or email in the contact form — or after they accept your draft offer. Never invent their name or email; leave those blank unless they told you. Write a concise professional message they can edit. After calling, say one short line that a draft is in the form — do not read the whole draft aloud.',
  inputSchema: z.object({
    name: z.string().max(80).optional().describe('Visitor name only if they gave it'),
    email: z.string().max(120).optional().describe('Visitor email only if they gave it'),
    subject: z
      .string()
      .max(140)
      .optional()
      .describe('Short subject line, e.g. Collaboration inquiry'),
    message: z
      .string()
      .max(2000)
      .optional()
      .describe('Draft body for the message field — concise, professional, editable')
  }),
  execute: async ({ name, email, subject, message }) => {
    const draft = {
      name: name?.trim() || undefined,
      email: email?.trim() || undefined,
      subject: subject?.trim() || undefined,
      message: message?.trim() || undefined
    }
    const hasAny = Boolean(draft.name || draft.email || draft.subject || draft.message)
    if (!hasAny) {
      return { ok: false as const, error: 'Provide at least one field to fill' }
    }
    return {
      ok: true as const,
      path: '/contact' as const,
      search: 'draft=1',
      label: 'Contact draft',
      draft
    }
  }
})

export const auntieDotTools = {
  navigate: auntieDotNavigateTool,
  openResume: auntieDotOpenResumeTool,
  endSession: auntieDotEndSessionTool,
  openContent: auntieDotOpenContentTool,
  fillContact: auntieDotFillContactTool
}
