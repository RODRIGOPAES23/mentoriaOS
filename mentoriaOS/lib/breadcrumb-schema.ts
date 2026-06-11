// Gerador de Breadcrumb Schema JSON-LD baseado na rota
export function generateBreadcrumbSchema(pathname: string) {
  const SITE = "https://cklareza.com"

  // Mapeamento de rotas para labels
  const routeMap: Record<string, string> = {
    "/recursos":   "Recursos",
    "/precos":     "Preços",
    "/seguranca":  "Segurança",
    "/privacidade":"Privacidade",
    "/contato":    "Contato",
    "/sobre":      "Sobre",
    "/blog":       "Blog",
    "/glossario":  "Glossário",
  }

  // Labels legíveis para posts de blog
  const blogPostLabels: Record<string, string> = {
    "software-para-mentores-guia-completo":   "Software para Mentores: Guia Completo",
    "como-fazer-checkin-semanal-com-mentorados": "Check-in Semanal com Mentorados",
    "como-aumentar-a-retencao-de-mentorados": "Como Aumentar a Retenção de Mentorados",
    "mentorship-software-guide":              "Mentorship Software Guide",
    "como-reduzir-churn-mentoria":            "Como Reduzir o Churn na Sua Mentoria",
    "plataforma-mentoria-white-label":        "Plataforma de Mentoria White-Label",
    "como-cobrar-mentoria":                   "Como Cobrar Mentoria: Precificação High-Ticket",
    "como-escalar-mentoria":                  "Como Escalar sua Mentoria",
  }

  // Home não gera breadcrumb
  if (!pathname || pathname === "/") return null

  const isBlogPost = pathname.startsWith("/blog/") && pathname !== "/blog"
  const slug = pathname.replace("/blog/", "")

  // Constrói itens — cada um com @type: "ListItem" (obrigatório pelo Google)
  const makeItem = (position: number, name: string, item: string) => ({
    "@type": "ListItem" as const,
    position,
    name,
    item,
  })

  const items = [makeItem(1, "Home", SITE)]

  if (isBlogPost) {
    items.push(makeItem(2, "Blog", `${SITE}/blog`))
    const label = blogPostLabels[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    items.push(makeItem(3, label, `${SITE}${pathname}`))
  } else {
    const label = routeMap[pathname]
    if (!label) return null
    items.push(makeItem(2, label, `${SITE}${pathname}`))
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  }
}
