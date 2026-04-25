import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PortfolioVideoWarmCache } from '@/components/PortfolioVideoWarmCache'
import { ThemeProvider } from '@/components/ThemeProvider'
import { PORTFOLIO_MENU_BACKGROUND_VIDEOS } from '@/lib/portfolioMenuVideos'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {PORTFOLIO_MENU_BACKGROUND_VIDEOS.map((href) => (
          <link key={href} rel="preload" href={href} as="video" type="video/mp4" />
        ))}
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <PortfolioVideoWarmCache />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 