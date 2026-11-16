import { Suspense } from 'react'

import Contact from '@/components/Contact'
import BackToMenuButton from '@/components/BackToMenuButton'

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <BackToMenuButton />
      <Suspense fallback={null}>
        <Contact />
      </Suspense>
    </main>
  )
}
