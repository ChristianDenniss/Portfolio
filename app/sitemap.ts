import type { MetadataRoute } from 'next'

const SITE = 'https://christiandennis.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/about', '/projects', '/contact'] as const

  return routes.map((path) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.8,
  }))
}
