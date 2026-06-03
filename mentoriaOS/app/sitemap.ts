import type { MetadataRoute } from "next"

const SITE = "https://cklareza.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/recursos`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/precos`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/sobre`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/contato`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/blog/como-aumentar-a-retencao-de-mentorados`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ]
}
