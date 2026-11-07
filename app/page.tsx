import { Suspense } from 'react'

import Hero from '@/components/Hero'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={null}>
        <Hero />
      </Suspense>
    </main>
  )
}
