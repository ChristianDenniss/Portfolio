import { Suspense } from 'react'

import Projects from '@/components/Projects'
import BackToMenuButton from '@/components/BackToMenuButton'

export default function ProjectsPage() {
  return (
    <main className="min-h-[100dvh] bg-[#03101c]">
      <BackToMenuButton />
      <Suspense fallback={null}>
        <Projects />
      </Suspense>
    </main>
  )
}
