import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, TrendingDown, TrendingUp, Brain, Bell } from "lucide-react"
import { SiteHeader, SiteFooter } from "@/components/site/SiteChrome"

const SITE = "https://cklareza.com"
const SLUG = "/blog/como-reduzir-churn-mentoria"
const TITLE = "Como Reduzir o Churn na Sua Mentoria: 5 Estratégias que Funcionam"
const DESC = "Churn invisível é o maior inimigo do mentor high-ticket. Descubra como identificar alunos em risco antes que cancelam e as 5 estratégias para aumentar a retenção na sua mentoria."
const DATE = "2026-06-09"

const C = { bg: "#ffffff", card: "#f8f9fa", card2: "#f3f4f6", border: "#e5e7eb", muted: "#6b7280", text: "#1f2937", gold: "#d4af37", goldL: "#f0d97d", teal: "#0f8a8a" }

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: SLUG, languages: { "pt-BR": SLUG, "x-default": SLUG } },
  openGraph: { type: "article", url: `${SITE}${SLUG}`, title: TITLE, description: DESC, images: ["/logo.jpg"], locale: "pt_BR", publishedTime: DATE },
  keywords: ["churn mentoria", "retenção de mentorados", "como reduzir cancelamentos mentoria", "churn high ticket", "retenção alunos mentoria", "como manter mentorados", "gestão de mentoria", "software para mentores"],
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
  keywords: "churn mentoria, retenção mentorados, gestão mentoria, software mentores",
  inLanguage: "pt-BR",
  about: { "@type": "Thing", name: "Gestão de Mentoria" },
}

const SINAIS_CHURN = [
  { icone: AlertTriangle, cor: "#ef4444", sinal: "Aluno para de responder check-ins", risco: "Alto", acao: "Contato direto em 48h" },
  { icone: TrendingDown, cor: "#f97316", sinal: "Frequência de resposta cai mais de 50%", risco: "Médio-Alto", acao: "Sessão de alinhamento" },
  { icone: AlertTriangle, cor: "#f59e0b", sinal: "Respostas ficam cada vez mais curtas", risco: "Médio", acao: "Perguntar sobre resultado percebido" },
  { icone: TrendingDown, cor: "#f59e0b", sinal: "Falta 2+ calls sem reagendar", risco: "Médio", acao: "WhatsApp pessoal + proposta de horário" },
  { icone: AlertTriangle, cor: "#6b7280", sinal: "Não abre os materiais enviados", risco: "Baixo-Médio", acao: "Mudar formato de entrega" },
]

const ESTRATEGIAS = [
  {
    num: "01",
    titulo: "Meça o engajamento, não só o pagamento",
    corpo: `A maioria dos mentores só percebe o churn quando o aluno cancela ou deixa de pagar. O problema: nesse ponto, a decisão já foi tomada há semanas.

Engajamento real se mede em: frequência de check-ins, qualidade das respostas, reabertura de materiais, presença nas calls. Um aluno que paga em dia mas para de responder check-ins está tecnicamente em churn silencioso.

**Como fazer:** defina uma cadência mínima esperada (ex: 1 check-in/semana) e monitore desvios. Aluno que fica 10 dias sem responder merece atenção imediata — não espere ele sumir para agir.`,
    resultado: "Identifica risco 3-4 semanas antes do cancelamento"
  },
  {
    num: "02",
    titulo: "Check-in semanal estruturado (não aleatório)",
    corpo: `O check-in é o sensor mais valioso que um mentor tem. Mas a maioria o usa como \"dever de casa\" genérico em vez de um termômetro calibrado.

Um check-in eficaz pergunta: o que funcionou essa semana? Onde travou? Qual o maior obstáculo agora? O que precisa de mim para a próxima call? Essas 4 perguntas revelam progresso real, identificam bloqueios antes que virem frustração e criam material direto para o briefing da call.

**Como fazer:** use sempre o mesmo formulário estruturado. Com o tempo, você terá um histórico comparativo que mostra a trajetória do aluno — isso é ouro para retenção e renovação.`,
    resultado: "Reduz \"não sei o que está acontecendo com ele\" em 90%"
  },
  {
    num: "03",
    titulo: "Entre em cada call com contexto completo",
    corpo: `Calls sem preparo são a principal causa de churn que os mentores não enxergam. O aluno percebe quando o mentor não lembrou o que foi discutido na semana anterior. Isso corrói a confiança no valor da mentoria.

O preparo não precisa ser longo — precisa ser certeiro. Leia os últimos 2 check-ins, revise as tarefas pendentes, identifique o maior obstáculo atual. São 3 minutos que transformam a qualidade percebida da call.

**Como fazer:** monte um briefing padrão antes de cada call. Com IA, isso acontece automaticamente: o sistema lê os check-ins recentes e gera a pauta sugerida em segundos. O mentor entra na call já sabendo exatamente onde o aluno está.`,
    resultado: "NPS de call aumenta em média 30 pontos"
  },
  {
    num: "04",
    titulo: "Celebre os marcos — não só corrija os gaps",
    corpo: `Mentorias high-ticket têm um paradoxo: quanto mais o aluno progride, mais ele esquece o quão longe chegou. Ele sobe a régua de expectativas e começa a ver só o que falta — não o quanto evoluiu.

Mentores que combatem isso ativamente têm taxas de retenção até 40% maiores. A estratégia é simples: mostre o histórico. Compare onde o aluno estava na semana 1 com onde está agora. Use os check-ins anteriores como espelho de progresso.

**Como fazer:** no mês 3 e mês 6 de cada aluno, faça uma sessão de retrospectiva. Abra os primeiros check-ins e compare com os recentes. A maioria dos alunos fica surpreso com o próprio progresso — e isso cria vontade de continuar.`,
    resultado: "Taxa de renovação sobe 40-60% com retrospectivas mensais"
  },
  {
    num: "05",
    titulo: "Use um sistema — não o seu cérebro como CRM",
    corpo: `O mentor que tenta gerenciar 10+ alunos na cabeça, no WhatsApp e em planilhas está operando no limite. Inevitavelmente, um aluno fica sem atenção por 2-3 semanas — e esse é o aluno que vai cancelar.

Um sistema centralizado resolve 3 problemas de uma vez: você vê todos os alunos em um dashboard (quem está em dia, quem está atrasado, quem está em risco), o financeiro fica visível (quem pagou, quem está inadimplente), e você tem histórico completo para cada aluno sem depender de memória.

**Como fazer:** migre de planilha + WhatsApp para uma plataforma especializada. O setup leva 1 hora. O retorno é imediato: você para de operar no escuro e começa a tomar decisões baseadas em dados.`,
    resultado: "Elimina o \"aluno invisível\" — ninguém passa 2 semanas sem atenção"
  },
]

export default function ComoReduzirChurnMentoria() {
  return (
    <div style={{ background: C.bg, color: C.text }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
      <SiteHeader />

      {/* HERO */}
      <article className="max-w-3xl mx-auto px-5 pt-14 pb-20">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-80 transition-opacity" style={{ color: C.muted }}>
          <ArrowLeft className="w-4 h-4" /> Blog
        </Link>

        <div className="mb-8">
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: C.teal }}>Retenção & Churn</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-3 leading-tight">{TITLE}</h1>
          <p className="text-lg mt-4 leading-relaxed" style={{ color: C.muted }}>{DESC}</p>
          <div className="flex items-center gap-4 mt-5 text-sm" style={{ color: C.muted }}>
            <span>CKlareza · {new Date(DATE).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
            <span>·</span>
            <span>9 min de leitura</span>
          </div>
        </div>

        {/* INTRO */}
        <div className="rounded-2xl p-6 mb-10" style={{ background: `#fef2f2`, border: `1px solid #fecaca` }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
            <div>
              <p className="font-bold" style={{ color: "#991b1b" }}>O custo real do churn em mentoria high-ticket</p>
              <p className="text-sm mt-1" style={{ color: "#7f1d1d" }}>
                Com ticket médio de R$5.000/mês, perder 1 aluno = R$60.000/ano de receita. Mentores com 10 alunos
                que tem churn anual de 30% estão deixando R$180.000 na mesa — sem perceber.
              </p>
            </div>
          </div>
        </div>

        <p className="text-lg leading-relaxed mb-6">
          O churn em mentoria é diferente do churn de SaaS. Não é uma decisão racional baseada em features —
          é uma decisão emocional baseada em <strong>percepção de valor</strong>. O aluno cancela quando sente que
          parou de crescer, quando sente que não é visto pelo mentor, ou quando a vida ficou ocupada demais e
          ninguém percebeu.
        </p>
        <p className="text-lg leading-relaxed mb-12">
          A boa notícia: esses sinais aparecem semanas antes do cancelamento. Com o sistema certo, você age
          antes que a decisão seja tomada.
        </p>

        {/* SINAIS DE ALERTA */}
        <h2 className="text-2xl font-bold mb-6">Os 5 sinais de churn que você precisa monitorar</h2>
        <div className="space-y-3 mb-12">
          {SINAIS_CHURN.map((s, i) => (
            <div key={i} className="flex items-start gap-4 rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <s.icone className="w-5 h-5 shrink-0 mt-0.5" style={{ color: s.cor }} />
              <div className="flex-1">
                <p className="font-semibold text-sm">{s.sinal}</p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>Ação recomendada: {s.acao}</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-md whitespace-nowrap" style={{ background: `${s.cor}15`, color: s.cor }}>
                Risco {s.risco}
              </span>
            </div>
          ))}
        </div>

        {/* ESTRATÉGIAS */}
        <h2 className="text-2xl font-bold mb-8">5 estratégias para reduzir o churn na sua mentoria</h2>
        <div className="space-y-10">
          {ESTRATEGIAS.map((e) => (
            <div key={e.num}>
              <div className="flex items-start gap-4 mb-4">
                <span className="text-5xl font-black leading-none" style={{ color: `${C.teal}20`, fontVariantNumeric: "tabular-nums" }}>{e.num}</span>
                <h3 className="text-xl font-bold mt-2">{e.titulo}</h3>
              </div>
              <div className="prose prose-gray max-w-none text-base leading-relaxed mb-4">
                {e.corpo.split("\n\n").map((p, i) => (
                  <p key={i} className="mb-4" style={{ color: p.startsWith("**") ? C.text : C.muted }}
                    dangerouslySetInnerHTML={{ __html: p.replace(/\*\*([^*]+)\*\*/g, `<strong style="color:${C.text}">$1</strong>`) }} />
                ))}
              </div>
              <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: `${C.teal}0f`, border: `1px solid ${C.teal}30` }}>
                <TrendingUp className="w-5 h-5 shrink-0" style={{ color: C.teal }} />
                <p className="text-sm font-semibold" style={{ color: C.teal }}>{e.resultado}</p>
              </div>
            </div>
          ))}
        </div>

        {/* IA SECTION */}
        <div className="rounded-2xl p-7 mt-14 mb-10" style={{ background: `linear-gradient(135deg, ${C.teal}08, ${C.teal}15)`, border: `1px solid ${C.teal}30` }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.teal }}>
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">O Radar de Churn do CKlareza</h3>
              <p className="leading-relaxed mb-3" style={{ color: C.muted }}>
                O CKlareza monitora automaticamente os padrões de engajamento de cada aluno e alerta quando algo muda.
                Frequência de check-in caiu? Respostas ficaram mais curtas? Call remarcada pela terceira vez?
                O sistema notifica você antes que o aluno decida sair.
              </p>
              <p className="text-sm font-semibold" style={{ color: C.teal }}>
                Mentores que usam o Radar agem antes que o aluno decida cancelar — não depois.
              </p>
            </div>
          </div>
        </div>

        {/* CONCLUSÃO */}
        <h2 className="text-2xl font-bold mt-12 mb-4">Conclusão: Churn não é destino — é consequência</h2>
        <p className="text-lg leading-relaxed mb-4" style={{ color: C.muted }}>
          Todo churn tem uma causa. E na maioria dos casos, essa causa foi visível semanas antes — só não havia
          sistema para detectá-la. Aluno sem atenção por 2 semanas. Call sem contexto. Progresso não celebrado.
          Financeiro fora de controle.
        </p>
        <p className="text-lg leading-relaxed mb-12" style={{ color: C.muted }}>
          Com as 5 estratégias deste artigo e um sistema centralizado, você para de operar no escuro e começa
          a tomar decisões antes que o problema apareça. Isso é Lifetime Value de verdade.
        </p>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <Bell className="w-10 h-10 mx-auto mb-4" style={{ color: C.teal }} />
          <h3 className="text-2xl font-bold mb-2">Veja o Radar de Churn em ação</h3>
          <p className="mb-6" style={{ color: C.muted }}>
            O CKlareza monitora o engajamento de cada aluno automaticamente. Setup em 5 minutos, sem cartão.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold" style={{ background: C.teal, color: "#ffffff" }}>
              Criar conta gratuita <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contato" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold" style={{ background: C.card2, border: `1px solid ${C.border}`, color: C.text }}>
              Ver demonstração
            </Link>
          </div>
        </div>

        {/* LEIA TAMBÉM */}
        <div className="mt-14">
          <p className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: C.muted }}>Leia também</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { href: "/blog/como-fazer-checkin-semanal-com-mentorados", titulo: "Como fazer check-in semanal com mentorados" },
              { href: "/blog/software-para-mentores-guia-completo", titulo: "Software para mentores: guia completo 2026" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="flex items-center gap-3 p-4 rounded-xl transition-colors group" style={{ background: C.card, border: `1px solid ${C.border}` }}>
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
