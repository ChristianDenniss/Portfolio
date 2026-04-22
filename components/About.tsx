'use client'

import { motion } from 'framer-motion'

export default function About() {
  return (
    <section id="about" className="section-padding relative bg-[#05131f] text-[#cde8ff]">
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(85,170,230,0.25)_0%,transparent_42%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(173,216,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(173,216,255,0.08)_1px,transparent_1px)] [background-size:120px_120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="relative z-10 mx-auto max-w-4xl rounded-lg border border-[#2f607f] bg-[#071c2b]/80 p-8 md:p-12"
      >
        <p className="mb-3 text-xs tracking-[0.45em] text-[#84bbe1]">ABOUT</p>
        <h2 className="mb-6 text-4xl font-bold tracking-[0.14em] text-[#e6f5ff]">WHO I AM</h2>
        <p className="text-lg leading-relaxed text-[#d3e9fb]">
          I&apos;m Christian Dennis, a developer from New Brunswick, Canada, focused on building useful software
          that people actually use. My projects range from full-stack web platforms and geospatial research tools
          to mobile apps and systems work, with a strong interest in performance, security, and practical product
          design.
        </p>
      </motion.div>
    </section>
  )
}
