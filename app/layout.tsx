import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' })

export const metadata: Metadata = {
  title: 'Christian Dennis',
  description: 'Welcome to my project portfolio and showcase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={fraunces.variable} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 