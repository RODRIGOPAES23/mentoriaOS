import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"

const C = { bg: "#0a1420", card: "#0f2030", border: "#1e3450", muted: "#7fa0bd", gold: "#d4af37", goldL: "#f0d97d", teal: "#13a3a3" }

export const metadata: Metadata = {
  title: "Blog — Gestão e Retenção em Mentoria",
  description: "Estratégias de acompanhamento, retenção e Lifetime Value para mentores e empresas de mentoria. Conteúdo prático da CKlareza.",
  alternates: { canonical: "/blog" },
}

const POSTS = [
  {
    slug: "/blog/como-aumentar-a-retencao-de-mentorados",
    cat: "Retenção",
    titulo: "Como aumentar a retenção de mentorados (e o Lifetime Value)",
    resumo: "5 alavancas práticas para reter mentorados, reduzir cancelamentos e aumentar o valor de cada aluno ao longo do tempo.",
    data: "03 jun 2026",
  },
]

export default function BlogIndex() {
  return (
    <div style={{ background: C.bg, color: "#fff" }} className="min-h-screen">
      <header className="px-5 h-16 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: C.gold }} />
          <span className="font-bold" style={{ background: `linear-gradient(180deg, ${C.goldL}, ${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>CKlareza</span>
        </Link>
        <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: C.gold, color: "#1a1407" }}>Entrar</Link>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-12">
        <p className="text-xs font-bold tracking-widest mb-2" style={{ color: C.teal }}>BLOG CKLAREZA</p>
        <h1 className="text-3xl md:text-4xl font-bold">Gestão e retenção em mentoria</h1>
        <p className="mt-3 text-lg" style={{ color: C.muted }}>Estratégias práticas para profissionalizar sua mentoria e aumentar o Lifetime Value.</p>

        <div className="grid gap-5 mt-10">
          {POSTS.map(p => (
            <Link key={p.slug} href={p.slug} className="block rounded-2xl p-6 transition-all hover:-translate-y-1" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-3 text-xs mb-2" style={{ color: C.muted }}>
                <span className="px-2 py-0.5 rounded-full" style={{ background: `${C.teal}18`, color: C.teal }}>{p.cat}</span>
                <span>{p.data}</span>
              </div>
              <h2 className="text-xl font-bold text-white">{p.titulo}</h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: C.muted }}>{p.resumo}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold mt-4" style={{ color: C.goldL }}>Ler artigo <ArrowRight className="w-4 h-4" /></span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
