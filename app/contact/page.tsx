import Contact from '@/components/Contact'
import BackToMenuButton from '@/components/BackToMenuButton'

const CONTACT_MENU_VIDEO_PRELOAD = '/4K%20Videos/Halo%20Customization%20Menu.mp4'

export default function ContactPage() {
  return (
    <>
      <link rel="preload" href={CONTACT_MENU_VIDEO_PRELOAD} as="video" type="video/mp4" />
      <main className="min-h-screen">
        <BackToMenuButton />
        <Contact />
      </main>
    </>
  )
}
