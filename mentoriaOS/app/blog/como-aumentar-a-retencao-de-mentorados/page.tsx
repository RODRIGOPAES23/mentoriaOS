import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, ArrowLeft, ArrowRight } from "lucide-react"

const SITE = "https://cklareza.com"
const SLUG = "/blog/como-aumentar-a-retencao-de-mentorados"
const TITLE = "Como Aumentar a Retenção de Mentorados (e o Lifetime Value)"
const DESC = "Guia prático: 5 alavancas para reter mentorados, reduzir cancelamentos e aumentar o Lifetime Value da sua mentoria — com clareza e IA."
const DATE = "2026-06-03"

const C = { bg: "#0a1420", card: "#0f2030", border: "#1e3450", muted: "#7fa0bd", gold: "#d4af37", goldL: "#f0d97d", teal: "#13a3a3" }

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: SLUG },
  openGraph: { type: "article", url: `${SITE}${SLUG}`, title: TITLE, description: DESC, images: ["/logo.jpg"] },
}

const JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      headline: TITLE,
      description: DESC,
      datePublished: DATE, dateModified: DATE,
      author: { "@type": "Organization", name: "CKlareza" },
      publisher: { "@type": "Organization", name: "CKlareza", logo: { "@type": "ImageObject", url: `${SITE}/logo.jpg` } },
      mainEntityOfPage: `${SITE}${SLUG}`,
      image: `${SITE}/logo.jpg`,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
        { "@type": "ListItem", position: 3, name: "Retenção de mentorados", item: `${SITE}${SLUG}` },
      ],
    },
  ],
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold mt-10 mb-3 text-white">{children}</h2>
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
        <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: C.gold, color: "#1a1407" }}>Entrar</Link>
      </header>

      <article className="max-w-3xl mx-auto px-5 py-10">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm mb-6" style={{ color: C.muted }}>
          <ArrowLeft className="w-4 h-4" /> Blog
        </Link>
        <p className="text-xs font-bold tracking-widest mb-2" style={{ color: C.teal }}>RETENÇÃO · LIFETIME VALUE</p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">Como aumentar a retenção de mentorados (e o Lifetime Value)</h1>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: C.muted }}>
          Reter mentorados é o que separa uma mentoria que cresce de uma que vive correndo atrás de novos clientes.
          Retenção é manter o mentorado engajado e renovando ao longo do tempo — e é a maior alavanca do
          <strong className="text-white"> Lifetime Value</strong> (o valor total que cada aluno gera enquanto está com você).
        </p>

        <H2>Por que um mentorado desiste</H2>
        <p className="leading-relaxed" style={{ color: C.muted }}>
          Raramente é por falta de conteúdo. Na prática, o mentorado abandona quando <strong className="text-white">perde a sensação de progresso</strong>,
          quando o acompanhamento fica frouxo, ou quando a relação esfria entre uma call e outra. Falta clareza — para ele e para você.
        </p>

        <H2>5 alavancas para reter (e renovar)</H2>
        <ol className="space-y-4 mt-2">
          {[
            ["Acompanhamento próximo e proativo", "Não espere o mentorado sumir. Saiba quem está atrasado nas tarefas e quem não faz check-in há tempo — e aja antes do desânimo virar cancelamento."],
            ["Clareza financeira nos dois lados", "Cobranças organizadas evitam atrito. O aluno sabe o que deve e quando; você sabe quem está inadimplente sem precisar caçar planilha."],
            ["Metas visíveis e progresso à vista", "Mostre o avanço. Quando o mentorado vê o quanto evoluiu (metas de 30/90 dias, tarefas concluídas), ele renova porque sente que está chegando lá."],
            ["Ritmo de calls consistente", "Uma cadência previsível de calls cria vínculo. Agenda clara + pauta pronta = cada encontro entrega valor e reforça a relação."],
            ["Personalização baseada em dados", "Cada aluno é diferente. Use os dados do acompanhamento para focar onde está o gargalo real de cada um — não no genérico."],
          ].map(([t, d], i) => (
            <li key={i} className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <h3 className="font-bold text-lg text-white">{i + 1}. {t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: C.muted }}>{d}</p>
            </li>
          ))}
        </ol>

        <H2>O papel da IA e da tecnologia</H2>
        <p className="leading-relaxed" style={{ color: C.muted }}>
          O que trava a maioria dos mentores é o tempo: planilhas espalhadas, cobrança manual, briefing feito na pressa.
          Uma <Link href="/" className="underline" style={{ color: C.goldL }}>plataforma de mentoria</Link> centraliza tudo —
          e uma camada de IA mostra <strong className="text-white">quem precisa de atenção agora</strong> e prepara a pauta da próxima call.
          Você deixa de operar no escuro e passa a agir com clareza, no momento certo.
        </p>

        <H2>Conclusão</H2>
        <p className="leading-relaxed" style={{ color: C.muted }}>
          Retenção não é sorte: é acompanhamento próximo, clareza financeira, progresso visível e ritmo. Faça isso de forma
          consistente e o Lifetime Value sobe sozinho. O atalho é parar de depender de planilhas e ter a operação inteira num só lugar.
        </p>

        <div className="rounded-2xl p-7 mt-10 text-center" style={{ background: C.card, border: `1px solid ${C.gold}33` }}>
          <p className="text-lg font-semibold text-white">Organize sua mentoria e aumente a retenção</p>
          <p className="mt-2 text-sm" style={{ color: C.muted }}>Financeiro, atividades, calls e IA — num só lugar, com a sua marca.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold mt-5" style={{ background: C.gold, color: "#1a1407" }}>
            Acessar o sistema <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </article>
    </div>
  )
}
