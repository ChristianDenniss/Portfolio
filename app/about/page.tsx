import About from '@/components/About'
import BackToMenuButton from '@/components/BackToMenuButton'

export default function AboutPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col xl:min-h-0 xl:h-dvh xl:max-h-dvh xl:overflow-hidden">
      <BackToMenuButton />
      <About />
    </main>
  )
}
