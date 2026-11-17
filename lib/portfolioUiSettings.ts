/**
 * Lightweight UI prefs (launcher visibility, etc.). Persisted in `localStorage`.
 */

const STORAGE_KEY = 'portfolio-ui-settings-v1'

export const PORTFOLIO_UI_SETTINGS_CHANGED_EVENT = 'portfolio-ui-settings-changed'

export type PortfolioUiSettings = {
  /** When false, the Cortana concentric mark stays hidden until re-enabled in Settings. */
  cortanaLauncher: boolean
  /** When true, the one-time outfit / workplace-discretion warning has been accepted. */
  cortanaOutfitAck: boolean
}

export const DEFAULT_PORTFOLIO_UI_SETTINGS: PortfolioUiSettings = {
  cortanaLauncher: true,
  cortanaOutfitAck: false
}

function normalizeSettings(parsed: Partial<PortfolioUiSettings>): PortfolioUiSettings {
  return {
    cortanaLauncher:
      typeof parsed.cortanaLauncher === 'boolean'
        ? parsed.cortanaLauncher
        : DEFAULT_PORTFOLIO_UI_SETTINGS.cortanaLauncher,
    cortanaOutfitAck:
      typeof parsed.cortanaOutfitAck === 'boolean'
        ? parsed.cortanaOutfitAck
        : DEFAULT_PORTFOLIO_UI_SETTINGS.cortanaOutfitAck
  }
}

export function readPortfolioUiSettings(): PortfolioUiSettings {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PORTFOLIO_UI_SETTINGS }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PORTFOLIO_UI_SETTINGS }
    return normalizeSettings(JSON.parse(raw) as Partial<PortfolioUiSettings>)
  } catch {
    return { ...DEFAULT_PORTFOLIO_UI_SETTINGS }
  }
}

export function writePortfolioUiSettings(partial: Partial<PortfolioUiSettings>): void {
  if (typeof window === 'undefined') return
  const cur = readPortfolioUiSettings()
  const next = normalizeSettings({
    cortanaLauncher: partial.cortanaLauncher ?? cur.cortanaLauncher,
    cortanaOutfitAck: partial.cortanaOutfitAck ?? cur.cortanaOutfitAck
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(PORTFOLIO_UI_SETTINGS_CHANGED_EVENT))
}
