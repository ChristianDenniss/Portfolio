'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function About() {
  const [portraitMissing, setPortraitMissing] = useState(false)
  const [activeStoryIndex, setActiveStoryIndex] = useState(0)
  const [storyImageMissing, setStoryImageMissing] = useState<Record<number, boolean>>({})
  const [activeTopic, setActiveTopic] = useState('my-story')

  const stories = [
    {
      title: 'Caught This Beauty',
      caption: 'Weekend fishing reset. Patience + persistence.',
      image: '/images/about/fishing.jpg'
    },
    {
      title: 'Trail Session',
      caption: 'Hiking days are when I do my best thinking.',
      image: '/images/about/hiking.jpg'
    },
    {
      title: 'Field Notes',
      caption: 'Exploring new places and collecting ideas.',
      image: '/images/about/outdoors.jpg'
    }
  ]

  const topicOptions = [
    {
      id: 'my-story',
      label: 'My Story',
      title: 'My Story',
      subtitle: 'Where I come from',
      summary:
        "I'm Christian Dennis, a developer from New Brunswick, Canada. I grew up curious about how things work and turned that into building software that people actually rely on.",
      entries: [
        { heading: 'Background', detail: 'Computer science and self-driven projects shaped how I build today.' },
        { heading: 'What hooked me', detail: 'Seeing code turn into something real—tools, games, and platforms people use daily.' },
        { heading: 'Today', detail: 'Full-stack work, research-heavy systems, and shipping products with care for quality.' }
      ]
    },
    {
      id: 'hobbies',
      label: 'Hobbies',
      title: 'Hobbies',
      subtitle: 'Away from the keyboard',
      summary: 'Time outside work keeps me balanced and often feeds how I think about problems—patience, planning, and trying again.',
      entries: [
        { heading: 'Outdoors', detail: 'Fishing, hiking, and exploring—good resets and good headspace.' },
        { heading: 'Making & learning', detail: 'Tinkering with side projects and picking up skills that compound over time.' },
        { heading: 'Community', detail: 'Games and communities that care about craft and collaboration.' }
      ]
    },
    {
      id: 'goals',
      label: 'Goals',
      title: 'Goals',
      subtitle: 'What I am aiming for',
      summary: 'I want to keep leveling up as an engineer while building things that matter—technically solid, secure, and genuinely useful.',
      entries: [
        { heading: 'Short term', detail: 'Sharpen product sense, performance, and security in everything I ship.' },
        { heading: 'Medium term', detail: 'Lead larger systems end-to-end—from design through deployment and monitoring.' },
        { heading: 'Long term', detail: 'Be someone teams trust for hard problems and calm execution under pressure.' }
      ]
    },
    {
      id: 'values',
      label: 'Values',
      title: 'Values',
      subtitle: 'What I stand on',
      summary: 'I try to work in a way I would want to work with—clear, honest, and focused on outcomes without cutting corners on quality.',
      entries: [
        { heading: 'Integrity', detail: 'Say what I will do, do it, and own mistakes when they happen.' },
        { heading: 'Craft', detail: 'Readable code, thoughtful UX, and systems that are maintainable over time.' },
        { heading: 'Respect', detail: 'Good collaboration, clear communication, and credit where it is due.' }
      ]
    },
    {
      id: 'facts',
      label: 'Facts',
      title: 'Facts',
      subtitle: 'Quick hits',
      summary: 'A few concrete things about me and my work—no fluff, just signal.',
      entries: [
        { heading: 'Location', detail: 'Based in New Brunswick, Canada.' },
        { heading: 'Stack', detail: 'TypeScript, React, Node, PostgreSQL, and plenty of integration and data work.' },
        { heading: 'Shipped work', detail: 'From large community platforms to research tools and mobile apps on the store.' }
      ]
    },
    {
      id: 'what-drives-me',
      label: 'What Drives Me',
      title: 'What Drives Me',
      subtitle: 'Why I build',
      summary: 'I am motivated by problems that are hard enough to be interesting and useful enough that finishing them feels worth it.',
      entries: [
        { heading: 'Impact', detail: 'Software that changes how people work or play for the better.' },
        { heading: 'Mastery', detail: 'Getting better at the fundamentals—systems, security, and performance.' },
        { heading: 'Curiosity', detail: 'New domains, new constraints, and figuring out how pieces fit together.' }
      ]
    },
    {
      id: 'how-i-think',
      label: 'How I Think',
      title: 'How I Think',
      subtitle: 'Mental models',
      summary: 'I like to understand the shape of a problem before jumping to solutions—constraints, risks, and what “good” looks like for users.',
      entries: [
        { heading: 'First principles', detail: 'What must be true, what can we defer, and what are we optimizing for?' },
        { heading: 'Trade-offs', detail: 'Speed vs. safety, simplicity vs. flexibility—explicit choices, not accidents.' },
        { heading: 'Iteration', detail: 'Small steps, measurable feedback, and adjusting instead of guessing.' }
      ]
    },
    {
      id: 'how-i-approach-challenges',
      label: 'How I Approach Challenges',
      title: 'How I Approach Challenges',
      subtitle: 'When things get hard',
      summary: 'I break big problems down, isolate unknowns, and tackle them in an order that reduces risk early instead of saving surprises for the end.',
      entries: [
        { heading: 'Clarify', detail: 'Reproduce, document assumptions, and agree on success criteria.' },
        { heading: 'Experiment', detail: 'Spikes and prototypes where they save time—not endless yak shaving.' },
        { heading: 'Ship & learn', detail: 'Get something real in front of people, measure, and improve.' }
      ]
    }
  ]

  const activeTopicData = topicOptions.find((topic) => topic.id === activeTopic) ?? topicOptions[0]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStoryIndex((prev) => (prev + 1) % stories.length)
    }, 4000)

    return () => {
      window.clearInterval(timer)
    }
  }, [stories.length])

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
      className="relative flex min-h-[100dvh] flex-1 flex-col overflow-x-hidden bg-[#03101c] px-4 pb-0 pt-16 text-[#cde8ff] sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 bg-[#03101c]/74" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="relative z-10 mx-auto w-full max-w-7xl xl:flex xl:min-h-0 xl:flex-1 xl:flex-col"
        style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
      >
        <div className="mb-6 flex shrink-0 flex-wrap gap-2">
          <div className="border border-[#8ebfe6]/34 bg-[#4b8dc2]/24 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#dff0ff]">
            About Me
          </div>
          <div className="border border-[#8ebfe6]/26 bg-[#2b4f72]/24 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#a8c7e2]">
            Skills
          </div>
          <div className="border border-[#8ebfe6]/26 bg-[#2b4f72]/24 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#a8c7e2]">
            Experience
          </div>
          <div className="border border-[#8ebfe6]/26 bg-[#2b4f72]/24 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#a8c7e2]">
            Education/Accolades
          </div>
        </div>

        <div className="min-h-0 xl:flex xl:min-h-0 xl:flex-1 xl:flex-col">
          <div className="grid min-h-0 items-start gap-6 xl:min-h-0 xl:flex-1 xl:grid-cols-[0.92fr_1.28fr_0.8fr] xl:grid-rows-[minmax(0,1fr)]">
            <div className="space-y-4 xl:self-start">
            <div className="relative aspect-[16/9] w-full overflow-hidden border border-[#8ebfe6]/34 bg-[#12314a] backdrop-blur-[2px]">
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

              <div className="absolute inset-x-0 bottom-0 z-10 border-t border-[#9fcdf1]/24 bg-[#03101c]/62 px-3 py-2 backdrop-blur-[1px]">
                <p className="text-sm text-[#d7e9fa]">{activeStory.caption}</p>
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
                        onClick={() => setActiveTopic(topic.id)}
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

            <div className="relative flex min-h-[280px] flex-col justify-end border-x border-t border-[#8ebfe6]/34 bg-[#274c6e]/22 px-3 pt-3 backdrop-blur-[2px] sm:min-h-[320px] xl:min-h-0 xl:h-full xl:self-stretch">
            <div className="relative min-h-[240px] w-full flex-1 border-x border-t border-[#9fcdf1]/24 bg-[#102c42] sm:min-h-[280px] xl:min-h-[360px]">
              {!portraitMissing && (
                <img
                  src="/images/me-standalone.png"
                  alt="Christian Dennis cutout portrait"
                  className="absolute bottom-0 left-1/2 h-auto max-h-full w-auto max-w-[min(100%,96%)] -translate-x-1/2 object-contain object-bottom"
                  onError={() => setPortraitMissing(true)}
                />
              )}
              {portraitMissing && (
                <div className="absolute inset-0 flex items-center justify-center text-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#8bb2d3]">Standalone PNG Slot</p>
                    <p className="mt-2 text-sm text-[#cde3f7]">Drop cutout at `public/images/me-standalone.png`</p>
                  </div>
                </div>
              )}
            </div>
            </div>

            <div
              className="border border-[#8ebfe6]/34 bg-[#3d7eb4]/28 p-4 backdrop-blur-[3px] xl:self-start"
              style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
            >
            <div className="border border-[#b6dbf7]/20 p-4">
              <h2 className="text-2xl font-bold uppercase tracking-[0.12em] text-[#e6f5ff]">{activeTopicData.title}</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8fb2d0]">{activeTopicData.subtitle}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#c8def2]">
                {activeTopicData.summary}
              </p>

              <div className="mt-5">
                {activeTopicData.entries.map((entry, index) => (
                  <div key={entry.heading} className={index > 0 ? 'mt-5 border-t border-gray-400/15 pt-5' : undefined}>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8eb2d0]">{entry.heading}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#d4e7f9]">{entry.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
