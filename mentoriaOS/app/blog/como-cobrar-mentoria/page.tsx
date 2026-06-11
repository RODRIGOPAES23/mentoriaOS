import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2, DollarSign, TrendingUp, AlertTriangle } from "lucide-react"
import { SiteHeader, SiteFooter } from "@/components/site/SiteChrome"

const SITE = "https://cklareza.com"
const SLUG = "/blog/como-cobrar-mentoria"
const TITLE = "Como Cobrar Mentoria: Precificação High-Ticket que Funciona em 2026"
const DESC = "Quanto cobrar pela sua mentoria? Como estruturar planos, justificar o preço e aumentar o ticket sem perder alunos. Guia completo de precificação para mentores."
const DATE = "2026-06-09"

const C = { bg: "#ffffff", card: "#f8f9fa", card2: "#f3f4f6", border: "#e5e7eb", muted: "#6b7280", text: "#1f2937", gold: "#d4af37", goldL: "#f0d97d", teal: "#0f8a8a" }

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: SLUG, languages: { "pt-BR": SLUG, "x-default": SLUG } },
  openGraph: { type: "article", url: `${SITE}${SLUG}`, title: TITLE, description: DESC, images: ["/logo.jpg"], locale: "pt_BR", publishedTime: DATE },
  keywords: ["como cobrar mentoria", "precificação mentoria", "quanto cobrar mentoria high ticket", "preço mentoria", "ticket médio mentoria", "como aumentar preço mentoria", "mentoria high ticket Brasil"],
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
  name: "Como precificar sua mentoria high-ticket",
  description: "Passo a passo para definir o preço certo para sua mentoria, estruturar planos e aumentar o ticket sem perder alunos.",
  step: [
    { "@type": "HowToStep", name: "Calcule o resultado que você entrega", text: "Estime o impacto financeiro médio que seu aluno consegue depois da mentoria. O preço deve ser uma fração do resultado." },
    { "@type": "HowToStep", name: "Defina o modelo de cobrança", text: "Escolha entre mensalidade recorrente (MRR), pacote fechado ou success fee. Para high-ticket, mensalidade recorrente é o modelo mais previsível." },
    { "@type": "HowToStep", name: "Estruture 3 planos com ancoragem", text: "Crie planos Basic, Pro e Premium. O Premium âncora a percepção de valor. O Pro é onde a maioria escolhe. O Basic qualifica quem ainda não está pronto." },
    { "@type": "HowToStep", name: "Justifique o preço com experiência", text: "White-label, portal profissional, check-ins estruturados, briefing com IA — cada elemento da sua operação justifica visualmente o ticket cobrado." },
    { "@type": "HowToStep", name: "Aumente o preço gradualmente", text: "Aumente para novos alunos primeiro. Mantenha o preço para os atuais por 3-6 meses. Comunicação clara evita churn na transição." },
  ],
}

const MODELOS = [
  { titulo: "Mensalidade recorrente", desc: "Aluno paga todo mês enquanto está ativo. Previsibilidade máxima para o mentor. Ideal para acompanhamento contínuo.", pros: ["MRR previsível", "Relação contínua", "Renovação natural"], contras: ["Aluno pode cancelar", "Justifica mensalmente"], ideal: "Mentores com acompanhamento ativo", cor: C.teal },
  { titulo: "Pacote fechado", desc: "Aluno paga por um período (3, 6 ou 12 meses) adiantado. Compromisso maior, resultado esperado claro.", pros: ["Receita garantida upfront", "Aluno comprometido", "Sem risco de churn mensal"], contras: ["Ticket de entrada maior", "Menos flexível"], ideal: "Programas com prazo definido", cor: C.gold },
  { titulo: "Success fee", desc: "Pagamento atrelado ao resultado do aluno (ex: % do faturamento gerado). Baixo risco para o aluno, alto risco para o mentor.", pros: ["Fácil de vender", "Alinhamento total"], contras: ["Renda imprevisível", "Difícil de escalar"], ideal: "Nichos com resultado mensurável claro", cor: "#a855f7" },
]

const ERROS = [
  "Cobrar por hora (desvaloriza o resultado, valoriza o tempo)",
  "Dar desconto sem contrapartida (treina o aluno a sempre pedir)",
  "Não ter preço no site (gera desqualificados na conversa de venda)",
  "Cobrar igual para todos os perfis de aluno",
  "Aumentar o preço sem melhorar a experiência entregue",
]

export default function ComoRcobrarMentoria() {
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
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: C.teal }}>Precificação & Negócio</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-3 leading-tight">{TITLE}</h1>
          <p className="text-lg mt-4 leading-relaxed" style={{ color: C.muted }}>{DESC}</p>
          <div className="flex items-center gap-4 mt-5 text-sm" style={{ color: C.muted }}>
            <span>CKlareza · {new Date(DATE).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
            <span>·</span><span>10 min de leitura</span>
          </div>
        </div>

        {/* REFERÊNCIA DE PREÇOS */}
        <div className="rounded-2xl p-6 mb-10" style={{ background: `${C.teal}08`, border: `1px solid ${C.teal}25` }}>
          <p className="font-bold mb-3" style={{ color: C.teal }}>📊 Referência de preços — mentoria high-ticket Brasil 2026</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { faixa: "Iniciante", range: "R$500–R$1.500/mês", desc: "1–10 mentorados, nicho em construção" },
              { faixa: "Estabelecido", range: "R$2.000–R$5.000/mês", desc: "10–30 mentorados, resultado comprovado" },
              { faixa: "Autoridade", range: "R$6.000–R$20.000/mês", desc: "30+ mentorados, nicho dominante" },
            ].map((f, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.muted }}>{f.faixa}</p>
                <p className="font-bold text-sm mt-1" style={{ color: C.text }}>{f.range}</p>
                <p className="text-xs mt-1" style={{ color: C.muted }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-10 mb-4">O princípio fundamental: preço é fração do resultado</h2>
        <p className="text-lg leading-relaxed mb-4" style={{ color: C.muted }}>
          O erro mais comum em precificação de mentoria é calcular o preço de dentro para fora — quanto tempo gasto, qual meu custo, quanto preciso ganhar. Isso produz preços baixos e mentores exaustos.
        </p>
        <p className="text-lg leading-relaxed mb-10" style={{ color: C.muted }}>
          A lógica certa é de fora para dentro: <strong style={{ color: C.text }}>qual resultado financeiro médio você entrega ao aluno?</strong> Se sua mentoria ajuda um profissional a faturar R$50.000 a mais por ano, cobrar R$3.000/mês é uma fração pequena desse retorno. O preço se justifica sozinho — você só precisa comunicar o resultado.
        </p>

        {/* COMO PRECIFICAR */}
        <h2 className="text-2xl font-bold mb-6">Como precificar em 5 passos</h2>
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

        {/* MODELOS */}
        <h2 className="text-2xl font-bold mb-6">Os 3 modelos de cobrança — qual usar?</h2>
        <div className="space-y-5 mb-12">
          {MODELOS.map((m, i) => (
            <div key={i} className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-bold text-lg">{m.titulo}</h3>
                <span className="text-xs font-bold px-2 py-1 rounded shrink-0" style={{ background: `${m.cor}15`, color: m.cor }}>Ideal: {m.ideal}</span>
              </div>
              <p className="text-sm mb-4" style={{ color: C.muted }}>{m.desc}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold mb-2" style={{ color: C.teal }}>VANTAGENS</p>
                  {m.pros.map((p, j) => <p key={j} className="text-xs flex items-start gap-1.5 mb-1" style={{ color: C.muted }}><CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" style={{ color: C.teal }} />{p}</p>)}
                </div>
                <div>
                  <p className="text-xs font-bold mb-2" style={{ color: "#ef4444" }}>ATENÇÃO</p>
                  {m.contras.map((p, j) => <p key={j} className="text-xs flex items-start gap-1.5 mb-1" style={{ color: C.muted }}><AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />{p}</p>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ANCORAGEM */}
        <h2 className="text-2xl font-bold mb-4">A estratégia de 3 planos (ancoragem de preço)</h2>
        <p className="text-lg leading-relaxed mb-6" style={{ color: C.muted }}>
          Nunca ofereça apenas 1 preço. Com 1 opção, a decisão do aluno é "compro ou não compro". Com 3 opções, a decisão passa a ser "qual compro". Essa mudança de enquadramento aumenta a taxa de conversão em 30-50%.
        </p>
        <div className="rounded-2xl overflow-hidden mb-12" style={{ border: `1px solid ${C.border}` }}>
          {[
            { nome: "Basic", desc: "Para quem está começando", exemplo: "R$1.500/mês · Calls quinzenais · Sem portal", destaque: false },
            { nome: "Pro ⭐", desc: "Para quem quer resultado consistente", exemplo: "R$3.500/mês · Calls semanais · Portal white-label · IA", destaque: true },
            { nome: "Premium", desc: "Para quem quer dedicação máxima", exemplo: "R$8.000/mês · Acesso direto · Imersão trimestral", destaque: false },
          ].map((p, i) => (
            <div key={i} className="p-5 flex items-start justify-between gap-4" style={{ background: p.destaque ? `${C.teal}08` : C.bg, borderTop: i > 0 ? `1px solid ${C.border}` : "none" }}>
              <div>
                <p className="font-bold" style={{ color: p.destaque ? C.teal : C.text }}>{p.nome}</p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>{p.desc}</p>
              </div>
              <p className="text-sm text-right" style={{ color: C.muted }}>{p.exemplo}</p>
            </div>
          ))}
        </div>

        {/* ERROS */}
        <h2 className="text-2xl font-bold mb-5">5 erros de precificação que custam caro</h2>
        <ul className="space-y-3 mb-12">
          {ERROS.map((e, i) => (
            <li key={i} className="flex items-start gap-3 text-sm" style={{ color: C.muted }}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
              {e}
            </li>
          ))}
        </ul>

        {/* EXPERIÊNCIA JUSTIFICA PREÇO */}
        <div className="rounded-2xl p-7 mb-10" style={{ background: `${C.teal}08`, border: `1px solid ${C.teal}25` }}>
          <DollarSign className="w-8 h-8 mb-3" style={{ color: C.teal }} />
          <h3 className="text-xl font-bold mb-2">A experiência que você entrega justifica o preço que você cobra</h3>
          <p className="leading-relaxed" style={{ color: C.muted }}>
            Portal profissional com a sua marca. Check-ins estruturados semanais. Briefing de call gerado por IA. Histórico completo da jornada do aluno. Cada elemento da sua operação é um argumento visual para o seu ticket. Quando o aluno entra numa plataforma com sua cara e vê organização em tudo, o preço deixa de ser questionado.
          </p>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <TrendingUp className="w-10 h-10 mx-auto mb-4" style={{ color: C.teal }} />
          <h3 className="text-2xl font-bold mb-2">Crie a operação que justifica seu preço</h3>
          <p className="mb-6" style={{ color: C.muted }}>Portal white-label, briefing com IA, check-ins e financeiro — tudo na sua marca. Setup em 5 minutos.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold" style={{ background: C.teal, color: "#ffffff" }}>
              Criar conta gratuita <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/precos" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold" style={{ background: C.card2, border: `1px solid ${C.border}`, color: C.text }}>
              Ver planos e preços
            </Link>
          </div>
        </div>

        <div className="mt-14">
          <p className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: C.muted }}>Leia também</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { href: "/blog/como-reduzir-churn-mentoria", titulo: "Como reduzir o churn na sua mentoria" },
              { href: "/blog/plataforma-mentoria-white-label", titulo: "Plataforma white-label: o que é e como escolher" },
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
