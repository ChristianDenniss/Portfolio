import Hero from '@/components/Hero'

const HERO_MENU_VIDEO_PRELOAD = '/HaloAssetMimic/FMS_MainMenu_v2.mp4'

export default function Home() {
  return (
    <>
      <link rel="preload" href={HERO_MENU_VIDEO_PRELOAD} as="video" type="video/mp4" />
      <main className="min-h-screen">
        <Hero />
      </main>
    </>
  )
} 