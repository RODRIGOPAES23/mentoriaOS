import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { SiteHeader, SiteFooter, SC } from "@/components/site/SiteChrome"

const SITE = "https://cklareza.com"

export const metadata: Metadata = {
  title: "Glossário de Mentoria — Termos e Definições | CKlareza",
  description: "Definições claras dos principais termos de mentoria: churn, check-in, white-label, briefing de call, MRR, high-ticket. Glossário completo para mentores profissionais.",
  alternates: { canonical: "/glossario", languages: { "pt-BR": "/glossario", "x-default": "/glossario" } },
  openGraph: { url: `${SITE}/glossario` },
  keywords: ["glossário mentoria", "termos de mentoria", "o que é churn", "o que é check-in de mentoria", "o que é white label mentoria", "definições mentoria"],
}

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "Glossário de Mentoria — CKlareza",
  description: "Definições dos principais termos usados em mentoria profissional high-ticket.",
  url: `${SITE}/glossario`,
  inLanguage: "pt-BR",
}

const TERMOS = [
  {
    termo: "Check-in de Mentoria",
    ancora: "check-in",
    definicao: "Formulário ou relatório periódico (geralmente semanal) que o mentorado preenche para atualizar o mentor sobre seu progresso, dificuldades e conquistas. O check-in substitui mensagens dispersas no WhatsApp e cria um histórico estruturado que o mentor pode usar para preparar a próxima call.",
    relacionado: { texto: "Como fazer check-in semanal com mentorados", href: "/blog/como-fazer-checkin-semanal-com-mentorados" },
  },
  {
    termo: "Churn em Mentoria",
    ancora: "churn",
    definicao: "Cancelamento de alunos ativos — seja por pedido explícito, inadimplência ou simplesmente por não renovar. Em mentoria high-ticket, cada churn representa perda de R$5.000 a R$20.000 de receita anual. Churn invisível é o mais perigoso: o aluno sinaliza a saída semanas antes de cancelar (para de responder check-ins, falta calls, respostas ficam curtas), mas o mentor sem sistema não percebe.",
    relacionado: { texto: "Como reduzir o churn na sua mentoria", href: "/blog/como-reduzir-churn-mentoria" },
  },
  {
    termo: "White-Label em Mentoria",
    ancora: "white-label",
    definicao: "Modelo onde o mentor usa a tecnologia de uma plataforma mas seus alunos veem apenas a marca do mentor — logo, cores e domínio próprios, sem menção ao software por baixo. White-label real significa que o aluno não vê 'Powered by X' em nenhum canto. Em mentoria high-ticket, white-label é fundamental para justificar tickets mais altos e criar vínculo do aluno com o mentor (não com a plataforma).",
    relacionado: { texto: "Plataforma de mentoria white-label: o que é", href: "/blog/plataforma-mentoria-white-label" },
  },
  {
    termo: "Briefing de Call",
    ancora: "briefing",
    definicao: "Documento preparatório que o mentor lê antes de cada sessão com um aluno. Contém o diagnóstico do gargalo atual do aluno e a pauta sugerida para a call. Um briefing eficaz é gerado a partir dos últimos check-ins do aluno e permite que o mentor entre na sessão com contexto completo em 2 minutos em vez de 45. Com IA, o briefing é gerado automaticamente.",
    relacionado: { texto: "Como funciona o briefing com IA do CKlareza", href: "/recursos" },
  },
  {
    termo: "MRR — Monthly Recurring Revenue",
    ancora: "mrr",
    definicao: "Receita recorrente mensal — a soma de todas as mensalidades ativas no mês. Para mentores com modelo de assinatura, o MRR é o indicador mais importante do negócio: ele mostra a previsibilidade da receita e o crescimento real mês a mês. MRR = número de alunos ativos × ticket médio mensal.",
    relacionado: { texto: "Como escalar sua mentoria", href: "/blog/como-escalar-mentoria" },
  },
  {
    termo: "High-Ticket em Mentoria",
    ancora: "high-ticket",
    definicao: "Modelo de mentoria com ticket elevado — geralmente acima de R$2.000/mês por aluno. Mentoria high-ticket é baseada em resultado, acompanhamento próximo e experiência premium. O mentor high-ticket atende menos alunos, cobra mais por cada um e gera resultado mensurável. A percepção de profissionalismo (plataforma, portal, processo) é parte fundamental da justificativa do preço.",
    relacionado: { texto: "Como cobrar mentoria high-ticket", href: "/blog/como-cobrar-mentoria" },
  },
  {
    termo: "Radar de Churn",
    ancora: "radar-churn",
    definicao: "Sistema automatizado que monitora padrões de engajamento de cada aluno e alerta o mentor quando um sinal de risco aparece — frequência de check-in cai, respostas ficam mais curtas, calls são remarcadas repetidamente. O Radar de Churn permite que o mentor aja antes que o aluno decida cancelar, em vez de descobrir o problema após o cancelamento. Funcionalidade exclusiva do CKlareza.",
    relacionado: { texto: "Como reduzir o churn na sua mentoria", href: "/blog/como-reduzir-churn-mentoria" },
  },
  {
    termo: "Portal do Aluno",
    ancora: "portal",
    definicao: "Área exclusiva onde o mentorado acessa tudo relacionado à sua jornada: formulário de check-in semanal, tarefas e atividades, histórico de calls, materiais enviados pelo mentor e registro da jornada completa. Em plataformas white-label, o portal aparece com a marca do mentor — não com a identidade do software.",
    relacionado: { texto: "Ver todos os recursos do CKlareza", href: "/recursos" },
  },
  {
    termo: "Lifetime Value (LTV) em Mentoria",
    ancora: "ltv",
    definicao: "Valor total que um aluno gera durante todo o período em que permanece na mentoria. LTV = ticket mensal × duração média em meses. Um aluno que paga R$3.000/mês e fica 18 meses tem LTV de R$54.000. O foco em LTV muda a lógica do negócio: em vez de vender sempre, o mentor investe em retenção, resultados e renovação — o que é mais lucrativo e mais sustentável.",
    relacionado: { texto: "Por que 'Lifetime Value' é o nome do CKlareza", href: "/sobre" },
  },
  {
    termo: "Onboarding de Mentorado",
    ancora: "onboarding",
    definicao: "Processo estruturado de boas-vindas para um novo aluno — do primeiro acesso ao portal até a primeira call. Um onboarding bem feito define expectativas, coleta informações iniciais, apresenta o processo e cria o vínculo emocional com a mentoria. Onboarding sem processo gera insegurança no aluno desde o início e aumenta o risco de churn precoce.",
    relacionado: { texto: "Como escalar sua mentoria sem trabalhar mais", href: "/blog/como-escalar-mentoria" },
  },
]

export default function Glossario() {
  const letras = [...new Set(TERMOS.map(t => t.termo[0]))].sort()

  return (
    <div style={{ background: SC.bg, color: SC.text }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
      <SiteHeader />

      {/* HERO */}
      <section className="max-w-3xl mx-auto px-5 pt-16 pb-10 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: `${SC.teal}12`, border: `1px solid ${SC.teal}30` }}>
          <BookOpen className="w-7 h-7" style={{ color: SC.teal }} />
        </div>
        <span className="text-xs font-bold tracking-[0.3em]" style={{ color: SC.teal }}>REFERÊNCIA</span>
        <h1 className="text-4xl md:text-5xl font-bold mt-4">Glossário de Mentoria</h1>
        <p className="text-lg mt-5 leading-relaxed max-w-2xl mx-auto" style={{ color: SC.muted }}>
          Definições claras dos termos que todo mentor profissional precisa conhecer — de churn a white-label, de MRR a briefing de call.
        </p>
      </section>

      {/* ÍNDICE */}
      <div className="max-w-3xl mx-auto px-5 pb-8 flex flex-wrap gap-2 justify-center">
        {TERMOS.map(t => (
          <a key={t.ancora} href={`#${t.ancora}`} className="text-sm px-3 py-1.5 rounded-lg font-medium transition-colors hover:opacity-80" style={{ background: SC.card, border: `1px solid ${SC.border}`, color: SC.muted }}>
            {t.termo}
          </a>
        ))}
      </div>

      {/* TERMOS */}
      <section className="max-w-3xl mx-auto px-5 pb-20">
        <div className="space-y-8">
          {TERMOS.map((t, i) => (
            <article key={t.ancora} id={t.ancora} className="rounded-2xl p-7 scroll-mt-20" style={{ background: SC.card, border: `1px solid ${SC.border}` }}>
              <h2 className="text-xl font-bold mb-3">{t.termo}</h2>
              <p className="leading-relaxed" style={{ color: SC.muted }}>{t.definicao}</p>
              {t.relacionado && (
                <Link href={t.relacionado.href} className="inline-flex items-center gap-2 mt-4 text-sm font-semibold hover:underline" style={{ color: SC.teal }}>
                  {t.relacionado.texto} <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-5 pb-20 text-center">
        <div className="rounded-2xl p-8" style={{ background: SC.card, border: `1px solid ${SC.border}` }}>
          <h2 className="text-2xl font-bold mb-2">Coloque o glossário em prática</h2>
          <p className="mt-2 mb-6" style={{ color: SC.muted }}>
            Check-in, briefing com IA, radar de churn, white-label — tudo isso está no CKlareza. Setup em 5 minutos, sem cartão.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold" style={{ background: SC.teal, color: "#ffffff" }}>
              Criar conta gratuita <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/recursos" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold" style={{ background: SC.bg, border: `1px solid ${SC.border}`, color: SC.text }}>
              Ver todos os recursos
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
