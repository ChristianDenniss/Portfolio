import About from '@/components/About'
import BackToMenuButton from '@/components/BackToMenuButton'

/** Same file as `ABOUT_MENU_VIDEO_SRC` in `About.tsx` (URL-encoded path). */
const ABOUT_MENU_VIDEO_PRELOAD = '/4K%20Videos/Halo%204%20Menu.mp4'

export default function AboutPage() {
  return (
    <>
      <link rel="preload" href={ABOUT_MENU_VIDEO_PRELOAD} as="video" type="video/mp4" />
      <main className="flex min-h-[100dvh] flex-col xl:min-h-0 xl:h-dvh xl:max-h-dvh xl:overflow-hidden">
        <BackToMenuButton />
        <About />
      </main>
    </>
  )
}
