import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"

const SITE = "https://cklareza.com"
const SLUG = "/blog/software-para-mentores-guia-completo"
const TITLE = "Software para Mentores: Guia Completo para Escolher em 2026"
const DESC = "O que avaliar ao escolher um software para mentores: financeiro, acompanhamento, comunicação e IA. Comparativo prático para profissionalizar sua mentoria."
const DATE = "2026-06-04"

const C = { bg: "#ffffff", card: "#f8f9fa", border: "#e5e7eb", muted: "#6b7280", gold: "#d4af37", goldL: "#f0d97d", teal: "#13a3a3" }

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: SLUG },
  openGraph: { type: "article", url: `${SITE}${SLUG}`, title: TITLE, description: DESC, images: ["/logo.jpg"], locale: "pt_BR" },
  keywords: ["software para mentores", "sistema para mentores", "plataforma de mentoria", "CRM para mentores", "gestão de mentoria", "app para mentores"],
}

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: TITLE,
  description: DESC,
  datePublished: DATE, dateModified: DATE,
  author: { "@type": "Organization", name: "CKlareza", url: SITE },
  publisher: { "@type": "Organization", name: "CKlareza", logo: { "@type": "ImageObject", url: `${SITE}/logo.jpg` } },
  mainEntityOfPage: `${SITE}${SLUG}`,
  image: `${SITE}/logo.jpg`,
  keywords: "software para mentores, plataforma de mentoria, sistema para mentores, gestão de mentoria",
  inLanguage: "pt-BR",
  about: { "@type": "SoftwareApplication", name: "CKlareza", applicationCategory: "BusinessApplication" },
}

export default function Post() {
  return (
    <div style={{ background: C.bg, color: "#fff" }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />

      <header className="px-5 h-16 flex items-center justify-between max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: C.gold }} />
          <span className="font-bold" style={{ background: `linear-gradient(180deg, ${C.goldL}, ${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>CKlareza</span>
        </Link>
        <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: C.gold, color: "#1a1407" }}>Acessar sistema</Link>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors" style={{ color: C.muted }}>
          <ArrowLeft className="w-4 h-4" /> Blog
        </Link>

        <div className="flex items-center gap-3 text-xs mb-4" style={{ color: C.muted }}>
          <span className="px-2 py-0.5 rounded-full" style={{ background: `${C.teal}18`, color: C.teal }}>Ferramentas</span>
          <span>4 jun 2026</span>
          <span>· 8 min de leitura</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{TITLE}</h1>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: C.muted }}>{DESC}</p>

        <div className="mt-10 space-y-8 text-base leading-relaxed" style={{ color: "#b8d0e8" }}>

          <section>
            <p>Se você mentora profissionalmente — seja com 5 ou 50 alunos — chegou um momento em que planilhas, WhatsApp e anotações avulsas simplesmente não dão mais conta. Um <strong className="text-white">software para mentores</strong> organiza tudo num só lugar: quem pagou, quem está atrasado nas tarefas, qual call está marcada, e quem precisa da sua atenção agora.</p>
            <p className="mt-4">O problema é que a maioria dos mentores não sabe o que avaliar na hora de escolher. Neste guia, separamos os 5 módulos essenciais que qualquer plataforma de mentoria precisa ter — e o que perguntar antes de contratar.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Gestão financeira: o coração da operação</h2>
            <p>O módulo financeiro é, na prática, o mais crítico. Um bom <strong className="text-white">sistema para mentores</strong> precisa mostrar:</p>
            <ul className="mt-3 space-y-2 ml-4">
              {["Quem vai pagar e quando (próximos 7 dias)", "Quem está em atraso (vencido e não pago)", "Valor total pendente por aluno e global", "Histórico de pagamentos por ciclo"].map(i => (
                <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.teal }} />{i}</li>
              ))}
            </ul>
            <p className="mt-4">Evite ferramentas que só registram pagamentos manualmente. O ideal é que o sistema mostre proativamente quem vence em 3 dias — antes que você precise lembrar.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Acompanhamento de tarefas: quem está evoluindo</h2>
            <p>Tarefas sem acompanhamento sistemático viram ruído. O módulo de atividades deve funcionar como um <strong className="text-white">Kanban de mentoria</strong>: você cria tarefas para cada aluno, eles marcam como concluídas, e você vê o progresso de todos num só painel.</p>
            <p className="mt-4">Itens que fazem diferença:</p>
            <ul className="mt-3 space-y-2 ml-4">
              {["Data de vencimento por tarefa com alerta automático", "Progresso em % (tarefas concluídas / total)", "Visão global de todos os alunos num Kanban", "Portal do aluno para check-in sem precisar de app separado"].map(i => (
                <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.teal }} />{i}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Check-in semanal: dados que orientam a próxima call</h2>
            <p>O check-in semanal transforma a sessão de mentoria de uma conversa aberta em uma decisão orientada por dados. O aluno preenche métricas (vendas, leads, investimento) e dificuldades antes da call — e o mentor chega preparado.</p>
            <p className="mt-4">Com IA, o sistema lê os check-ins e gera automaticamente o <em>briefing da call</em>: o diagnóstico do momento do aluno, o que melhorou, o que piorou, e a pauta recomendada. Isso economiza 20–30 min de preparação por call.</p>
            <p className="mt-4">A <Link href="/recursos" className="underline" style={{ color: C.goldL }}>CKlareza</Link> tem esse módulo integrado: o aluno preenche pelo portal, a IA processa e o briefing já está pronto quando o mentor abre o dashboard.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Calendário e gestão de calls</h2>
            <p>Você precisa saber, numa visão só, todas as calls da semana com os respectivos alunos. O calendário de mentoria deve mostrar:</p>
            <ul className="mt-3 space-y-2 ml-4">
              {["Próximas sessões agendadas com nome do aluno", "Esteira de calls (agendada → realizada → cancelada)", "Link da call integrado (Zoom, Meet ou Jitsi)", "Histórico de calls anteriores por aluno"].map(i => (
                <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.teal }} />{i}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. White-label: sua marca, não a do software</h2>
            <p>Se você tem uma empresa de mentoria ou revende para outros mentores, o <strong className="text-white">white-label</strong> é decisivo. Você quer que o aluno veja o seu logo, sua cor, seu domínio — não a marca do software que você usa.</p>
            <p className="mt-4">Uma plataforma de mentoria white-label de verdade permite:</p>
            <ul className="mt-3 space-y-2 ml-4">
              {["Logo, cores primárias e secundárias customizáveis", "Domínio próprio (ex: app.suaempresa.com)", "Portal do aluno com identidade visual da sua empresa", "Vários mentores sob uma só conta empresa"].map(i => (
                <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.teal }} />{i}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Checklist: perguntas para fazer antes de contratar</h2>
            <div className="rounded-2xl p-6 space-y-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              {[
                "O sistema mostra quem paga em X dias sem eu precisar filtrar?",
                "O aluno tem um portal próprio para check-in e ver as tarefas?",
                "Tem integração com videochamada?",
                "Posso colocar meu logo e minha cor?",
                "A IA gera o briefing da call automaticamente?",
                "Funciona no celular como aplicativo?",
                "Posso exportar meus dados a qualquer momento?",
              ].map((q, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: `${C.teal}18`, color: C.teal }}>{i + 1}</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Conclusão</h2>
            <p>Um bom software para mentores não é um CRM genérico adaptado — é uma ferramenta construída especificamente para o fluxo de mentoria: check-in → briefing → call → tarefas → pagamento → renovação.</p>
            <p className="mt-4">Se você quer ver como isso funciona na prática, a <strong className="text-white">CKlareza</strong> cobre todos os 5 módulos acima com white-label incluso, sem precisar de 10 ferramentas separadas.</p>
          </section>

          <div className="rounded-2xl p-8 text-center mt-8" style={{ background: C.card, border: `1px solid ${C.gold}33` }}>
            <p className="text-lg font-bold text-white mb-2">Veja o CKlareza em ação</p>
            <p className="text-sm mb-5" style={{ color: C.muted }}>Plataforma completa: financeiro, tarefas, check-in com IA, calls e white-label.</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              style={{ background: C.gold, color: "#1a1407" }}>
              Acessar gratuitamente <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8" style={{ borderTop: `1px solid ${C.border}` }}>
          <p className="text-sm font-semibold text-white mb-4">Continue lendo</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { href: "/blog/como-aumentar-a-retencao-de-mentorados", t: "Como aumentar a retenção de mentorados", cat: "Retenção" },
              { href: "/blog/como-fazer-checkin-semanal-com-mentorados", t: "Check-in semanal: guia prático", cat: "Acompanhamento" },
            ].map(p => (
              <Link key={p.href} href={p.href} className="rounded-xl p-4 block transition-all hover:-translate-y-0.5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <span className="text-xs" style={{ color: C.teal }}>{p.cat}</span>
                <p className="text-sm font-semibold text-white mt-1">{p.t}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
