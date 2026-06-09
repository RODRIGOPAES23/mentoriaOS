import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MessageCircle, Calendar, ArrowRight, Linkedin } from "lucide-react"
import { SiteHeader, SiteFooter, LifetimeValueCTA, SC } from "@/components/site/SiteChrome"

export const metadata: Metadata = {
  title: "Contato — Agende uma demonstração da CKlareza",
  description: "Fale com a CKlareza: agende uma demonstração e veja a plataforma de mentoria white-label funcionando com a sua marca.",
  alternates: { canonical: "/contato", languages: { "pt-BR": "/contato", "en-US": "/contato", "es-ES": "/contato", "x-default": "/contato" } },
  openGraph: { url: "https://cklareza.com/contato" },
}

const EMAIL = "contactus@cklareza.com"
const WHATS = "5548974001405"
const WHATS_LABEL = "+55 48 97400-1405"

export default function Contato() {
  return (
    <div style={{ background: SC.bg, color: SC.text }} className="min-h-screen">
      <SiteHeader />

      <section className="max-w-3xl mx-auto px-5 pt-20 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Vamos conversar?</h1>
        <p className="text-lg mt-5" style={{ color: SC.muted }}>
          Quer levar a CKlareza para a sua mentoria ou empresa? Agende uma demonstração e veja a plataforma com a sua marca.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-5 pb-12 grid grid-cols-2 md:grid-cols-4 gap-5">
        <a href={`mailto:${EMAIL}?subject=Quero%20conhecer%20a%20CKlareza`} className="rounded-2xl p-7 text-center transition-all hover:-translate-y-1" style={{ background: SC.card, border: `1px solid ${SC.border}` }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `rgb(var(--sc-gold-rgb) / 0.09)`, border: `1px solid rgb(var(--sc-gold-rgb) / 0.2)` }}><Mail className="w-6 h-6" style={{ color: SC.gold }} /></div>
          <p className="font-bold">E-mail</p>
          <p className="text-sm mt-1" style={{ color: SC.muted }}>{EMAIL}</p>
        </a>
        <a href={`mailto:${EMAIL}?subject=Quero%20agendar%20uma%20demonstra%C3%A7%C3%A3o`} className="rounded-2xl p-7 text-center transition-all hover:-translate-y-1" style={{ background: SC.card, border: `1px solid rgb(var(--sc-gold-rgb) / 0.27)` }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `rgb(var(--sc-teal-rgb) / 0.09)`, border: `1px solid rgb(var(--sc-teal-rgb) / 0.2)` }}><Calendar className="w-6 h-6" style={{ color: SC.teal }} /></div>
          <p className="font-bold">Agende uma demo</p>
          <p className="text-sm mt-1" style={{ color: SC.muted }}>30 min, sob medida</p>
        </a>
        <a href={`https://wa.me/${WHATS}?text=Ol%C3%A1!%20Quero%20conhecer%20a%20CKlareza.`} target="_blank" rel="noopener noreferrer" className="rounded-2xl p-7 text-center transition-all hover:-translate-y-1" style={{ background: SC.card, border: `1px solid ${SC.border}` }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "#22c55e18", border: "1px solid #22c55e33" }}><MessageCircle className="w-6 h-6" style={{ color: "#22c55e" }} /></div>
          <p className="font-bold">WhatsApp</p>
          <p className="text-sm mt-1" style={{ color: SC.muted }}>{WHATS_LABEL}</p>
        </a>
        <a href="https://www.linkedin.com/in/cklareza-lifetime-value" target="_blank" rel="noopener noreferrer" className="rounded-2xl p-7 text-center transition-all hover:-translate-y-1" style={{ background: SC.card, border: `1px solid ${SC.border}` }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "#0a66c218", border: "1px solid #0a66c244" }}><Linkedin className="w-6 h-6" style={{ color: "#4c9aff" }} /></div>
          <p className="font-bold">LinkedIn</p>
          <p className="text-sm mt-1" style={{ color: SC.muted }}>/cklareza</p>
        </a>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-20 text-center">
        <div className="rounded-2xl p-8" style={{ background: SC.card, border: `1px solid rgb(var(--sc-gold-rgb) / 0.2)` }}>
          <p className="text-lg font-semibold">Prefere ver agora?</p>
          <p className="mt-2 text-sm" style={{ color: SC.muted }}>Acesse o sistema e explore — teste sem cartão.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold mt-5" style={{ background: SC.gold, color: "#1a1407" }}>Acessar o sistema <ArrowRight className="w-5 h-5" /></Link>
        </div>
      </section>
      <LifetimeValueCTA />
      <SiteFooter />
    </div>
  )
}
