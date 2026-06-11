import type { MetadataRoute } from "next"

const SITE = "https://cklareza.com"
const now = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Páginas principais
    { url: SITE,                    lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE}/recursos`,      lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/precos`,        lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/seguranca`,     lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/sobre`,         lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/contato`,       lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/privacidade`,   lastModified: now, changeFrequency: "yearly",  priority: 0.3 },

    // Blog
    { url: `${SITE}/blog`,          lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    {
      url: `${SITE}/blog/software-para-mentores-guia-completo`,
      lastModified: now, changeFrequency: "monthly", priority: 0.8,
    },
    {
      url: `${SITE}/blog/como-fazer-checkin-semanal-com-mentorados`,
      lastModified: now, changeFrequency: "monthly", priority: 0.7,
    },
    {
      url: `${SITE}/blog/como-aumentar-a-retencao-de-mentorados`,
      lastModified: now, changeFrequency: "monthly", priority: 0.7,
    },
    {
      url: `${SITE}/blog/mentorship-software-guide`,
      lastModified: now, changeFrequency: "monthly", priority: 0.7,
    },
    {
      url: `${SITE}/blog/como-reduzir-churn-mentoria`,
      lastModified: now, changeFrequency: "monthly", priority: 0.8,
    },
    {
      url: `${SITE}/blog/plataforma-mentoria-white-label`,
      lastModified: now, changeFrequency: "monthly", priority: 0.8,
    },
    {
      url: `${SITE}/blog/como-cobrar-mentoria`,
      lastModified: now, changeFrequency: "monthly", priority: 0.8,
    },
    {
      url: `${SITE}/blog/como-escalar-mentoria`,
      lastModified: now, changeFrequency: "monthly", priority: 0.8,
    },
    {
      url: `${SITE}/blog/o-que-e-check-in-de-mentoria`,
      lastModified: now, changeFrequency: "monthly", priority: 0.7,
    },
    { url: `${SITE}/glossario`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ]
}
