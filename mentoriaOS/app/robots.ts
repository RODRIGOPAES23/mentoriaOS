import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Áreas privadas / app não devem ser indexadas
        disallow: ["/admin", "/dashboard", "/selecionar", "/api/", "/m/", "/login"],
      },
    ],
    sitemap: "https://cklareza.com/sitemap.xml",
    host: "https://cklareza.com",
  }
}
