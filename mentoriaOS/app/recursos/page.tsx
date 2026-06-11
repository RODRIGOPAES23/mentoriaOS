import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { LayoutDashboard, DollarSign, KanbanSquare, Brain, Phone, Building2, ArrowRight, Check, ChevronDown } from "lucide-react"
import { SiteHeader, SiteFooter, LifetimeValueCTA, SC } from "@/components/site/SiteChrome"

const FAQ_RECURSOS = [
  { q: "O CKlareza funciona no celular?", a: "Sim. O CKlareza é 100% web e responsivo — funciona em qualquer dispositivo (celular, tablet, notebook) sem instalação. O portal do aluno também é otimizado para mobile." },
  { q: "Como funciona o briefing com IA?", a: "Antes de cada call, a IA do CKlareza lê os últimos check-ins do aluno e gera automaticamente um diagnóstico do gargalo atual e uma pauta sugerida para a sessão. O processo leva menos de 30 segundos. O mentor revisa, ajusta se quiser, e entra na call já preparado." },
  { q: "Quanto tempo leva para configurar o CKlareza?", a: "5 minutos. Você cria a conta, importa ou cadastra seus alunos, e já está operando. Não há instalação, servidor ou configuração técnica. Tudo é web, tudo é imediato." },
  { q: "O portal do aluno é realmente white-label?", a: "Sim. O portal onde o aluno faz check-in, acessa materiais e acompanha sua jornada usa o seu logo, suas cores e pode ser acessado pelo seu domínio próprio. O aluno não vê nenhuma menção ao CKlareza." },
  { q: "O CKlareza tem integração com WhatsApp ou Calendly?", a: "O CKlareza centraliza o que hoje está espalhado em Calendly, Google Drive, planilhas e WhatsApp. A agenda de calls, os materiais e o histórico do aluno ficam dentro da plataforma. A comunicação via WhatsApp permanece com você — não substituímos ela, complementamos com estrutura." },
  { q: "Os dados dos meus alunos ficam seguros?", a: "Sim. Dados em trânsito são protegidos por HTTPS e em repouso com criptografia de nível enterprise (infraestrutura Supabase). Cada empresa e mentor tem ambiente lógico separado. Você é o controlador dos dados — pode exportar ou deletar a qualquer momento." },
]

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_RECURSOS.map(f => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
}

export const metadata: Metadata = {
  title: "Recursos — Financeiro, Atividades e IA para Mentoria",
  description: "Dashboard de operação, financeiro inteligente, Kanban de atividades, briefing com IA e portal do aluno. Tudo para operar sua mentoria white-label.",
  alternates: { canonical: "/recursos", languages: { "pt-BR": "/recursos", "en-US": "/recursos", "es-ES": "/recursos", "x-default": "/recursos" } },
  openGraph: { url: "https://cklareza.com/recursos" },
}

const FEATURES = [
  { icon: LayoutDashboard, cor: SC.teal, t: "Dashboard de operação", d: "Pendências financeiras, próximas calls, progresso de tarefas e renovações numa tela só — sem rolar. Você bate o olho e sabe o que fazer." },
  { icon: DollarSign, cor: "#22c55e", t: "Financeiro inteligente", d: "Crie cobranças, veja inadimplência e projeção. Cada pagamento editável (data, valor, status). Saiba quem paga, quanto e quando — e cobre no momento certo." },
  { icon: KanbanSquare, cor: "#4c9aff", t: "Atividades em Kanban", d: "As tarefas de todos os mentorados num quadro global: a fazer, atrasadas e concluídas. Arraste para mudar o status. Nada cai no esquecimento." },
  { icon: Brain, cor: "#a855f7", t: "Briefing com IA", d: "A IA lê os check-ins do aluno e entrega o diagnóstico do gargalo + a pauta da próxima call, prontos. Você chega em cada sessão sabendo exatamente o que tratar." },
  { icon: Phone, cor: SC.gold, t: "Calls + Portal do aluno", d: "Agenda, esteira de calls (do agendamento à análise) e um portal onde o mentorado faz check-in, vê tarefas e acompanha a jornada." },
  { icon: Building2, cor: SC.teal, t: "White-label completo", d: "Seu logo, suas cores e seu domínio próprio. Vários mentores por empresa, cada um vendo só o que é seu. O motor é o CKlareza; a marca é a sua." },
]

export default function Recursos() {
  return (
    <div style={{ background: SC.bg, color: SC.text }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      <SiteHeader />
      <section className="max-w-4xl mx-auto px-5 pt-16 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Tudo para operar sua mentoria</h1>
        <p className="text-lg mt-5 max-w-2xl mx-auto" style={{ color: SC.muted }}>Um sistema, não dez planilhas. Do financeiro ao briefing com IA — com a sua marca.</p>
      </section>

      <section className="max-w-5xl mx-auto px-5 pb-16 grid md:grid-cols-2 gap-5">
        {FEATURES.map(f => (
          <div key={f.t} className="rounded-2xl p-7" style={{ background: SC.card, border: `1px solid ${SC.border}` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.cor}18`, border: `1px solid ${f.cor}33` }}>
              <f.icon className="w-6 h-6" style={{ color: f.cor }} />
            </div>
            <h2 className="font-bold text-xl">{f.t}</h2>
            <p className="mt-2 leading-relaxed" style={{ color: SC.muted }}>{f.d}</p>
          </div>
        ))}
      </section>

      {/* Por dentro do produto (telas reais) */}
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">Por dentro do produto</h2>
          <p className="text-lg mt-2" style={{ color: SC.muted }}>Telas reais da plataforma — sem mockup.</p>
        </div>
        <div className="space-y-8">
          {[
            ["produto-dashboard", "Dashboard de operação: pendências, calls, progresso e renovações numa tela."],
            ["produto-atividades", "Atividades em Kanban: a fazer, atrasadas e concluídas — de todos os mentorados."],
            ["produto-financeiro", "Financeiro: cobranças, inadimplência e projeção, com cada pagamento editável."],
          ].map(([img, cap]) => (
            <figure key={img} className="rounded-2xl p-1.5 overflow-hidden" style={{ background: SC.card, border: `1px solid ${SC.border}`, boxShadow: `0 24px 70px -28px rgb(var(--sc-teal-rgb) / 0.25)` }}>
              <Image src={`/${img}.jpg`} alt={cap} width={1440} height={880} sizes="(max-width: 1024px) 100vw, 1024px" className="w-full h-auto rounded-xl block" />
              <figcaption className="text-center text-sm py-3 px-4" style={{ color: SC.muted }}>{cap}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Caso real */}
      <section className="py-16" style={{ background: SC.card, borderTop: `1px solid ${SC.border}`, borderBottom: `1px solid ${SC.border}` }}>
        <div className="max-w-3xl mx-auto px-5 text-center">
          <span className="text-xs font-bold tracking-widest" style={{ color: SC.teal }}>CASO REAL</span>
          <p className="text-2xl md:text-3xl font-semibold mt-4 leading-snug">
            A <strong style={{ color: SC.goldL }}>Termo Laser</strong> opera a mentoria dela na CKlareza —
            com a própria marca, seus mentores e seus mentorados, tudo num só lugar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-7 text-sm" style={{ color: SC.muted }}>
            {["Marca própria", "Vários mentores", "Acompanhamento com IA"].map(x => (
              <span key={x} className="flex items-center gap-1.5"><Check className="w-4 h-4" style={{ color: SC.gold }} /> {x}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — rich snippets */}
      <section className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Perguntas frequentes sobre o CKlareza</h2>
        <div className="space-y-4">
          {FAQ_RECURSOS.map((f, i) => (
            <details key={i} className="rounded-2xl group" style={{ background: SC.card, border: `1px solid ${SC.border}` }}>
              <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold select-none list-none">
                <span>{f.q}</span>
                <ChevronDown className="w-4 h-4 shrink-0 ml-3 transition-transform group-open:rotate-180" style={{ color: SC.teal }} />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: SC.muted }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Pronto para ver na prática?</h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
          <Link href="/contato" className="px-6 py-3.5 rounded-xl font-bold inline-flex items-center justify-center gap-2" style={{ background: SC.gold, color: "#1a1407" }}>Agende uma demonstração <ArrowRight className="w-5 h-5" /></Link>
          <Link href="/login" className="px-6 py-3.5 rounded-xl font-semibold" style={{ background: SC.card, border: `1px solid ${SC.border}`, color: SC.text }}>Acessar o sistema</Link>
        </div>
      </section>
      <LifetimeValueCTA />
      <SiteFooter />
    </div>
  )
}
