// Gerador de Breadcrumb Schema JSON-LD baseado na rota
export function generateBreadcrumbSchema(pathname: string) {
  const SITE = "https://cklareza.com"

  // Mapeamento de rotas para labels e hierarquia
  const routeMap: Record<string, { label: string; parent?: string }> = {
    "/": { label: "Home" },
    "/recursos": { label: "Recursos", parent: "/" },
    "/precos": { label: "Preços", parent: "/" },
    "/seguranca": { label: "Segurança", parent: "/" },
    "/privacidade": { label: "Privacidade", parent: "/" },
    "/contato": { label: "Contato", parent: "/" },
    "/sobre": { label: "Sobre", parent: "/" },
    "/blog": { label: "Blog", parent: "/" },
  }

  // Detectar se é rota de blog post
  const isBlogPost = pathname.startsWith("/blog/") && pathname !== "/blog"
  const blogPostTitle = pathname
    .replace("/blog/", "")
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  const items: Array<{
    position: number
    name: string
    item: string
  }> = []

  // Home sempre primeira
  items.push({
    position: 1,
    name: "Home",
    item: SITE,
  })

  // Página atual
  if (pathname === "/" || !pathname || pathname === "") {
    // Não adiciona breadcrumb redundante na home
    return null
  }

  const route = routeMap[pathname]
  if (route) {
    items.push({
      position: items.length + 1,
      name: route.label,
      item: `${SITE}${pathname}`,
    })
  } else if (isBlogPost) {
    // Blog > Post específico
    items.push({
      position: 2,
      name: "Blog",
      item: `${SITE}/blog`,
    })
    items.push({
      position: 3,
      name: blogPostTitle,
      item: `${SITE}${pathname}`,
    })
  }

  if (items.length < 2) return null

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  }
}
