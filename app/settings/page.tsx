import BackToMenuButton from '@/components/BackToMenuButton'
import SettingsAudio from '@/components/SettingsAudio'

export default function SettingsPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#03101c] text-[#cde8ff]">
      <BackToMenuButton />
      <SettingsAudio />
    </main>
  )
}
