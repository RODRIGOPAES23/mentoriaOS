import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Áreas privadas / app não devem ser indexadas
        // /login removido daqui — Next.js App Router tenta prefetch RSC (/login?_rsc=)
        // que causava warning no Search Console. Bloqueio de indexação feito via
        // noindex/nofollow no metadata da própria página de login (mais correto).
        disallow: ["/admin", "/dashboard", "/selecionar", "/api/", "/m/"],
      },
    ],
    sitemap: "https://cklareza.com/sitemap.xml",
    host: "https://cklareza.com",
  }
}
