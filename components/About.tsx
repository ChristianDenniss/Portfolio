'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import {
  playPortfolioAboutSectionTabTransitionSound,
  playPortfolioTransitionSound
} from '@/lib/portfolioSfx'

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
    location: 'Saint John, NB',
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
    location: 'Saint John, NB',
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

/** `public/4K Videos/Halo 4 Menu.mp4`: same pattern as `Contact.tsx` (URL-encoded). */
const ABOUT_MENU_VIDEO_SRC = '/4K%20Videos/Halo%204%20Menu.mp4'

function ExperienceJobCard({ job }: { job: ExperienceEntry }) {
  const hasLogo = Boolean(job.logo?.trim())
  const [logoFailed, setLogoFailed] = useState(false)
  const showInitial = !hasLogo || logoFailed
  const initialLetter = job.company.replace(/[^A-Za-z]/g, '').slice(0, 1) || '?'

  return (
    <article className="flex items-stretch overflow-hidden rounded-sm border border-[#8ebfe6]/30 bg-[#071422]/40 shadow-[0_10px_28px_rgba(0,0,0,0.4)] backdrop-blur-[2px]">
      <div className="relative flex w-[7.25rem] shrink-0 flex-col justify-center self-stretch bg-[#0b1e30]/22 sm:w-40">
        <div
          className="pointer-events-none absolute inset-y-2 right-0 w-px bg-gradient-to-b from-transparent via-[#8ebfe6]/18 to-transparent"
          aria-hidden
        />
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
      <div className="min-w-0 flex-1 border-l border-[#8ebfe6]/14 bg-[#0d2740]/22 px-4 py-3 sm:px-6 sm:py-4" style={interReadable}>
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
}

function EducationProgramBlock({ program }: { program: EducationProgram }) {
  const hasLogo = Boolean(program.logo?.trim())
  const [logoFailed, setLogoFailed] = useState(false)
  const showInitial = !hasLogo || logoFailed
  const initialLetter = program.school.replace(/[^A-Za-z]/g, '').slice(0, 1) || '?'

  return (
    <section className="flex items-start gap-5 sm:gap-7">
      <div className="relative w-[5.5rem] shrink-0 sm:w-28">
        <div className="flex h-20 w-full items-center justify-start sm:h-24">
          {showInitial ? (
            <span
              className="flex aspect-square h-full max-h-20 w-full max-w-[5.5rem] items-center justify-center border border-[#4d6d8f]/50 bg-[#122a42]/40 text-sm font-bold uppercase tracking-tight text-[#dfefff] sm:max-h-24 sm:max-w-28 sm:text-base"
              aria-hidden
            >
              {initialLetter}
            </span>
          ) : (
            <img
              src={program.logo}
              alt={`${program.school} logo`}
              className="h-20 w-full max-w-full object-contain object-left sm:h-24"
              onError={() => setLogoFailed(true)}
            />
          )}
        </div>
      </div>
      <div className="min-w-0 flex-1 text-left">
        <header>
          <h3 className="text-lg font-semibold tracking-tight text-[#f2f8ff] sm:text-xl">{program.school}</h3>
          <p className="mt-1 text-sm text-[#94b8d4]">{program.location}</p>
          <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-6 sm:gap-y-1">
            <p className="min-w-0 text-[0.9375rem] font-medium leading-snug text-[#d6e9fb]">{program.credential}</p>
            <p className="shrink-0 text-xs font-medium tabular-nums tracking-wide text-[#7fa6c8] sm:ml-auto">{program.dates}</p>
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
    <div className="w-full max-w-none px-0 pb-6 text-left" style={interReadable}>
      <div className="flex flex-col gap-11 sm:gap-14">
        {EDUCATION.map((program) => (
          <EducationProgramBlock key={program.id} program={program} />
        ))}
      </div>
    </div>
  )
}

const SKILLS_TABLE_ROWS: { category: string; stack: string }[] = [
  { category: 'Languages', stack: 'C++, Java, JavaScript, TypeScript, Python, C, SQL, Binary, Assembly' },
  { category: 'Frontend', stack: 'React, Next.js, React Router, React Native, Expo, Vite, Tailwind CSS, Framer Motion, React Three Fiber, JavaFX' },
  { category: 'Backend', stack: 'Node.js, Express, RESTful APIs, TypeORM, Zod, Axios, JWT, Redis, CLI application design' },
  { category: 'Databases', stack: 'PostgreSQL, SQLite, MongoDB' },
  {
    category: 'Search / IR / Data Systems',
    stack:
      'Inverted indexing, tokenization, TF-IDF, recency ranking, semantic search, snippet highlighting, incremental index sync, B-tree, composite B-tree, partial indexes, covering indexes (INCLUDE), hash indexes, GIN, GiST, tsvector / tsquery, pg_trgm'
  },
  {
    category: 'Document / Data Processing',
    stack: 'Apache PDFBox, Apache POI, Google Sheets API, data scraping, data aggregation, ETL-style preprocessing'
  },
  {
    category: 'AI / ML / Analytics',
    stack: 'OpenAI API, prompt engineering, PCA, predictive modelling, statistical analysis, data visualization'
  },
  {
    category: 'Cloud / Infra / Deployment',
    stack: 'AWS, Docker, Coolify, Tailscale, Vercel, Supabase, Fly.io, Maven Shade (fat JAR packaging)'
  },
  {
    category: 'Geospatial / Research',
    stack: 'Google Earth Engine, semantic engineering, ontology engineering, digital twin modelling, geospatial analytics, satellite data workflows'
  },
  {
    category: 'Testing & Quality',
    stack: 'Jest, unit testing, vulnerability assessment, production monitoring, PR review experience'
  },
  { category: 'IDEs & Editors', stack: 'Cursor IDE, VS Code, Visual Studio, IntelliJ IDEA, BlueJ, jGRASP, LC-3, Google Colab' },
  {
    category: 'Collaboration & Delivery',
    stack: 'GitHub, open source collaboration, Bitbucket, SourceTree, Jira, Slack, Discord, paired programming'
  },
  { category: 'Design & Documentation', stack: 'Figma, Mermaid, Miro, Orval, Swagger, OpenAPI' },
  { category: 'Utilities', stack: 'Postman, TablePlus, Protégé, PageSpeed Insights' }
]

function SkillsTabContent() {
  const linkCls = 'font-medium text-[#9fcdff] underline decoration-[#9fcdff]/40 underline-offset-2 hover:text-[#cfe8ff]'

  return (
    <div className="mx-auto max-w-4xl space-y-6 text-sm leading-relaxed text-[#c8def2]">
      <h2 className="text-xl font-bold tracking-tight text-[#f0f7ff] sm:text-2xl">Hi, I&apos;m Christian Dennis</h2>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8eb2d0]">About me</h3>
        <p className="mt-2">
          I like writing code that ends up in front of real people and seeing how they interact with it. My end goal is
          pretty simple: build things that work, learn when they don&apos;t, and leave the codebase cleaner than I found
          it (most of the time).
        </p>
      </div>

      <hr className="border-0 border-t border-gray-400/20" />

      <details className="group rounded-sm border border-[#8ebfe6]/26 bg-[#071522]/90">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-[#eaf4ff] marker:hidden [&::-webkit-details-marker]:hidden">
          <span className="select-none text-[#7fa6cc] group-open:hidden">▸ </span>
          <span className="select-none text-[#7fa6cc] hidden group-open:inline">▾ </span>
          Technical experience and skills from past projects
        </summary>
        <div className="overflow-x-auto border-t border-[#8ebfe6]/18 px-2 pb-4 pt-2">
          <table className="w-full min-w-[32rem] border-collapse text-left text-[0.8125rem]">
            <thead>
              <tr className="border-b border-[#8ebfe6]/25">
                <th className="px-3 py-2 font-semibold uppercase tracking-[0.08em] text-[#9fb9d6]">Category</th>
                <th className="px-3 py-2 font-semibold uppercase tracking-[0.08em] text-[#9fb9d6]">Stack / tools</th>
              </tr>
            </thead>
            <tbody>
              {SKILLS_TABLE_ROWS.map((row) => (
                <tr key={row.category} className="border-b border-[#1e3a52]/90 align-top last:border-b-0">
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-[#d4e7f9]">{row.category}</td>
                  <td className="px-3 py-2.5 text-[#b9d2ea]">{row.stack}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <hr className="border-0 border-t border-gray-400/20" />

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8eb2d0]">
          I&apos;m looking to expand my knowledge into
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-[#6d94bd]">
          <li>
            <span className="font-semibold text-[#d4e7f9]">Languages:</span> Golang, Rust, Kotlin (and other languages as
            projects need them).
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
      </div>

      <hr className="border-0 border-t border-gray-400/20" />

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8eb2d0]">How to reach me</h3>
        <p className="mt-2">
          Email{' '}
          <a href="mailto:aottgpvp@gmail.com" className={linkCls}>
            aottgpvp@gmail.com
          </a>{' '}
          or{' '}
          <a href="mailto:e65t3@unb.com" className={linkCls}>
            e65t3@unb.com
          </a>
          , and we can go from there.
        </p>
      </div>
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
          heading: 'Mid term',
          detail:
            'Run larger systems from design through deploy and day-two ops, not only the first launch: observability, runbooks, and the kind of discipline that keeps incidents rare and recoverable.'
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
      subtitle: 'Quick hits',
      summary:
        'Based in New Brunswick, Canada. Daily tools: TypeScript, React, Node, PostgreSQL, integrations, and data-heavy features when the product needs them. I have shipped large community platforms, research tooling, an App Store app, and a long tail of smaller releases and experiments. Each one taught me something about scope, performance, or talking to real users under constraints.'
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
          src={ABOUT_MENU_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
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
            <div className="border border-[#8ebfe6]/34 bg-[#3d7eb4]/28 p-4 backdrop-blur-[3px]">
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
              className="scrollbar-bar-only min-h-0 max-h-[calc(100dvh-9rem)] flex-1 overflow-y-auto overscroll-contain py-2 sm:py-4 xl:max-h-full"
              style={interReadable}
            >
              <SkillsTabContent />
            </div>
          )}

          {activeSection === 'education' && (
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-10 pt-8 sm:pt-10 -mx-4 px-2 sm:-mx-6 sm:px-3 lg:-mx-8 lg:px-4"
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
