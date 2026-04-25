/**
 * Full-screen Halo-style menu background clips (`public/…`, many tracked with Git LFS).
 * Preload + warm-cache all of them at app start so route changes do not wait on first bytes.
 */
export const PORTFOLIO_HERO_MENU_VIDEO_SRC = '/HaloAssetMimic/FMS_MainMenu_v2.mp4'

export const PORTFOLIO_ABOUT_MENU_VIDEO_SRC = '/4K%20Videos/Halo%204%20Menu.mp4'

export const PORTFOLIO_CONTACT_MENU_VIDEO_SRC = '/4K%20Videos/Halo%20Customization%20Menu.mp4'

export const PORTFOLIO_SETTINGS_MENU_VIDEO_SRC = '/4K%20Videos/Halo%20Cross-Game%20Menu.mp4'

export const PORTFOLIO_MENU_BACKGROUND_VIDEOS = [
  PORTFOLIO_HERO_MENU_VIDEO_SRC,
  PORTFOLIO_ABOUT_MENU_VIDEO_SRC,
  PORTFOLIO_CONTACT_MENU_VIDEO_SRC,
  PORTFOLIO_SETTINGS_MENU_VIDEO_SRC
] as const
