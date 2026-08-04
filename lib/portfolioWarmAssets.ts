/**
 * Static assets to warm after first paint (routes + videos are handled separately).
 * Ordered by priority within each wave.
 */

/** Tiny cursors - first interaction feel. */
export const PORTFOLIO_WARM_CURSORS = [
  '/cursors/energy-sword-32.png',
  '/cursors/energy-sword-click-32.png'
] as const

/** Experience / education logos + About centrepiece. */
export const PORTFOLIO_WARM_LOGOS = [
  '/images/A10Logo.png',
  '/images/TROJAI-removebg-preview.png',
  '/images/RTI-removebg-preview.png',
  '/images/FF%20logo.png',
  '/images/unblogo-removebg-preview.png',
  '/images/msvulogo-removebg-preview.png',
  '/images/placeHolderCentrePiece.png'
] as const

/** Project card thumbnails (Projects route). */
export const PORTFOLIO_WARM_PROJECT_IMAGES = [
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
] as const

/** About “My Story” carousel (warms last - larger set). */
export const PORTFOLIO_WARM_STORY_IMAGES = [
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
] as const

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
