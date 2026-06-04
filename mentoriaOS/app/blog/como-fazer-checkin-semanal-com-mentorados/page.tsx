import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"

const SITE = "https://cklareza.com"
const SLUG = "/blog/como-fazer-checkin-semanal-com-mentorados"
const TITLE = "Check-in Semanal com Mentorados: Como Fazer de Forma Eficiente"
const DESC = "Guia prático para implementar check-ins semanais na sua mentoria: quais métricas pedir, como usar os dados na call e como a IA pode gerar o briefing automaticamente."
const DATE = "2026-06-04"

const C = { bg: "#ffffff", card: "#f8f9fa", border: "#e5e7eb", muted: "#6b7280", gold: "#d4af37", goldL: "#f0d97d", teal: "#13a3a3" }

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: SLUG },
  openGraph: { type: "article", url: `${SITE}${SLUG}`, title: TITLE, description: DESC, images: ["/logo.jpg"], locale: "pt_BR" },
  keywords: ["check-in semanal mentorados", "acompanhamento de mentorados", "como acompanhar alunos mentoria", "métricas mentoria", "briefing de call mentoria", "check-in com alunos"],
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
  inLanguage: "pt-BR",
  keywords: "check-in semanal, acompanhamento de mentorados, métricas de mentoria, briefing de call",
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
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm mb-8" style={{ color: C.muted }}>
          <ArrowLeft className="w-4 h-4" /> Blog
        </Link>

        <div className="flex items-center gap-3 text-xs mb-4" style={{ color: C.muted }}>
          <span className="px-2 py-0.5 rounded-full" style={{ background: `${C.teal}18`, color: C.teal }}>Acompanhamento</span>
          <span>4 jun 2026</span>
          <span>· 7 min de leitura</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{TITLE}</h1>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: C.muted }}>{DESC}</p>

        <div className="mt-10 space-y-8 text-base leading-relaxed" style={{ color: "#b8d0e8" }}>

          <section>
            <p>A call de mentoria mais produtiva não começa na call — começa antes. Quando o aluno preenche um <strong className="text-white">check-in semanal estruturado</strong>, o mentor chega à sessão com diagnóstico pronto, sabe o que melhorou, o que regrediu, e qual deve ser o foco dos próximos 50 minutos.</p>
            <p className="mt-4">Sem check-in, a call começa sempre do zero: "Como foi sua semana?" — e os primeiros 15 minutos são de atualização que poderia ter acontecido antes. Isso é custo alto para quem mentora 10, 20, 30 pessoas.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Por que o check-in semanal muda o jogo</h2>
            <p>O check-in cumpre três funções ao mesmo tempo:</p>
            <ul className="mt-3 space-y-3">
              {[
                { t: "Responsabilidade", d: "O aluno sabe que vai reportar os números toda semana. Isso por si só aumenta a execução." },
                { t: "Diagnóstico contínuo", d: "Com histórico de 4, 8, 12 semanas, você vê tendências que conversas soltas não mostram." },
                { t: "Briefing automático", d: "Com IA, o sistema lê os dados do check-in e gera a pauta da call — sem você precisar reler anotações anteriores." },
              ].map(item => (
                <li key={item.t} className="flex items-start gap-3 rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.teal }} />
                  <span><strong className="text-white">{item.t}:</strong> {item.d}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Quais métricas pedir no check-in</h2>
            <p>O check-in ideal tem duas partes: <strong className="text-white">métricas quantitativas</strong> (que permitem comparação semana a semana) e <strong className="text-white">contexto qualitativo</strong> (que explica os números).</p>

            <div className="mt-5 grid md:grid-cols-2 gap-4">
              <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <h3 className="font-bold text-white mb-3 text-sm">📊 Métricas quantitativas</h3>
                <ul className="space-y-1.5 text-sm" style={{ color: "#b8d0e8" }}>
                  {["Vendas realizadas (R$)", "Leads gerados", "Investimento em tráfego (R$)", "Vídeos / posts publicados", "Conversas iniciadas"].map(m => (
                    <li key={m} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C.teal }} />{m}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <h3 className="font-bold text-white mb-3 text-sm">📝 Contexto qualitativo</h3>
                <ul className="space-y-1.5 text-sm" style={{ color: "#b8d0e8" }}>
                  {["Maiores dificuldades da semana", "Tarefas executadas (vs. planejadas)", "O que funcionou diferente", "Dúvidas para a próxima call", "Nível de energia / motivação"].map(m => (
                    <li key={m} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C.gold }} />{m}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-4 text-sm" style={{ color: C.muted }}>Adapte as métricas ao nicho. Para mentoria de emagrecimento, seriam: peso, refeições dentro do plano, treinos realizados. Para mentoria jurídica: processos abertos, reuniões de clientes. O princípio é o mesmo.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Como transformar o check-in em briefing de call</h2>
            <p>Com os dados em mãos, você pode fazer o briefing manualmente (10–15 min por aluno) ou deixar a IA fazer isso. O fluxo com IA é:</p>

            <ol className="mt-4 space-y-4">
              {[
                { n: "1", t: "Aluno preenche o check-in", d: "Pelo portal do aluno — sem precisar de app separado. Leva 3–5 minutos." },
                { n: "2", t: "IA processa os dados", d: "O sistema lê o check-in atual + histórico das últimas semanas e identifica tendências, quedas e padrões." },
                { n: "3", t: "Briefing gerado automaticamente", d: "Diagnóstico do momento do aluno + pauta sugerida para a call (3–5 pontos prioritários)." },
                { n: "4", t: "Mentor abre o dashboard", d: "Antes da call, lê o briefing em 2 minutos e já sabe o que vai tratar. Nada de \"como foi a semana?\"." },
              ].map(s => (
                <li key={s.n} className="flex gap-4">
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0" style={{ background: `${C.teal}20`, color: C.teal, border: `1px solid ${C.teal}44` }}>{s.n}</span>
                  <div>
                    <p className="font-semibold text-white">{s.t}</p>
                    <p className="text-sm mt-0.5" style={{ color: "#b8d0e8" }}>{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Quando enviar e como garantir o preenchimento</h2>
            <p>O maior desafio do check-in não é o formato — é a consistência. Algumas boas práticas:</p>
            <ul className="mt-3 space-y-2 ml-4">
              {[
                "Defina um dia fixo (ex.: domingo à noite ou segunda de manhã, antes da call semanal)",
                "O link do portal deve estar sempre acessível — salvo no celular como app ou enviado no WhatsApp recorrente",
                "Primeiras semanas: lembre manualmente. Depois vira hábito",
                "Mostre ao aluno que os dados são usados na call — isso aumenta a adesão",
                "Não exija mais de 5 minutos de preenchimento",
              ].map(i => (
                <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.teal }} />{i}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Histórico como ferramenta de renovação</h2>
            <p>Depois de 3–4 meses de check-ins, você tem algo valioso: <strong className="text-white">evidência concreta da evolução do aluno</strong>. Vendas de R$ 8k para R$ 47k em 16 semanas. Taxa de conversão de 1,2% para 3,8%.</p>
            <p className="mt-4">Na conversa de renovação, você não precisa convencer com palavras — você mostra os dados. Isso muda completamente a dinâmica da renovação e aumenta o Lifetime Value da mentoria.</p>
            <p className="mt-4">Veja mais sobre isso em: <Link href="/blog/como-aumentar-a-retencao-de-mentorados" className="underline" style={{ color: C.goldL }}>Como aumentar a retenção de mentorados</Link>.</p>
          </section>

          <div className="rounded-2xl p-8 text-center mt-8" style={{ background: C.card, border: `1px solid ${C.gold}33` }}>
            <p className="text-lg font-bold text-white mb-2">Check-in integrado no CKlareza</p>
            <p className="text-sm mb-5" style={{ color: C.muted }}>Portal do aluno + briefing com IA + histórico de 12 semanas — tudo num só lugar.</p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              style={{ background: C.gold, color: "#1a1407" }}>
              Ver como funciona <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-12 pt-8" style={{ borderTop: `1px solid ${C.border}` }}>
            <p className="text-sm font-semibold text-white mb-4">Continue lendo</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { href: "/blog/como-aumentar-a-retencao-de-mentorados", t: "Como aumentar a retenção de mentorados", cat: "Retenção" },
                { href: "/blog/software-para-mentores-guia-completo", t: "Software para mentores: guia completo", cat: "Ferramentas" },
              ].map(p => (
                <Link key={p.href} href={p.href} className="rounded-xl p-4 block transition-all hover:-translate-y-0.5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <span className="text-xs" style={{ color: C.teal }}>{p.cat}</span>
                  <p className="text-sm font-semibold text-white mt-1">{p.t}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
