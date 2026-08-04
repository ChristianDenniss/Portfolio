import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PortfolioAssetWarmCache } from '@/components/PortfolioAssetWarmCache'
import { PortfolioRouteWarmCache } from '@/components/PortfolioRouteWarmCache'
import { PortfolioVideoWarmCache } from '@/components/PortfolioVideoWarmCache'
import { ThemeProvider } from '@/components/ThemeProvider'
import { PORTFOLIO_MENU_BACKGROUND_VIDEOS } from '@/lib/portfolioMenuVideos'
import { PORTFOLIO_WARM_CURSORS, PORTFOLIO_WARM_FONTS } from '@/lib/portfolioWarmAssets'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Christian Dennis',
  description:
    'Portfolio of Christian Dennis - software engineer and AI security co-op (TrojAI / A10 Networks), projects, and experience.',
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
        {PORTFOLIO_WARM_FONTS.map((font) => (
          <link
            key={font.href}
            rel="preload"
            href={font.href}
            as="font"
            type={font.type}
            crossOrigin="anonymous"
          />
        ))}
        {PORTFOLIO_WARM_CURSORS.map((href) => (
          <link key={href} rel="preload" href={href} as="image" type="image/png" />
        ))}
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <PortfolioRouteWarmCache />
          <PortfolioVideoWarmCache />
          <PortfolioAssetWarmCache />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
