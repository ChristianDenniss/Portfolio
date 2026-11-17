/**
 * Lightweight UI prefs (launcher visibility, etc.). Persisted in `localStorage`.
 * Outfit advisory ack is a separate key so it never flips launcher visibility.
 */

const STORAGE_KEY = 'portfolio-ui-settings-v1'
const OUTFIT_ACK_KEY = 'portfolio-cortana-outfit-ack-v1'

export const PORTFOLIO_UI_SETTINGS_CHANGED_EVENT = 'portfolio-ui-settings-changed'

export type PortfolioUiSettings = {
  /** When false, the Cortana concentric mark stays hidden until re-enabled in Settings. Default: visible. */
  cortanaLauncher: boolean
}

export const DEFAULT_PORTFOLIO_UI_SETTINGS: PortfolioUiSettings = {
  cortanaLauncher: true
}

function normalizeSettings(parsed: Partial<PortfolioUiSettings>): PortfolioUiSettings {
  return {
    cortanaLauncher:
      typeof parsed.cortanaLauncher === 'boolean'
        ? parsed.cortanaLauncher
        : DEFAULT_PORTFOLIO_UI_SETTINGS.cortanaLauncher
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
    cortanaLauncher: partial.cortanaLauncher ?? cur.cortanaLauncher
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(PORTFOLIO_UI_SETTINGS_CHANGED_EVENT))
}

/** One-time workplace-discretion warning — independent of launcher visibility. */
export function readCortanaOutfitAck(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (localStorage.getItem(OUTFIT_ACK_KEY) === '1') return true
    // Migrate accidental ack stored on the old UI-settings blob, then strip it.
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { cortanaOutfitAck?: unknown; cortanaLauncher?: unknown }
    if (parsed.cortanaOutfitAck === true) {
      localStorage.setItem(OUTFIT_ACK_KEY, '1')
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          normalizeSettings({
            cortanaLauncher:
              typeof parsed.cortanaLauncher === 'boolean' ? parsed.cortanaLauncher : true
          })
        )
      )
      return true
    }
    return false
  } catch {
    return false
  }
}

export function writeCortanaOutfitAck(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(OUTFIT_ACK_KEY, '1')
  } catch {
    /* ignore quota / private mode */
  }
}
