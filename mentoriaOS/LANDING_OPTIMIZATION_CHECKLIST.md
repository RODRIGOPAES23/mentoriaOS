# 🚀 PASSO C: OTIMIZAÇÕES LANDING ELEGANTE

## 📊 CHECKLIST DE PERFORMANCE & SEO

### ✅ CORE WEB VITALS
- [ ] LCP (Largest Contentful Paint): < 2.5s
  - Solução: Next.js Image otimização + font preloading
  - Ação: Adicionar `next/font` com preload
  
- [ ] FID (First Input Delay): < 100ms
  - Solução: Code splitting Framer Motion
  - Ação: dynamic import com ssr:false para componentes de animação
  
- [ ] CLS (Cumulative Layout Shift): < 0.1
  - Solução: Definir tamanhos explícitos em containers
  - Ação: Adicionar `min-h` e `aspect-ratio` em todos os cards

### ✅ IMAGENS & ASSETS
- [ ] Lazy loading em todas as imagens
- [ ] WebP com fallback PNG
- [ ] Responsividade (srcSet com múltiplos breakpoints)
- [ ] Compressão automática via Next.js Image

### ✅ FONTE TIPOGRÁFICA
```tsx
// Em app/layout.tsx, adicionar:
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  preload: true,
  display: 'swap' // Garante que não faz CLS
})
```

---

## 🔍 SEO COMPLETO

### ✅ METADATA
```tsx
export const metadata = {
  title: "CKlareza — Transforme vidas, não planilhas",
  description: "Plataforma de mentoria white-label. Organize financeiro, atividades e calls com clareza total.",
  keywords: ["mentoria", "plataforma mentoria", "white-label", "SaaS mentoria"],
  authors: [{ name: "CKlareza" }],
  creator: "CKlareza",
  publisher: "CKlareza",
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://cklareza.com",
    siteName: "CKlareza",
    title: "CKlareza — Transforme vidas, não planilhas",
    description: "Plataforma de mentoria que organiza tudo o que importa.",
    images: [
      {
        url: "https://cklareza.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CKlareza — Transforme vidas"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "CKlareza — Transforme vidas, não planilhas",
    description: "Plataforma de mentoria white-label completa",
    creator: "@cklareza",
    images: ["https://cklareza.com/og-image.jpg"]
  },
  alternates: {
    canonical: "https://cklareza.com",
    languages: {
      'pt-BR': 'https://cklareza.com/pt',
      'en-US': 'https://cklareza.com/en',
      'es-ES': 'https://cklareza.com/es'
    }
  }
}
```

### ✅ SCHEMA.ORG (JSON-LD)
```tsx
// Adicionar em landing-elegante.tsx, dentro do <head>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "CKlareza",
      "description": "Plataforma de mentoria white-label",
      "url": "https://cklareza.com",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "BRL",
        "priceValidUntil": "2026-12-31"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "500"
      }
    })
  }}
/>
```

### ✅ SITEMAP & ROBOTS
- Gerar `sitemap.xml` com todas as rotas
- Adicionar `robots.txt` com regras de crawl
- Submeter ao Google Search Console

---

## ♿ ACESSIBILIDADE (WCAG 2.1 AA)

### ✅ CONTRASTE
- [ ] Todos os textos: ratio mínimo 4.5:1
- [ ] Texto grande (18pt+): ratio mínimo 3:1
- [x] Já implementado em landing-elegante (preto #121212 em branco #FBFBFB = 21:1)

### ✅ NAVEGAÇÃO COM TECLADO
```tsx
// Adicionar em todos os botões:
<button
  onClick={() => {}}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  tabIndex={0}
  aria-label="Descrição do botão"
>
  Click me
</button>
```

### ✅ LEITORES DE TELA
- [x] Semântica HTML5 (`<section>`, `<nav>`, `<footer>`)
- [ ] aria-label em todos os ícones sem texto
- [ ] aria-describedby para campos de formulário
- [ ] role="region" em seções dinâmicas

### ✅ ANIMAÇÕES
- [x] Respeitar `prefers-reduced-motion`
```tsx
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

const animationVariant = prefersReducedMotion ? 
  { opacity: 1 } : 
  { initial: { opacity: 0 }, animate: { opacity: 1 } }
```

---

## ⚡ PERFORMANCE (Lighthouse)

### ✅ BUNDLE SIZE
- [ ] Manter JS abaixo de 200KB (gzipped)
- [ ] Tree-shake Framer Motion (importar apenas `motion`)
- [ ] Lazy load componentes pesados

### ✅ CACHE STRATEGY
```
public/: 1 year (versioned files)
/_next/static/: 1 year
API routes: no-cache, must-revalidate
```

### ✅ MINIFICAÇÃO
- [x] Next.js faz automaticamente em produção
- [ ] Verificar com `next/bundle-analyzer`

---

## 🎯 RESULTADOS ESPERADOS

| Métrica | Target | Status |
|---------|--------|--------|
| **Lighthouse Performance** | 90+ | ⏳ |
| **Lighthouse SEO** | 95+ | ⏳ |
| **Lighthouse Accessibility** | 95+ | ⏳ |
| **Lighthouse Best Practices** | 90+ | ⏳ |
| **Core Web Vitals** | All Green | ⏳ |
| **Mobile Score** | 85+ | ⏳ |

---

## 🚀 IMPLEMENTAÇÃO (ORDEM DE PRIORIDADE)

### AGORA (Crítico)
1. [ ] Font preloading (Inter)
2. [ ] Schema JSON-LD
3. [ ] Metadata completo
4. [ ] Lazy load Framer Motion
5. [ ] Next.js Image em heróis

### PRÓXIMA SEMANA
6. [ ] Sitemap dinâmico
7. [ ] OG images otimizadas
8. [ ] aria-labels em ícones
9. [ ] prefers-reduced-motion
10. [ ] Bundle size audit

### ANTES DO LAUNCH
11. [ ] Lighthouse audit final
12. [ ] Mobile testing
13. [ ] Cross-browser (Chrome, Safari, Firefox, Edge)
14. [ ] A/B testing de CTAs
15. [ ] Google Analytics + Hotjar

---

## ✅ COMANDOS PARA TESTAR LOCALMENTE

```bash
# Build otimizado
npm run build

# Analisar bundle
npm run build && npx next-bundle-analyzer

# Lighthouse em CLI
npm install -g lighthouse
lighthouse https://cklareza.com --view

# Testar acessibilidade
npm install -D axe-core
npx axe https://cklareza.com
```

---

**Objetivo Final:** Um site que não só é lindo, mas rápido, acessível e bem-ranqueado no Google.

🎯 **"Crystal Logic"** = Clareza em cada pixel, cada animação, cada métrica.
