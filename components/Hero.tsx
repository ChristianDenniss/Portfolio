'use client'

import { motion } from 'framer-motion'
import { ArrowDown, Github, Linkedin, Mail } from 'lucide-react'

export default function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Wood Cabin Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-wood-50 via-bark-50 to-pine-50 dark:from-stone-800 dark:via-stone-900 dark:to-stone-900">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wood-grain' x='0' y='0' width='200' height='200' patternUnits='userSpaceOnUse'%3E%3Crect width='200' height='200' fill='%23b8764a' opacity='0.1'/%3E%3C%3C!-- Wood grain lines --%3E%3Cpath d='M0 15 Q50 10 100 15 T200 15 L200 20 Q150 25 100 20 T0 20 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 35 Q50 30 100 35 T200 35 L200 40 Q150 45 100 40 T0 40 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 55 Q50 50 100 55 T200 55 L200 60 Q150 65 100 60 T0 60 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 75 Q50 70 100 75 T200 75 L200 80 Q150 85 100 80 T0 80 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 95 Q50 90 100 95 T200 95 L200 100 Q150 105 100 100 T0 100 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 115 Q50 110 100 115 T200 115 L200 120 Q150 125 100 120 T0 120 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 135 Q50 130 100 135 T200 135 L200 140 Q150 145 100 140 T0 140 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 155 Q50 150 100 155 T200 155 L200 160 Q150 165 100 160 T0 160 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 175 Q50 170 100 175 T200 175 L200 180 Q150 185 100 180 T0 180 Z' fill='%23a5623e' opacity='0.15'/%3E%3C%3C!-- Knots and variations --%3E%3Ccircle cx='30' cy='45' r='3' fill='%238a4e35' opacity='0.2'/%3E%3Ccircle cx='170' cy='125' r='2' fill='%238a4e35' opacity='0.2'/%3E%3Ccircle cx='80' cy='165' r='4' fill='%238a4e35' opacity='0.2'/%3E%3C%3C!-- Grain variations --%3E%3Cpath d='M0 25 Q25 22 50 25 T100 25 Q125 28 150 25 T200 25' stroke='%238a4e35' stroke-width='0.5' fill='none' opacity='0.1'/%3E%3Cpath d='M0 65 Q25 62 50 65 T100 65 Q125 68 150 65 T200 65' stroke='%238a4e35' stroke-width='0.5' fill='none' opacity='0.1'/%3E%3Cpath d='M0 105 Q25 102 50 105 T100 105 Q125 108 150 105 T200 105' stroke='%238a4e35' stroke-width='0.5' fill='none' opacity='0.1'/%3E%3Cpath d='M0 145 Q25 142 50 145 T100 145 Q125 148 150 145 T200 145' stroke='%238a4e35' stroke-width='0.5' fill='none' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23wood-grain)'/%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Greeting */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-bark-600 dark:text-wood-300"
          >
            Hello, I'm
          </motion.p>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold gradient-text"
          >
            Christian Dennis
          </motion.h1>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl md:text-3xl text-bark-700 dark:text-wood-200"
          >
            Project Hub & Showcase
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-lg text-bark-600 dark:text-wood-300 max-w-2xl mx-auto"
          >
            Hi! I'm a 21-year-old developer from Canada who loves building.   
            I like writing code that ends up in front of real people and seeing how they interact with it.
            Click on any project below to dive deeper into the architecture, skills, learnings, and codebase.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.a
              href="#projects"
              className="px-8 py-3 bg-wood-600 text-white rounded-lg hover:bg-wood-700 transition-colors font-medium shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Projects
            </motion.a>
            <motion.a
              href="https://github.com/ChristianDenniss"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border-2 border-wood-600 text-wood-600 dark:text-wood-400 rounded-lg hover:bg-wood-600 hover:text-white transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View GitHub
            </motion.a>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center space-x-6 pt-8"
          >
            <motion.a
              href="https://github.com/ChristianDenniss"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bark-600 dark:text-wood-300 hover:text-wood-600 dark:hover:text-wood-400 transition-colors"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Github size={24} />
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/christian-dennis-43601a2a1/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bark-600 dark:text-wood-300 hover:text-wood-600 dark:hover:text-wood-400 transition-colors"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Linkedin size={24} />
            </motion.a>
            <motion.a
              href="mailto:aottgpvp@gmail.com"
              className="text-bark-600 dark:text-wood-300 hover:text-wood-600 dark:hover:text-wood-400 transition-colors"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Mail size={24} />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="text-bark-500 dark:text-wood-400" size={24} />
        </motion.div>
      </motion.div>
    </section>
  )
} 