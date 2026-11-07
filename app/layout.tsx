import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PortfolioAssetWarmCache } from '@/components/PortfolioAssetWarmCache'
import { PortfolioThemeAutoplay } from '@/components/PortfolioThemeAutoplay'
import { PortfolioRouteWarmCache } from '@/components/PortfolioRouteWarmCache'
import { PortfolioVideoWarmCache } from '@/components/PortfolioVideoWarmCache'
import { PORTFOLIO_MENU_BACKGROUND_VIDEOS } from '@/lib/portfolioMenuVideos'
import { PORTFOLIO_WARM_CURSORS, PORTFOLIO_WARM_FONTS } from '@/lib/portfolioWarmAssets'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://christiandennis.vercel.app'),
  title: 'Christian Dennis',
  description:
    'Portfolio of Christian Dennis - software engineer and AI security co-op (TrojAI / A10 Networks), projects, and experience.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
        <link rel="preload" href="/sounds/theme.mp3" as="audio" fetchPriority="high" />
      </head>
      <body className={inter.className}>
        <audio
          id="portfolio-theme"
          src="/sounds/theme.mp3"
          autoPlay
          loop
          preload="auto"
          className="pointer-events-none absolute h-px w-px opacity-0"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var a=document.getElementById('portfolio-theme');if(!a)return;var master=1,theme=1;try{var s=JSON.parse(localStorage.getItem('portfolio-audio-settings-v1')||'{}');if(typeof s.master==='number')master=s.master;if(typeof s.theme==='number')theme=s.theme;}catch(e){}a.volume=Math.max(0,Math.min(1,0.7*master*theme));var p=a.play();if(p&&p.catch)p.catch(function(){});})();`
          }}
        />
        <PortfolioThemeAutoplay />
        <PortfolioRouteWarmCache />
        <PortfolioVideoWarmCache />
        <PortfolioAssetWarmCache />
        {children}
      </body>
    </html>
  )
}
