/**
 * Stable IDs / slugs Cortana (and URL deep-links) can open on the portfolio.
 * Keep in sync with About awards/skills/topics and Projects titles.
 */

export const PORTFOLIO_AWARD_IDS = [
  'icpc-nena-2026-moncton',
  'acpc-2026',
  'golden-key-2026',
  'a10-class-2026',
  'hack-atlantic-2026',
  'unbsj-campus-scholarship-2026',
  'deans-list-2026',
  'fisher-2026',
  'fisher-2025',
  'good-energy-2025',
  'student-assistance-scholarship-2025',
  'unb-special-scholarship-2024'
] as const
export type PortfolioAwardId = (typeof PORTFOLIO_AWARD_IDS)[number]

export const PORTFOLIO_SKILL_IDS = [
  'startup-breadth',
  'languages',
  'web-product-ui',
  'backend-apis',
  'data-stores-sql',
  'search-ir',
  'ai-agents-security',
  'games-perf',
  'infra-quality',
  'research-geo',
  'sheets-ops',
  'design-api-contracts'
] as const
export type PortfolioSkillId = (typeof PORTFOLIO_SKILL_IDS)[number]

export const PORTFOLIO_ABOUT_TOPIC_IDS = [
  'my-story',
  'hobbies',
  'goals',
  'values',
  'stats',
  'what-drives-me',
  'how-i-think',
  'how-i-approach-challenges'
] as const
export type PortfolioAboutTopicId = (typeof PORTFOLIO_ABOUT_TOPIC_IDS)[number]

/** Slug → exact Projects card title (modal lookup key). */
export const PORTFOLIO_PROJECT_SLUGS = {
  'parking-digital-twin': 'Parking Digital Twin',
  'volleyball-4-2': 'Volleyball 4-2 Website',
  'local-search-engine': 'Local Search Engine',
  nibble: 'Nibble',
  'stats-3d-pca': 'Stats 3D PCA Graphing',
  'chess-engine': 'Chess Engine',
  'database-optimization': 'Database Optimization playground',
  maddyapp: 'MaddyApp',
  'test-suite-management': 'Test Suite Management System',
  'cancer-survival-analysis': 'Cancer Survival Analysis',
  'portfolio-site': 'Portfolio site',
  'custom-car-mib2': 'Custom Car (MIB2)',
  'array-combiner': 'Array Combiner',
  'vb42-stat-tracker': 'VB4.2 Stat Tracker'
} as const
export type PortfolioProjectSlug = keyof typeof PORTFOLIO_PROJECT_SLUGS

export const PORTFOLIO_OPEN_KINDS = [
  'award',
  'skill',
  'aboutTopic',
  'project',
  'contactMap'
] as const
export type PortfolioOpenKind = (typeof PORTFOLIO_OPEN_KINDS)[number]

export function isPortfolioAwardId(value: string): value is PortfolioAwardId {
  return (PORTFOLIO_AWARD_IDS as readonly string[]).includes(value)
}

export function isPortfolioSkillId(value: string): value is PortfolioSkillId {
  return (PORTFOLIO_SKILL_IDS as readonly string[]).includes(value)
}

export function isPortfolioAboutTopicId(value: string): value is PortfolioAboutTopicId {
  return (PORTFOLIO_ABOUT_TOPIC_IDS as readonly string[]).includes(value)
}

export function isPortfolioProjectSlug(value: string): value is PortfolioProjectSlug {
  return Object.prototype.hasOwnProperty.call(PORTFOLIO_PROJECT_SLUGS, value)
}

export function projectTitleFromSlug(slug: string): string | null {
  if (!isPortfolioProjectSlug(slug)) return null
  return PORTFOLIO_PROJECT_SLUGS[slug]
}

export function projectSlugFromTitle(title: string): PortfolioProjectSlug | null {
  const entry = (Object.entries(PORTFOLIO_PROJECT_SLUGS) as [PortfolioProjectSlug, string][]).find(
    ([, t]) => t === title
  )
  return entry?.[0] ?? null
}
