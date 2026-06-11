import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2, Zap, Users, BarChart3, Layers } from "lucide-react"
import { SiteHeader, SiteFooter } from "@/components/site/SiteChrome"

const SITE = "https://cklareza.com"
const SLUG = "/blog/como-escalar-mentoria"
const TITLE = "Como Escalar sua Mentoria sem Trabalhar Mais Horas"
const DESC = "Escalar mentoria não significa atender mais pessoas — significa atender mais pessoas com a mesma qualidade, sem aumentar sua carga de trabalho. Veja como fazer isso com sistema e IA."
const DATE = "2026-06-09"

const C = { bg: "#ffffff", card: "#f8f9fa", card2: "#f3f4f6", border: "#e5e7eb", muted: "#6b7280", text: "#1f2937", gold: "#d4af37", goldL: "#f0d97d", teal: "#0f8a8a" }

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: SLUG, languages: { "pt-BR": SLUG, "x-default": SLUG } },
  openGraph: { type: "article", url: `${SITE}${SLUG}`, title: TITLE, description: DESC, images: ["/logo.jpg"], locale: "pt_BR", publishedTime: DATE },
  keywords: ["como escalar mentoria", "escalar mentoria high ticket", "mentoria em escala", "como crescer mentoria", "sistema para escalar mentoria", "mentoria com mais alunos", "gestão de mentoria em escala"],
}

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: TITLE, description: DESC,
  datePublished: DATE, dateModified: DATE,
  author: { "@type": "Organization", name: "CKlareza", url: SITE },
  publisher: { "@type": "Organization", name: "CKlareza", logo: { "@type": "ImageObject", url: `${SITE}/logo.jpg` } },
  mainEntityOfPage: `${SITE}${SLUG}`,
  image: `${SITE}/logo.jpg`,
  inLanguage: "pt-BR",
}

const HOWTO_JSONLD = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Como escalar sua mentoria sem trabalhar mais",
  description: "Como aumentar o número de mentorados sem aumentar proporcionalmente as horas trabalhadas.",
  step: [
    { "@type": "HowToStep", name: "Padronize o processo de onboarding", text: "Crie um checklist padrão de boas-vindas, materiais de início e primeira call estruturada. Com processo padrão, adicionar um novo aluno leva 15 minutos em vez de 2 horas." },
    { "@type": "HowToStep", name: "Implemente check-in semanal estruturado", text: "Check-in semanal substitui múltiplas mensagens no WhatsApp. Em vez de responder dúvidas dispersas, você lê 1 formulário por aluno e entra na call já com o contexto completo." },
    { "@type": "HowToStep", name: "Use IA para preparar as calls", text: "Briefing com IA lê os check-ins e gera a pauta da call em 30 segundos. De 45 minutos de preparação para 2 minutos — por cada call, para cada aluno." },
    { "@type": "HowToStep", name: "Centralize tudo em um sistema", text: "Dashboard único: financeiro, atividades, calls, progresso de cada aluno. Sem sistema, cada aluno novo aumenta linearmente a carga mental. Com sistema, o crescimento é gerenciado." },
    { "@type": "HowToStep", name: "Adicione mentores à sua equipe", text: "Com white-label e multi-mentor, você cria uma estrutura onde outros mentores atendem sob a sua marca, com seus processos. Você escala a operação, não só o número de alunos seus." },
  ],
}

const GARGALOS = [
  { titulo: "Preparação de call", antes: "45 min por aluno", depois: "2 min com briefing IA", icon: Zap, melhora: "−96% de tempo" },
  { titulo: "Onboarding de aluno novo", antes: "2–3 horas de setup", depois: "15 min com processo padrão", icon: Users, melhora: "−87% de tempo" },
  { titulo: "Monitoramento de progresso", antes: "WhatsApp + planilha todo dia", depois: "Dashboard com 1 olhada", icon: BarChart3, melhora: "Elimina caos" },
  { titulo: "Gestão financeira", antes: "Planilha + cobranças manuais", depois: "Automático com alertas", icon: Layers, melhora: "Zero esquecimentos" },
]

const NIVEIS = [
  { nivel: "Nível 1 · Solo", alunos: "5–15 mentorados", como: "Você atende tudo sozinho. Sistema organiza. IA agiliza as calls.", limite: "Tempo da semana" },
  { nivel: "Nível 2 · Time pequeno", alunos: "15–50 mentorados", como: "1-2 mentores assistentes com acesso separado no sistema.", limite: "Qualidade de atendimento" },
  { nivel: "Nível 3 · Empresa", alunos: "50–200 mentorados", como: "Equipe de mentores, white-label completo, processos documentados.", limite: "Capacidade de recrutamento" },
  { nivel: "Nível 4 · Plataforma", alunos: "200+ mentorados", como: "Sua marca, múltiplos programas, estrutura empresarial completa.", limite: "Visão estratégica e capital" },
]

export default function ComoEscalarMentoria() {
  return (
    <div style={{ background: C.bg, color: C.text }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO_JSONLD) }} />
      <SiteHeader />

      <article className="max-w-3xl mx-auto px-5 pt-14 pb-20">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-80" style={{ color: C.muted }}>
          <ArrowLeft className="w-4 h-4" /> Blog
        </Link>

        <div className="mb-8">
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: C.teal }}>Escala & Operação</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-3 leading-tight">{TITLE}</h1>
          <p className="text-lg mt-4 leading-relaxed" style={{ color: C.muted }}>{DESC}</p>
          <div className="flex items-center gap-4 mt-5 text-sm" style={{ color: C.muted }}>
            <span>CKlareza · {new Date(DATE).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
            <span>·</span><span>9 min de leitura</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-10 mb-4">O mito da escala em mentoria</h2>
        <p className="text-lg leading-relaxed mb-4" style={{ color: C.muted }}>
          A maioria dos mentores acredita que escalar significa simplesmente aceitar mais alunos. O resultado é previsível: qualidade cai, churn aumenta, mentor fica exausto, e o crescimento para sozinho.
        </p>
        <p className="text-lg leading-relaxed mb-10" style={{ color: C.muted }}>
          Escala real em mentoria tem uma definição diferente: <strong style={{ color: C.text }}>aumentar o número de alunos sem aumentar proporcionalmente as horas trabalhadas.</strong> Isso exige sistema, processo e ferramentas — não apenas mais energia.
        </p>

        {/* GARGALOS */}
        <h2 className="text-2xl font-bold mb-6">Os 4 gargalos que impedem a escala</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {GARGALOS.map((g, i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${C.teal}12` }}>
                <g.icon className="w-5 h-5" style={{ color: C.teal }} />
              </div>
              <h3 className="font-bold text-sm">{g.titulo}</h3>
              <div className="mt-2 space-y-1">
                <p className="text-xs" style={{ color: "#ef4444" }}>Antes: {g.antes}</p>
                <p className="text-xs" style={{ color: C.teal }}>Depois: {g.depois}</p>
              </div>
              <p className="text-xs font-bold mt-2 px-2 py-1 rounded inline-block" style={{ background: `${C.teal}12`, color: C.teal }}>{g.melhora}</p>
            </div>
          ))}
        </div>

        {/* COMO ESCALAR */}
        <h2 className="text-2xl font-bold mb-6">Como escalar em 5 passos</h2>
        <div className="space-y-6 mb-12">
          {HOWTO_JSONLD.step.map((s, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm" style={{ background: `${C.teal}15`, color: C.teal }}>{i + 1}</div>
              <div>
                <h3 className="font-bold">{s.name}</h3>
                <p className="text-sm mt-1 leading-relaxed" style={{ color: C.muted }}>{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* NÍVEIS DE ESCALA */}
        <h2 className="text-2xl font-bold mb-6">Os 4 níveis de escala em mentoria</h2>
        <div className="space-y-4 mb-12">
          {NIVEIS.map((n, i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold">{n.nivel}</h3>
                <span className="text-xs font-bold px-2 py-1 rounded whitespace-nowrap" style={{ background: `${C.teal}12`, color: C.teal }}>{n.alunos}</span>
              </div>
              <p className="text-sm mb-1" style={{ color: C.muted }}>{n.como}</p>
              <p className="text-xs" style={{ color: C.muted }}>Limite atual: <em>{n.limite}</em></p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-7 mb-10" style={{ background: `${C.teal}08`, border: `1px solid ${C.teal}25` }}>
          <h3 className="text-xl font-bold mb-2">Caso real: Termo Laser</h3>
          <p className="leading-relaxed" style={{ color: C.muted }}>
            A Termo Laser escalou sua operação de mentoria usando o CKlareza como base. O tempo de preparação por call caiu de 45 para 2 minutos com o briefing de IA. O churn caiu pela metade com o Radar de Churn. O MRR cresceu 40% em 6 meses — sem o mentor trabalhar mais horas.
          </p>
          <div className="flex gap-4 mt-4">
            {["−50% Churn", "+40% MRR", "45→2min prep/call"].map((s, i) => (
              <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.teal }}>{s}</span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-8 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="text-2xl font-bold mb-2">Pronto para escalar sua mentoria?</h3>
          <p className="mb-6" style={{ color: C.muted }}>Sistema completo para organizar, automatizar e crescer — com a sua marca. Setup em 5 minutos.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold" style={{ background: C.teal, color: "#ffffff" }}>
              Criar conta gratuita <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/recursos" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold" style={{ background: C.card2, border: `1px solid ${C.border}`, color: C.text }}>
              Ver todos os recursos
            </Link>
          </div>
        </div>

        <div className="mt-14">
          <p className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: C.muted }}>Leia também</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { href: "/blog/como-cobrar-mentoria", titulo: "Como cobrar mentoria high-ticket" },
              { href: "/blog/como-reduzir-churn-mentoria", titulo: "Como reduzir o churn na sua mentoria" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="flex items-center gap-3 p-4 rounded-xl group" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <span className="text-sm font-medium group-hover:underline">{l.titulo}</span>
                <ArrowRight className="w-4 h-4 shrink-0 ml-auto" style={{ color: C.teal }} />
              </Link>
            ))}
          </div>
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}
