import type { MetadataRoute } from 'next'

const SITE = 'https://christiandennis.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/settings'],
    },
    sitemap: `${SITE}/sitemap.xml`,
  }
}
