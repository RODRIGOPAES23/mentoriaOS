import type { Metadata } from "next"
import { CheckCircle2 } from "lucide-react"
import { SiteHeader, SiteFooter, LifetimeValueCTA, SC } from "@/components/site/SiteChrome"
import PricingCalc from "./PricingCalc"

export const metadata: Metadata = {
  title: "Preços — Planos de Mentoria White-Label | CKlareza",
  description: "Calcule seu desconto real. Preço por mentorado com até 80% de desconto. Planos sob medida para mentores e empresas de mentoria. Teste grátis, sem cartão.",
  alternates: { canonical: "/precos", languages: { "pt-BR": "/precos", "en-US": "/precos", "es-ES": "/precos", "x-default": "/precos" } },
  openGraph: { url: "https://cklareza.com/precos" },
}

const FAQ_PRECOS = [
  { q: "Quanto custa o CKlareza?", a: "O CKlareza é precificado por mentorado ativo, com desconto progressivo: quanto mais alunos, menor o custo unitário. Use nossa calculadora para ver o valor exato para o seu número de mentorados." },
  { q: "Preciso de cartão de crédito para testar?", a: "Não. Você cria conta gratuitamente e explora o sistema completo sem inserir dados de pagamento. O cartão só é necessário quando você decidir assinar um plano." },
  { q: "O plano inclui white-label completo?", a: "White-label (logo, cores e domínio próprio) está disponível nos planos com mais de 20 mentorados ativos. Nos planos menores, você opera com a interface padrão do CKlareza." },
  { q: "Posso cancelar quando quiser?", a: "Sim. Cancelamento com 1 clique, sem multa, sem burocracia, sem período mínimo de fidelidade. Você mantém acesso até o fim do período pago." },
  { q: "Qual o limite de mentorados por plano?", a: "Não há limite fixo — o preço é proporcional ao número de mentorados ativos. Quanto mais alunos, maior o desconto unitário. Fale com a gente para volumes acima de 100 mentorados." },
  { q: "O preço muda se eu adicionar um mentor à minha equipe?", a: "Mentores adicionais podem ser incluídos nos planos empresariais. Entre em contato para um orçamento sob medida para equipes." },
]

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_PRECOS.map(f => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
}

export default function Precos() {
  return (
    <div style={{ background: SC.bg, color: SC.text }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      <SiteHeader />

      {/* Hero da página */}
      <section className="max-w-4xl mx-auto px-5 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: SC.text }}>
          Planos sob medida
        </h1>
        <p className="text-lg mt-4 max-w-2xl mx-auto" style={{ color: SC.muted }}>
          Preço por mentorado — quanto maior sua operação, maior o desconto.
          Use a calculadora abaixo para ver exatamente quanto você vai pagar.
        </p>
      </section>

      {/* Calculadora + Tabela + Cards (client component) */}
      <PricingCalc />

      {/* FAQ — rich snippets no Google */}
      <section className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Perguntas frequentes sobre preços</h2>
        <div className="space-y-4">
          {FAQ_PRECOS.map((f, i) => (
            <details key={i} className="rounded-2xl group" style={{ background: SC.card, border: `1px solid ${SC.border}` }}>
              <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold select-none list-none">
                <span>{f.q}</span>
                <CheckCircle2 className="w-4 h-4 shrink-0 ml-3" style={{ color: SC.teal }} />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: SC.muted }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <LifetimeValueCTA />
      <SiteFooter />
    </div>
  )
}
