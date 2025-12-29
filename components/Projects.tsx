'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Github, ArrowRight, X, Calendar, Code, Star } from 'lucide-react'
import { useState } from 'react'

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const projects = [
    {
      title: 'Volleyball 4-2 Website',
      description: 'A full-stack TypeScript application made for the game Volleyball 4.2, for managing statistics, teams, players, seasons, games, awards, articles, and website users. Now open source!',
      longDescription: 'A comprehensive volleyball management system built with modern web technologies and now open source. The application handles everything from player, game, and team statistics and management across different seasons to award tracking and tournament organization. Built with TypeScript throughout the stack for type safety, featuring a React frontend with Vite, Express.js backend with TypeORM and PostgreSQL, and containerized deployment with Docker, Coolify, and tailscale. The system extensively integrates with external APIs including the Roblox API for player data and game statistics, and the Challonge API for tournament management and bracket generation. As an open source project, I\'ve gained extensive experience in production monitoring, code review, vulnerability management, and cybersecurity practices.',
      technologies: ['TypeScript', 'React', 'Express.js', 'PostgreSQL', 'TypeORM', 'Docker', 'Vite', 'Tailscale', 'Roblox API', 'Challonge API', 'Open Source', 'Cybersecurity'],
      image: '/images/vbWebsite.png',
      github: 'https://github.com/ChristianDenniss/volleyProject',
      live: 'https://volleyball4-2.com/',
      featured: true,
      highlights: ['Open source project on GitHub', 'Full-stack TypeScript application', 'PostgreSQL database with TypeORM', 'JWT authentication & security', 'Docker containerization', 'Production monitoring & cybersecurity', 'Contributor PR review & code management', 'Vulnerability assessment & mitigation', 'Comprehensive testing with Jest', 'Roblox API integration for player data', 'Challonge API integration for tournament management'],
      challenges: 'Building a complex sports management system with real-time statistics, user authentication, and ensuring data integrity across multiple interconnected entities. Extensive work with external APIs including Roblox API for player data synchronization and Challonge API for tournament bracket management and real-time updates. Managing an open source project with multiple contributors, conducting thorough PR reviews, monitoring production systems for vulnerabilities, and implementing cybersecurity best practices.',
      learnings: 'Advanced TypeScript patterns, database design with TypeORM, containerized deployment, and building scalable full-stack applications with proper testing and security measures. Extensive experience with API integration, handling external data sources, rate limiting, error handling, and maintaining data consistency across multiple third-party services. Production monitoring, open source project management, contributor onboarding, PR review processes, vulnerability assessment, cybersecurity implementation, and maintaining secure codebases in production environments.'
    },
    {
      title: 'Stats 3D PCA Graphing',
      description: 'An interactive analytical tool that visualizes player statistical profiles in 3D space using Principal Component Analysis (PCA), featuring player archetype classification and similarity analysis.',
      longDescription: 'A sophisticated data visualization and statistical analysis application that transforms raw volleyball statistics into normalized vectors and projects them into 3D space using Principal Component Analysis. The system aggregates player statistics across games, normalizes them per-set to account for playing time, and creates 13-dimensional statistical vectors. These vectors are then projected into 3D space using PCA, allowing users to visualize relationships between different statistical dimensions. The application includes a comprehensive player archetype classification system with creative naming conventions (e.g., "Maverick Striker", "Intimidating Playmaker", "Unicorn") that categorizes players based on their play styles. Features include interactive 3D visualization using React Three Fiber, season-scoped analysis for contextual comparisons, player similarity calculations, and an intuitive interface with hover, click, and selection interactions. The system follows design principles of explainable transformations, neutral vectors, and per-set normalization to ensure fair and interpretable statistical comparisons.',
      technologies: ['TypeScript', 'React', 'React Three Fiber', 'PCA', 'Data Visualization', 'Statistical Analysis', '3D Graphics', 'Linear Algebra'],
      image: '/images/vector.png',
      github: 'https://github.com/ChristianDenniss/Stats-Vectorization-Graphing',
      live: 'https://statnormalizevectorize3dpca.vercel.app/',
      featured: true,
      highlights: ['Interactive 3D visualization with React Three Fiber', 'Principal Component Analysis (PCA) for dimensionality reduction', '13-dimensional statistical vectorization', 'Per-set normalization for fair comparisons', 'Player archetype classification system', 'Player similarity analysis', 'Season-scoped statistical analysis', 'Interactive controls (rotate, pan, zoom)', 'Color-coded archetype visualization', 'Explainable PCA component breakdown', 'Deployed on Vercel'],
      challenges: 'Implementing PCA from scratch to project 13-dimensional vectors into 3D space, designing a comprehensive archetype classification system that accurately categorizes players based on statistical profiles, creating an intuitive 3D interface with smooth interactions, handling large datasets efficiently, and ensuring statistical validity through proper normalization techniques.',
      learnings: 'Principal Component Analysis implementation, statistical vectorization and normalization techniques, 3D graphics programming with React Three Fiber, dimensionality reduction algorithms, player similarity metrics, data visualization best practices, TypeScript development, and building explainable statistical analysis tools.'
    },
    {
      title: 'Chess Engine',
      description: 'A minimal chess engine built with JavaFX, featuring game logic, move validation, and a graphical interface for playing chess.',
      longDescription: 'This project demonstrates my understanding of game development principles, algorithmic thinking, and Java programming. The chess engine includes complete game logic with move validation, check/checkmate detection, and a clean graphical interface built with JavaFX. It showcases my ability to work with complex algorithms and create user-friendly applications.',
      technologies: ['Java', 'JavaFX', 'Algorithms', 'Game Logic'],
      image: '/images/chess.png',
      github: 'https://github.com/ChristianDenniss/Chess-Engine',
      live: null,
      featured: true,
      highlights: ['Complete chess game logic', 'Move validation system', 'Graphical user interface', 'Check/checkmate detection'],
      challenges: 'Implementing complex chess rules and ensuring all edge cases were handled correctly.',
      learnings: 'Deepened my understanding of algorithms, game state management, and JavaFX development.'
    },
    {
      title: 'Test Suite Management System',
      description: 'A comprehensive Java application built with JavaFX for managing test suites and test cases, executing tests on Java programs across folder structures, and managing test results with detailed reporting.',
      longDescription: 'A comprehensive test management and execution system developed as a group project for CS-2043. This application allows users to create, modify, and delete test suites and test cases through an intuitive JavaFX interface. The system implements a many-to-many relationship architecture where test cases can be associated with multiple test suites without data duplication, enabling efficient test organization and reuse. The application can execute test suites on folders containing Java programs, recursively traversing all subfolders to find and test Java files. It compiles and runs the test cases, displaying detailed execution results. The system includes a dedicated results management screen for viewing, analyzing, and managing test execution outcomes. The project demonstrates strong file management skills, execution and compiling capabilities, recursive directory traversal, and a focus on creating user-friendly interfaces with excellent UX design principles.',
      technologies: ['Java', 'JavaFX', 'File Management', 'Execution & Compiling', 'User Interface', 'UX Design'],
      image: '/images/testing.png',
      github: 'https://github.com/HadiAkbar/CS-2043-Group-Project',
      live: null,
      featured: true,
      highlights: ['Test suite and test case management', 'Many-to-many relationship architecture', 'Create, modify, and delete operations', 'No data duplication - cases reusable across suites', 'Test execution on Java program folders', 'Recursive subfolder traversal', 'Automatic compilation and execution', 'Results display and management screen', 'JavaFX graphical user interface', 'File management and data persistence', 'User-friendly UX design'],
      challenges: 'Designing a flexible architecture that allows test cases to belong to multiple test suites without duplication, implementing efficient file management for data persistence, creating a test execution engine that recursively traverses folder structures, handling compilation and execution of Java programs, managing test results and displaying them in a user-friendly manner, and creating an intuitive user interface that makes complex test organization and execution simple.',
      learnings: 'JavaFX application development, file management and data persistence, many-to-many relationship modeling, recursive directory traversal algorithms, Java program compilation and execution, test result management and reporting, user interface design principles, UX best practices, and collaborative group project development.'
    },
    {
      title: 'Array Combiner',
      description: 'A utility to combine two arrays of any dimensions (1D or 2D) into a new 2D array with total columns of the combined array.',
      longDescription: 'A practical utility that solves a common data processing challenge. This project shows my ability to create reusable tools that handle edge cases and provide clean, efficient solutions. The array combiner can process arrays of different dimensions and combine them intelligently.',
      technologies: ['JavaScript', 'Linear Algebra', 'Data Processing', '2D Arrays', '1D Arrays'],
      image: '/images/arrayCombine.jpg',
      github: 'https://github.com/ChristianDenniss/Array-Combiner',
      live: null,
      featured: false,
      highlights: ['Handles 1D and 2D arrays', 'Flexible combination logic', 'Clean utility function', 'Edge case handling'],
      challenges: 'Designing a solution that works with arrays of different dimensions and sizes.',
      learnings: 'Improved my understanding of array manipulation and creating reusable utility functions.'
    },
    {
      title: 'MaddyApp',
      description: 'A beautiful React Native iOS app for organizing groceries, todos, and bucket lists with AI-powered recipe-to-grocery list conversion and cute pixel art animations.',
      longDescription: 'A lifestyle organization app built with React Native and Expo, published on the Apple App Store that helps users manage their daily life with style. Features include intelligent grocery list management with AI-powered recipe parsing, todo tracking with priorities, and bucket list organization. The app uses OpenAI API and prompt engineering to automatically generate grocery lists from recipe links, beautiful pixel art animations, SQLite local storage for robust data management and privacy, works offline, and includes haptic feedback for satisfying interactions.',
      technologies: ['React Native', 'Expo', 'iOS', 'Mobile Development', 'OpenAI API', 'Prompt Engineering', 'Pixel Art', 'SQLite', 'Local Storage'],
      image: '/images/sidewayMaddyApp.png',
      github: undefined,
      live: 'https://apps.apple.com/ca/app/maddyapp/id6748365715',
      featured: true,
      highlights: ['Published on Apple App Store', 'Built with React Native and Expo', 'AI-powered recipe-to-grocery list conversion', 'OpenAI API integration with prompt engineering', 'Beautiful pixel art animations', 'SQLite local storage for robust data management', 'Offline functionality', 'Haptic feedback integration'],
      challenges: 'Creating an intuitive mobile interface with engaging animations while implementing SQLite for reliable local data storage, integrating OpenAI API for intelligent recipe parsing, and ensuring data privacy using React Native and Expo.',
      learnings: 'React Native development, Expo framework, iOS development, App Store publishing process, mobile UX design, SQLite database implementation, OpenAI API integration, prompt engineering for recipe parsing, animation implementation, and building apps that prioritize user privacy with robust local storage.'
    },
    {
      title: 'VB4.2 Stat Tracker',
      description: 'Python application using Google Sheets API to read and track season statistics, demonstrating API integration and data processing.',
      longDescription: 'This project showcases my ability to work with external APIs and process real-world data. It demonstrates practical application of Python programming, API integration, and data analysis skills. The stat tracker automates the process of collecting and organizing sports statistics.',
      technologies: ['Python', 'Google Sheets API', 'Data Analysis'],
      image: '/images/StatsProj.png',
      github: 'https://github.com/ChristianDenniss/VB4.2-Stat-Tracker',
      live: null,
      featured: false,
      highlights: ['Google Sheets API integration', 'Automated data collection', 'Statistical analysis', 'Real-world application'],
      challenges: 'Working with external APIs and handling data in different formats.',
      learnings: 'API integration, data processing, and creating tools for real-world use cases.'
    },
    {
      title: 'Cancer Survival Analysis',
      description: 'CS2704 Final Project - GDP cancer survival analysis using Jupyter Notebooks for data science and statistical analysis.',
      longDescription: 'An academic project that demonstrates my ability to work with real-world data and apply statistical analysis techniques. This project shows my understanding of data science principles, statistical methods, and the ability to draw meaningful insights from complex datasets.',
      technologies: ['Python', 'Jupyter', 'Data Science', 'Statistics'],
      image: '/images/CancerProj.png',
      github: 'https://github.com/UNB-CS-Projects/GDP-cancer-survival-analysis',
      live: null,
      featured: false,
      highlights: ['Statistical analysis', 'Data visualization', 'Research methodology', 'Academic rigor'],
      challenges: 'Working with complex medical data and applying appropriate statistical methods.',
      learnings: 'Data science workflows, statistical analysis, and research methodology.'
    }
  ]

  return (
    <section id="projects" className="section-padding wood-panel relative">
      {/* Wood texture overlay */}
      <div className="absolute inset-0 wood-texture opacity-30"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold gradient-text mb-4">My Projects</h2>
          <p className="text-lg text-bark-700 dark:text-wood-200 max-w-2xl mx-auto">
            A collection of my code, experiments, and solutions across different technologies
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-stone-800 rounded-lg overflow-hidden shadow-lg card-hover cursor-pointer transform hover:scale-105 transition-all duration-200 cabin-border flex flex-col"
              onClick={() => setSelectedProject(index)}
            >
              {/* Project Image */}
              <div className="relative h-48 bg-gradient-to-br from-wood-100 via-bark-100 to-pine-100 dark:from-stone-700 dark:via-stone-800 dark:to-stone-700 overflow-hidden">
                {project.image && project.image !== '/api/placeholder/400/250' ? (
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div 
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='card-wood' x='0' y='0' width='150' height='150' patternUnits='userSpaceOnUse'%3E%3Crect width='150' height='150' fill='%23b8764a' opacity='0.1'/%3E%3Cpath d='M0 10 Q37.5 7.5 75 10 T150 10 L150 15 Q112.5 18.75 75 15 T0 15 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 25 Q37.5 22.5 75 25 T150 25 L150 30 Q112.5 33.75 75 30 T0 30 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 40 Q37.5 37.5 75 40 T150 40 L150 45 Q112.5 48.75 75 45 T0 45 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 55 Q37.5 52.5 75 55 T150 55 L150 60 Q112.5 63.75 75 60 T0 60 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 70 Q37.5 67.5 75 70 T150 70 L150 75 Q112.5 78.75 75 75 T0 75 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 85 Q37.5 82.5 75 85 T150 85 L150 90 Q112.5 93.75 75 90 T0 90 Z' fill='%23a5623a' opacity='0.15'/%3E%3Cpath d='M0 100 Q37.5 97.5 75 100 T150 100 L150 105 Q112.5 108.75 75 105 T0 105 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 115 Q37.5 112.5 75 115 T150 115 L150 120 Q112.5 123.75 75 120 T0 120 Z' fill='%23a5623e' opacity='0.15'/%3E%3Cpath d='M0 130 Q37.5 127.5 75 130 T150 130 L150 135 Q112.5 138.75 75 135 T0 135 Z' fill='%23a5623e' opacity='0.15'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='150' height='150' fill='url(%23card-wood)'/%3E%3C/svg%3E")`
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold text-bark-700 dark:text-bark-300">
                        {project.title.split(' ')[0]}
                      </span>
                    </div>
                  </>
                )}
                {project.featured && (
                  <div className="absolute top-4 right-4 bg-wood-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Featured
                  </div>
                )}
              </div>

              {/* Project Content */}
              <div className="px-6 py-3 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {project.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-wood-100 dark:bg-wood-800 text-wood-800 dark:text-wood-200 text-xs rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Project Links */}
                <div className="flex space-x-4 mt-auto">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-wood-600 dark:hover:text-wood-400 transition-colors"
                  >
                    <Github size={16} />
                    <span className="text-sm">Code</span>
                  </a>
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-wood-600 dark:hover:text-wood-400 transition-colors"
                    >
                      <ExternalLink size={16} />
                      <span className="text-sm">Live</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com/ChristianDenniss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-wood-600 text-white rounded-lg hover:bg-wood-700 transition-colors font-medium"
          >
            <span>see everything on github</span>
            <ArrowRight size={16} />
          </a>
        </motion.div>

        {/* Project Detail Modal */}
        {selectedProject !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 pt-20"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-stone-800 rounded-lg max-w-4xl w-full max-h-[calc(90vh-5rem)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedProject !== null && (
                <div className="p-8">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {projects[selectedProject].title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {projects[selectedProject].description}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Technologies */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Code className="mr-2" size={20} />
                      Technologies Used
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {projects[selectedProject].technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Description */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      About This Project
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {projects[selectedProject].longDescription}
                    </p>
                  </div>

                  {/* Key Highlights */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Star className="mr-2" size={20} />
                      Key Highlights
                    </h3>
                    <ul className="space-y-2">
                      {projects[selectedProject].highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-600 dark:text-gray-300">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Challenges & Learnings */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Challenges Faced
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {projects[selectedProject].challenges}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Key Learnings
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {projects[selectedProject].learnings}
                      </p>
                    </div>
                  </div>

                  {/* Project Links */}
                  <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <a
                      href={projects[selectedProject].github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Github size={16} />
                      <span>View Code</span>
                    </a>
                    {projects[selectedProject].live && (
                      <a
                        href={projects[selectedProject].live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-6 py-3 bg-wood-600 text-white rounded-lg hover:bg-wood-700 transition-colors"
                      >
                        <ExternalLink size={16} />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  )
} 