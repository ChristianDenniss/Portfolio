'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, X } from 'lucide-react'
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
import {
  AUNTIE_DOT_ABOUT_SECTION_LABELS,
  AUNTIE_DOT_MAX_CHARS,
  AUNTIE_DOT_ROUTE_LABELS,
  isAuntieDotAboutSection,
  isAuntieDotRoute,
  type AuntieDotAboutSection,
  type AuntieDotRoute
} from '@/lib/auntieDotLimits'
import { getEffectiveMenuVoVolume } from '@/lib/portfolioAudioSettings'
import {
  cancelBriefingSpeech,
  countSyllables,
  revealIndexFromBoundary,
  speakBriefingSitrep,
  wordFromBoundary
} from '@/lib/portfolioBriefingSpeech'
import {
  duckThemeForMissionBriefing,
  playCortanaShutdownSound,
  playPortfolioTransitionSound,
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

const ORB_SIZE = 56
const ORB_MARGIN = 12
const DRAG_THRESHOLD_PX = 6
const POS_STORAGE_KEY = 'portfolio-auntie-dot-pos-v2'
const PANEL_W = 300

type OrbPos = { x: number; y: number }

function clampOrbPos(x: number, y: number): OrbPos {
  if (typeof window === 'undefined') return { x, y }
  const maxX = Math.max(ORB_MARGIN, window.innerWidth - ORB_SIZE - ORB_MARGIN)
  const maxY = Math.max(ORB_MARGIN, window.innerHeight - ORB_SIZE - ORB_MARGIN)
  return {
    x: Math.min(maxX, Math.max(ORB_MARGIN, x)),
    y: Math.min(maxY, Math.max(ORB_MARGIN, y))
  }
}

function defaultOrbPos(): OrbPos {
  return clampOrbPos(window.innerWidth - ORB_SIZE - ORB_MARGIN, ORB_MARGIN)
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

function hasMicSupport(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

/**
 * Classic Cortana concentric mark (Windows Cortana proportions):
 * thick flat ring + solid core with a clear gap — not a 3D orb.
 */
function CortanaMark({
  mode = 'idle',
  className = '',
  uid = 'orb'
}: {
  mode?: OrbMode
  className?: string
  /** Unique suffix so multiple SVGs on the page don't clash gradient ids. */
  uid?: string
}) {
  const softId = `auntieCortanaSoft-${uid}`
  const thinking = mode === 'thinking'
  const speaking = mode === 'speaking'
  const listening = mode === 'listening'
  // Microsoft Cortana geometry scaled to 64: ring r≈24 / sw≈8, core r≈11
  const ringR = 23.5
  const ringSw = 7.5
  const coreR = 10.5

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden
      shapeRendering="geometricPrecision"
    >
      <defs>
        <radialGradient id={softId} cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="rgba(120,200,240,0.35)" />
          <stop offset="100%" stopColor="rgba(120,200,240,0)" />
        </radialGradient>
      </defs>

      {/* Soft bloom — SVG only, no CSS drop-shadow (avoids muddy blur at small sizes) */}
      <circle
        cx="32"
        cy="32"
        r="31"
        fill={`url(#${softId})`}
        className={mode === 'idle' ? 'auntie-cortana-aura' : undefined}
        opacity={speaking || listening ? 1 : 0.85}
      />

      {/* Flat primary ring — one ring only (extra strokes read as a cheap bullseye) */}
      <circle
        cx="32"
        cy="32"
        r={ringR}
        fill="none"
        stroke="#9ad4f2"
        strokeWidth={ringSw}
        className={mode === 'idle' ? 'auntie-cortana-breathe' : undefined}
      />

      {/* Flat core */}
      <circle
        cx="32"
        cy="32"
        r={coreR}
        fill="#8ecff0"
        className={speaking ? 'auntie-cortana-core-speak' : listening ? 'auntie-cortana-core-listen' : undefined}
      />

      {thinking && (
        <circle
          cx="32"
          cy="32"
          r={ringR}
          fill="none"
          stroke="rgba(240,250,255,0.95)"
          strokeWidth={ringSw}
          strokeLinecap="round"
          strokeDasharray="16 132"
          className="auntie-cortana-sweep"
        />
      )}

      {listening && (
        <circle
          cx="32"
          cy="32"
          r="29"
          fill="none"
          stroke="rgba(170,220,250,0.55)"
          strokeWidth="1.35"
          className="auntie-cortana-listen-ring"
        />
      )}
    </svg>
  )
}

function HologramFigure({
  mode,
  gesture,
  gestureKey,
  talkKick = 0,
  talkSyllables = 1
}: {
  mode: OrbMode
  gesture?: AuntieDotGesture | null
  gestureKey?: number
  talkKick?: number
  talkSyllables?: number
}) {
  return (
    <AuntieDotAvatar
      mode={mode}
      gesture={gesture}
      gestureKey={gestureKey}
      talkKick={talkKick}
      talkSyllables={talkSyllables}
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
  /** Freeze panel dock side while open — flipping left/right mid-drag jumps it toward center. */
  const [panelDock, setPanelDock] = useState<{ below: boolean; alignEnd: boolean } | null>(null)
  const [gesture, setGesture] = useState<AuntieDotGesture | null>(null)
  const [gestureKey, setGestureKey] = useState(0)
  const [talkKick, setTalkKick] = useState(0)
  const [talkSyllables, setTalkSyllables] = useState(1)
  const [talkPoc, setTalkPoc] = useState(false)
  const [talkPocLine, setTalkPocLine] = useState(0)
  /** Caption typed out in sync with Web Speech word boundaries. */
  const [voCaption, setVoCaption] = useState<{ full: string; visible: number } | null>(null)
  const prevSpeaking = useRef(false)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const lastSpokenIdRef = useRef<string | null>(null)
  const lastNavToolIdRef = useRef<string | null>(null)
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
  } | null>(null)
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
    const trimmed = text.trim()
    if (!trimmed) return

    lastSpokenIdRef.current = messageId
    cancelBriefingSpeech()
    duckThemeForMissionBriefing()
    setSpeaking(true)
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

  const caption = voCaption
    ? voCaption.full.slice(0, voCaption.visible)
    : talkPoc && open
      ? ''
      : uplinkNote
        ? uplinkNote
        : error
          ? 'Signal degraded.'
          : busy && !assistantText
            ? '…'
            : assistantText
              ? assistantText
              : listening
                ? 'Listening…'
                : open
                  ? 'Standing by.'
                  : ''

  useEffect(() => {
    setMicAvailable(hasMicSupport())
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const search = window.location.search
    setLocationSearch(search)
    const poc = new URLSearchParams(search).get('talkpoc') === '1'
    setTalkPoc(poc)
    if (poc) {
      setOpen(true)
      setSpeaking(true)
    }
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

  // Open greeting VO (skipped during talk POC) — short delay so the panel is on-screen first.
  const didGreetRef = useRef(false)
  useEffect(() => {
    if (!open) {
      didGreetRef.current = false
      return
    }
    if (talkPoc || didGreetRef.current) return
    didGreetRef.current = true
    const line = OPEN_GREETINGS[Math.floor(Math.random() * OPEN_GREETINGS.length)]!
    const timer = window.setTimeout(() => {
      if (!openRef.current) return
      void speakReply(line, `greet-${Date.now()}`)
    }, 280)
    return () => window.clearTimeout(timer)
  }, [open, talkPoc, speakReply])

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

  useEffect(() => {
    setOrbPos(readStoredOrbPos() ?? defaultOrbPos())
  }, [])

  useEffect(() => {
    if (!open || !orbPos) {
      setPanelDock(null)
      return
    }
    setPanelDock((prev) => {
      if (prev) return prev
      const vw = window.innerWidth
      const vh = window.innerHeight
      return {
        below: orbPos.y < vh * 0.42,
        alignEnd: orbPos.x > vw * 0.45
      }
    })
  }, [open, orbPos])

  useEffect(() => {
    const onResize = () => {
      setOrbPos((prev) => (prev ? clampOrbPos(prev.x, prev.y) : defaultOrbPos()))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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

  const toggleOpen = useCallback(() => {
    setOpen((prev) => {
      if (prev) {
        silenceCortana()
        playCortanaShutdownSound()
        return false
      }
      playPortfolioTransitionSound()
      clearError()
      setUplinkNote(null)
      setMessages([])
      lastSpokenIdRef.current = null
      lastNavToolIdRef.current = null
      return true
    })
  }, [clearError, setMessages, silenceCortana])

  // Greeting wave whenever the panel opens (skip during talk POC so jaw reads clearly)
  useEffect(() => {
    if (open && !talkPoc) fireGesture('wave')
    else if (!open) setGesture(null)
  }, [open, talkPoc, fireGesture])

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
      drag.moved = true
      const next = clampOrbPos(drag.originX + dx, drag.originY + dy)
      orbPosRef.current = next
      setOrbPos(next)
    }

    const onUp = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return
      dragRef.current = null
      setDragging(false)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''

      if (drag.moved) {
        const next = orbPosRef.current ?? clampOrbPos(drag.originX, drag.originY)
        persistOrbPos(next)
        return
      }
      if (drag.clickAction === 'toggle') toggleOpenRef.current()
    }

    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  const beginDrag = useCallback(
    (event: ReactPointerEvent<Element>, clickAction: 'toggle' | 'none') => {
      if (event.button !== 0) return
      const origin = orbPosRef.current
      if (!origin) return
      event.preventDefault()
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: origin.x,
        originY: origin.y,
        moved: false,
        clickAction
      }
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'grabbing'
      setDragging(true)
    },
    []
  )

  const onOrbPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      beginDrag(event, 'toggle')
    },
    [beginDrag]
  )

  const onPanelPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (isAuntieDragExcludedTarget(event.target)) return
      beginDrag(event, 'none')
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
      void sendMessage({ text })
    },
    [busy, clearError, sendMessage]
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

  if (!orbPos) return null

  const panelOpensBelow = panelDock?.below ?? orbPos.y < (typeof window !== 'undefined' ? window.innerHeight : 800) * 0.42
  const panelAlignEnd = panelDock?.alignEnd ?? orbPos.x > (typeof window !== 'undefined' ? window.innerWidth : 1280) * 0.45

  return (
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
            className={`pointer-events-auto absolute ${
              panelOpensBelow ? 'top-full mt-2' : 'bottom-full mb-2'
            } ${panelAlignEnd ? 'right-0' : 'left-0'} ${
              dragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ width: `min(100vw - 1.25rem, ${PANEL_W}px)` }}
            role="dialog"
            aria-label="Cortana"
          >
            {/* Blur only — no plate / border / chrome. Tiny tint so backdrop-filter engages. */}
            <div className="relative flex flex-col items-center bg-[rgba(3,16,24,0.03)] px-2 py-2 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => closePanel({ playShutdown: true })}
                className="absolute -right-0.5 -top-0.5 z-20 flex h-8 w-8 touch-hit items-center justify-center border-0 bg-transparent text-[#d8ecff] drop-shadow-[0_0_6px_rgba(160,220,255,0.95)] transition-[color,filter] hover:text-white hover:drop-shadow-[0_0_10px_rgba(190,230,255,1)]"
                aria-label="Close Cortana"
              >
                <X size={16} strokeWidth={2.25} />
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
                  className="min-w-0 flex-1 cursor-text touch-auto border-0 border-b border-[#5d79a4]/55 bg-transparent px-1 py-1 text-sm text-[#e8f4ff] outline-none placeholder:text-[#5f7a96] focus:border-[#9fd0f5]/7 disabled:opacity-55"
                  aria-label="Message Cortana"
                />
                {micAvailable && (
                  <button
                    type="button"
                    onClick={toggleMic}
                    disabled={busy}
                    aria-pressed={listening}
                    aria-label={listening ? 'Stop microphone' : 'Speak'}
                    className={`touch-hit flex h-7 w-7 shrink-0 items-center justify-center transition-colors disabled:opacity-45 ${
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
              <p className="mt-0.5 w-full px-1 text-[0.52rem] uppercase tracking-[0.14em] text-[#7a96b4] drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
                Esc · Close
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cortana concentric mark — drag / open launcher. Hidden while hologram is open. */}
      {!open && (
        <button
          type="button"
          onPointerDown={onOrbPointerDown}
          aria-expanded={false}
          aria-label="Open Cortana"
          className={`pointer-events-auto group relative flex h-14 w-14 touch-none items-center justify-center ${
            dragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <CortanaMark
            mode={orbMode}
            uid="launcher"
            className={`relative h-12 w-12 transition-transform duration-200 ${
              orbMode === 'thinking' || orbMode === 'speaking'
                ? 'scale-105'
                : 'group-hover:scale-105'
            }`}
          />
        </button>
      )}
    </div>
  )
}
