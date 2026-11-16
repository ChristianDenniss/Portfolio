import { tool } from 'ai'
import { z } from 'zod'

import {
  AUNTIE_DOT_ABOUT_SECTION_LABELS,
  AUNTIE_DOT_ABOUT_SECTIONS,
  AUNTIE_DOT_ROUTE_LABELS,
  AUNTIE_DOT_ROUTES,
  type AuntieDotAboutSection
} from '@/lib/auntieDotLimits'

export const auntieDotNavigateTool = tool({
  description:
    'Open an exact portfolio page. Match intent carefully: jobs/work history/employers/co-ops/internships/Campaigns → /about + section experience. Portfolio projects/missions/demos/side projects → /projects (never for jobs). Bio/story → /about. Skills/stack → /about + skills. School/degree/UNB → /about + education. Awards/Dean\'s List → /about + awards. Contact/hire → /contact. Audio/settings → /settings. Home/menu → /. Never use this for resume PDF requests.',
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

export const auntieDotTools = {
  navigate: auntieDotNavigateTool
}
