import type { Metadata } from "next"
import Link from "next/link"
import { Heart, Target, ShieldCheck, ArrowRight } from "lucide-react"
import { SiteHeader, SiteFooter, SC } from "@/components/site/SiteChrome"

export const metadata: Metadata = {
  title: "Sobre — Nosso propósito é transformar vidas",
  description: "A CKlareza existe para dar ao mentor o tempo e a clareza de transformar a vida de quem confia nele. Conheça nosso propósito e nossos valores.",
  alternates: { canonical: "/sobre" },
}

const VALORES = [
  { icon: Target, cor: SC.teal, t: "Clareza acima de tudo", d: "Decisão boa nasce de informação clara. Tiramos o mentor do escuro: ele vê quem precisa de atenção agora." },
  { icon: ShieldCheck, cor: SC.gold, t: "A marca é do cliente", d: "White-label de verdade. Você entrega uma experiência premium com a sua identidade — o motor fica invisível." },
  { icon: Heart, cor: "#ff5470", t: "Transformar vidas", d: "Cada recurso serve a um fim maior: mais retenção significa mais vidas verdadeiramente transformadas." },
]

export default function Sobre() {
  return (
    <div style={{ background: SC.bg, color: "#fff" }} className="min-h-screen">
      <SiteHeader />

      <section className="max-w-3xl mx-auto px-5 pt-20 pb-12 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: `${SC.gold}18`, border: `1px solid ${SC.gold}44` }}>
          <Heart className="w-7 h-7" style={{ color: SC.gold }} />
        </div>
        <span className="text-xs font-bold tracking-[0.3em]" style={{ color: SC.teal }}>NOSSO PROPÓSITO</span>
        <h1 className="text-4xl md:text-6xl font-bold mt-4" style={{ background: `linear-gradient(90deg, ${SC.goldL}, ${SC.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Transformar vidas.</h1>
        <p className="text-lg md:text-xl mt-6 leading-relaxed" style={{ color: SC.muted }}>
          A CKlareza não nasceu para vender software. Nasceu para devolver ao mentor o recurso mais escasso que ele tem —
          <strong className="text-white"> tempo e clareza</strong> — para fazer o que realmente importa: transformar a vida de quem confia nele.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-5 pb-16 grid md:grid-cols-3 gap-5">
        {VALORES.map(v => (
          <div key={v.t} className="rounded-2xl p-7" style={{ background: SC.card, border: `1px solid ${SC.border}` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${v.cor}18`, border: `1px solid ${v.cor}33` }}>
              <v.icon className="w-6 h-6" style={{ color: v.cor }} />
            </div>
            <h2 className="font-bold text-lg">{v.t}</h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: SC.muted }}>{v.d}</p>
          </div>
        ))}
      </section>

      <section className="py-16" style={{ background: SC.card, borderTop: `1px solid ${SC.border}` }}>
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Por que "Lifetime Value"?</h2>
          <p className="text-lg mt-4 leading-relaxed" style={{ color: SC.muted }}>
            Porque o sucesso de uma mentoria não está em vender uma vez — está em acompanhar de perto, gerar resultado e
            manter a relação viva ao longo do tempo. É isso que constrói valor de verdade, para o mentorado e para o mentor.
          </p>
          <Link href="/contato" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold mt-8" style={{ background: SC.gold, color: "#1a1407" }}>
            Fale com a gente <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
