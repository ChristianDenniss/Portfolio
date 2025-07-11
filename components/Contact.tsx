'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

export default function Contact() {
  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'aottgpvp@gmail.com',
      href: 'mailto:aottgpvp@gmail.com'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+1 (506) 607-0383',
      href: 'tel:+15066070383'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'New Brunswick, Canada',
      href: '#'
    }
  ]

  return (
    <section id="contact" className="section-padding wood-panel relative">
      {/* Wood texture overlay */}
      <div className="absolute inset-0 wood-texture opacity-20"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold gradient-text mb-4">Get In Touch</h2>
          <p className="text-lg text-bark-700 dark:text-wood-200 max-w-2xl mx-auto">
            Questions about my work? Want to collaborate or hire me? Let's connect!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-semibold text-bark-800 dark:text-wood-100">
              Let's Connect
            </h3>
            
            <p className="text-bark-600 dark:text-wood-300">
              I'm always open to discussing tech, collaborating on interesting projects, 
              or new job opportunities. Feel free to reach out about any of my work or availability!
            </p>

            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <motion.a
                  key={info.label}
                  href={info.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-4 p-4 bg-wood-50 dark:bg-wood-800 rounded-lg hover:bg-wood-100 dark:hover:bg-wood-700 transition-colors cabin-border"
                >
                  <info.icon className="text-bark-600 dark:text-wood-400" size={20} />
                  <div>
                    <p className="text-sm text-bark-600 dark:text-wood-400">{info.label}</p>
                    <p className="font-medium text-bark-800 dark:text-wood-100">{info.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Social Links */}
            <div className="pt-4">
                          <h4 className="text-lg font-medium text-bark-800 dark:text-wood-100 mb-4">
              Follow Me
            </h4>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/ChristianDenniss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-wood-100 dark:bg-wood-700 rounded-lg hover:bg-wood-200 dark:hover:bg-wood-600 transition-colors cabin-border"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/christian-dennis-43601a2a1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-wood-100 dark:bg-wood-700 rounded-lg hover:bg-wood-200 dark:hover:bg-wood-600 transition-colors cabin-border"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/christiiandennis/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-wood-100 dark:bg-wood-700 rounded-lg hover:bg-wood-200 dark:hover:bg-wood-600 transition-colors cabin-border"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-semibold text-bark-800 dark:text-wood-100">
              Send Message
            </h3>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-bark-700 dark:text-wood-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 border border-wood-300 dark:border-wood-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-transparent bg-wood-50 dark:bg-wood-800 text-bark-800 dark:text-wood-100 wood-placeholder"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-bark-700 dark:text-wood-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-wood-300 dark:border-wood-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-transparent bg-wood-50 dark:bg-wood-800 text-bark-800 dark:text-wood-100 wood-placeholder"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-bark-700 dark:text-wood-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-wood-300 dark:border-wood-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-transparent bg-wood-50 dark:bg-wood-800 text-bark-800 dark:text-wood-100 wood-placeholder"
                  placeholder="Contact inquiry"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-bark-700 dark:text-wood-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full px-4 py-3 border border-wood-300 dark:border-wood-600 rounded-lg focus:ring-2 focus:ring-wood-500 focus:border-transparent bg-wood-50 dark:bg-wood-800 text-bark-800 dark:text-wood-100 resize-none wood-placeholder"
                  placeholder="Tell me about your inquiry..."
                ></textarea>
              </div>
              
              <motion.button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-wood-600 text-white rounded-lg hover:bg-wood-700 transition-colors font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send size={16} />
                <span>Send Message</span>
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 