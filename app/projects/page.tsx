import Projects from '@/components/Projects'
import BackToMenuButton from '@/components/BackToMenuButton'

export default function ProjectsPage() {
  return (
    <main className="min-h-screen">
      <BackToMenuButton />
      <Projects />
    </main>
  )
}
