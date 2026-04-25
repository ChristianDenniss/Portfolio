import BackToMenuButton from '@/components/BackToMenuButton'
import SettingsAudio from '@/components/SettingsAudio'

const SETTINGS_MENU_VIDEO_PRELOAD = '/4K%20Videos/Halo%20Cross-Game%20Menu.mp4'

export default function SettingsPage() {
  return (
    <>
      <link rel="preload" href={SETTINGS_MENU_VIDEO_PRELOAD} as="video" type="video/mp4" />
      <main className="flex min-h-[100dvh] flex-col bg-[#03101c] text-[#cde8ff]">
        <BackToMenuButton />
        <SettingsAudio />
      </main>
    </>
  )
}
