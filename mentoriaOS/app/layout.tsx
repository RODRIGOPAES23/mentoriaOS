import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CookieBanner } from "@/components/site/CookieBanner"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

const SITE = "https://cklareza.com"
const DESC = "Plataforma de mentoria white-label com IA: organize financeiro, atividades e calls e veja, com clareza, quem precisa de você agora. Sua marca, nosso motor."

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "CKlareza — Plataforma de Mentoria White-Label com IA",
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
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    alternateLocale: ["en_US", "es_ES"],
    url: SITE,
    siteName: "CKlareza",
    title: "CKlareza — Plataforma de Mentoria White-Label com IA",
    description: DESC,
    images: [{ url: "/logo.jpg", width: 1200, height: 655, alt: "CKlareza — Lifetime Value" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CKlareza — Mentoria White-Label com IA",
    description: DESC,
    images: ["/logo.jpg"],
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: { google: "I1MFavBSn25MdEPJkXDWWYi3URoBX1THuwlbSkhBuT0" },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a1420",
}

const JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "CKlareza",
      url: SITE,
      logo: `${SITE}/logo.jpg`,
      slogan: "Lifetime Value",
      description: DESC,
      email: "contactus@cklareza.com",
      sameAs: ["https://www.linkedin.com/in/cklareza-lifetime-value"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "contactus@cklareza.com",
        telephone: "+5548974001405",
        availableLanguage: ["Portuguese", "English", "Spanish"],
      },
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
      ],
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
        {/* hreflang — indica ao Google as versões por idioma */}
        <link rel="alternate" hrefLang="pt-BR" href="https://cklareza.com/" />
        <link rel="alternate" hrefLang="en"    href="https://cklareza.com/" />
        <link rel="alternate" hrefLang="es"    href="https://cklareza.com/" />
        <link rel="alternate" hrefLang="x-default" href="https://cklareza.com/" />
        {/* PWA — iOS Safari (não lê manifest.json, precisa de meta tags próprias) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CKlareza" />
        <link rel="apple-touch-icon" href="/icon.png" />
        {/* PWA — Android Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
      </head>
      <body className="antialiased text-white" style={{ background: "#0a1420" }}>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
