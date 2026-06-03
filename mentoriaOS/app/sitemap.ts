import type { MetadataRoute } from "next"

const SITE = "https://cklareza.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    // Páginas públicas futuras (criar para SEO): /recursos, /precos, /blog, /sobre, /contato
    // { url: `${SITE}/recursos`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // { url: `${SITE}/precos`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // { url: `${SITE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ]
}
