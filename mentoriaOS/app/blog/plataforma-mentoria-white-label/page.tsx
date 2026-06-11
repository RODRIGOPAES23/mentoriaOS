import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Building2, Star, Shield, Palette } from "lucide-react"
import { SiteHeader, SiteFooter } from "@/components/site/SiteChrome"

const SITE = "https://cklareza.com"
const SLUG = "/blog/plataforma-mentoria-white-label"
const TITLE = "Plataforma de Mentoria White-Label: O Que É e Como Escolher"
const DESC = "White-label em mentoria significa seus alunos verem só sua marca — não a do software. Entenda o que é, quais os benefícios reais e como avaliar uma plataforma de mentoria white-label para o seu negócio."
const DATE = "2026-06-09"

const C = { bg: "#ffffff", card: "#f8f9fa", card2: "#f3f4f6", border: "#e5e7eb", muted: "#6b7280", text: "#1f2937", gold: "#d4af37", goldL: "#f0d97d", teal: "#0f8a8a" }

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: SLUG, languages: { "pt-BR": SLUG, "x-default": SLUG } },
  openGraph: { type: "article", url: `${SITE}${SLUG}`, title: TITLE, description: DESC, images: ["/logo.jpg"], locale: "pt_BR", publishedTime: DATE },
  keywords: ["plataforma de mentoria white label", "white label mentoria", "mentoria com marca própria", "software mentoria white label", "plataforma mentoria personalizada", "sistema de mentoria white label Brasil", "mentoria high ticket plataforma"],
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
  keywords: "white label mentoria, plataforma mentoria white label, software mentores",
  inLanguage: "pt-BR",
  about: { "@type": "Thing", name: "Plataforma de Mentoria White-Label" },
}

const COMPARATIVO = [
  {
    aspecto: "Branding",
    semWL: "Aluno vê logo do software (\"Powered by X\")",
    comWL: "Aluno vê só a sua marca, cores e domínio",
  },
  {
    aspecto: "Percepção de valor",
    semWL: "Mentor parece usar ferramenta genérica",
    comWL: "Mentor parece ter produto premium próprio",
  },
  {
    aspecto: "Preço que você cobra",
    semWL: "Pressão para cobrar menos (percepção de amador)",
    comWL: "Justifica ticket mais alto (experiência premium)",
  },
  {
    aspecto: "Retenção de alunos",
    semWL: "Aluno compara com outras plataformas similares",
    comWL: "Aluno associa experiência ao mentor, não ao software",
  },
  {
    aspecto: "Escalabilidade",
    semWL: "Difícil criar sub-marcas ou empresas dentro",
    comWL: "Permite criar programas, turmas e sub-marcas",
  },
]

const CRITERIOS = [
  {
    icone: Palette,
    titulo: "Personalização real de marca",
    desc: "Verificar: logo próprio, cores personalizadas, domínio próprio (não subdomínio do software). Perguntar: o aluno vê alguma menção ao software em algum momento?",
    peso: "Crítico",
  },
  {
    icone: Building2,
    titulo: "Portal do aluno com sua identidade",
    desc: "O portal onde o aluno faz check-in, acessa materiais e acompanha sua jornada deve ser 100% com a identidade do mentor — não uma área genérica.",
    peso: "Crítico",
  },
  {
    icone: Star,
    titulo: "Funcionalidades operacionais completas",
    desc: "White-label só faz sentido se a plataforma tem: gestão financeira, atividades, check-in estruturado, histórico de calls, comunicação. Marca bonita em software ruim não resolve.",
    peso: "Alto",
  },
  {
    icone: Shield,
    titulo: "LGPD e segurança",
    desc: "Os dados dos seus alunos ficam em qual país? Há criptografia? Você pode exportar ou deletar os dados? Você é o controlador dos dados — precisa ter controle real.",
    peso: "Alto",
  },
  {
    icone: ArrowRight,
    titulo: "Suporte e evolução do produto",
    desc: "A plataforma é atualizada regularmente? Tem suporte em português? White-label em software estagnado é problemático — você fica preso em uma versão desatualizada.",
    peso: "Médio",
  },
]

export default function PlataformaMentoriaWhiteLabel() {
  return (
    <div style={{ background: C.bg, color: C.text }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
      <SiteHeader />

      <article className="max-w-3xl mx-auto px-5 pt-14 pb-20">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-80 transition-opacity" style={{ color: C.muted }}>
          <ArrowLeft className="w-4 h-4" /> Blog
        </Link>

        <div className="mb-8">
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: C.teal }}>White-Label & Branding</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-3 leading-tight">{TITLE}</h1>
          <p className="text-lg mt-4 leading-relaxed" style={{ color: C.muted }}>{DESC}</p>
          <div className="flex items-center gap-4 mt-5 text-sm" style={{ color: C.muted }}>
            <span>CKlareza · {new Date(DATE).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
            <span>·</span>
            <span>8 min de leitura</span>
          </div>
        </div>

        {/* O QUE É */}
        <h2 className="text-2xl font-bold mt-10 mb-4">O que é white-label em mentoria?</h2>
        <p className="text-lg leading-relaxed mb-4" style={{ color: C.muted }}>
          White-label (ou marca branca) significa que você usa a tecnologia de um terceiro, mas seus clientes
          veem <strong style={{ color: C.text }}>só a sua marca</strong>. Sem menção ao software por baixo. Sem logo
          de outra empresa. Sem "Powered by X" em nenhum canto.
        </p>
        <p className="text-lg leading-relaxed mb-4" style={{ color: C.muted }}>
          Em mentoria, isso se traduz em: seu aluno acessa um portal com o <strong style={{ color: C.text }}>seu logo, suas cores e seu domínio</strong>. Ele faz check-in na "Plataforma da [Seu Nome]" — não em algum software genérico de terceiro. Você entrega uma experiência premium com identidade própria. O motor fica invisível.
        </p>
        <p className="text-lg leading-relaxed mb-10" style={{ color: C.muted }}>
          É a diferença entre aparecer em uma reunião de Zoom genérico e aparecer em uma sala de reunião virtual com o seu nome na porta.
        </p>

        {/* POR QUE IMPORTA */}
        <h2 className="text-2xl font-bold mb-4">Por que white-label importa para mentoria high-ticket?</h2>
        <p className="text-lg leading-relaxed mb-6" style={{ color: C.muted }}>
          Em mentoria high-ticket (R$3.000–R$20.000/mês), percepção é parte do produto. Quando um aluno paga
          esse valor, ele espera uma experiência à altura. Um Calendly genérico, um formulário do Google, um
          Notion público — esses detalhes corroem a percepção de valor mesmo que o conteúdo seja excelente.
        </p>

        <div className="rounded-2xl p-6 mb-4" style={{ background: `${C.teal}08`, border: `1px solid ${C.teal}25` }}>
          <p className="font-bold mb-2" style={{ color: C.teal }}>O efeito direto no preço</p>
          <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
            Mentores com plataforma white-label consistentemente cobram 20-40% mais — e têm maior taxa de renovação.
            O aluno não está comparando o mentor com outros mentores. Está comparando a experiência com o que ele
            conhece de outros produtos premium. White-label profissional passa no teste silencioso de percepção de qualidade.
          </p>
        </div>

        <p className="text-lg leading-relaxed mb-12" style={{ color: C.muted }}>
          Além disso, quando o aluno associa toda a experiência à sua marca (não ao software), ele cria um
          vínculo com <em>você</em> — não com a ferramenta. Isso é relevante na hora da renovação: ele renova
          com o mentor, não com a plataforma.
        </p>

        {/* COMPARATIVO */}
        <h2 className="text-2xl font-bold mb-6">Sem white-label vs. com white-label: comparativo direto</h2>
        <div className="rounded-2xl overflow-hidden mb-12" style={{ border: `1px solid ${C.border}` }}>
          <div className="grid grid-cols-3 text-xs font-bold uppercase tracking-wider p-3 gap-2" style={{ background: C.card2, color: C.muted }}>
            <span>Aspecto</span>
            <span style={{ color: "#ef4444" }}>Sem white-label</span>
            <span style={{ color: C.teal }}>Com white-label</span>
          </div>
          {COMPARATIVO.map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 p-3 text-sm items-start" style={{ background: i % 2 === 0 ? C.bg : C.card, borderTop: `1px solid ${C.border}` }}>
              <span className="font-semibold">{row.aspecto}</span>
              <span style={{ color: C.muted }} className="flex items-start gap-1.5">
                <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                {row.semWL}
              </span>
              <span style={{ color: C.muted }} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: C.teal }} />
                {row.comWL}
              </span>
            </div>
          ))}
        </div>

        {/* COMO AVALIAR */}
        <h2 className="text-2xl font-bold mb-6">5 critérios para avaliar uma plataforma de mentoria white-label</h2>
        <div className="space-y-5 mb-12">
          {CRITERIOS.map((c, i) => (
            <div key={i} className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${C.teal}12`, border: `1px solid ${C.teal}25` }}>
                  <c.icone className="w-5 h-5" style={{ color: C.teal }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold">{c.titulo}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: c.peso === "Crítico" ? "#fef2f2" : c.peso === "Alto" ? `${C.teal}12` : C.card2, color: c.peso === "Crítico" ? "#ef4444" : c.peso === "Alto" ? C.teal : C.muted }}>
                      {c.peso}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{c.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PERGUNTAS A FAZER */}
        <h2 className="text-2xl font-bold mb-5">Perguntas que você deve fazer antes de contratar</h2>
        <ul className="space-y-3 mb-12">
          {[
            "O aluno vê alguma menção ao nome do software em qualquer tela?",
            "Posso usar meu próprio domínio (portal.minhamarca.com.br)?",
            "O app mobile (se houver) aparece com o nome da minha empresa na App Store?",
            "Consigo personalizar as cores, fontes e logo sem depender do suporte?",
            "Os dados dos meus alunos ficam em qual país e sob qual legislação?",
            "Posso exportar todos os dados se decidir mudar de plataforma?",
            "O plano white-label tem limite de alunos ou é ilimitado?",
          ].map((q, i) => (
            <li key={i} className="flex items-start gap-3 text-sm" style={{ color: C.muted }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-xs mt-0.5" style={{ background: `${C.teal}15`, color: C.teal }}>{i + 1}</span>
              {q}
            </li>
          ))}
        </ul>

        {/* CKLAREZA */}
        <div className="rounded-2xl p-7 mb-10" style={{ background: `linear-gradient(135deg, ${C.teal}08, ${C.teal}15)`, border: `1px solid ${C.teal}30` }}>
          <h3 className="text-xl font-bold mb-3">Como o CKlareza entrega white-label</h3>
          <ul className="space-y-2">
            {[
              "Portal do aluno com seu logo, suas cores e seu domínio — sem menção ao CKlareza",
              "Check-in semanal, histórico de jornada e materiais com a sua identidade visual",
              "Multi-mentor por empresa: crie sua equipe de mentores com acesso segregado",
              "IA para briefing de call integrada nativamente — não um add-on externo",
              "Dados hospedados com criptografia, LGPD-compliant, você é o controlador",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.teal }} />
                <span style={{ color: C.muted }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CONCLUSÃO */}
        <h2 className="text-2xl font-bold mt-12 mb-4">White-label não é luxo — é posicionamento</h2>
        <p className="text-lg leading-relaxed mb-4" style={{ color: C.muted }}>
          Para mentores que cobram acima de R$2.000/mês, white-label deixou de ser diferencial e virou
          expectativa. Seus alunos pagam por uma experiência premium. A ferramenta que eles usam toda semana
          precisa comunicar isso visualmente.
        </p>
        <p className="text-lg leading-relaxed mb-12" style={{ color: C.muted }}>
          Use os critérios deste guia para avaliar as opções disponíveis — e verifique sempre se o white-label
          é real (sua marca em tudo) ou apenas cosmético (nome do software em letras pequenas em algum canto).
        </p>

        {/* CTA */}
        <div className="rounded-2xl p-8 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="text-2xl font-bold mb-2">Veja o white-label do CKlareza em ação</h3>
          <p className="mb-6" style={{ color: C.muted }}>
            Crie uma conta gratuita e configure o portal com a sua marca em 5 minutos. Sem cartão.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold" style={{ background: C.teal, color: "#ffffff" }}>
              Criar conta gratuita <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contato" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold" style={{ background: C.card2, border: `1px solid ${C.border}`, color: C.text }}>
              Agendar demonstração
            </Link>
          </div>
        </div>

        <div className="mt-14">
          <p className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: C.muted }}>Leia também</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { href: "/blog/software-para-mentores-guia-completo", titulo: "Software para mentores: guia completo 2026" },
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
