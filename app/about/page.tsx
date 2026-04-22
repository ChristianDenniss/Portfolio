import About from '@/components/About'
import BackToMenuButton from '@/components/BackToMenuButton'

export default function AboutPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col">
      <BackToMenuButton />
      <About />
    </main>
  )
}
