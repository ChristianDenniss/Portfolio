/**
 * Static assets to warm after first paint (routes + videos are handled separately).
 * Ordered by priority within each wave.
 */

/** Tiny cursors - first interaction feel. */
export const PORTFOLIO_WARM_CURSORS = [
  '/cursors/energy-sword-32.png',
  '/cursors/energy-sword-click-32.png'
] as const

export type PortfolioWarmImage = {
  src: string
  width: number
  height: number
  sizes: string
}

const LOGO_SIZES = '160px'
const CARD_SIZES = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
const STORY_SIZES = '(max-width: 1280px) 100vw, 40vw'
const ARTICLE_SIZES = '(max-width: 768px) 100vw, 72rem'

function warmLogo(src: string): PortfolioWarmImage {
  return { src, width: 160, height: 160, sizes: LOGO_SIZES }
}

function warmPhoto(src: string, sizes: string, width = 1600, height = 1000): PortfolioWarmImage {
  return { src, width, height, sizes }
}

/** Experience / education / award logos shown through next/image. */
export const PORTFOLIO_WARM_LOGOS: readonly PortfolioWarmImage[] = [
  '/images/A10Logo.png',
  '/images/TROJAI-removebg-preview.png',
  '/images/RTI-removebg-preview.png',
  '/images/FF%20logo.png',
  '/images/unblogo-removebg-preview.png',
  '/images/msvulogo-removebg-preview.png',
  '/images/KVHS-logo-250x300.png',
  '/images/ScienceAtlanticLogo.png',
  '/images/HackAtlanticLogo.png',
  '/images/GoldenKeyLogo.png',
  '/images/NibbleLogo.png'
].map(warmLogo)

/** Project cards, About stories, portrait, and award articles. */
export const PORTFOLIO_WARM_CONTENT_IMAGES: readonly PortfolioWarmImage[] = [
  ...[
    '/images/vbsite.png',
    '/images/DT.png',
    '/images/JAVASEARCHENGINE.png',
    '/images/vector.png',
    '/images/chess.png',
    '/images/DBOPT.png',
    '/images/sidewayMaddyApp.png',
    '/images/testing.png',
    '/images/CancerProj.png',
    '/images/arrayCombine.jpg',
    '/images/StatsProj.png'
  ].map((src) => warmPhoto(src, CARD_SIZES, 1200, 750)),
  warmPhoto('/images/placeHolderCentrePiece.png', '(min-width: 1280px) 40vw, 100vw', 1200, 1600),
  ...[
    '/images/about/SeniorYearBasketballTeam.jpg',
    '/images/about/WinningProvincialsInBasketball.jpg',
    '/images/about/beachday.jpg',
    '/images/about/BeachWithGF.jpg',
    '/images/about/WorkingWithMyDad.png',
    '/images/about/VisitingMonasteryForWeekend.jpg',
    '/images/about/AttendingFriendsBaptism.jpg',
    '/images/about/NewYearsWIthFriends.jpg',
    '/images/about/SillyHalloweenWithGF.jpg',
    '/images/about/1stAnnualHalifaxTripWithTheBoys.jpg',
    '/images/about/2ndAnnualHalifaxTripWithTheBoys.jpg',
    '/images/about/6801A394-4949-4AE7-90E4-F5311D282757.jpg'
  ].map((src) => warmPhoto(src, STORY_SIZES)),
  ...[
    '/images/awards/acpc-2026-certificate.jpg',
    '/images/awards/acpc-2026-scoreboard.jpg',
    '/images/awards/acpc-2026-results.png',
    '/images/awards/hack-atlantic-cover.png',
    '/images/awards/hack-atlantic-1.jpg',
    '/images/awards/hack-atlantic-2.jpg',
    '/images/awards/hack-atlantic-3.jpg',
    '/images/awards/hack-atlantic-4.jpg',
    '/images/awards/hack-atlantic-5.jpg',
    '/images/awards/hack-atlantic-partners.png',
    '/images/awards/golden-key-name.jpg',
    '/images/awards/golden-key-signature.jpg',
    '/images/awards/a10-class-of-2026.jpg',
    '/images/awards/deans-list-line.png',
    '/images/awards/deans-list-mark.png',
    '/images/awards/unb-scholarship.png'
  ].map((src) => warmPhoto(src, ARTICLE_SIZES))
]

/** Halo UI fonts (also `<link rel="preload">` in layout). */
export const PORTFOLIO_WARM_FONTS = [
  {
    href: '/font/Conduit%20ITC%20W04%20Black%20Italic/Web%20Fonts/5abef54f5e7d8abdb1acde88a1fbb1c8.woff2',
    type: 'font/woff2' as const
  },
  {
    href: '/font/logo%20fonts/Halo.ttf',
    type: 'font/ttf' as const
  },
  {
    href: '/font/logo%20fonts/Halo%20Outline.ttf',
    type: 'font/ttf' as const
  }
] as const

export const PORTFOLIO_WARM_RESUME = '/assets/ChristianDennis_SoftwareEngineer_Resume2026.pdf'
