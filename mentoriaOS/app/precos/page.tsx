import type { Metadata } from "next"
import { SiteHeader, SiteFooter, LifetimeValueCTA, SC } from "@/components/site/SiteChrome"
import PricingCalc from "./PricingCalc"

export const metadata: Metadata = {
  title: "Preços — Planos de Mentoria White-Label",
  description: "Calcule seu desconto real. Preço por mentorado com até 80% de desconto. Planos sob medida para mentores e empresas de mentoria.",
  alternates: { canonical: "/precos" },
  openGraph: { url: "https://cklareza.com/precos" },
}

export default function Precos() {
  return (
    <div style={{ background: SC.bg, color: SC.text }} className="min-h-screen">
      <SiteHeader />

      {/* Hero da página */}
      <section className="max-w-4xl mx-auto px-5 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: SC.text }}>
          Planos sob medida
        </h1>
        <p className="text-lg mt-4 max-w-2xl mx-auto" style={{ color: SC.muted }}>
          Preço por mentorado — quanto maior sua operação, maior o desconto.
          Use a calculadora abaixo para ver exatamente quanto você vai pagar.
        </p>
      </section>

      {/* Calculadora + Tabela + Cards (client component) */}
      <PricingCalc />

      <LifetimeValueCTA />
      <SiteFooter />
    </div>
  )
}
