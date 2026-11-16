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

export const auntieDotNavigateTool = tool({
  description:
    'Open an exact portfolio page. Match intent carefully: jobs/work history/employers/co-ops/internships/Campaigns → /about + section experience. Portfolio projects/missions/demos/side projects → /projects (never for jobs). Bio/story → /about. Skills/stack → /about + skills. School/degree/UNB → /about + education. Awards/Dean\'s List → /about + awards. Contact/hire → /contact. Audio/settings → /settings. Home/menu → /. Do NOT use this for resume PDF — use openResume. Do NOT use this to dismiss Cortana — use endSession.',
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
    'Open Christian\'s resume PDF in a new tab (same as Main Menu → RESUME). Use when they ask for the resume, CV, or PDF. Do not navigate to a page instead.',
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

export const auntieDotTools = {
  navigate: auntieDotNavigateTool,
  openResume: auntieDotOpenResumeTool,
  endSession: auntieDotEndSessionTool
}
