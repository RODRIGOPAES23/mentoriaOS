import type { Metadata } from "next"
import Link from "next/link"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import { SiteHeader, SiteFooter, SC } from "@/components/site/SiteChrome"

export const metadata: Metadata = {
  title: "Preços — Planos de Mentoria White-Label",
  description: "Planos sob medida para mentores e empresas de mentoria. Agende uma demonstração e descubra o plano ideal para a sua operação.",
  alternates: { canonical: "/precos" },
}

const PLANOS = [
  {
    nome: "Mentor", sub: "Para o mentor individual que quer profissionalizar a operação.",
    feats: ["Dashboard de operação", "Financeiro + cobranças", "Atividades em Kanban", "Portal do aluno", "Briefing com IA"],
    destaque: false,
  },
  {
    nome: "Empresa", sub: "White-label com a sua marca e vários mentores.", destaque: true,
    feats: ["Tudo do plano Mentor", "Marca, cores e domínio próprios", "Vários mentores", "Cada um vê só o que é seu", "Painel de gestão da empresa"],
  },
  {
    nome: "Enterprise", sub: "Para escalar e revender mentoria white-label.",
    feats: ["Tudo do plano Empresa", "Onboarding dedicado", "Volume de mentores/alunos", "Suporte prioritário", "Integrações sob medida"],
    destaque: false,
  },
]

export default function Precos() {
  return (
    <div style={{ background: SC.bg, color: "#fff" }} className="min-h-screen">
      <SiteHeader />
      <section className="max-w-4xl mx-auto px-5 pt-16 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Planos sob medida</h1>
        <p className="text-lg mt-5 max-w-2xl mx-auto" style={{ color: SC.muted }}>
          O CKlareza se adapta ao tamanho da sua operação. Agende uma conversa e montamos o plano ideal — sem surpresa, sem amarração.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-5 pb-16 grid md:grid-cols-3 gap-5 items-start">
        {PLANOS.map(p => (
          <div key={p.nome} className="rounded-2xl p-7 relative" style={{ background: SC.card, border: `1px solid ${p.destaque ? SC.gold : SC.border}`, boxShadow: p.destaque ? `0 20px 60px -20px ${SC.gold}33` : "none" }}>
            {p.destaque && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: SC.gold, color: "#1a1407" }}>Mais escolhido</span>}
            <h2 className="text-xl font-bold flex items-center gap-2">{p.destaque && <Sparkles className="w-4 h-4" style={{ color: SC.gold }} />}{p.nome}</h2>
            <p className="text-sm mt-1.5 min-h-[40px]" style={{ color: SC.muted }}>{p.sub}</p>
            <p className="text-2xl font-bold mt-4" style={{ color: SC.goldL }}>Sob consulta</p>
            <ul className="mt-5 space-y-2.5">
              {p.feats.map(f => <li key={f} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: SC.teal }} /> {f}</li>)}
            </ul>
            <Link href="/contato" className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
              style={p.destaque ? { background: SC.gold, color: "#1a1407" } : { background: SC.bg, border: `1px solid ${SC.border}`, color: "#fff" }}>
              Falar com a gente <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </section>

      <section className="max-w-3xl mx-auto px-5 py-16 text-center">
        <p className="text-lg" style={{ color: SC.muted }}>Quer ver funcionando antes de decidir?</p>
        <Link href="/contato" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold mt-5" style={{ background: SC.gold, color: "#1a1407" }}>Agende uma demonstração <ArrowRight className="w-5 h-5" /></Link>
      </section>
      <SiteFooter />
    </div>
  )
}
