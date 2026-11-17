'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, Trash2, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent
} from 'react'
import { createPortal } from 'react-dom'

const AuntieDotAvatar = dynamic(
  () => import('@/components/AuntieDotAvatar').then((m) => m.AuntieDotAvatar),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto flex h-56 w-full items-center justify-center bg-transparent sm:h-64">
        <div className="h-16 w-16 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(140,210,255,0.45),transparent_70%)]" />
      </div>
    )
  }
)

import type { AuntieDotGesture } from '@/components/AuntieDotAvatar'
import { theaterLabelFromPath } from '@/lib/auntieDotKnowledge'
import { matchAuntieDotIntentShortcut } from '@/lib/auntieDotIntentShortcuts'
import {
  AUNTIE_DOT_ABOUT_SECTION_LABELS,
  AUNTIE_DOT_MAX_CHARS,
  AUNTIE_DOT_RESUME_HREF,
  AUNTIE_DOT_ROUTE_LABELS,
  isAuntieDotAboutSection,
  isAuntieDotRoute,
  type AuntieDotAboutSection,
  type AuntieDotRoute
} from '@/lib/auntieDotLimits'
import { getEffectiveMenuVoVolume } from '@/lib/portfolioAudioSettings'
import {
  writeContactDraft,
  type PortfolioContactDraft
} from '@/lib/portfolioContactDraft'
import { lockPageScroll } from '@/lib/lockPageScroll'
import {
  PORTFOLIO_UI_SETTINGS_CHANGED_EVENT,
  readCortanaOutfitAck,
  readPortfolioUiSettings,
  writeCortanaOutfitAck,
  writePortfolioUiSettings
} from '@/lib/portfolioUiSettings'
import {
  cancelBriefingSpeech,
  countSyllables,
  revealIndexFromBoundary,
  sanitizeForSpeech,
  speakBriefingSitrep,
  wordFromBoundary
} from '@/lib/portfolioBriefingSpeech'
import {
  duckThemeForMissionBriefing,
  playCortanaShutdownSound,
  playPortfolioTransitionSound,
  playResumeOpenSound,
  resetThemeDuckForMissionBriefing,
  unduckThemeForMissionBriefing
} from '@/lib/portfolioSfx'

type OrbMode = 'idle' | 'listening' | 'thinking' | 'speaking'

/** Spoken when the panel opens (Halo-flavored Cortana VO). */
const OPEN_GREETINGS = [
  'Hey there Chief.',
  'Welcome back Chief.',
  'Great to see you Chief.',
  'Good to have you back Chief.',
  "I've been waiting Chief.",
  'Systems online. Ready when you are Chief.',
  'Shall we get to work Chief?',
  'There you are Chief.'
] as const

/** Demo lines for `?talkpoc=1` / `npm run cortana:talk-poc`. */
const TALK_POC_LINES = [
  'Packet lock — facial jaw/lip rig online.',
  'Christian is twenty-three, UNBSJ Comp Sci, Dean’s List.',
  'Four roles on file. Roughly two years in industry.',
  'Move your cursor — I track loosely. Ask anything when ready.'
] as const

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error?: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
}

const ORB_SIZE = 76
const ORB_MARGIN = 12
const ORB_MENU_GAP = 14
const DRAG_THRESHOLD_PX = 6
/** v3: home dock above main menu (drops old top-right saved spots). */
const POS_STORAGE_KEY = 'portfolio-auntie-dot-pos-v3'
const PANEL_W = 300
/** Bottom hide-dock hit pad while dragging the Cortana mark. */
const HIDE_DOCK_HIT_PAD_PX = 14

type OrbPos = { x: number; y: number }

function readSafeInset(side: 'top' | 'right' | 'bottom' | 'left'): number {
  if (typeof window === 'undefined') return 0
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--sat-${side}`)
  const n = Number.parseFloat(raw || '')
  return Number.isFinite(n) ? n : 0
}

/** Keep the mark inside the visible frame (notch / home-indicator safe areas only). */
function clampOrbPos(x: number, y: number): OrbPos {
  if (typeof window === 'undefined') return { x, y }
  const safeL = Math.max(ORB_MARGIN, readSafeInset('left') || 0)
  const safeR = Math.max(ORB_MARGIN, readSafeInset('right') || 0)
  const safeT = Math.max(ORB_MARGIN, readSafeInset('top') || 0)
  const safeB = Math.max(ORB_MARGIN, readSafeInset('bottom') || 0)
  const maxX = Math.max(safeL, window.innerWidth - ORB_SIZE - safeR)
  const maxY = Math.max(safeT, window.innerHeight - ORB_SIZE - safeB)
  return {
    x: Math.min(maxX, Math.max(safeL, x)),
    y: Math.min(maxY, Math.max(safeT, y))
  }
}

function panelWidthCss(): string {
  if (typeof window === 'undefined') return `min(100vw - 1.25rem, ${PANEL_W}px)`
  const safeX = (readSafeInset('left') || 0) + (readSafeInset('right') || 0)
  const gutter = 20 + safeX
  return `min(100vw - ${gutter}px, ${PANEL_W}px)`
}

/** Sit above the top-right corner of the Halo main-menu column. */
function menuAnchoredOrbPos(): OrbPos {
  if (typeof window === 'undefined') return { x: ORB_MARGIN, y: ORB_MARGIN }
  const shell = document.querySelector('.hero-menu-shell')
  if (shell instanceof HTMLElement) {
    const r = shell.getBoundingClientRect()
    return clampOrbPos(r.right - ORB_SIZE, r.top - ORB_SIZE - ORB_MENU_GAP)
  }
  const pad = window.innerWidth < 640 ? 16 : window.innerWidth < 768 ? 32 : 48
  const menuW = Math.min(448, window.innerWidth - pad * 2)
  const dockBottom = window.innerWidth < 640 ? 36 : 56
  const approxMenuH = Math.min(390, window.innerHeight * 0.5)
  return clampOrbPos(
    pad + menuW - ORB_SIZE,
    window.innerHeight - dockBottom - approxMenuH - ORB_SIZE - ORB_MENU_GAP
  )
}

function defaultOrbPos(): OrbPos {
  return menuAnchoredOrbPos()
}

function readStoredOrbPos(): OrbPos | null {
  try {
    const raw = localStorage.getItem(POS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<OrbPos>
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') return null
    return clampOrbPos(parsed.x, parsed.y)
  } catch {
    return null
  }
}

function persistOrbPos(pos: OrbPos): void {
  try {
    localStorage.setItem(POS_STORAGE_KEY, JSON.stringify(pos))
  } catch {
    // ignore
  }
}

/** Inputs / controls stay interactive; everything else on the open panel can drag. */
function isAuntieDragExcludedTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return true
  return Boolean(target.closest('input, textarea, button, a, select, [data-no-drag="true"]'))
}

function textFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

function latestNavigateHop(
  messages: UIMessage[]
): { toolCallId: string; path: AuntieDotRoute; section?: AuntieDotAboutSection } | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]
    if (!message || message.role !== 'assistant') continue
    for (const part of message.parts) {
      if (part.type !== 'tool-navigate') continue
      const toolPart = part as {
        type: 'tool-navigate'
        toolCallId: string
        state: string
        input?: { path?: string; section?: string }
        output?: { path?: string; section?: string }
      }
      const path = toolPart.output?.path ?? toolPart.input?.path
      const sectionRaw = toolPart.output?.section ?? toolPart.input?.section
      if (
        (toolPart.state === 'output-available' || toolPart.state === 'input-available') &&
        typeof path === 'string' &&
        isAuntieDotRoute(path)
      ) {
        const section =
          path === '/about' && typeof sectionRaw === 'string' && isAuntieDotAboutSection(sectionRaw)
            ? sectionRaw
            : undefined
        return { toolCallId: toolPart.toolCallId, path, section }
      }
    }
  }
  return null
}

function latestToolCallId(
  messages: UIMessage[],
  toolType: 'tool-openResume' | 'tool-endSession'
): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]
    if (!message || message.role !== 'assistant') continue
    for (const part of message.parts) {
      if (part.type !== toolType) continue
      const toolPart = part as { type: string; toolCallId: string; state: string }
      if (toolPart.state === 'output-available' || toolPart.state === 'input-available') {
        return toolPart.toolCallId
      }
    }
  }
  return null
}

function latestOpenContentHop(
  messages: UIMessage[]
): { toolCallId: string; path: string; search: string; label: string } | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]
    if (!message || message.role !== 'assistant') continue
    for (const part of message.parts) {
      if (part.type !== 'tool-openContent') continue
      const toolPart = part as {
        type: 'tool-openContent'
        toolCallId: string
        state: string
        output?: {
          ok?: boolean
          path?: string
          search?: string
          label?: string
        }
      }
      if (
        (toolPart.state === 'output-available' || toolPart.state === 'input-available') &&
        toolPart.output?.ok === true &&
        typeof toolPart.output.path === 'string' &&
        typeof toolPart.output.search === 'string'
      ) {
        return {
          toolCallId: toolPart.toolCallId,
          path: toolPart.output.path,
          search: toolPart.output.search,
          label:
            typeof toolPart.output.label === 'string' && toolPart.output.label
              ? toolPart.output.label
              : 'Content'
        }
      }
    }
  }
  return null
}

function latestFillContactHop(
  messages: UIMessage[]
): {
  toolCallId: string
  path: string
  search: string
  label: string
  draft: PortfolioContactDraft
} | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]
    if (!message || message.role !== 'assistant') continue
    for (const part of message.parts) {
      if (part.type !== 'tool-fillContact') continue
      const toolPart = part as {
        type: 'tool-fillContact'
        toolCallId: string
        state: string
        output?: {
          ok?: boolean
          path?: string
          search?: string
          label?: string
          draft?: PortfolioContactDraft
        }
        input?: PortfolioContactDraft
      }
      const draft = toolPart.output?.draft ?? toolPart.input
      if (
        (toolPart.state === 'output-available' || toolPart.state === 'input-available') &&
        toolPart.output?.ok !== false &&
        draft &&
        typeof draft === 'object'
      ) {
        return {
          toolCallId: toolPart.toolCallId,
          path:
            typeof toolPart.output?.path === 'string' ? toolPart.output.path : '/contact',
          search:
            typeof toolPart.output?.search === 'string' ? toolPart.output.search : 'draft=1',
          label:
            typeof toolPart.output?.label === 'string' && toolPart.output.label
              ? toolPart.output.label
              : 'Contact draft',
          draft
        }
      }
    }
  }
  return null
}

function hasMicSupport(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

/**
 * Concentric blue rings with Cortana's head in the core — recognizable launcher icon.
 */
function CortanaMark({
  mode = 'idle',
  className = ''
}: {
  mode?: OrbMode
  className?: string
  /** Kept for call-site compat; unused now that the mark is HTML+img. */
  uid?: string
}) {
  const thinking = mode === 'thinking'
  const speaking = mode === 'speaking'
  const listening = mode === 'listening'

  return (
    <span className={`relative inline-flex aspect-square items-center justify-center ${className}`} aria-hidden>
      {/* Soft bloom */}
      <span
        className={`pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(140,200,240,0.35)_40%,transparent_72%)] ${
          mode === 'idle' ? 'auntie-cortana-aura' : ''
        }`}
        style={{ opacity: speaking || listening ? 1 : 0.85 }}
      />

      {/* Thin dual ring around a large head crop */}
      <span
        className={`pointer-events-none absolute inset-[2%] rounded-full ${
          mode === 'idle' ? 'auntie-cortana-breathe' : ''
        }`}
        style={{
          background:
            'radial-gradient(circle, transparent 68%, #3d7eb0 69%, #3d7eb0 76%, #8ecff0 77%, #8ecff0 92%, transparent 93%)'
        }}
      />

      {/* Head */}
      <span
        className={`relative z-[1] block overflow-hidden rounded-full bg-[#062033] ring-1 ring-[#8ecff0]/35 ${
          speaking ? 'auntie-cortana-core-speak' : listening ? 'auntie-cortana-core-listen' : ''
        }`}
        style={{ width: '72%', height: '72%' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny launcher glyph; avoid next/image layout cost */}
        <img
          src="/images/cortana-launcher-bust.jpg"
          alt=""
          draggable={false}
          className="h-full w-full object-cover object-[center_12%]"
          style={{ transform: 'scale(1.12)' }}
        />
      </span>

      {thinking ? (
        <span
          className="pointer-events-none absolute inset-[2%] rounded-full auntie-cortana-sweep"
          style={{
            background:
              'conic-gradient(from 0deg, rgba(240,250,255,0.95) 0deg, rgba(240,250,255,0.95) 28deg, transparent 28deg, transparent 360deg)',
            WebkitMask:
              'radial-gradient(circle, transparent 76%, #000 77%, #000 92%, transparent 93%)',
            mask: 'radial-gradient(circle, transparent 76%, #000 77%, #000 92%, transparent 93%)'
          }}
        />
      ) : null}

      {listening ? (
        <span className="pointer-events-none absolute inset-[2%] rounded-full border border-[rgba(170,220,250,0.55)] auntie-cortana-listen-ring" />
      ) : null}
    </span>
  )
}

function HologramFigure({
  mode,
  gesture,
  gestureKey,
  talkKick = 0,
  talkSyllables = 1,
  autoGestures = true,
  onReady
}: {
  mode: OrbMode
  gesture?: AuntieDotGesture | null
  gestureKey?: number
  talkKick?: number
  talkSyllables?: number
  autoGestures?: boolean
  onReady?: () => void
}) {
  return (
    <AuntieDotAvatar
      mode={mode}
      gesture={gesture}
      gestureKey={gestureKey}
      talkKick={talkKick}
      talkSyllables={talkSyllables}
      autoGestures={autoGestures}
      onReady={onReady}
    />
  )
}

export default function AuntieDot() {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const [locationSearch, setLocationSearch] = useState('')
  const theater = theaterLabelFromPath(pathname, locationSearch)

  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [micAvailable, setMicAvailable] = useState(false)
  const [uplinkNote, setUplinkNote] = useState<string | null>(null)
  const [orbPos, setOrbPos] = useState<OrbPos | null>(null)
  const [dragging, setDragging] = useState(false)
  /** Trash dock while dragging the launcher mark (not the open panel). */
  const [hideDockVisible, setHideDockVisible] = useState(false)
  const [hideDockHot, setHideDockHot] = useState(false)
  /** Freeze panel dock side while open — flipping left/right mid-drag jumps it toward center. */
  const [panelDock, setPanelDock] = useState<{ below: boolean; alignEnd: boolean } | null>(null)
  const [gesture, setGesture] = useState<AuntieDotGesture | null>(null)
  const [gestureKey, setGestureKey] = useState(0)
  /** True after the 3D rig has fitted and painted one posed frame. */
  const [avatarReady, setAvatarReady] = useState(false)
  const [talkKick, setTalkKick] = useState(0)
  const [talkSyllables, setTalkSyllables] = useState(1)
  const [talkPoc, setTalkPoc] = useState(false)
  const [talkPocLine, setTalkPocLine] = useState(0)
  /** Caption typed out in sync with Web Speech word boundaries. */
  const [voCaption, setVoCaption] = useState<{ full: string; visible: number } | null>(null)
  /** Concentric mark launcher — can be tucked away from Settings / panel. */
  const [launcherVisible, setLauncherVisible] = useState(true)
  /** One-time workplace-discretion warning before first open. */
  const [outfitWarnOpen, setOutfitWarnOpen] = useState(false)
  /** True after PRESS ANY KEY / `?menu=1` — do not wait on async router.replace. */
  const [menuEntered, setMenuEntered] = useState(false)
  const prevSpeaking = useRef(false)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const lastSpokenIdRef = useRef<string | null>(null)
  const lastNavToolIdRef = useRef<string | null>(null)
  const lastResumeToolIdRef = useRef<string | null>(null)
  const lastEndSessionToolIdRef = useRef<string | null>(null)
  const lastOpenContentToolIdRef = useRef<string | null>(null)
  const lastFillContactToolIdRef = useRef<string | null>(null)
  const pendingEndSessionRef = useRef(false)
  const openRef = useRef(open)
  const theaterRef = useRef(theater)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
    moved: boolean
    /** Orb click toggles open; panel drag should never toggle on release. */
    clickAction: 'toggle' | 'none'
    /** Launcher mark can be dropped on the hide dock; panel cannot. */
    kind: 'launcher' | 'panel'
    captureEl: Element | null
  } | null>(null)
  const hideDockRef = useRef<HTMLDivElement | null>(null)
  const hideDockHotRef = useRef(false)
  const hideLauncherRef = useRef<() => void>(() => {})
  const orbPosRef = useRef<OrbPos | null>(null)
  orbPosRef.current = orbPos

  openRef.current = open
  theaterRef.current = theater

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/auntie-dot',
        prepareSendMessagesRequest: ({ id, messages, body, headers, credentials, api }) => ({
          api,
          headers,
          credentials,
          body: {
            ...body,
            id,
            messages,
            theater: theaterRef.current
          }
        })
      }),
    []
  )

  const speakReply = useCallback(async (text: string, messageId: string) => {
    if (!openRef.current) return
    if (getEffectiveMenuVoVolume(1) <= 0) return
    // Same string for TTS + caption so word boundaries stay aligned; strip URL/path spam.
    const trimmed = sanitizeForSpeech(text)
    if (!trimmed) return

    lastSpokenIdRef.current = messageId
    cancelBriefingSpeech()
    duckThemeForMissionBriefing()
    setSpeaking(true)
    // Start empty — never flash the full streamed reply then wipe it for word reveal.
    setVoCaption({ full: trimmed, visible: 0 })

    const spoken = await speakBriefingSitrep({
      text: trimmed,
      onBoundary: (charIndex, charLength) => {
        const word = wordFromBoundary(trimmed, charIndex, charLength)
        setTalkSyllables(countSyllables(word))
        setTalkKick((n) => n + 1)
        setVoCaption({
          full: trimmed,
          visible: revealIndexFromBoundary(trimmed, charIndex, charLength)
        })
      },
      onEnd: () => {
        if (!openRef.current) return
        setVoCaption({ full: trimmed, visible: trimmed.length })
        setSpeaking(false)
        unduckThemeForMissionBriefing()
      },
      onError: () => {
        if (!openRef.current) return
        setVoCaption({ full: trimmed, visible: trimmed.length })
        setSpeaking(false)
        unduckThemeForMissionBriefing()
      }
    })

    if (!spoken && openRef.current) {
      setVoCaption({ full: trimmed, visible: trimmed.length })
      setSpeaking(false)
      unduckThemeForMissionBriefing()
    }
  }, [])

  const stopMic = useCallback(() => {
    const rec = recognitionRef.current
    if (rec) {
      try {
        rec.onresult = null
        rec.onerror = null
        rec.onend = null
        rec.abort()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }
    setListening(false)
  }, [])

  const { messages, sendMessage, status, error, clearError, stop, setMessages } = useChat({
    id: 'auntie-dot',
    transport,
    onFinish: ({ message, isAbort, isError }) => {
      if (isAbort || isError) return
      if (message.role !== 'assistant') return
      if (lastSpokenIdRef.current === message.id) return
      void speakReply(textFromMessage(message), message.id)
    },
    onError: (err) => {
      const msg = err.message || ''
      if (/credits|billing|quota/i.test(msg)) {
        setUplinkNote('Uplink denied // OpenAI credits depleted')
      } else if (/413|too large|Max \d+ characters/i.test(msg)) {
        setUplinkNote(`Packet too large // Max ${AUNTIE_DOT_MAX_CHARS} characters`)
      } else if (/503|auth token|OPENAI|Bad auth/i.test(msg)) {
        setUplinkNote('Uplink denied // No auth token')
      } else if (
        /429|congested|capped|locked|Echo rejected|Slow down|Hourly|Daily|Repeat/i.test(msg)
      ) {
        setUplinkNote(
          msg.startsWith('Channel') || msg.startsWith('Echo') || msg.startsWith('Packet')
            ? msg
            : 'Channel congested // Retry shortly'
        )
      } else {
        setUplinkNote(
          msg.startsWith('Uplink') || msg.startsWith('Signal') || msg.startsWith('Channel') || msg.startsWith('Packet')
            ? msg
            : 'Signal degraded // Try again'
        )
      }
    }
  })

  const busy = status === 'submitted' || status === 'streaming'
  const orbMode: OrbMode = talkPoc || speaking
    ? 'speaking'
    : listening
      ? 'listening'
      : busy
        ? 'thinking'
        : 'idle'

  /** Hard-stop VO, chat stream, mic, and restore theme to user mix. */
  const silenceCortana = useCallback(() => {
    cancelBriefingSpeech()
    setSpeaking(false)
    setVoCaption(null)
    setUplinkNote(null)
    stopMic()
    stop()
    resetThemeDuckForMissionBriefing()
  }, [stop, stopMic])

  const closePanel = useCallback(
    (opts?: { playShutdown?: boolean }) => {
      silenceCortana()
      if (opts?.playShutdown !== false) playCortanaShutdownSound()
      setOpen(false)
    },
    [silenceCortana]
  )

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')
  const assistantText = lastAssistant ? textFromMessage(lastAssistant) : ''

  // When menu VO is on, never dump the full streamed reply into the caption — that
  // flashes the whole line, then speakReply clears it and types word-by-word.
  const menuVoOn = getEffectiveMenuVoVolume(1) > 0
  const awaitingVo =
    menuVoOn &&
    Boolean(assistantText) &&
    Boolean(lastAssistant) &&
    lastSpokenIdRef.current !== lastAssistant?.id
  const caption = voCaption
    ? voCaption.visible > 0
      ? voCaption.full.slice(0, voCaption.visible)
      : '…'
    : talkPoc && open
      ? ''
      : uplinkNote
        ? uplinkNote
        : error
          ? 'Signal degraded.'
          : busy || awaitingVo
            ? '…'
            : listening
              ? 'Listening…'
              : assistantText && !menuVoOn
                ? assistantText
                : open
                  ? 'Standing by.'
                  : ''

  useEffect(() => {
    setMicAvailable(hasMicSupport())
  }, [])

  useEffect(() => {
    const syncLauncher = () => setLauncherVisible(readPortfolioUiSettings().cortanaLauncher)
    syncLauncher()
    window.addEventListener(PORTFOLIO_UI_SETTINGS_CHANGED_EVENT, syncLauncher)
    return () => window.removeEventListener(PORTFOLIO_UI_SETTINGS_CHANGED_EVENT, syncLauncher)
  }, [])

  const hideLauncher = useCallback(() => {
    writePortfolioUiSettings({ cortanaLauncher: false })
    setLauncherVisible(false)
    closePanel({ playShutdown: true })
  }, [closePanel])
  hideLauncherRef.current = hideLauncher

  const pointInHideDock = useCallback((clientX: number, clientY: number) => {
    const el = hideDockRef.current
    if (!el) return false
    const r = el.getBoundingClientRect()
    const pad = HIDE_DOCK_HIT_PAD_PX
    return (
      clientX >= r.left - pad &&
      clientX <= r.right + pad &&
      clientY >= r.top - pad &&
      clientY <= r.bottom + pad
    )
  }, [])
  const pointInHideDockRef = useRef(pointInHideDock)
  pointInHideDockRef.current = pointInHideDock

  useEffect(() => {
    if (typeof window === 'undefined') return
    const applySearch = (search: string) => {
      setLocationSearch(search)
      const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
      if (q.get('menu') === '1') setMenuEntered(true)
      const poc = q.get('talkpoc') === '1'
      setTalkPoc(poc)
      if (poc) {
        setOpen(true)
        setSpeaking(true)
      }
    }
    applySearch(window.location.search)
    // Off the title gate on any non-home route.
    if (pathname !== '/') setMenuEntered(true)
    const onMenuEntered = () => {
      setMenuEntered(true)
      applySearch('?menu=1')
    }
    window.addEventListener('portfolio-menu-entered', onMenuEntered)
    return () => window.removeEventListener('portfolio-menu-entered', onMenuEntered)
  }, [pathname])

  // Talk POC: speak demo lines with the same Web Speech path as mission briefs.
  useEffect(() => {
    if (!talkPoc || !open) return

    let cancelled = false
    let lineIndex = 0
    let pauseTimer: number | null = null
    duckThemeForMissionBriefing()

    const speakLine = () => {
      if (cancelled || !openRef.current) return
      const text = TALK_POC_LINES[lineIndex % TALK_POC_LINES.length]!
      setTalkPocLine(lineIndex)
      setVoCaption({ full: text, visible: 0 })
      setSpeaking(true)

      void speakBriefingSitrep({
        text,
        onBoundary: (charIndex, charLength) => {
          if (cancelled) return
          const word = wordFromBoundary(text, charIndex, charLength)
          setTalkSyllables(countSyllables(word))
          setTalkKick((n) => n + 1)
          setVoCaption({
            full: text,
            visible: revealIndexFromBoundary(text, charIndex, charLength)
          })
        },
        onEnd: () => {
          if (cancelled) return
          setVoCaption({ full: text, visible: text.length })
          setSpeaking(false)
          lineIndex += 1
          pauseTimer = window.setTimeout(speakLine, 750)
        },
        onError: () => {
          if (cancelled) return
          setVoCaption({ full: text, visible: text.length })
          setSpeaking(false)
          lineIndex += 1
          pauseTimer = window.setTimeout(speakLine, 750)
        }
      }).then((started) => {
        if (cancelled) return
        if (!started) {
          setVoCaption({ full: text, visible: text.length })
          setSpeaking(false)
          lineIndex += 1
          pauseTimer = window.setTimeout(speakLine, 2200)
        }
      })
    }

    speakLine()

    return () => {
      cancelled = true
      if (pauseTimer !== null) window.clearTimeout(pauseTimer)
      cancelBriefingSpeech()
      unduckThemeForMissionBriefing()
      setSpeaking(false)
      setVoCaption(null)
    }
  }, [talkPoc, open])

  // Open greeting VO once the hologram has actually rendered (not a fixed timer).
  const didGreetRef = useRef(false)
  useEffect(() => {
    if (!open) {
      didGreetRef.current = false
      setAvatarReady(false)
      return
    }
    if (talkPoc || didGreetRef.current || !avatarReady) return
    didGreetRef.current = true
    const line = OPEN_GREETINGS[Math.floor(Math.random() * OPEN_GREETINGS.length)]!
    void speakReply(line, `greet-${Date.now()}`)
  }, [open, talkPoc, avatarReady, speakReply])

  // Follow navigate tool hops from Cortana.
  useEffect(() => {
    const hop = latestNavigateHop(messages)
    if (!hop || hop.toolCallId === lastNavToolIdRef.current) return
    lastNavToolIdRef.current = hop.toolCallId
    const label =
      hop.path === '/about' && hop.section
        ? AUNTIE_DOT_ABOUT_SECTION_LABELS[hop.section]
        : AUNTIE_DOT_ROUTE_LABELS[hop.path]
    setUplinkNote(`Routing // ${label}`)
    playPortfolioTransitionSound()
    if (hop.path === '/') {
      setLocationSearch('?menu=1')
      router.push('/?menu=1')
      return
    }
    if (hop.path === '/about' && hop.section) {
      const qs = `?section=${hop.section}`
      setLocationSearch(qs)
      router.push(`/about${qs}`)
      return
    }
    setLocationSearch('')
    router.push(hop.path)
  }, [messages, router])

  // Open resume PDF when she calls openResume.
  useEffect(() => {
    const toolCallId = latestToolCallId(messages, 'tool-openResume')
    if (!toolCallId || toolCallId === lastResumeToolIdRef.current) return
    lastResumeToolIdRef.current = toolCallId
    setUplinkNote('Opening // Resume')
    playResumeOpenSound()
    window.open(AUNTIE_DOT_RESUME_HREF, '_blank', 'noopener,noreferrer')
  }, [messages])

  // Open award / skill / topic / project / map deep-links.
  useEffect(() => {
    const hop = latestOpenContentHop(messages)
    if (!hop || hop.toolCallId === lastOpenContentToolIdRef.current) return
    lastOpenContentToolIdRef.current = hop.toolCallId
    setUplinkNote(`Opening // ${hop.label}`)
    playPortfolioTransitionSound()
    const qs = hop.search.startsWith('?') ? hop.search : `?${hop.search}`
    setLocationSearch(qs)
    router.push(`${hop.path}${qs}`)
  }, [messages, router])

  // Prefill Contact form + hop to Uplink.
  useEffect(() => {
    const hop = latestFillContactHop(messages)
    if (!hop || hop.toolCallId === lastFillContactToolIdRef.current) return
    lastFillContactToolIdRef.current = hop.toolCallId
    writeContactDraft(hop.draft)
    setUplinkNote(`Draft // ${hop.label}`)
    playPortfolioTransitionSound()
    const qs = hop.search.startsWith('?') ? hop.search : `?${hop.search}`
    setLocationSearch(qs)
    router.push(`${hop.path}${qs}`)
  }, [messages, router])

  // endSession → close after goodbye VO (or immediately if VO is muted / no speech).
  useEffect(() => {
    const toolCallId = latestToolCallId(messages, 'tool-endSession')
    if (!toolCallId || toolCallId === lastEndSessionToolIdRef.current) return
    lastEndSessionToolIdRef.current = toolCallId
    pendingEndSessionRef.current = true
    setUplinkNote('Signing off')
  }, [messages])

  useEffect(() => {
    if (!pendingEndSessionRef.current || !open) return
    if (busy || speaking) return
    // After VO finishes, close quickly. If VO never starts (muted / empty), wait a beat.
    const spokenThisReply =
      Boolean(lastAssistant) && lastSpokenIdRef.current === lastAssistant?.id
    const delay = spokenThisReply ? 450 : 1600
    const timer = window.setTimeout(() => {
      if (!pendingEndSessionRef.current || !openRef.current) return
      pendingEndSessionRef.current = false
      closePanel({ playShutdown: true })
    }, delay)
    return () => window.clearTimeout(timer)
  }, [busy, speaking, open, messages, closePanel, lastAssistant])

  // Main menu: always dock above the menu column. Other routes: saved spot or same dock.
  useEffect(() => {
    if (pathname === '/') {
      const place = () => {
        const next = menuAnchoredOrbPos()
        orbPosRef.current = next
        setOrbPos(next)
        persistOrbPos(next)
      }
      place()
      const t1 = window.setTimeout(place, 60)
      const t2 = window.setTimeout(place, 320)
      return () => {
        window.clearTimeout(t1)
        window.clearTimeout(t2)
      }
    }
    const next = readStoredOrbPos() ?? defaultOrbPos()
    orbPosRef.current = next
    setOrbPos(next)
  }, [pathname, locationSearch])

  useEffect(() => {
    if (!open || !orbPos) {
      setPanelDock(null)
      return
    }
    setPanelDock((prev) => {
      if (prev) return prev
      const vw = window.innerWidth
      const vh = window.innerHeight
      // ~hologram + caption + ask row — prefer opening above when space below is tight (phones).
      const panelH = Math.min(360, vh * 0.55)
      const spaceBelow = vh - (orbPos.y + ORB_SIZE)
      const spaceAbove = orbPos.y
      const below =
        spaceBelow >= panelH || (spaceBelow >= spaceAbove && orbPos.y < vh * 0.42)
      return {
        below,
        alignEnd: orbPos.x + ORB_SIZE / 2 > vw * 0.5
      }
    })
  }, [open, orbPos])

  useEffect(() => {
    const onResize = () => {
      if (pathname === '/') {
        const next = menuAnchoredOrbPos()
        orbPosRef.current = next
        setOrbPos(next)
        return
      }
      setOrbPos((prev) => (prev ? clampOrbPos(prev.x, prev.y) : defaultOrbPos()))
    }
    // Orientation / chrome resize only — do not chase visualViewport (mobile keyboard
    // was shoving the hologram off-screen even when the panel still fit).
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [pathname])

  useEffect(() => {
    const html = document.documentElement
    const collapseIfModal = () => {
      if (html.dataset.portfolioModalOpen === 'true' && openRef.current) {
        closePanel({ playShutdown: false })
      }
    }
    collapseIfModal()
    const observer = new MutationObserver(collapseIfModal)
    observer.observe(html, { attributes: true, attributeFilter: ['data-portfolio-modal-open'] })
    return () => observer.disconnect()
  }, [closePanel])

  useEffect(() => {
    if (!open) {
      silenceCortana()
      return
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (document.documentElement.dataset.portfolioModalOpen === 'true') return
      event.preventDefault()
      closePanel({ playShutdown: true })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closePanel, silenceCortana])

  const fireGesture = useCallback((name: AuntieDotGesture) => {
    setGesture(name)
    setGestureKey((k) => k + 1)
  }, [])

  const openPanel = useCallback(() => {
    playPortfolioTransitionSound()
    clearError()
    setUplinkNote(null)
    setMessages([])
    lastSpokenIdRef.current = null
    lastNavToolIdRef.current = null
    lastResumeToolIdRef.current = null
    lastEndSessionToolIdRef.current = null
    lastOpenContentToolIdRef.current = null
    lastFillContactToolIdRef.current = null
    pendingEndSessionRef.current = false
    setOutfitWarnOpen(false)
    setOpen(true)
  }, [clearError, setMessages])

  const toggleOpen = useCallback(() => {
    if (openRef.current) {
      silenceCortana()
      playCortanaShutdownSound()
      setOpen(false)
      return
    }
    if (!readCortanaOutfitAck()) {
      setOutfitWarnOpen(true)
      return
    }
    openPanel()
  }, [openPanel, silenceCortana])

  const acceptOutfitWarning = useCallback(() => {
    writeCortanaOutfitAck()
    openPanel()
  }, [openPanel])

  const abortOutfitWarning = useCallback(() => {
    // Dismiss only — never hide the launcher mark.
    setOutfitWarnOpen(false)
  }, [])

  useEffect(() => {
    if (!outfitWarnOpen) return
    const unlock = lockPageScroll()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        setOutfitWarnOpen(false)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      unlock()
      window.removeEventListener('keydown', onKey, true)
    }
  }, [outfitWarnOpen])

  // Greeting wave once per panel open (not on every avatar remount / route return)
  const didWaveRef = useRef(false)
  useEffect(() => {
    if (!open) {
      didWaveRef.current = false
      setGesture(null)
      return
    }
    if (talkPoc || didWaveRef.current || !avatarReady) return
    didWaveRef.current = true
    fireGesture('wave')
  }, [open, talkPoc, avatarReady, fireGesture])

  // After she finishes speaking — pick a restrained closer, not always a salute
  useEffect(() => {
    if (talkPoc) {
      prevSpeaking.current = speaking
      return
    }
    if (prevSpeaking.current && !speaking && open) {
      if (Math.random() < 0.45) {
        const closers: AuntieDotGesture[] = [
          'nod',
          'affirm',
          'acknowledge',
          'present',
          'offer',
          'salute'
        ]
        fireGesture(closers[Math.floor(Math.random() * closers.length)]!)
      }
    }
    prevSpeaking.current = speaking
  }, [speaking, open, fireGesture])

  const toggleOpenRef = useRef(toggleOpen)
  toggleOpenRef.current = toggleOpen

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return
      event.preventDefault()
      const dx = event.clientX - drag.startX
      const dy = event.clientY - drag.startY
      if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
      const firstMove = !drag.moved
      drag.moved = true
      const next = clampOrbPos(drag.originX + dx, drag.originY + dy)
      orbPosRef.current = next
      setOrbPos(next)

      if (drag.kind === 'launcher') {
        if (firstMove) setHideDockVisible(true)
        const over = pointInHideDockRef.current(event.clientX, event.clientY)
        if (over !== hideDockHotRef.current) {
          hideDockHotRef.current = over
          setHideDockHot(over)
        }
      }
    }

    const onUp = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return
      dragRef.current = null
      setDragging(false)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      if (drag.captureEl) {
        try {
          if (drag.captureEl.hasPointerCapture(drag.pointerId)) {
            drag.captureEl.releasePointerCapture(drag.pointerId)
          }
        } catch {
          // ignore
        }
      }

      const dropOnHide =
        drag.kind === 'launcher' &&
        drag.moved &&
        (hideDockHotRef.current || pointInHideDockRef.current(event.clientX, event.clientY))
      hideDockHotRef.current = false
      setHideDockVisible(false)
      setHideDockHot(false)

      if (dropOnHide) {
        hideLauncherRef.current()
        return
      }

      if (drag.moved) {
        const next = orbPosRef.current ?? clampOrbPos(drag.originX, drag.originY)
        persistOrbPos(next)
        return
      }
      if (drag.clickAction === 'toggle') toggleOpenRef.current()
    }

    // Block page pan during drag without toggling overflow (overflow:hidden shifts layout/scrollbar).
    const onTouchMove = (event: TouchEvent) => {
      if (!dragRef.current) return
      event.preventDefault()
    }

    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  const beginDrag = useCallback(
    (
      event: ReactPointerEvent<Element>,
      clickAction: 'toggle' | 'none',
      kind: 'launcher' | 'panel'
    ) => {
      if (event.button !== 0) return
      const origin = orbPosRef.current
      if (!origin) return
      event.preventDefault()
      event.stopPropagation()

      const captureEl = event.currentTarget
      try {
        captureEl.setPointerCapture(event.pointerId)
      } catch {
        // Some browsers reject capture mid-gesture; window listeners still track.
      }

      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: origin.x,
        originY: origin.y,
        moved: false,
        clickAction,
        kind,
        captureEl
      }

      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'grabbing'
      setDragging(true)
      if (kind !== 'launcher') {
        hideDockHotRef.current = false
        setHideDockVisible(false)
        setHideDockHot(false)
      }
    },
    []
  )

  const onOrbPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      beginDrag(event, 'toggle', 'launcher')
    },
    [beginDrag]
  )

  const onPanelPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (isAuntieDragExcludedTarget(event.target)) return
      beginDrag(event, 'none', 'panel')
    },
    [beginDrag]
  )

  const submitText = useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text || busy) return
      if (text.length > AUNTIE_DOT_MAX_CHARS) {
        setUplinkNote(`Packet too large // Max ${AUNTIE_DOT_MAX_CHARS} characters`)
        return
      }
      clearError()
      setUplinkNote(null)
      cancelBriefingSpeech()
      setSpeaking(false)
      setVoCaption(null)
      resetThemeDuckForMissionBriefing()
      setInput('')

      // Obvious hops — skip the model (cheaper + reliable).
      const shortcut = matchAuntieDotIntentShortcut(text)
      if (shortcut) {
        const stamp = Date.now()
        const userId = `local-u-${stamp}`
        const assistantId = `local-a-${stamp}`
        setMessages((prev) => [
          ...prev,
          { id: userId, role: 'user', parts: [{ type: 'text', text }] },
          {
            id: assistantId,
            role: 'assistant',
            parts: [{ type: 'text', text: shortcut.line }]
          }
        ])
        void speakReply(shortcut.line, assistantId)

        if (shortcut.type === 'navigate') {
          setUplinkNote(`Routing // ${shortcut.label}`)
          playPortfolioTransitionSound()
          if (shortcut.path === '/') {
            setLocationSearch('?menu=1')
            router.push('/?menu=1')
          } else if (shortcut.path === '/about' && shortcut.section) {
            const qs = `?section=${shortcut.section}`
            setLocationSearch(qs)
            router.push(`/about${qs}`)
          } else {
            setLocationSearch('')
            router.push(shortcut.path)
          }
          return
        }

        if (shortcut.type === 'openContent') {
          setUplinkNote(`Opening // ${shortcut.label}`)
          playPortfolioTransitionSound()
          const qs = shortcut.search.startsWith('?')
            ? shortcut.search
            : `?${shortcut.search}`
          setLocationSearch(qs)
          router.push(`${shortcut.path}${qs}`)
          return
        }

        if (shortcut.type === 'openResume') {
          setUplinkNote('Opening // Resume')
          playResumeOpenSound()
          window.open(shortcut.href, '_blank', 'noopener,noreferrer')
          return
        }

        // endSession
        setUplinkNote('Signing off')
        pendingEndSessionRef.current = true
        return
      }

      void sendMessage({ text })
    },
    [busy, clearError, router, sendMessage, setMessages, speakReply]
  )

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    submitText(input)
  }

  const toggleMic = useCallback(() => {
    if (!micAvailable || busy) return
    if (listening) {
      stopMic()
      return
    }

    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Ctor) return

    stopMic()
    const recognition = new Ctor()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognitionRef.current = recognition

    recognition.onresult = (event) => {
      let interim = ''
      let finalText = ''
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i]
        const chunk = result?.[0]?.transcript ?? ''
        if ((result as { isFinal?: boolean }).isFinal) finalText += chunk
        else interim += chunk
      }
      const live = (finalText || interim).trim()
      if (live) setInput(live)
      if (finalText.trim()) {
        stopMic()
        submitText(finalText)
      }
    }
    recognition.onerror = () => stopMic()
    recognition.onend = () => {
      recognitionRef.current = null
      setListening(false)
    }

    try {
      recognition.start()
      setListening(true)
    } catch {
      stopMic()
    }
  }, [busy, listening, micAvailable, stopMic, submitText])

  // Hide only on the title gate. `menuEntered` flips on the Hero event immediately so we
  // do not wait for async `router.replace('/?menu=1')` (that race hid the launcher on home).
  const liveMenu =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('menu') === '1'
  const stateMenu =
    new URLSearchParams(
      locationSearch.startsWith('?') ? locationSearch.slice(1) : locationSearch
    ).get('menu') === '1'
  const pastTitleGate = pathname !== '/' || menuEntered || liveMenu || stateMenu || talkPoc

  if (!orbPos || !pastTitleGate) return null
  // Mark tucked away and panel closed — stay mounted for settings/talk-poc, render nothing.
  if (!launcherVisible && !open) return null

  const panelOpensBelow = panelDock?.below ?? orbPos.y < (typeof window !== 'undefined' ? window.innerHeight : 800) * 0.42
  const panelAlignEnd = panelDock?.alignEnd ?? orbPos.x > (typeof window !== 'undefined' ? window.innerWidth : 1280) * 0.45

  const outfitWarnModal =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {outfitWarnOpen ? (
              <div
                key="cortana-outfit-warn"
                className="fixed inset-0 z-[70] flex items-center justify-center p-3 pt-16 sm:p-4 sm:pt-20"
                role="presentation"
                onClick={abortOutfitWarning}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  aria-hidden
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="relative z-10 w-full max-w-md overflow-hidden border border-[#7fb6de]/32 bg-[#0c2236] text-[#e2f0ff] shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
                  onClick={(event) => event.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="cortana-outfit-warn-title"
                  style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
                >
                  <span className="pointer-events-none absolute inset-0 [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,14px_100%,0_calc(100%-14px))] border border-[#b6dbf7]/18" />
                  <div className="relative px-5 py-5 sm:px-6 sm:py-6">
                    <p className="text-xs uppercase tracking-[0.12em] text-[#89a7c5]">Advisory</p>
                    <h2
                      id="cortana-outfit-warn-title"
                      className="mt-1 text-xl font-semibold uppercase tracking-[0.06em] text-[#d7e5f4] sm:text-2xl"
                    >
                      Workplace discretion
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-[#9ab6d2] sm:text-[0.95rem]">
                      Cortana&apos;s appearance in the Halo games is not entirely safe for work.
                      Continue at your own discretion.
                    </p>
                    <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                      <button
                        type="button"
                        onClick={abortOutfitWarning}
                        className="inline-flex min-h-[40px] items-center justify-center border border-[#7eb6e2]/35 bg-[#1a3a55]/45 px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#c5dbf0] transition-colors hover:border-[#b0daff]/50 hover:text-white"
                      >
                        Not now
                      </button>
                      <button
                        type="button"
                        onClick={acceptOutfitWarning}
                        className="inline-flex min-h-[40px] items-center justify-center border border-[#8ebfe6]/45 bg-[#4b8dc2]/35 px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#e4f2ff] transition-colors hover:border-[#c2e0fa]/55 hover:bg-[#61a8de]/40 hover:text-white"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : null}
          </AnimatePresence>,
          document.body
        )
      : null

  const hideDock =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {hideDockVisible ? (
              <motion.div
                key="cortana-hide-dock"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 14 }}
                transition={{ duration: 0.18 }}
                className="pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[60] flex justify-center"
                style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
                aria-hidden
              >
                <div
                  ref={hideDockRef}
                  className={`flex flex-col items-center gap-1 transition-transform duration-150 ${
                    hideDockHot ? 'scale-110' : 'scale-100'
                  }`}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full border transition-[box-shadow,background-color,border-color] duration-150 ${
                      hideDockHot
                        ? 'border-[#ffb4a0]/75 bg-[rgba(90,28,22,0.72)] shadow-[0_0_28px_rgba(255,120,90,0.45)]'
                        : 'border-[#7eb6e2]/45 bg-[rgba(6,24,40,0.72)] shadow-[0_10px_28px_rgba(0,0,0,0.45)]'
                    } backdrop-blur-[6px]`}
                  >
                    <Trash2
                      size={hideDockHot ? 28 : 24}
                      strokeWidth={1.75}
                      className={hideDockHot ? 'text-[#ffe0d4]' : 'text-[#9fd0f5]'}
                    />
                  </div>
                  <span
                    className={`text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-[color,text-shadow] duration-150 ${
                      hideDockHot
                        ? 'text-white [text-shadow:0_0_6px_rgba(255,200,170,1),0_0_14px_rgba(255,140,100,0.95),0_0_28px_rgba(255,90,60,0.75),0_1px_3px_rgba(0,0,0,1),0_2px_10px_rgba(0,0,0,0.9)]'
                        : 'text-white [text-shadow:0_0_6px_rgba(180,230,255,1),0_0_14px_rgba(120,200,255,0.95),0_0_28px_rgba(70,160,255,0.75),0_1px_3px_rgba(0,0,0,1),0_2px_10px_rgba(0,0,0,0.9)]'
                    }`}
                  >
                    {hideDockHot ? 'Release to hide' : 'Hide mark'}
                  </span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body
        )
      : null

  return (
    <>
      {outfitWarnModal}
      {hideDock}
    <div
      className="pointer-events-none fixed z-[45]"
      style={{
        fontFamily: 'HaloMenu, "Arial Narrow", sans-serif',
        left: orbPos.x,
        top: orbPos.y,
        width: ORB_SIZE
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: panelOpensBelow ? -10 : 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: panelOpensBelow ? -8 : 8, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            onPointerDown={onPanelPointerDown}
            className={`pointer-events-auto absolute touch-none ${
              panelOpensBelow ? 'top-full mt-2' : 'bottom-full mb-2'
            } ${panelAlignEnd ? 'right-0' : 'left-0'} ${
              dragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ width: panelWidthCss(), touchAction: 'none' }}
            role="dialog"
            aria-label="Cortana"
          >
            {/* Blur only — no plate / border / chrome. Tiny tint so backdrop-filter engages. */}
            <div className="relative flex flex-col items-center bg-[rgba(3,16,24,0.03)] px-2 py-2 backdrop-blur-[2px]">
              {/* Drag affordance — 6-dot grip, top-left, HUD blue */}
              <div
                className="pointer-events-none absolute left-1.5 top-1.5 z-20 grid grid-cols-2 gap-[3px]"
                aria-hidden
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <span
                    key={i}
                    className="block h-[3.5px] w-[3.5px] rounded-full bg-[#9fd0f5] shadow-[0_0_0_1px_rgba(3,16,24,0.75)]"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => closePanel({ playShutdown: true })}
                className="absolute right-0 top-0 z-20 flex h-8 w-8 touch-hit items-center justify-center transition-opacity hover:opacity-90"
                aria-label="Close Cortana"
              >
                {/* White outline + black inner — readable on any hologram color */}
                <span className="relative inline-flex">
                  <X
                    size={20}
                    strokeWidth={4}
                    className="absolute inset-0 text-white"
                    aria-hidden
                  />
                  <X size={16} strokeWidth={1.7} className="relative text-black" />
                </span>
              </button>

              {talkPoc ? (
                <p className="mb-0.5 w-full px-1 text-left text-[0.55rem] uppercase tracking-[0.16em] text-[#7eb6e2]/95">
                  Talk POC // jaw rig · move mouse to look
                </p>
              ) : null}

              <HologramFigure
                mode={orbMode}
                gesture={gesture}
                gestureKey={gestureKey}
                talkKick={talkKick}
                talkSyllables={talkSyllables}
                onReady={() => setAvatarReady(true)}
              />

              <p className="mt-1 w-full px-1 text-left text-[0.82rem] leading-snug text-[#e2f0ff] drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)] sm:text-[0.88rem]">
                {caption ? (
                  <>
                    <span className="mr-1.5 font-medium tracking-wide text-[#9fd0f5]">Cortana:</span>
                    {caption}
                  </>
                ) : null}
                {busy && assistantText ? (
                  <span className="ml-0.5 inline-block h-[0.85em] w-[0.35em] translate-y-[0.1em] animate-pulse bg-[#9fd0f5]" />
                ) : null}
              </p>
              <form
                onSubmit={onSubmit}
                className="mt-1 flex w-full touch-auto items-center gap-1.5 px-1"
                data-no-drag="true"
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value.slice(0, AUNTIE_DOT_MAX_CHARS))}
                  placeholder="Ask…"
                  maxLength={AUNTIE_DOT_MAX_CHARS}
                  disabled={busy}
                  enterKeyHint="send"
                  autoComplete="off"
                  autoCorrect="on"
                  autoCapitalize="sentences"
                  className="min-w-0 flex-1 cursor-text touch-auto border-0 border-b border-[#5d79a4]/55 bg-transparent px-1 py-1 text-base text-[#e8f4ff] outline-none placeholder:text-[#5f7a96] focus:border-[#9fd0f5]/7 disabled:opacity-55 sm:text-sm"
                  aria-label="Message Cortana"
                />
                {micAvailable && (
                  <button
                    type="button"
                    onClick={toggleMic}
                    disabled={busy}
                    aria-pressed={listening}
                    aria-label={listening ? 'Stop microphone' : 'Speak'}
                    className={`touch-hit flex h-11 w-11 shrink-0 items-center justify-center transition-colors disabled:opacity-45 sm:h-7 sm:w-7 ${
                      listening ? 'text-[#9fd0f5]' : 'text-[#7a96b4] hover:text-[#c8def2]'
                    }`}
                  >
                    <Mic size={16} strokeWidth={2} />
                  </button>
                )}
              </form>
              <p className="mt-0.5 w-full px-1 text-right text-[0.5rem] tabular-nums tracking-wide text-[#5f7a96]/90">
                {input.length}/{AUNTIE_DOT_MAX_CHARS}
              </p>
              <p
                className="mt-0.5 w-full px-1 text-[0.52rem] uppercase tracking-[0.14em] text-[#7a96b4] drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]"
                data-no-drag="true"
              >
                <span className="sm:hidden">Drag · Move</span>
                <span className="hidden sm:inline">Esc · Close</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cortana logo mark — drag / open. Hidden while hologram is open or tucked away. */}
      {!open && launcherVisible && (
        <button
          type="button"
          onPointerDown={onOrbPointerDown}
          aria-expanded={false}
          aria-label="Open Cortana"
          className={`pointer-events-auto group relative flex h-[76px] w-[76px] touch-none items-center justify-center ${
            dragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <CortanaMark
            mode={orbMode}
            uid="launcher"
            className={`relative h-[68px] w-[68px] drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] transition-transform duration-200 ${
              hideDockHot
                ? 'scale-90 opacity-70'
                : orbMode === 'thinking' || orbMode === 'speaking'
                  ? 'scale-105'
                  : 'group-hover:scale-105'
            }`}
          />
        </button>
      )}
    </div>
    </>
  )
}
