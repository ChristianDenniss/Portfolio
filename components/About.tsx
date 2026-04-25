'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

import {
  playPortfolioAboutSectionTabTransitionSound,
  playPortfolioSkillBlockDropSound,
  playPortfolioSkillBlockGrabSound,
  playPortfolioTransitionSound
} from '@/lib/portfolioSfx'
import { PORTFOLIO_ABOUT_MENU_VIDEO_SRC } from '@/lib/portfolioMenuVideos'

type MainSectionId = 'about' | 'skills' | 'experience' | 'education'

type TopicEntry = { heading: string; detail: string }

type TopicOption = {
  id: string
  label: string
  title: string
  subtitle: string
  summary: string
  /** Omit or leave empty for a single body block (`summary` only). */
  entries?: TopicEntry[]
}

type ExperienceEntry = {
  id: string
  company: string
  /** Optional external company site shown as a link on the company name. */
  website?: string
  location: string
  /** Optional logo URL; omit or empty to show company initial. */
  logo?: string
  title: string
  dateRange: string
  /** Short context under the title; omit if not needed. */
  description?: string
  tasks: string[]
}

type EducationProgram = {
  id: string
  school: string
  location: string
  /** Logo under `public/` (e.g. `/images/unblogo-removebg-preview.png`). */
  logo: string
  credential: string
  dates: string
  bullets: string[]
}

const MAIN_TABS: { id: MainSectionId; label: string }[] = [
  { id: 'about', label: 'About Me' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Degrees & honors' }
]

/** Logos under `public/images/`; omit `logo` to fall back to initials. */
const EXPERIENCES: ExperienceEntry[] = [
  {
    id: 'trojai',
    company: 'TrojAI, Inc.',
    website: 'https://troj.ai/',
    location: 'Saint John, NB',
    logo: '/images/TROJAI-removebg-preview.png',
    title: 'AI Security Engineer (Co-op)',
    dateRange: 'April 2026 – Sept 2026',
    description:
      'TrojAI builds enterprise-grade security for AI agents and models: secure deployment across the lifecycle, runtime protection against prompt injection and tool misuse, and alignment with governance frameworks. Mission: enable organizations to innovate with AI without trading off security.',
    tasks: [
      'Contributed to agent and model security features in line with TrojAI Detect (build-time weakness surfacing) and TrojAI Defend (runtime threat protection) product directions.',
      'Worked on controls and policy engines for blocking unsafe agent behavior: prompt injection, jailbreaking, tool exploitation, and leakage of PII, IP, or other sensitive data in agent flows.',
      'Supported evaluation and integration work so agent actions stay reliable across tools, APIs, and enterprise environments, including self-hosted and multi-cloud deployment constraints.',
      'Assisted with benchmarking, test harnesses, and customer-facing narratives around blocking rules, risk detection categories, and compliance-oriented agent governance.'
    ]
  },
  {
    id: 'red-thread',
    company: 'Red Thread Innovations, Inc.',
    website: 'https://www.redthreadinnovations.com/',
    location: 'Toronto, Canada',
    logo: '/images/RTI-removebg-preview.png',
    title: 'Software Engineer (Co-op)',
    dateRange: 'April 2025 – Sept 2025',
    tasks: [
      'Developed and optimized realistic AI avatars in Unreal Engine, animating character rigs using viseme data and ElevenLabs text-to-speech API, with performance improvements via WebAssembly.',
      'Owned and executed end-to-end data modeling for a relational LMS backend, defining tables, schemas, and relationships using Miro and Mermaid to establish the primary source of truth for development.',
      'Researched LLM SDKs and APIs and benchmarked models on company-specific coding tasks and practices to guide development of a node-based coding agent and its orchestration harness and environment (CogniGraph).'
    ]
  },
  {
    id: 'full-frame',
    company: 'Full Frame Freelance',
    location: 'Rothesay, NB',
    logo: '/images/FF%20logo.png',
    title: 'Full-stack freelance software developer',
    dateRange: 'January 2025 – June 2025',
    description:
      'Freelance stretch focused on Google Sheets systems for real operators, plus continued product work on Volleyball 4-2 (same stack and scope as the Volleyball 4-2 entry in my Projects page).',
    tasks: [
      'Commission and finances tracking workbook in Google Sheets for a solo developer: structured tabs, formulas, and Apps Script so payouts and revenue stayed auditable without a separate product.',
      'Community-facing statistics sheet for a large gaming community: complex layouts and calculations that had to stay in sync with their existing Google Sheets so officers could paste, link, and trust one source of truth across files.',
      'Volleyball 4-2 website and admin experience during this window: full-stack TypeScript work on the same production property as in Projects (leagues, stats, seasons, and integrations), not a separate prototype.'
    ]
  }
]

const EDUCATION: EducationProgram[] = [
  {
    id: 'unb',
    school: 'University of New Brunswick',
    location: 'Saint John, NB, Canada',
    logo: '/images/unblogo-removebg-preview.png',
    credential: 'Bachelor of Computer Science, co-op program, with distinction',
    dates: 'Jan 2024 – Apr 2027',
    bullets: [
      'GPA: 3.7.',
      "Honors: Dean's List; Fisher Foundation Award (2x); Good Energy Award (2x).",
      'Publications: Published a research paper from a high-fidelity digital twin of UNBSJ campus parking infrastructure I developed, modeling dynamic real-world demand, what-if scenarios, and system stress. That work led to direct outreach and engagement from the bi-campus Chair of Transportation and Parking.'
    ]
  },
  {
    id: 'msvu',
    school: 'Mount Saint Vincent University',
    location: 'Halifax, NS, Canada',
    logo: '/images/msvulogo-removebg-preview.png',
    credential: 'Bachelor of General Science',
    dates: 'Jan 2022 – Apr 2023',
    bullets: [
      'Completed a wide variety of coursework before transferring to UNB to pursue my passion for Computer Science.',
      'Also completed three IT courses at MSVU, which helped me develop a strong foundation in computer science and programming.'
    ]
  }
]

const interReadable = { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' } as const

function ExperienceJobCard({ job }: { job: ExperienceEntry }) {
  const hasLogo = Boolean(job.logo?.trim())
  const [logoFailed, setLogoFailed] = useState(false)
  const showInitial = !hasLogo || logoFailed
  const initialLetter = job.company.replace(/[^A-Za-z]/g, '').slice(0, 1) || '?'

  const cardBody = (
    <article className="flex items-stretch overflow-hidden rounded-sm border border-[#8ebfe6]/30 bg-[#071422]/40 shadow-[0_10px_28px_rgba(0,0,0,0.4)] backdrop-blur-[2px] transition-colors duration-150 group-hover:border-[#b6dbf7]/40">
      <div className="relative flex w-[7.25rem] shrink-0 flex-col justify-center self-stretch bg-[#0b1e30]/22 sm:w-40">
        <div className="flex h-36 w-full items-center justify-center px-2 sm:h-40 sm:px-3">
          {showInitial ? (
            <span
              className="flex h-full max-h-full w-full max-w-full aspect-square items-center justify-center border border-[#4d6d8f]/60 bg-[#122a42]/50 text-sm font-bold uppercase tracking-tight text-[#dfefff] sm:text-base"
              aria-hidden
            >
              {initialLetter}
            </span>
          ) : (
            <img
              src={job.logo}
              alt={job.company}
              className="h-full w-full object-contain object-center"
              onError={() => setLogoFailed(true)}
            />
          )}
        </div>
      </div>
      <div className="min-w-0 flex-1 bg-[#0d2740]/22 px-4 py-3 sm:px-6 sm:py-4" style={interReadable}>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8eb2d0]">
            {job.company}
            <span className="font-medium normal-case tracking-normal text-[#9abdd4]"> · {job.location}</span>
          </p>
          <p className="text-[0.7rem] font-medium whitespace-nowrap text-[#8fb0cc] sm:text-right">{job.dateRange}</p>
        </div>
        <h3 className="mt-1 text-sm font-semibold uppercase tracking-[0.07em] text-[#f0f7ff] sm:text-base">{job.title}</h3>
        {job.description?.trim() ? (
          <p className="mt-2 text-sm leading-snug text-[#c8def2]">{job.description}</p>
        ) : null}
        <ul className="mt-2.5 grid list-none grid-cols-1 gap-x-10 gap-y-2 pl-0 text-sm leading-snug text-[#d4e7f9] sm:grid-cols-2">
          {job.tasks.map((task) => (
            <li key={task} className="flex gap-2">
              <span className="shrink-0 text-[#6d94bd]" aria-hidden>
                ·
              </span>
              <span>{task}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )

  if (!job.website) return cardBody

  return (
    <a
      href={job.website}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ebfe6]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03101c]"
      aria-label={`${job.company} website`}
    >
      {cardBody}
    </a>
  )
}

function EducationProgramBlock({ program }: { program: EducationProgram }) {
  const hasLogo = Boolean(program.logo?.trim())
  const [logoFailed, setLogoFailed] = useState(false)
  const showInitial = !hasLogo || logoFailed
  const initialLetter = program.school.replace(/[^A-Za-z]/g, '').slice(0, 1) || '?'

  return (
    <section className="flex min-w-0 items-start gap-4 sm:gap-7">
      <div className="relative flex w-[4.75rem] shrink-0 items-center justify-center sm:w-28">
        <div className="flex aspect-square w-full max-w-[7rem] items-center justify-center sm:max-w-none">
          {showInitial ? (
            <span
              className="flex aspect-square max-h-20 w-full max-w-full items-center justify-center border border-[#4d6d8f]/50 bg-[#122a42]/40 text-sm font-bold uppercase tracking-tight text-[#dfefff] sm:max-h-24 sm:text-base"
              aria-hidden
            >
              {initialLetter}
            </span>
          ) : (
            <img
              src={program.logo}
              alt={`${program.school} logo`}
              className="max-h-20 w-full max-w-full object-contain object-center sm:max-h-24"
              onError={() => setLogoFailed(true)}
            />
          )}
        </div>
      </div>
      <div className="min-w-0 flex-1 text-left">
        <header>
          <h3 className="text-lg font-semibold tracking-tight text-[#f2f8ff] sm:text-xl">{program.school}</h3>
          <p className="mt-1 text-sm text-[#94b8d4]">{program.location}</p>
          <div className="mt-4 flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4 sm:gap-y-1 lg:gap-x-6">
            <p className="min-w-0 text-[0.9375rem] font-medium leading-snug text-[#d6e9fb] sm:min-w-0 sm:flex-1">
              {program.credential}
            </p>
            <p className="min-w-0 text-xs font-medium tabular-nums tracking-wide text-[#7fa6c8] sm:shrink-0 sm:text-right">
              {program.dates}
            </p>
          </div>
        </header>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-left text-sm leading-relaxed text-[#c8def2] marker:text-[#5f86ad]">
          {program.bullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function EducationTabContent() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-2 pb-6 text-left sm:px-4" style={interReadable}>
      <div className="flex min-w-0 flex-col gap-11 sm:gap-14">
        {EDUCATION.map((program) => (
          <EducationProgramBlock key={program.id} program={program} />
        ))}
      </div>
    </div>
  )
}

const skillLinkCls =
  'font-medium text-[#9fcdff] underline decoration-[#9fcdff]/40 underline-offset-2 hover:text-[#cfe8ff]'

const skillTabLinkBtnCls = `${skillLinkCls} cursor-pointer border-0 bg-transparent p-0 text-left font-inherit text-sm`

const SKILL_CLUSTER_LG_COL: Record<number, string> = {
  12: 'lg:col-span-12',
  8: 'lg:col-span-8',
  7: 'lg:col-span-7',
  6: 'lg:col-span-6',
  5: 'lg:col-span-5',
  4: 'lg:col-span-4'
}

type SkillClusterSurface = 'frame' | 'rail' | 'soft'

function skillClusterSurfaceClass(surface: SkillClusterSurface): string {
  switch (surface) {
    case 'frame':
      return 'rounded-sm border border-[#8ebfe6]/26 bg-[#071522]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
    case 'rail':
      return 'rounded-sm border border-[#8ebfe6]/18 border-l-[3px] border-l-[#7eb8ea] bg-[#050f18]/88 shadow-[inset_1px_0_0_rgba(126,184,234,0.12)]'
    case 'soft':
      return 'rounded-lg border border-[#2a4a66]/55 bg-[#060f18]/80 ring-1 ring-[#8ebfe6]/10'
  }
}

const SKILL_BLOCK_ORDER_STORAGE_KEY = 'portfolio:skillClusterOrder:v1'

type SkillClusterDef = {
  id: string
  title: string
  items: string[]
  lgCol: number
  surface: SkillClusterSurface
}

function normalizeStoredOrder(stored: unknown, canonical: string[]): string[] | null {
  if (!Array.isArray(stored)) return null
  const ids = stored.filter((x): x is string => typeof x === 'string')
  if (ids.length !== canonical.length) return null
  const canonSet = new Set(canonical)
  for (const id of ids) {
    if (!canonSet.delete(id)) return null
  }
  if (canonSet.size !== 0) return null
  return ids
}

function reorderSkillClusterIds(order: string[], draggedId: string, targetId: string): string[] {
  if (draggedId === targetId) return order
  const from = order.indexOf(draggedId)
  const to = order.indexOf(targetId)
  if (from === -1 || to === -1) return order
  const next = [...order]
  next.splice(from, 1)
  next.splice(to, 0, draggedId)
  return next
}

/** Capability-focused copy; timelines and artifacts stay in Experience / Projects. */
const SKILL_CLUSTERS: SkillClusterDef[] = [
  {
    id: 'languages',
    title: 'Languages & runtimes',
    lgCol: 12,
    surface: 'rail',
    items: [
      'TypeScript, JavaScript, Java, Go, Python, and SQL across services, UIs, data work, and tooling; C/C++ including systems-level and legacy codepaths; comfortable with assembly and wire-level reading when debugging.',
      'None of that is a silo: services, CLIs, batch jobs, glue, and APIs can be whichever language fits the existing repo, team, latency, and ops constraints. The list above is what I am likely to ship in, and have shipped in, not a rule that each language only belongs in one kind of work.',
      'Example: TypeScript across a large community web stack, Java for a from-scratch local search CLI, Python for research-side glue when a notebook is the fastest honest path.'
    ]
  },
  {
    id: 'web-product-ui',
    title: 'Web & product UI',
    lgCol: 7,
    surface: 'frame',
    items: [
      'A lot of shipped depth in React and Next.js, Vite, React Three Fiber, Tailwind, React Native, and Expo for layout, 3D analytics, and store-grade mobile. UI motion is mostly CSS and small targeted tweaks rather than deep Framer Motion work compared to the Figma-led design and plugin side on this same map (Design, diagrams, and API contracts).',
      'Those stacks are where most of my UI reps live, not a fence: the same product problems can ship in another framework if the repo or team already standardized on it.',
      'Example: long-running admin and stats surfaces in React, plus browser-side 3D work where player stats are easier to read as a spatial projection than a flat grid.',
      'Example: at Red Thread (RTI), tasked with a new relational LMS data model as engineering’s source of truth starting from the design team’s latest deliverables alone; when flows or screens implied friction, bad keys, or duplication in real data, I pushed back with concrete schema and UX fixes and coordinated changes with design instead of silently papering over it.'
    ]
  },
  {
    id: 'backend-apis',
    title: 'Backend, APIs, and integration',
    lgCol: 5,
    surface: 'soft',
    items: [
      'REST-shaped services, validation (e.g. Zod), JWT-style auth, ORM-backed persistence (TypeORM), Redis for hot paths and rate limits; plenty of reps in Node/Express-shaped code, with the same discipline portable to Go, Java, or whatever the service runtime is.',
      'Stitching external APIs, scraping or augmenting institutional data when no single vendor covers the workflow, and keeping errors, logging, and caching coherent across services.',
      'Example: course and scheduling APIs merged into a research backend next to Redis and batch jobs, or game-platform APIs behind auth, rate limits, and careful error surfaces.'
    ]
  },
  {
    id: 'data-stores-sql',
    title: 'Data stores & SQL depth',
    lgCol: 8,
    surface: 'frame',
    items: [
      'Strong depth in PostgreSQL: migrations, query plans, intentional indexing (full-text, trigram, and related patterns).',
      'Comparing ORM-generated SQL to hand-tuned paths under the same predicates, measuring wall time and payload, not vibes.',
      'The same data-modelling habits carry to SQLite, MongoDB, or other stores when access patterns, edge deploys, or team standards point there, without treating every problem as one fat CRUD table.',
      'Example: Postgres + TypeORM under real traffic on a community product, plus a separate bench app that runs the same logical query through ORM and raw SQL slots to compare plans and payloads.'
    ]
  },
  {
    id: 'search-ir',
    title: 'Search & information retrieval',
    lgCol: 4,
    surface: 'rail',
    items: [
      'Custom tokenization, inverted indexes, weighted lexical ranking, recency bias, snippets, and incremental index sync in constrained environments.',
      'Rich document ingestion (PDF, Office Open XML) feeding retrieval stacks; the same IR ideas show up in CLIs, web backends, and batch jobs, not only a classic desktop search box.',
      'Example: a plain Java CLI that walks folders, indexes text plus PDF and Office files, ranks with TF-IDF and recency, and ships as a shaded JAR so people can search without installing a suite.'
    ]
  },
  {
    id: 'ai-agents-security',
    title: 'AI, agents, and security mindset',
    lgCol: 6,
    surface: 'soft',
    items: [
      'LLM SDK evaluation, prompt design, and orchestration across tools and APIs, including node-based agent graphs where several models and tool calls participate in one coding workflow, not only a single chat surface.',
      'Thinking in controls and abuse categories for agents: tool misuse, injection, leakage, and how policy engines express “allowed” versus “blocked.”',
      'Benchmarks and harnesses to make model and defense choices legible to teammates and stakeholders.',
      'Example: AI security co-op on guardrails and evals; at another co-op, research and hands-on build on an internal node-based coding-agent harness that coordinated multiple LLMs and tools; on-device recipe-to-grocery prompts where answers line up with list rows instead of open-ended chat.'
    ]
  },
  {
    id: 'games-perf',
    title: 'Games, realtime, and performance surfaces',
    lgCol: 6,
    surface: 'frame',
    items: [
      'Unreal Engine for character, audio, and viseme-heavy pipelines under budget; WebAssembly for compute-heavy paths in the browser or in tooling; profiling and measurement before guessing.',
      'Performance work is not locked to games: the same measure-first mindset applies to web services, data jobs, and integrations when latency or throughput is the risk.',
      'Example: Unreal avatars with viseme-driven animation and TTS at a prior co-op when frame time and asset cost were both on the scoreboard, not only “make it pretty.”'
    ]
  },
  {
    id: 'infra-quality',
    title: 'Infra, release, and quality',
    lgCol: 5,
    surface: 'rail',
    items: [
      'Dockerized services; pragmatic hosting (Vercel, Fly, Coolify, Supabase-style stacks); private networking (Tailscale-style) alongside public endpoints whenever the deployment needs both.',
      'Jest and integration-style tests, production monitoring, PR review, and dependency hygiene on any shared codebase where regressions or supply-chain risk would hurt users.',
      'Example: containerized deploys with private networking on a side project that still sees daily use, plus dependency and PR review when strangers contribute to an open repo.'
    ]
  },
  {
    id: 'research-geo',
    title: 'Research, geospatial, and modelling',
    lgCol: 7,
    surface: 'soft',
    items: [
      'Google Earth Engine with stacked imagery and ontology-style domain modelling when the world is messier than one tidy table (the same structuring habits port to other stacks and data sources).',
      'Predictive modelling from heterogeneous inputs; statistical transforms (e.g. PCA pipelines) paired with interfaces that stay explainable, including on the web or in internal tools.',
      'Example: researched proper local GeoJSON satellite imagery, imported it as Earth Engine assets, layered it with other stack layers, then used Google Earth Projects for path distances, mapping, and exports around the parking digital twin.'
    ]
  },
  {
    id: 'sheets-ops',
    title: 'Ops spreadsheets & automation',
    lgCol: 6,
    surface: 'frame',
    items: [
      'Google Sheets and Apps Script for operator-grade workbooks: structured tabs, formulas, and automation (finance and ops are common cases, not the only ones worth automating in Sheets).',
      'Workbooks that interop with existing spreadsheets so paste-and-link workflows stay trustworthy, whether the users are officers, staff, or clients already living in Sheets.',
      'Example: freelance commission and payout tracking in Sheets plus Apps Script, and community stats grids that had to stay link-stable across files officers already trusted.'
    ]
  },
  {
    id: 'design-api-contracts',
    title: 'Design, diagrams, and API contracts',
    lgCol: 6,
    surface: 'rail',
    items: [
      'Figma at a level I actually lean on: my own layouts, design-to-code exporter workflows, and custom plugins when stock Figma is not enough (tight SVG IDs, asset prep, and similar pipelines into code).',
      'Mermaid and Miro for shared diagrams before or alongside code (happy to match whatever design or diagram tool the team already uses).',
      'OpenAPI / Swagger-shaped thinking so clients and servers agree on errors, shapes, and versioning, plus Orval-style codegen when it earns its keep.',
      'Example: parking-lot SVGs in Figma with exporter and plugin constraints so downstream code could trust IDs and geometry through the rest of the digital twin pipeline.'
    ]
  }
]

/** Avoid the browser default drag preview that looks like a text selection / paste blob. */
function setSkillClusterDragPreview(ev: React.DragEvent): void {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  ev.dataTransfer.setDragImage(canvas, 0, 0)
}

function SkillsTabContent({ goToSection }: { goToSection: (id: MainSectionId) => void }) {
  const canonicalOrder = useMemo(() => SKILL_CLUSTERS.map((c) => c.id), [])
  const clusterById = useMemo(() => {
    const m: Record<string, SkillClusterDef> = {}
    for (const c of SKILL_CLUSTERS) m[c.id] = c
    return m
  }, [])

  const [order, setOrder] = useState<string[]>(() => canonicalOrder)
  const orderRef = useRef(order)
  orderRef.current = order
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(SKILL_BLOCK_ORDER_STORAGE_KEY)
      const normalized = normalizeStoredOrder(raw ? JSON.parse(raw) : null, canonicalOrder)
      if (normalized) setOrder(normalized)
    } catch {
      /* ignore corrupt storage */
    }
  }, [canonicalOrder])

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    setSkillClusterDragPreview(e)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggingId(id)
    playPortfolioSkillBlockGrabSound()
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setOverId(null)
  }

  const handleDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverId(id)
  }

  const handleDrop =
    (targetId: string) =>
    (e: React.DragEvent) => {
      e.preventDefault()
      const draggedId = e.dataTransfer.getData('text/plain')
      if (!draggedId || draggedId === targetId) {
        handleDragEnd()
        return
      }
      const prev = orderRef.current
      const next = reorderSkillClusterIds(prev, draggedId, targetId)
      if (next.join() !== prev.join()) {
        setOrder(next)
        try {
          localStorage.setItem(SKILL_BLOCK_ORDER_STORAGE_KEY, JSON.stringify(next))
        } catch {
          /* ignore quota */
        }
        playPortfolioSkillBlockDropSound()
      }
      setDraggingId(null)
      setOverId(null)
    }

  return (
    <div
      className="w-full max-w-none space-y-8 pl-3 pr-0 pb-6 text-sm leading-relaxed text-[#c8def2] sm:pl-5 lg:pl-8 xl:pl-10 2xl:pl-12"
      style={interReadable}
    >
      <header className="max-w-3xl space-y-2 lg:max-w-4xl">
        <h2 className="text-lg font-semibold tracking-tight text-[#f0f7ff] sm:text-xl">Capability map</h2>
        <p className="text-sm text-[#9abdd4]">
          What I know and have actually applied in practice; grouped by area for easy skimming. Anything listed in one block can still
          apply across the rest of the map when the problem calls for it. For employers, dates, and write-ups use the{' '}
          <button type="button" className={skillTabLinkBtnCls} onClick={() => goToSection('experience')}>
            Experience
          </button>{' '}
          tab; for repos, demos, and deep dives use{' '}
          <a href="/#projects" className={skillLinkCls}>
            Projects
          </a>{' '}
          section.
        </p>
        <p className="text-xs text-[#7fa6c8]">
          Drag a block by its surface to reorder!
        </p>
      </header>

      <div
        className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-5"
        role="list"
        aria-label="Skill areas, draggable to reorder"
      >
        {order.map((id) => {
          const cluster = clusterById[id]
          if (!cluster) return null
          const isDragging = draggingId === id
          const isOver = overId === id && draggingId !== null && draggingId !== id
          return (
            <section
              key={id}
              role="listitem"
              aria-grabbed={isDragging}
              draggable
              onDragStart={handleDragStart(id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver(id)}
              onDrop={handleDrop(id)}
              className={`min-w-0 cursor-grab touch-manipulation select-none active:cursor-grabbing ${SKILL_CLUSTER_LG_COL[cluster.lgCol] ?? 'lg:col-span-12'} ${skillClusterSurfaceClass(cluster.surface)} px-3 py-3 shadow-[4px_5px_0_0_rgba(4,10,18,0.72)] transition-[box-shadow,transform,opacity] duration-150 will-change-transform sm:px-4 sm:py-3.5 lg:px-5 lg:py-4 ${
                isDragging ? 'scale-[0.98] opacity-60 shadow-[2px_3px_0_0_rgba(4,10,18,0.55)]' : ''
              } ${isOver ? 'ring-2 ring-[#8ebfe6]/50 ring-offset-2 ring-offset-[#03101c]' : ''}`}
            >
              <h3
                className={`font-semibold uppercase tracking-[0.14em] text-[#8eb2d0] ${
                  cluster.surface === 'rail' ? 'text-[0.72rem] sm:text-xs' : 'text-[0.7rem]'
                }`}
              >
                {cluster.title}
              </h3>
              <ul className="mt-2.5 list-none space-y-2 pl-0 leading-snug text-[#d4e7f9] lg:mt-3">
                {cluster.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="shrink-0 text-[#6d94bd]" aria-hidden>
                      ·
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <footer className="max-w-3xl rounded-lg border border-[#8ebfe6]/20 bg-[#050f18]/60 px-4 py-4 sm:px-6 lg:max-w-4xl">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8eb2d0]">
          I&apos;m looking to expand my knowledge into
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-[#6d94bd]">
          <li>
            <span className="font-semibold text-[#d4e7f9]">Languages:</span> Rust, Kotlin, and deeper production mileage
            in whatever the next codebase demands beyond my strongest day-to-day set above.
          </li>
          <li>
            <span className="font-semibold text-[#d4e7f9]">Areas:</span> AI security for enterprise use, cybersecurity,
            database and backend optimization, distributed systems, Kubernetes, AWS hosting, and end-to-end software
            delivery.
          </li>
          <li>
            <span className="font-semibold text-[#d4e7f9]">Focus:</span> Deeper collaboration and team skills while still
            shipping production-ready software with real impact.
          </li>
        </ul>
      </footer>
    </div>
  )
}

/** Slideshow entries: `file` lives under `public/images/about/`. Reorder to change carousel order. */
const STORIES = [
  {
    file: 'SeniorYearBasketballTeam.jpg',
    title: 'Senior year basketball',
    caption: 'My senior year basketball team; Early practices and a lot of time on the road.'
  },
  {
    file: 'WinningProvincialsInBasketball.jpg',
    title: 'Provincials',
    caption: 'Winning a Provincial championship my first year of organized basketball.'
  },
  {
    file: 'beachday.jpg',
    title: 'Beach day',
    caption: 'Nice summer Beach day at low tide.'
  },
  {
    file: 'BeachWithGF.jpg',
    title: 'Beach with her',
    caption: 'At the campground with my girlfriend.'
  },
  {
    file: 'WorkingWithMyDad.png',
    title: 'Working with Dad',
    caption: 'My first job working with my dad outwest in Alberta.'
  },
  {
    file: 'VisitingMonasteryForWeekend.jpg',
    title: 'Monastery weekend',
    caption: 'Weekend stay at a Orthodox monastery in Halifax.'
  },
  {
    file: 'AttendingFriendsBaptism.jpg',
    title: "Friend's baptism",
    caption: "Attending a friend's baptism, one of those moments you don't take for granted."
  },
  {
    file: 'NewYearsWIthFriends.jpg',
    title: "New Year's with friends",
    caption: "New Year's with a close group of friends."
  },
  {
    file: 'SillyHalloweenWithGF.jpg',
    title: 'Halloween',
    caption: 'Halloween with my girlfriend in a silly costume.'
  },
  {
    file: '1stAnnualHalifaxTripWithTheBoys.jpg',
    title: 'Halifax with the boys',
    caption: 'First Halifax trip with friends. Had a lot of fun and made it annual.'
  },
  {
    file: '2ndAnnualHalifaxTripWithTheBoys.jpg',
    title: 'Halifax, round two',
    caption: 'Second Halifax trip, same group as the year before!'
  },
  {
    file: '6801A394-4949-4AE7-90E4-F5311D282757.jpg',
    title: 'Snapshot',
    caption: 'Playing basketball at Holland College. in PEI.'
  }
] as const

export default function About() {
  const [menuVideoMissing, setMenuVideoMissing] = useState(false)
  const [portraitMissing, setPortraitMissing] = useState(false)
  const [activeStoryIndex, setActiveStoryIndex] = useState(0)
  const [storyImageMissing, setStoryImageMissing] = useState<Record<number, boolean>>({})
  const [activeTopic, setActiveTopic] = useState('my-story')
  const [activeSection, setActiveSection] = useState<MainSectionId>('about')

  const stories = useMemo(
    () => STORIES.map((s) => ({ title: s.title, caption: s.caption, image: `/images/about/${s.file}` })),
    []
  )

  useEffect(() => {
    for (const { image } of stories) {
      const img = new Image()
      img.src = image
    }
  }, [stories])

  const topicOptions: TopicOption[] = [
    {
      id: 'my-story',
      label: 'My Story',
      title: 'My Story',
      subtitle: 'Where I come from',
      summary:
        'I started as a kid with a strong drive to build. At first it was in my backyard, then with LEGO, then with Scratch games, which finally led me into programming. I loved building things and showing people what I made. As I grew, I got into video games too, which eventually pulled me toward computers. By the time college came around I was unsure whether to lean into the sciences or computer science, so I took a year in general science at MSVU, realized what I truly wanted, then transferred back home to UNB. I have been pursuing my degree since, alongside a lot of side projects and co-op roles.'
    },
    {
      id: 'hobbies',
      label: 'Hobbies',
      title: 'Hobbies',
      subtitle: 'Away from the keyboard',
      summary:
        'I lift regularly and treat the gym as part focus, part stress relief: heavy sets, slow progression, and the satisfaction of numbers that do not lie. Basketball with friends is the other outlet, full of pace, noise, and close games that remind me I still like competing away from a screen. I am a movie person too, the kind who reads credits, rewatches favorites, and will happily argue about sound design or pacing until someone changes the subject. Outdoors, I camp, hike, snowshoe, and fish whenever the season and weather cooperate, because nothing recenters a week like cold air, a trail, or water you can hear. At home I keep side projects alive and chase new technical skills on purpose, tooling, languages, and experiments that do not always ship but always teach me something worth bringing back to real work.'
    },
    {
      id: 'goals',
      label: 'Goals',
      title: 'Goals',
      subtitle: 'What I am aiming for',
      summary:
        'I want stronger craft on what I ship and clearer ownership as systems grow. That means naming risks early, keeping releases boring in the good way, and being honest when scope or timelines need to change instead of quietly drifting.',
      entries: [
        {
          heading: 'Near term',
          detail:
            'Better product calls, faster performance passes, and routine security review on releases, plus tighter feedback loops with whoever owns the outcome so I am not optimizing in a vacuum.'
        },  
        {
          heading: 'Long term',
          detail:
            'Be someone people pull in when production is broken and the fix has to stick: calm under pressure, clear communication, and changes that survive the next person reading the code at 2 a.m.'
        }
      ]
    },
    {
      id: 'values',
      label: 'Values',
      title: 'Values',
      subtitle: 'What I stand on',
      summary:
        'Clear estimates, follow-through on what I commit to, and code the next person can read without guessing. I show up prepared for real meetings, hand off cleanly, and give credit when someone else did the work. I do not ship work I know is careless when I could have fixed it. When trade-offs are ugly I prefer saying so upfront over letting surprise land on someone else later.'
    },
    {
      id: 'facts',
      label: 'Facts',
      title: 'Facts',
      subtitle: 'Biographical',
      summary: 'Plain identifiers. No spin.',
      entries: [
        { heading: 'Nationality', detail: 'Canadian-born.' },
        { heading: 'Height', detail: "5'10\"." },
        { heading: 'Hair', detail: 'Brown; Curly.' },
        { heading: 'Eyes', detail: 'Dark-Brown.' },
        { heading: 'Birthday', detail: 'April 1st (APRIL FOOLS!)' },
        
      ]
    },
    {
      id: 'what-drives-me',
      label: 'What Drives Me',
      title: 'What Drives Me',
      subtitle: 'Why I build',
      summary: 'I stay interested when the problem is technically hard and the result is something people will actually use.',
      entries: [
        { heading: 'Impact', detail: 'Work that changes how someone works or plays in a measurable way.' },
        { heading: 'Mastery', detail: 'Systems behavior, security, and performance. The boring layers that decide whether software survives.' },
        { heading: 'Curiosity', detail: 'New problem domains and figuring out how unfamiliar pieces connect.' }
      ]
    },
    {
      id: 'how-i-think',
      label: 'How I Think',
      title: 'How I Think',
      subtitle: 'Mental models',
      summary:
        'Before I write a lot of code I want constraints, risks, and a definition of done. I split what must be true now from what can wait, name trade-offs instead of hiding them, ship small slices, and adjust from real feedback instead of guessing in a vacuum. I am skeptical of plans that assume perfect information; I would rather ship something thin and learn than debate architecture in a deck for weeks.'
    },
    {
      id: 'how-i-approach-challenges',
      label: 'How I Approach Challenges',
      title: 'How I Approach Challenges',
      subtitle: 'When things get hard',
      summary:
        'Break the problem down and order unknowns by how much damage they can cause if you are wrong. Reproduce the scenario, write assumptions down, agree what fixed means. Use short spikes when the answer is unclear, then get a thin version in front of users and read metrics and logs before the next pass.'
    }
  ]

  const activeTopicData = topicOptions.find((topic) => topic.id === activeTopic) ?? topicOptions[0]

  useEffect(() => {
    if (activeSection !== 'about' || stories.length === 0) return

    const timer = window.setInterval(() => {
      setActiveStoryIndex((prev) => (prev + 1) % stories.length)
    }, 7000)

    return () => {
      window.clearInterval(timer)
    }
  }, [activeSection, activeStoryIndex, stories.length])

  const activeStory = stories[activeStoryIndex]

  const goToNextStory = () => {
    setActiveStoryIndex((prev) => (prev + 1) % stories.length)
  }

  const goToPreviousStory = () => {
    setActiveStoryIndex((prev) => (prev - 1 + stories.length) % stories.length)
  }

  return (
    <section
      id="about"
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#03101c] px-4 pb-0 pt-16 text-[#cde8ff] sm:px-6 lg:px-8"
    >
      {!menuVideoMissing ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          src={PORTFOLIO_ABOUT_MENU_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setMenuVideoMissing(true)}
        />
      ) : null}
      <div className="absolute inset-0 bg-[#03101c]/68" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="relative z-10 mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden xl:min-h-0"
        style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
      >
        <div className="mb-6 flex shrink-0 flex-wrap gap-2">
          {MAIN_TABS.map((tab) => {
            const isActive = activeSection === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === activeSection) return
                  playPortfolioAboutSectionTabTransitionSound()
                  setActiveSection(tab.id)
                }}
                className={`border px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                  isActive
                    ? 'border-[#8ebfe6]/34 bg-[#4b8dc2]/24 text-[#dff0ff]'
                    : 'border-[#8ebfe6]/26 bg-[#2b4f72]/24 text-[#a8c7e2] hover:border-[#8ebfe6]/40 hover:text-[#d7ebff]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex min-h-0 flex-1 flex-col xl:h-full xl:min-h-0">
          {activeSection === 'about' && (
          <div className="grid min-h-0 flex-1 gap-6 items-start xl:h-full xl:min-h-0 xl:grid-cols-[0.92fr_1.28fr_0.8fr] xl:grid-rows-[minmax(0,1fr)]">
            <div className="space-y-4 xl:max-h-full xl:min-h-0 xl:overflow-x-hidden xl:overflow-y-auto xl:self-start">
            <div className="relative w-full p-3">
              {/* Halo frame in gutter only (wider strokes); does not cover the photo */}
              <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden>
                {/* p-3 gutter = 12px; top-2/bottom-2 + h-4 aligns cream flush to image; stubs/sides nudged inward */}
                <div className="absolute inset-x-1 top-2 h-[4px] bg-[#e8dfc8]" />
                <div className="absolute left-1 top-3 h-2 w-[8px] bg-[#e8dfc8]" />
                <div className="absolute right-1 top-3 h-2 w-[8px] bg-[#e8dfc8]" />
                <div className="absolute inset-x-1 bottom-2 h-[4px] bg-[#e8dfc8]" />
                <div className="absolute bottom-3 left-1 h-2 w-[8px] bg-[#e8dfc8]" />
                <div className="absolute bottom-3 right-1 h-3 w-[8px] bg-[#e8dfc8]" />
                <div className="absolute bottom-[25%] left-2 top-[25%] w-[4px] bg-[#e8dfc8]" />
                <div className="absolute bottom-[25%] right-2 top-[25%] w-[4px] bg-[#e8dfc8]" />
              </div>

              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#12314a] backdrop-blur-[2px]">
              {!storyImageMissing[activeStoryIndex] && (
                <img
                  src={activeStory.image}
                  alt={activeStory.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onError={() => {
                    setStoryImageMissing((prev) => ({
                      ...prev,
                      [activeStoryIndex]: true
                    }))
                  }}
                />
              )}
              {storyImageMissing[activeStoryIndex] && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#12314a] text-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8bb2d3]">Story Image Slot</p>
                    <p className="mt-2 text-sm text-[#cde3f7]">Drop images at `public/images/about/*`</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={goToPreviousStory}
                className="absolute inset-y-0 left-0 z-10 w-12 bg-[#03101c]/22 text-xl text-[#d7ebff] transition-colors hover:bg-[#03101c]/45"
                aria-label="Previous story"
              >
                &#8249;
              </button>
              <button
                type="button"
                onClick={goToNextStory}
                className="absolute inset-y-0 right-0 z-10 w-12 bg-[#03101c]/22 text-xl text-[#d7ebff] transition-colors hover:bg-[#03101c]/45"
                aria-label="Next story"
              >
                &#8250;
              </button>

              <div className="absolute inset-x-0 bottom-0 z-10 bg-transparent px-3 py-2">
                <p
                  className="text-sm font-medium text-[#f2f8ff]"
                  style={{
                    textShadow:
                      '0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.85)'
                  }}
                >
                  {activeStory.caption}
                </p>
              </div>
              </div>
            </div>

            <h2
              className="text-xl font-bold uppercase leading-none tracking-[0.14em] text-[#dff0ff] drop-shadow-[0_0_12px_rgba(145,201,255,0.45)] sm:text-2xl"
              style={{ fontFamily: 'HaloLogo, HaloLogoOutline, "Arial Black", sans-serif' }}
            >
              TOPICS
            </h2>

            <div className="border border-[#8ebfe6]/34 bg-[#2f5e86]/26 py-3 pl-3 pr-0 backdrop-blur-[2px]">
              <div className="scrollbar-bar-only max-h-[220px] min-h-0 w-full overflow-y-auto overflow-x-hidden overscroll-contain">
                <div className="flex flex-col">
                  {topicOptions.map((topic) => {
                    const isActive = topic.id === activeTopic
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => {
                          if (topic.id === activeTopic) return
                          playPortfolioTransitionSound()
                          setActiveTopic(topic.id)
                        }}
                        className={`flex w-full items-center justify-between border-0 border-b bg-transparent px-3 py-2 text-left text-sm uppercase tracking-[0.09em] transition-colors last:border-b-0 ${
                          isActive
                            ? 'border-b-[#e8f6ff]/85 text-[#f1f8ff]'
                            : 'border-b-[#bcdcf0]/35 text-[#9fc0dd] hover:border-b-[#d7ebff]/55 hover:text-[#d7e9fb]'
                        }`}
                      >
                        <span className="leading-snug">{topic.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            </div>

            <div className="relative flex min-h-[240px] w-full items-center justify-center overflow-hidden bg-transparent sm:min-h-[280px] xl:h-full xl:min-h-0 xl:self-stretch">
              {!portraitMissing && (
                <img
                  src="/images/placeHolderCentrePiece.png"
                  alt="Christian Dennis portrait placeholder"
                  className="box-border h-full w-full object-contain object-center"
                  onError={() => setPortraitMissing(true)}
                />
              )}
              {portraitMissing && (
                <div className="flex min-h-[12rem] w-full items-center justify-center bg-transparent px-2 text-center xl:min-h-0 xl:flex-1">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8bb2d3]">Portrait slot</p>
                    <p className="mt-2 text-sm text-[#cde3f7]">Could not load `public/images/placeHolderCentrePiece.png`.</p>
                  </div>
                </div>
              )}
            </div>

            <div
              className="scrollbar-bar-only max-h-[calc(100dvh-9rem)] min-h-0 w-full overflow-y-auto overscroll-contain xl:max-h-full xl:self-start"
              style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
            >
            <div className="border border-[#b6dbf7]/20 bg-[#3d7eb4]/28 p-4 backdrop-blur-[3px]">
            <div className="border border-[#b6dbf7]/20 p-4">
              <h2 className="text-2xl font-bold uppercase tracking-[0.12em] text-[#e6f5ff]">{activeTopicData.title}</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8fb2d0]">{activeTopicData.subtitle}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#c8def2]">{activeTopicData.summary}</p>

              {(activeTopicData.entries?.length ?? 0) > 0 && (
                <div className="mt-5">
                  {(activeTopicData.entries ?? []).map((entry, index) => (
                    <div key={entry.heading} className={index > 0 ? 'mt-5 border-t border-gray-400/15 pt-5' : undefined}>
                      <p className="text-xs uppercase tracking-[0.14em] text-[#8eb2d0]">{entry.heading}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[#d4e7f9]">{entry.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
            </div>
          </div>
          )}

          {activeSection === 'experience' && (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-10 pt-1">
              <div className="mx-auto w-full max-w-6xl space-y-4 px-0 sm:space-y-5">
                <div className="h-5 shrink-0" aria-hidden />
                {EXPERIENCES.map((job) => (
                  <ExperienceJobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}

          {activeSection === 'skills' && (
            <div
              className="scrollbar-bar-only min-h-0 min-w-0 w-full max-h-[calc(100dvh-9rem)] flex-1 overflow-y-auto overscroll-contain py-2 sm:py-4 xl:max-h-full"
              style={interReadable}
            >
              <SkillsTabContent
                goToSection={(id) => {
                  if (id === activeSection) return
                  playPortfolioAboutSectionTabTransitionSound()
                  setActiveSection(id)
                }}
              />
            </div>
          )}

          {activeSection === 'education' && (
            <div
              className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain pb-10 pt-10 sm:pt-20"
              style={interReadable}
            >
              <EducationTabContent />
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
