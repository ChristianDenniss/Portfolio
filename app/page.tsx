import { Suspense } from 'react'

import Hero from '@/components/Hero'

export default function Home() {
  return (
    <main className="h-[100dvh] max-h-[100dvh] overflow-hidden">
      <Suspense fallback={null}>
        <Hero />
      </Suspense>
    </main>
  )
}
