import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CookieBanner } from "@/components/site/CookieBanner"
import SiteAnalytics from "@/components/site/SiteAnalytics"
import { BreadcrumbSchema } from "@/components/site/BreadcrumbSchema"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

const SITE = "https://cklareza.com"
const DESC = "A plataforma inteligente que organiza suas mentorias, centraliza a comunicação e acompanha o progresso dos seus alunos em um só lugar."

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "CKlareza — Organize suas mentorias em um só lugar",
    template: "%s | CKlareza",
  },
  description: DESC,
  keywords: [
    "plataforma de mentoria", "software para mentores", "mentoria white-label",
    "gestão de mentoria", "CRM para mentoria", "sistema de mentoria com IA",
    "white-label mentorship platform", "mentorship software", "lifetime value",
    "acompanhamento de mentorados", "briefing com IA para mentoria",
  ],
  authors: [{ name: "CKlareza" }],
  creator: "CKlareza",
  applicationName: "CKlareza",
  alternates: {
    canonical: "/",
    languages: {
      "pt-BR": "/",
      "en-US": "/",
      "es-ES": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    alternateLocale: ["en_US", "es_ES"],
    url: SITE,
    siteName: "CKlareza",
    title: "CKlareza — Organize suas mentorias em um só lugar",
    description: DESC,
    images: [{ url: "/logo.jpg", width: 1200, height: 655, alt: "CKlareza — Lifetime Value" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CKlareza — Organize suas mentorias em um só lugar",
    description: DESC,
    images: ["/logo.jpg"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: { google: "I1MFavBSn25MdEPJkXDWWYi3URoBX1THuwlbSkhBuT0" },
}

// Alternates por página — injeta hreflang nas sub-páginas
export const SITE_URL = SITE

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a1420",
}

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quanto tempo leva para configurar o CKlareza?",
      "acceptedAnswer": { "@type": "Answer", "text": "5 minutos. Você cria conta, importa seus alunos e já está operando. Sem instalação, 100% web." }
    },
    {
      "@type": "Question",
      "name": "Preciso de cartão de crédito para testar o CKlareza?",
      "acceptedAnswer": { "@type": "Answer", "text": "Não. Você cria conta gratuitamente, explora o sistema e só entra com cartão quando quiser assinar. Teste de 14 dias sem cartão." }
    },
    {
      "@type": "Question",
      "name": "O Radar de Churn do CKlareza realmente funciona?",
      "acceptedAnswer": { "@type": "Answer", "text": "Sim. Ele analisa frequência de check-ins, padrões de resposta e engajamento do aluno — e avisa quando o sinal muda. Mentores que usam o Radar agem antes que o aluno decida cancelar." }
    },
    {
      "@type": "Question",
      "name": "O CKlareza é white-label?",
      "acceptedAnswer": { "@type": "Answer", "text": "Sim, nos planos com mais de 20 mentorados. Você usa seu logo, suas cores e seu domínio. Seus alunos veem só a sua marca." }
    },
    {
      "@type": "Question",
      "name": "Para quem é o CKlareza?",
      "acceptedAnswer": { "@type": "Answer", "text": "Para mentores e empresas de mentoria high-ticket que querem profissionalizar a operação, reduzir churn e escalar sem trabalhar mais horas." }
    },
    {
      "@type": "Question",
      "name": "Posso cancelar o CKlareza quando quiser?",
      "acceptedAnswer": { "@type": "Answer", "text": "Sim. Sem multa, sem burocracia. Cancele com 1 clique a qualquer momento." }
    },
    {
      "@type": "Question",
      "name": "O briefing com IA do CKlareza substitui o julgamento do mentor?",
      "acceptedAnswer": { "@type": "Answer", "text": "Não — ele potencializa. A IA organiza o que o aluno trouxe e sugere a pauta. Você decide o que usar. O resultado é entrar na call com 10x mais clareza, em 30 segundos." }
    },
  ]
}

const LOCAL_BUSINESS_JSONLD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE}/#localbusiness`,
  name: "CKlareza",
  description: DESC,
  url: SITE,
  telephone: "+5548974001405",
  email: "contactus@cklareza.com",
  image: `${SITE}/logo.jpg`,
  priceRange: "$$",
  currenciesAccepted: "BRL",
  paymentAccepted: "Credit Card, PIX",
  areaServed: { "@type": "Country", name: "Brasil" },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua 72, nº 223, Sala 1507",
    addressLocality: "Goiânia",
    addressRegion: "GO",
    postalCode: "74805-480",
    addressCountry: "BR",
  },
  geo: { "@type": "GeoCoordinates", latitude: "-16.6864", longitude: "-49.2643" },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    opens: "09:00", closes: "18:00",
  },
  sameAs: [
    "https://www.linkedin.com/in/cklareza-lifetime-value",
    "https://cklareza.com",
  ],
}

const JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "CKlareza",
      legalName: "Rodrigo R. S. Paes Ltda",
      alternateName: ["RP Sap IA", "CKlareza Lifetime Value"],
      url: SITE,
      logo: `${SITE}/logo.jpg`,
      slogan: "Lifetime Value",
      description: DESC,
      email: "contactus@cklareza.com",
      telephone: "+5548974001405",
      taxID: "59.722.807/0001-80",
      vatID: "BR59.722.807/0001-80",
      foundingDate: "2026",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rua 72, nº 223, Sala 1507 — Lote 12/15, Quadra C16, Jardim Goiás",
        addressLocality: "Goiânia",
        addressRegion: "GO",
        postalCode: "74805-480",
        addressCountry: "BR",
      },
      founder: {
        "@type": "Person",
        name: "Rodrigo Paes",
        jobTitle: "CEO & Fundador",
        email: "rodrigo.paes.rj@gmail.com",
      },
      employee: {
        "@type": "Person",
        name: "Rodrigo Paes",
        jobTitle: "CEO",
      },
      sameAs: ["https://www.linkedin.com/in/cklareza-lifetime-value"],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: "contactus@cklareza.com",
          telephone: "+5548974001405",
          availableLanguage: ["Portuguese", "English", "Spanish"],
        },
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "rodrigo.paes.rj@gmail.com",
          telephone: "+5548974001405",
          areaServed: "BR",
          availableLanguage: ["Portuguese"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      name: "CKlareza",
      url: SITE,
      publisher: { "@id": `${SITE}/#organization` },
      inLanguage: ["pt-BR", "en", "es"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE}/#software`,
      name: "CKlareza",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Plataforma de gestão de mentoria white-label",
      operatingSystem: "Web",
      description: DESC,
      url: SITE,
      inLanguage: ["pt-BR", "en", "es"],
      publisher: { "@id": `${SITE}/#organization` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL", description: "Teste sem cartão · planos sob consulta" },
      featureList: [
        "Dashboard de operação da mentoria",
        "Gestão financeira e cobranças com controle de inadimplência",
        "Gestão de atividades em Kanban (a fazer, atrasadas, concluídas)",
        "Briefing de call gerado por IA a partir dos check-ins do aluno",
        "Portal do aluno com check-in semanal e acompanhamento da jornada",
        "White-label: logo, cores e domínio próprios",
        "Multi-mentor por empresa com isolamento de dados por papel",
        "Radar de Churn: alerta antecipado de alunos em risco de cancelamento",
        "Perguntas personalizadas de check-in por mentor",
        "Histórico completo da jornada do aluno",
      ],
      audience: {
        "@type": "Audience",
        audienceType: "Mentores e empresas de mentoria high-ticket",
        geographicArea: { "@type": "Country", name: "Brasil" },
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "1",
        bestRating: "5",
        worstRating: "1",
      },
      review: {
        "@type": "Review",
        reviewBody: "A equipe parou de perder noites preparando pautas. Cancelamentos caíram pela metade. Faturamento cresceu 40%.",
        author: { "@type": "Organization", name: "Termo Laser" },
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      },
      potentialAction: {
        "@type": "RegisterAction",
        name: "Criar conta gratuita",
        target: `${SITE}/login`,
        description: "Crie sua conta gratuitamente, sem cartão de crédito",
      },
      screenshot: [
        `${SITE}/produto-dashboard.jpg`,
        `${SITE}/produto-financeiro.jpg`,
        `${SITE}/produto-atividades.jpg`,
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Anti-flash de tema: aplica html.dark ANTES da pintura (padrão = dark) */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('ck_theme');if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();` }} />
        {/* hreflang REMOVIDO do layout — cada página gera o próprio via metadata.alternates
            para evitar conflito entre tags genéricas (/) e as específicas de cada rota */}
        {/* PWA — iOS Safari (não lê manifest.json, precisa de meta tags próprias) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CKlareza" />
        <link rel="apple-touch-icon" href="/icon.png" />
        {/* PWA — Android Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSONLD) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
        {/* FAQ_JSONLD removido do layout global — foi para app/page.tsx (home only)
            para evitar conflito com FAQPage schemas específicos de /precos e /recursos */}
      </head>
      <body className="antialiased text-white" style={{ background: "#0a1420" }}>
        <BreadcrumbSchema />
        {children}
        <SiteAnalytics />
        <CookieBanner />
      </body>
    </html>
  )
}
