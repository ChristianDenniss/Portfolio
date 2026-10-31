'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Github, ArrowRight, X, Calendar, Code, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [portalReady, setPortalReady] = useState(false)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    if (selectedProject === null) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProject(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [selectedProject])
  const projects = [
    {
      title: 'Volleyball 4-2 Website',
      description:
        'Full-stack TypeScript platform for Volleyball 4.2 leagues, stats, teams, seasons, awards, and articles. Peak traffic hit thousands of daily actives; still hundreds daily. In Sept 2026 the league reset for "Chapter 2," and the client wanted a fresh start on the site to match, so we rewrote it as a proper monorepo on Cloudflare. Now open source.',
      longDescription:
        'A comprehensive volleyball management system for player, game, and team statistics, seasons, awards, articles, and site users. While I was actively maintaining the earlier generation, Google Analytics showed about 100,000 visits over two months, with thousands of active users on a typical peak day; the community still drives hundreds of daily actives. The original stack was TypeScript end to end: React + Vite, Express + TypeORM + PostgreSQL, Redis, Docker, Coolify, and Tailscale, plus Roblox and Challonge API integrations. In September 2026 the client reset their league for "Chapter 2" and asked for a matching clean break on the product: a full rewrite into a proper monorepo hosted on Cloudflare, so the site could start fresh with the new chapter instead of carrying the old layout forward. Frontend, API, and shared packages now live in one deployable workspace. As an open source project it also covered production monitoring, PR review, vulnerability management, and secure release hygiene.',
      technologies: [
        'TypeScript',
        'React',
        'Monorepo',
        'Cloudflare',
        'Express.js',
        'PostgreSQL',
        'TypeORM',
        'Redis',
        'Vite',
        'Docker',
        'Roblox API',
        'Challonge API',
        'Open Source',
        'JWT',
        'Jest',
        'Figma'
      ],
      image: '/images/vbsite.png',
      github: 'https://github.com/ChristianDenniss/volleyProject',
      live: 'https://volleyball4-2.com/',
      featured: true,
      highlights: [
        'Sept 2026 "Chapter 2" league reset: client-requested fresh-start rewrite as a monorepo on Cloudflare',
        'Open source on GitHub',
        '~100k visits in 2 months; thousands of daily active users at peak and still hundreds daily (Google Analytics)',
        'Full-stack TypeScript leagues, stats, seasons, awards, and articles',
        'PostgreSQL + TypeORM with Redis caching',
        'Roblox and Challonge API integrations',
        'Production monitoring, PR review, and security hygiene'
      ],
      challenges:
        'Keeping a live community product correct across seasons and external APIs, then delivering a Chapter 2 fresh start: monorepo + Cloudflare rewrite that mirrored the league reset without stranding operators mid-transition.',
      learnings:
        'Product rewrites land cleaner when they follow a real world reset. Chapter 2 let us cut over to a monorepo and Cloudflare host as a deliberate fresh start instead of bolting new structure onto legacy seasons.'
    },
    {
      title: 'Parking Digital Twin',
      description: 'A research-driven digital twin with ontologies and a bi-directional feedback loop, combining scarce satellite data in Google Earth Engine, course-data API scraping (working around API security and stitching multiple systems), Redis cache, and predictive modelling for parking analytics. Extended work included Figma-to-SVG pipelines (plugins for special SVG IDs, plus SVG mutation and formatting), custom and global middleware for errors, logging, and caching, custom GEE assets layered on API imagery, and extracting, cropping, and zooming government satellite datasets to composite with Earth Engine.',
      longDescription: 'An in-depth research project that built a digital twin for parking analysis using ontologies to structure domain knowledge and a bi-directional feedback loop between the model and real-world data. No single system met the full requirements, so the solution involved integrating many different systems and working around API security limitations to complete one end-to-end task. Design and asset work in Figma included parking-lot SVGs where plugins helped satisfy a special SVG ID requirement; downstream SVG mutation and formatting connected the visual layer to the rest of the pipeline. Custom and global middleware tied services together with structured error handling, logging, and caching (including Redis) so the research stack stayed observable and performant. The work included extensive information gathering and research to source scarce satellite imagery: I used government dataset portals to extract, crop, and zoom imagery, then appended and processed it in Google Earth Engine alongside imagery from the Earth Engine API, including creating GEE assets to call and layer on top of that API-driven imagery for geospatial analytics. I scraped course and scheduling data from an institutional courses API to enrich the model with campus context, including where protections were light, with broader data collection and aggregation across collected datasets. A Redis cache was used to support performance and data flow. Using all of this combined data (satellite, course schedules, and other collected datasets), I developed and trained a predictive model to support parking demand and availability analytics. The project demonstrates research methodology, design-to-code SVG workflows, ontological modelling, geospatial data engineering, multi-system integration, and machine learning for real-world urban planning applications.',
      technologies: ['Google Earth Engine', 'Figma', 'SVG', 'Redis', 'Middleware', 'Supabase', 'Fly.io', 'Supabase', 'Graduate Research', 'Satellite Data', 'Data Scraping', 'Predictive Modelling', 'DDM', 'Geospatial Analytics', 'Ontologies', 'Bi-directional Feedback Loop'],
      image: '/images/DT.png',
      github: 'https://github.com/ChristianDenniss/Parking_Digital_Twin',
      figma: 'https://www.figma.com/design/QDDoFP63VBhhGUEAbM6J0H/Parking-Lot-SVGs?node-id=0-1&t=O8DvsTMgB5mfRXt9-1',
      live: 'https://unbsj-parking.vercel.app/',
      paper: 'https://zenodo.org/records/19492112',
      featured: true,
      highlights: [
        'Ontologies for domain knowledge and data structure',
        'Bi-directional feedback loop between model and real-world data',
        'Multi-system integration (no single system fit the bill)',
        'API security bypassing and stitching many systems to complete one task',
        'Redis cache for performance and data flow',
        'In-depth research and information gathering',
        'Sourcing and appending scarce satellite data',
        'Google Earth Engine integration and analytics',
        'Scraping institutional courses API for context data',
        'Predictive model built on multi-source data',
        'Geospatial data engineering',
        'Digital twin approach for parking analysis',
        'Figma design and Figma plugins for SVG ID requirements',
        'SVG export mutation, formatting, and pipeline integration',
        'Custom and global middleware: errors, logging, and caching across the stack',
        'Custom GEE assets layered on Earth Engine API imagery',
        'Government satellite portals: extract, resolution enhancement, and composite with GEE',
        'Data collection, cleaning, and aggregation across heterogeneous sources'
      ],
      challenges: 'No single system met the full requirements; finding and integrating scarce satellite datasets, appending them in Google Earth Engine, designing ontologies and a bi-directional feedback loop, working around API security and scraping data from an institutional courses API, orchestrating many different systems to complete one end-to-end task, and building a predictive model that effectively combined heterogeneous data sources for parking analytics. Additionally: aligning Figma and plugin workflows with strict SVG ID needs; maintaining reliable custom and global middleware (errors, logging, caching) across disparate services; sourcing and preparing government satellite imagery (extract, crop, zoom) for GEE; and authoring and layering GEE assets on API-driven imagery.',
      learnings: 'Ontological modelling for digital twins, bi-directional feedback design, integrating many systems when none fit the bill alone, working around API security and stitching data from multiple sources, Redis cache usage in a research pipeline, Google Earth Engine workflows, geospatial data sourcing and integration, predictive modelling with multi-source data, and research-driven digital twin development. Also: Figma-based design and plugin-driven SVG workflows; mutating and formatting SVG for downstream tools; custom and global middleware patterns for errors, logging, and caching; creating and layering GEE assets on API imagery; working with government satellite portals alongside Earth Engine; and broader data collection and aggregation across campus and geospatial sources.'
    },
    {
      title: 'Local Search Engine',
      description: 'A plain Java CLI search engine that indexes text, PDF, and Office files from a selected folder, with weighted ranking and semantic search support for fast, focused local file discovery.',
      longDescription: 'Local Search Engine is a plain Java command-line tool designed as a focused alternative to broad system search. On first run it creates `~/Documents/search bin` and uses it as the default indexed root, with the index persisted to `~/Documents/search bin/index.dat`. The crawler scans nested folders recursively and builds an in-memory inverted index that is saved to disk for fast startup and query performance. It supports UTF-8 text files plus common PDF and Office Open XML formats (`.docx`, `.xlsx`, `.pptx`, etc.) through Apache PDFBox and Apache POI extraction, while keeping the search and ranking engine in plain Java (no Lucene). Ranking combines TF-IDF lexical relevance with recency boosting, snippets include matched-term highlighting, and incremental sync handles add/remove/update changes. In interactive mode, the index re-syncs before every search and `list` command so new files appear without restarting, and semantic search is supported alongside weighted lexical retrieval.',
      technologies: ['Java', 'CLI', 'Inverted Index', 'TF-IDF', 'Recency Ranking', 'Semantic Search', 'Apache PDFBox', 'Apache POI', 'Tokenizer', 'Incremental Sync', 'Maven'],
      image: '/images/JAVASEARCHENGINE.png',
      github: 'https://github.com/ChristianDenniss/LocalSearchEngine',
      live: null,
      featured: true,
      highlights: ['Focused default index root: `~/Documents/search bin`', 'Recursive crawler with ignore rules', 'In-memory inverted index with disk persistence (`index.dat`)', 'Multi-format extraction: text + PDF + Office Open XML', 'Weighted ranking: TF-IDF + recency boost', 'Snippet generation with matched-term highlighting', 'Incremental sync for add/remove/update detection', 'Interactive CLI commands (`list`, `open`, `location`)', 'Shaded JAR packaging for simple `java -jar` execution'],
      challenges: 'Designing a reliable search pipeline in plain Java without Lucene, handling noisy PDF extraction, keeping index state consistent with filesystem changes, and balancing relevance with recency while preserving a clean CLI experience.',
      learnings: 'Built practical IR fundamentals in Java: tokenization, inverted indexing, weighted scoring, snippet generation, document extraction with PDFBox/POI, incremental indexing design, and CLI packaging/distribution with Maven Shade.'
    },
    {
      title: 'Nibble',
      description:
        'Hack Atlantic 2026 food price comparison platform shaped as a distributed data system: gRPC microservices, acquisition/scraping pipelines, cleaning and normalization, and Kubernetes-oriented local orchestration.',
      longDescription:
        'Nibble was our Hack Atlantic 2026 project (MLH, UNB Fredericton): a meta-pricing food delivery platform meant to compare restaurants, menus, fees, and deals across ordering sources. With teammates Hadi Akbar, Prabhas Dulam, and Kyle McMaster, we treated the hard problem as distributed data work rather than a single UI app. The stack is a multi-repo microservice architecture with gRPC service boundaries, a shared Go data model as the source of truth, dedicated data-acquisition services for web scraping and promotional feed parsing, cleaning/normalization into canonical restaurant and menu entities, an API/engine for search and price comparison, and platform contracts plus local-dev tooling aimed at Kubernetes-style multi-service runs. Under a 24-hour clock we did not fully crack continuous acquisition, but the weekend left a working product story and a clear distributed-systems layout across web platform, API engine, data acquisition, Go data model/store, contracts, and local-dev.',
      technologies: [
        'Go',
        'gRPC',
        'Microservices',
        'Distributed systems',
        'Web scraping',
        'Data cleaning',
        'Data normalization',
        'Data acquisition',
        'Kubernetes',
        'TypeScript',
        'React',
        'Hackathon'
      ],
      image: '/images/NibbleLogo.png',
      github: 'https://github.com/ChristianDenniss/nibble-web-platform',
      repos: [
        { label: 'Web platform', href: 'https://github.com/ChristianDenniss/nibble-web-platform' },
        { label: 'API engine', href: 'https://github.com/ChristianDenniss/nibble-api-engine' },
        { label: 'Data acquisition', href: 'https://github.com/ChristianDenniss/nibble-data-acquisition' },
        { label: 'Go data model', href: 'https://github.com/ChristianDenniss/nibble-go-data-model' },
        { label: 'Go data store', href: 'https://github.com/ChristianDenniss/nibble-go-data-store' },
        { label: 'Platform contracts', href: 'https://github.com/ChristianDenniss/nibble-platform-contracts' },
        { label: 'Local dev', href: 'https://github.com/ChristianDenniss/nibble-local-dev' }
      ],
      live: null,
      devpost: 'https://devpost.com/software/nibble-5hi02y',
      featured: true,
      highlights: [
        'gRPC microservice boundaries across acquisition, model/store, API engine, and web',
        'Distributed multi-repo layout designed for independent service ownership',
        'Web scraping and promotional feed parsing into structured deal/menu data',
        'Data cleaning and normalization onto a shared Go canonical data model',
        'Kubernetes-oriented local orchestration for running the full platform',
        'Meta-pricing comparison across food delivery sources',
        'Built at Hack Atlantic 2026; Devpost write-up linked'
      ],
      challenges:
        'Reliable multi-source acquisition under hackathon time: public APIs were gated, scraping and feed parsing needed cleaning before entities were comparable, and coordinating a distributed service graph was harder than shipping a single UI.',
      learnings:
        'Comparison products are distributed data systems first: gRPC contracts, acquisition pipelines, cleaning/normalization, and service orchestration matter more than polish when the moat is making heterogeneous sources comparable.'
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
      technologies: ['Java', 'JavaFX', 'Complex Arrays', 'Algorithms', 'Game Logic', 'Object-Oriented Programming', 'OOP', 'Inheritance'],
      image: '/images/chess.png',
      github: 'https://github.com/ChristianDenniss/Chess-Engine',
      live: null,
      featured: true,
      highlights: ['Complete chess game logic', 'Move validation system', 'Graphical user interface', 'Check/checkmate detection'],
      challenges: 'Implementing complex chess rules and ensuring all edge cases were handled correctly.',
      learnings: 'Deepened my understanding of algorithms, game state management, and JavaFX development.'
    },
    {
      title: 'Database Optimization playground',
      description: 'A full-stack query comparison lab: define one logical query (entity, filters, columns, sort/limit) and run it through multiple server-side execution slots (such as TypeORM versus hand-compiled raw SQL), then compare wall time, payload size, row counts, and a short narrative summary.',
      longDescription: 'Database Optimization playground is built to compare small, controlled database changes under the same predicates instead of guessing from production noise. You define a single logical query and execute it through configurable slots on the server, each path implementing the same semantics differently (for example ORM-generated SQL versus tuned raw SQL, or different index strategies). Results surface wall-clock time, payload size, row counts, and a concise narrative summary. The backend uses Node.js, Express, TypeORM, and PostgreSQL with a bench-oriented schema that exercises many index styles on the same tables (for example btree, composite, partial, covering INCLUDE, hash, GIN and GiST on tsvector, pg_trgm GIN on text, runtime versus stored full-text search, and more). Requests are validated with Zod; optional Redis caching and JWT support demo-style auth. The frontend is React, TypeScript, and Vite with a workbench for filters, slots, saved recipes, and results, plus an /about page with approach tiles and a bundled decision log from markdown. Developer experience includes Docker-friendly PostgreSQL, TypeORM migrations, and an API health check exposed in the UI.',
      technologies: [
        'PostgreSQL',
        'tsvector & tsquery',
        'GIN index (FTS)',
        'GiST',
        'pg_trgm GIN',
        'B-tree',
        'Composite B-tree',
        'Partial index',
        'Covering index (INCLUDE)',
        'Hash index',
        'Runtime vs stored FTS',
        'TypeORM vs raw SQL',
        'TypeORM migrations',
        'Query benchmarking'
      ],
      image: '/images/DBOPT.png',
      github: 'https://github.com/ChristianDenniss/DatabaseOPT',
      live: null,
      featured: true,
      highlights: [
        'One logical query, multiple execution slots (e.g. TypeORM vs hand-compiled SQL)',
        'Comparable metrics: wall time, payload size, row counts, narrative summary',
        'Controlled comparisons for ORM paths, indexes, full-text vs substring search',
        'Bench-oriented PostgreSQL schema with btree, composite, partial, INCLUDE, hash, GIN/GiST, pg_trgm',
        'Runtime vs stored full-text search variants on shared predicates',
        'Zod-validated API; optional Redis cache and JWT for demos',
        'React + Vite workbench: filters, slots, recipes, and results',
        '/about with approach tiles and decision log from bundled markdown',
        'Docker-friendly Postgres, TypeORM migrations, health check in the UI'
      ],
      challenges: 'Keeping slot semantics aligned so comparisons stay fair, designing a schema that stress-tests index types without becoming unmaintainable, and presenting timing and payload trade-offs clearly enough to support real decisions rather than micro-benchmark noise.',
      learnings: 'Structured query benchmarking, PostgreSQL indexing and full-text patterns, slot-based server architecture, Zod-driven API contracts, and building a focused lab UI that ties experiments back to an explicit decision log.'
    },
    {
      title: 'MaddyApp',
      description: 'A beautiful React Native iOS app for organizing groceries, todos, and bucket lists with AI-powered recipe-to-grocery list conversion and cute pixel art animations.',
      longDescription: 'A lifestyle organization app built with React Native and Expo, published on the Apple App Store that helps users manage their daily life with style. Features include intelligent grocery list management with AI-powered recipe parsing, todo tracking with priorities, and bucket list organization. The app uses OpenAI API and prompt engineering to automatically generate grocery lists from recipe links, beautiful pixel art animations, SQLite local storage for robust data management and privacy, works offline, and includes haptic feedback for satisfying interactions.',
      technologies: ['React Native', 'Expo', 'App Store Deployment','iOS Development', 'Mobile Development', 'OpenAI API', 'Prompt Engineering', 'Pixel Art', 'SQLite', 'Local Storage'],
      image: '/images/sidewayMaddyApp.png',
      github: undefined,
      live: 'https://apps.apple.com/ca/app/maddyapp/id6748365715',
      featured: true,
      highlights: ['Published on Apple App Store', 'Built with React Native and Expo', 'AI-powered recipe-to-grocery list conversion', 'OpenAI API integration with prompt engineering', 'Beautiful pixel art animations', 'SQLite local storage for robust data management', 'Offline functionality', 'Haptic feedback integration'],
      challenges: 'Creating an intuitive mobile interface with engaging animations while implementing SQLite for reliable local data storage, integrating OpenAI API for intelligent recipe parsing, and ensuring data privacy using React Native and Expo.',
      learnings: 'React Native development, Expo framework, iOS development, App Store publishing process, mobile UX design, SQLite database implementation, OpenAI API integration, prompt engineering for recipe parsing, animation implementation, and building apps that prioritize user privacy with robust local storage.'
    },
    {
      title: 'Test Suite Management System',
      description: 'A comprehensive Java application built with JavaFX for managing test suites and test cases, executing tests on Java programs across folder structures, and managing test results with detailed reporting.',
      longDescription: 'A comprehensive test management and execution system developed as a group project for CS-2043. This application allows users to create, modify, and delete test suites and test cases through an intuitive JavaFX interface. The system implements a many-to-many relationship architecture where test cases can be associated with multiple test suites without data duplication, enabling efficient test organization and reuse. The application can execute test suites on folders containing Java programs, recursively traversing all subfolders to find and test Java files. It compiles and runs the test cases, displaying detailed execution results. The system includes a dedicated results management screen for viewing, analyzing, and managing test execution outcomes. The project demonstrates strong file management skills, execution and compiling capabilities, recursive directory traversal, and a focus on creating user-friendly interfaces with excellent UX design principles.',
      technologies: ['Java', 'JavaFX', 'Full System', 'File Management', 'Execution & Compiling', 'User Interface', 'UX Design'],
      image: '/images/testing.png',
      github: 'https://github.com/HadiAkbar/CS-2043-Group-Project',
      live: null,
      featured: false,
      highlights: ['Test suite and test case management', 'Many-to-many relationship architecture', 'Create, modify, and delete operations', 'No data duplication - cases reusable across suites', 'Test execution on Java program folders', 'Recursive subfolder traversal', 'Automatic compilation and execution', 'Results display and management screen', 'JavaFX graphical user interface', 'File management and data persistence', 'User-friendly UX design'],
      challenges: 'Designing a flexible architecture that allows test cases to belong to multiple test suites without duplication, implementing efficient file management for data persistence, creating a test execution engine that recursively traverses folder structures, handling compilation and execution of Java programs, managing test results and displaying them in a user-friendly manner, and creating an intuitive user interface that makes complex test organization and execution simple.',
      learnings: 'JavaFX application development, file management and data persistence, many-to-many relationship modeling, recursive directory traversal algorithms, Java program compilation and execution, test result management and reporting, user interface design principles, UX best practices, and collaborative group project development.'
    },
    {
      title: 'Cancer Survival Analysis',
      description: 'CS2704 Final Project - GDP cancer survival analysis using Jupyter Notebooks for data science and statistical analysis.',
      longDescription: 'An academic project that demonstrates my ability to work with real-world data and apply statistical analysis techniques. This project shows my understanding of data science principles, statistical methods, and the ability to draw meaningful insights from complex datasets.',
      technologies: ['Python', 'Google Colab', 'Jupyter Notebooks', 'Data Science', 'Statistics', 'Data Visualization','Linear Regression'],
      image: '/images/CancerProj.png',
      github: 'https://github.com/UNB-CS-Projects/GDP-cancer-survival-analysis',
      live: null,
      featured: false,
      highlights: ['Statistical analysis', 'Data visualization', 'Research methodology', 'Academic rigor'],
      challenges: 'Working with complex medical data and applying appropriate statistical methods.',
      learnings: 'Data science workflows, statistical analysis, and research methodology.'
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
      title: 'VB4.2 Stat Tracker',
      description: 'Python application using Google Sheets API to read and track season statistics, demonstrating API integration and data processing.',
      longDescription: 'This project showcases my ability to work with external APIs and process real-world data. It demonstrates practical application of Python programming, API integration, and data analysis skills. The stat tracker automates the process of collecting and organizing sports statistics.',
      technologies: ['Python', 'UI/UX Design', 'Google Sheets API', 'Data Analysis'],
      image: '/images/StatsProj.png',
      github: 'https://github.com/ChristianDenniss/VB4.2-Stat-Tracker',
      live: null,
      featured: false,
      highlights: ['Google Sheets API integration', 'Automated data collection', 'Statistical analysis', 'Real-world application'],
      challenges: 'Working with external APIs and handling data in different formats.',
      learnings: 'API integration, data processing, and creating tools for real-world use cases.'
    },
    
  ]

  return (
    <section
      id="projects"
      className="section-padding relative overflow-hidden bg-[#03101c] text-[#bbdbff]"
      style={{ fontFamily: 'HaloMenu, "Arial Narrow", sans-serif' }}
    >
      <div className="absolute inset-0 bg-[#03101c]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(122,176,224,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(122,176,224,0.22)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(175,216,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(175,216,255,0.35)_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 uppercase tracking-[0.12em] text-[#d7ebff]">My Projects</h2>
          <p className="text-lg text-[#9ab6d2] max-w-2xl mx-auto">
            A collection of my code, experiments, and solutions across different technologies
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index, 5) * 0.03 }}
              className="group relative flex flex-col overflow-hidden border border-[#7eb6e2]/35 bg-[#3c79ad]/34 p-3 text-[#e2f0ff] backdrop-blur-[3px] transition-all duration-150 hover:scale-[1.05] hover:border-[#b0daff]/50 hover:bg-[#4f8fc7]/38 hover:text-white"
              onClick={() => setSelectedProject(index)}
            >
              <span className="pointer-events-none absolute inset-[4px] border border-[#8fc2ea]/45" />
              <span className="pointer-events-none absolute inset-[10px] border border-[#9fcdf1]/20" />
              <span className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(160,208,248,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(160,208,248,0.14)_1px,transparent_1px)] [background-size:16px_16px] [background-position:0_0]" />
              {/* Project Image */}
              <div className="relative h-48 overflow-hidden bg-[#1c3d5d]/55">
                {project.image && project.image !== '/api/placeholder/400/250' ? (
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(167,212,247,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(167,212,247,0.2)_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold text-[#d7ebff]">
                        {project.title.split(' ')[0]}
                      </span>
                    </div>
                  </>
                )}
                {project.featured && (
                  <div className={`absolute ${('paper' in project && project.paper) ? 'top-14' : 'top-4'} right-4 border border-[#8fc2ea]/80 bg-[#2f78b8]/90 px-2.5 py-1 text-xs font-semibold text-[#e4f2ff]`}>
                    Featured
                  </div>
                )}
                {'paper' in project && project.paper && (
                  <div className="absolute top-4 right-4 border border-[#8fc2ea]/80 bg-[#2a6fae]/90 px-3.5 py-1 text-xs font-semibold tracking-[0.08em] text-[#e4f2ff]">
                    PUBLISHED PAPER
                  </div>
                )}
              </div>

              {/* Project Content */}
              <div className="px-6 py-3 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-[#d7e5f4] mb-2">
                  {project.title}
                </h3>
                
                <p className="text-[#b3cbe3] text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full px-2.5 py-1 border border-[#d7e5f4]/30 bg-[#d7e5f4]/14 text-[#d7e5f4] text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Project Links */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-auto">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-[#b7cee4] hover:text-[#e4f2ff] transition-colors"
                    >
                      <Github size={16} />
                      <span className="text-sm">Code</span>
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-[#b7cee4] hover:text-[#e4f2ff] transition-colors"
                    >
                      <ExternalLink size={16} />
                      <span className="text-sm">Live</span>
                    </a>
                  )}
                  {'devpost' in project && project.devpost && (
                    <a
                      href={project.devpost}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-[#b7cee4] hover:text-[#e4f2ff] transition-colors"
                    >
                      <ExternalLink size={16} />
                      <span className="text-sm">Devpost</span>
                    </a>
                  )}
                  {'paper' in project && project.paper && (
                    <a
                      href={project.paper}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-[#b7cee4] hover:text-[#e4f2ff] transition-colors"
                    >
                      <ExternalLink size={16} />
                      <span className="text-sm">Publication</span>
                    </a>
                  )}
                  {'figma' in project && project.figma && (
                    <a
                      href={project.figma}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-[#b7cee4] hover:text-[#e4f2ff] transition-colors"
                    >
                      <ExternalLink size={16} />
                      <span className="text-sm">Figma</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More Projects */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com/ChristianDenniss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 border border-[#8ebfe6]/34 bg-[#4b8dc2]/24 px-6 py-3 text-[#e4f2ff] backdrop-blur-[3px] transition-all duration-150 hover:border-[#c2e0fa]/48 hover:bg-[#61a8de]/30"
          >
            <span>see everything on github</span>
            <ArrowRight size={16} />
          </a>
        </motion.div>

      </div>

      {portalReady
        ? createPortal(
            <AnimatePresence>
              {selectedProject !== null ? (
                <motion.div
                  key="project-modal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black/72 p-4 pt-20"
                  onClick={() => setSelectedProject(null)}
                  role="presentation"
                >
                  {/* Opaque non-motion shell; scroll lives on an untransformed child. */}
                  <div
                    className="relative flex max-h-[calc(90vh-5rem)] w-full max-w-4xl flex-col overflow-hidden border border-[#7fb6de]/32 bg-[#0c2236] text-[#e2f0ff] shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="project-modal-title"
                  >
                    <div className="scrollbar-bar-only min-h-0 flex-1 overflow-y-auto overscroll-contain [contain:content]">
                      <div className="p-8">
                        <div className="mb-6 flex items-start justify-between">
                          <div>
                            <h2 id="project-modal-title" className="mb-2 text-3xl font-bold text-[#d7e5f4]">
                              {projects[selectedProject].title}
                            </h2>
                            <p className="text-[#b3cbe3]">{projects[selectedProject].description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedProject(null)}
                            className="text-[#b7cee4] hover:text-[#e4f2ff]"
                            aria-label="Close project detail"
                          >
                            <X size={24} />
                          </button>
                        </div>

                        <div className="mb-6">
                          <h3 className="mb-3 flex items-center text-lg font-semibold text-[#d7e5f4]">
                            <Code className="mr-2" size={20} />
                            Technologies Used
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {projects[selectedProject].technologies.map((tech) => (
                              <span
                                key={tech}
                                className="rounded-full border border-[#d7e5f4]/30 bg-[#d7e5f4]/14 px-3 py-1 text-sm text-[#d7e5f4]"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mb-6">
                          <h3 className="mb-3 text-lg font-semibold text-[#d7e5f4]">About This Project</h3>
                          <p className="leading-relaxed text-[#b3cbe3]">
                            {projects[selectedProject].longDescription}
                          </p>
                        </div>

                        <div className="mb-6">
                          <h3 className="mb-3 flex items-center text-lg font-semibold text-[#d7e5f4]">
                            <Star className="mr-2" size={20} />
                            Key Highlights
                          </h3>
                          <ul className="space-y-2">
                            {projects[selectedProject].highlights.map((highlight, index) => (
                              <li key={index} className="flex items-start">
                                <div className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#9fcdf1]" />
                                <span className="text-[#b3cbe3]">{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-6 grid gap-6 md:grid-cols-2">
                          <div>
                            <h3 className="mb-3 text-lg font-semibold text-[#d7e5f4]">Challenges Faced</h3>
                            <p className="text-[#b3cbe3]">{projects[selectedProject].challenges}</p>
                          </div>
                          <div>
                            <h3 className="mb-3 text-lg font-semibold text-[#d7e5f4]">Key Learnings</h3>
                            <p className="text-[#b3cbe3]">{projects[selectedProject].learnings}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 border-t border-[#9fcdf1]/20 pt-6">
                          {'repos' in projects[selectedProject] &&
                          Array.isArray(projects[selectedProject].repos) &&
                          projects[selectedProject].repos!.length > 0
                            ? projects[selectedProject].repos!.map((repo) => (
                                <a
                                  key={repo.href}
                                  href={repo.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-2 border border-[#8ebfe6]/34 bg-[#4b8dc2]/24 px-6 py-3 text-[#e4f2ff] transition-all duration-150 hover:border-[#c2e0fa]/48 hover:bg-[#61a8de]/30"
                                >
                                  <Github size={16} />
                                  <span>{repo.label}</span>
                                </a>
                              ))
                            : projects[selectedProject].github && (
                                <a
                                  href={projects[selectedProject].github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-2 border border-[#8ebfe6]/34 bg-[#4b8dc2]/24 px-6 py-3 text-[#e4f2ff] transition-all duration-150 hover:border-[#c2e0fa]/48 hover:bg-[#61a8de]/30"
                                >
                                  <Github size={16} />
                                  <span>View Code</span>
                                </a>
                              )}
                          {projects[selectedProject].live && (
                            <a
                              href={projects[selectedProject].live!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 border border-[#8ebfe6]/34 bg-[#4b8dc2]/24 px-6 py-3 text-[#e4f2ff] transition-all duration-150 hover:border-[#c2e0fa]/48 hover:bg-[#61a8de]/30"
                            >
                              <ExternalLink size={16} />
                              <span>Live Demo</span>
                            </a>
                          )}
                          {'devpost' in projects[selectedProject] && projects[selectedProject].devpost && (
                            <a
                              href={projects[selectedProject].devpost}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 border border-[#8ebfe6]/34 bg-[#4b8dc2]/24 px-6 py-3 text-[#e4f2ff] transition-all duration-150 hover:border-[#c2e0fa]/48 hover:bg-[#61a8de]/30"
                            >
                              <ExternalLink size={16} />
                              <span>Devpost</span>
                            </a>
                          )}
                          {'paper' in projects[selectedProject] && projects[selectedProject].paper && (
                            <a
                              href={projects[selectedProject].paper}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 border border-[#8ebfe6]/34 bg-[#4b8dc2]/24 px-6 py-3 text-[#e4f2ff] transition-all duration-150 hover:border-[#c2e0fa]/48 hover:bg-[#61a8de]/30"
                            >
                              <ExternalLink size={16} />
                              <span>Published Paper</span>
                            </a>
                          )}
                          {'figma' in projects[selectedProject] && projects[selectedProject].figma && (
                            <a
                              href={projects[selectedProject].figma}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 border border-[#8ebfe6]/34 bg-[#4b8dc2]/24 px-6 py-3 text-[#e4f2ff] transition-all duration-150 hover:border-[#c2e0fa]/48 hover:bg-[#61a8de]/30"
                            >
                              <ExternalLink size={16} />
                              <span>Figma (Parking SVGs)</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </section>
  )
} 