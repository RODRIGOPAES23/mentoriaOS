import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, Lock, Database, Download, FileText, CheckCircle, ArrowRight } from "lucide-react"
import { SiteHeader, SiteFooter, LifetimeValueCTA } from "@/components/site/SiteChrome"
import { SC_LIGHT as SC } from "@/lib/colors-light"

export const metadata: Metadata = {
  title: "Segurança & Conformidade — CKlareza",
  description: "LGPD, criptografia, isolamento de dados, backup. A CKlareza foi construída para empresas que tratam privacidade e proteção de dados com responsabilidade.",
  alternates: { canonical: "/seguranca" },
}

const PILARES = [
  {
    icon: ShieldCheck,
    titulo: "LGPD — Lei 13.709/2018",
    descricao: "Todos os processos da CKlareza seguem as melhores práticas de proteção de dados pessoais. Você e seus mentorados têm controle total sobre as informações.",
  },
  {
    icon: Database,
    titulo: "Isolamento de Dados",
    descricao: "Cada empresa, mentor e mentorado possui ambiente lógico separado e protegido. Dados de um cliente nunca são acessíveis a outro.",
  },
  {
    icon: Lock,
    titulo: "Criptografia",
    descricao: "Dados protegidos em trânsito (HTTPS) e em repouso. Infraestrutura Supabase com criptografia de nível enterprise.",
  },
  {
    icon: Download,
    titulo: "Exportação & Exclusão",
    descricao: "Você pode exportar todos os seus dados em JSON a qualquer momento. Mentorados também podem anonimizar ou deletar suas informações via portal.",
  },
  {
    icon: FileText,
    titulo: "Auditoria",
    descricao: "Rastreamento automático de ações críticas. Histórico operacional completo para investigação e compliance.",
  },
]

const PT_CONTENT = {
  eyebrow: "SEGURANÇA EM PRIMEIRO LUGAR",
  h1: "Construído para empresas que levam privacidade a sério.",
  intro: "A CKlareza foi desenhada desde o início para atender organizações que tratam dados com responsabilidade. Não é um add-on — segurança é parte do core.",

  lgpdTitle: "Proteção de Dados (LGPD)",
  lgpdText: "Você é o controlador dos dados dos seus mentorados perante a Lei 13.709/2018. A CKlareza é o operador. Isso significa: você tem controle, você decide quem acessa, você pode exportar ou deletar a qualquer momento.",

  direitos: "Direitos do Titular",
  direitos_items: [
    "Acessar todos os seus dados",
    "Corrigir informações inexatas",
    "Solicitar exclusão de conta",
    "Exportar dados em formato estruturado",
    "Portabilidade para outro serviço",
  ],

  ctaTitle: "Quer entender melhor?",
  ctaText: "Leia nossa política de privacidade completa ou fale com a gente.",
  ctaBtn1: "Ver Política de Privacidade",
  ctaBtn2: "Agendar Conversa",

  trust: "Trust Signals",
  trustItems: [
    "100 em SEO e Boas Práticas no Google PageSpeed",
    "Verificado no Google Search Console",
    "Hospedado na Vercel (infraestrutura global)",
    "Dados no Supabase (nível enterprise)",
  ],
}

const EN_CONTENT = {
  eyebrow: "SECURITY FIRST",
  h1: "Built for companies that take data privacy seriously.",
  intro: "CKlareza was designed from day one to serve organizations that handle data responsibly. It's not an add-on — security is part of the core.",

  lgpdTitle: "Data Protection (LGPD & GDPR-aligned)",
  lgpdText: "You are the controller of your mentees' data. CKlareza is the processor. This means: you have control, you decide who accesses what, you can export or delete anytime.",

  direitos: "Your Data Rights",
  direitos_items: [
    "Access all your data",
    "Correct inaccurate information",
    "Request account deletion",
    "Export data in structured format",
    "Portability to another service",
  ],

  ctaTitle: "Want to learn more?",
  ctaText: "Read our full privacy policy or get in touch.",
  ctaBtn1: "View Privacy Policy",
  ctaBtn2: "Schedule a Call",

  trust: "Trust Signals",
  trustItems: [
    "100 in SEO & Best Practices on Google PageSpeed",
    "Verified on Google Search Console",
    "Hosted on Vercel (global infrastructure)",
    "Data on Supabase (enterprise-grade)",
  ],
}

const ES_CONTENT = {
  eyebrow: "SEGURIDAD PRIMERO",
  h1: "Construido para empresas que tratan la privacidad con responsabilidad.",
  intro: "CKlareza fue diseñado desde el inicio para servir organizaciones que manejan datos responsablemente. No es un complemento — la seguridad es parte del core.",

  lgpdTitle: "Protección de Datos (LGPD alineado)",
  lgpdText: "Tú eres el controlador de los datos de tus mentorados. CKlareza es el procesador. Esto significa: tienes control, decides quién accede, puedes exportar o eliminar en cualquier momento.",

  direitos: "Tus Derechos",
  direitos_items: [
    "Acceso a todos tus datos",
    "Corregir información inexacta",
    "Solicitar eliminación de cuenta",
    "Exportar datos en formato estructurado",
    "Portabilidad a otro servicio",
  ],

  ctaTitle: "¿Quieres saber más?",
  ctaText: "Lee nuestra política de privacidad completa o habla con nosotros.",
  ctaBtn1: "Ver Política de Privacidad",
  ctaBtn2: "Agendar Llamada",

  trust: "Señales de Confianza",
  trustItems: [
    "100 en SEO y Prácticas Recomendadas en Google PageSpeed",
    "Verificado en Google Search Console",
    "Hospedado en Vercel (infraestructura global)",
    "Datos en Supabase (nivel enterprise)",
  ],
}

function SecurityPage({ content, lang }: { content: typeof PT_CONTENT; lang: string }) {
  return (
    <div style={{ background: SC.bg, color: SC.text }} className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="max-w-3xl mx-auto px-5 pt-20 pb-12 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: `rgb(var(--sc-teal-rgb) / 0.09)`, border: `1px solid rgb(var(--sc-teal-rgb) / 0.27)` }}>
          <ShieldCheck className="w-7 h-7" style={{ color: SC.teal }} />
        </div>
        <span className="text-xs font-bold tracking-[0.3em]" style={{ color: SC.teal }}>{content.eyebrow}</span>
        <h1 className="text-4xl md:text-5xl font-bold mt-4">{content.h1}</h1>
        <p className="text-lg md:text-xl mt-6 leading-relaxed max-w-2xl mx-auto" style={{ color: SC.muted }}>
          {content.intro}
        </p>
      </section>

      {/* PILARES */}
      <section className="max-w-5xl mx-auto px-5 pb-16 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PILARES.map(p => (
          <div key={p.titulo} className="rounded-2xl p-6" style={{ background: SC.card, border: `1px solid ${SC.border}` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `rgb(var(--sc-teal-rgb) / 0.09)`, border: `1px solid rgb(var(--sc-teal-rgb) / 0.2)` }}>
              <p.icon className="w-6 h-6" style={{ color: SC.teal }} />
            </div>
            <h3 className="font-bold text-lg">{p.titulo}</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: SC.muted }}>{p.descricao}</p>
          </div>
        ))}
      </section>

      {/* LGPD DETAILS */}
      <section className="py-16" style={{ background: SC.card, borderTop: `1px solid ${SC.border}`, borderBottom: `1px solid ${SC.border}` }}>
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="text-3xl font-bold mb-3">{content.lgpdTitle}</h2>
          <p className="text-lg leading-relaxed mb-10" style={{ color: SC.muted }}>
            {content.lgpdText}
          </p>

          <h3 className="text-xl font-bold mb-4">{content.direitos}</h3>
          <ul className="space-y-3">
            {content.direitos_items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 shrink-0 mt-1" style={{ color: SC.teal }} />
                <span className="text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="text-2xl font-bold mb-6">{content.trust}</h2>
        <div className="grid gap-3">
          {content.trustItems.map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl p-4" style={{ background: `rgb(var(--sc-teal-rgb) / 0.07)`, border: `1px solid rgb(var(--sc-teal-rgb) / 0.2)` }}>
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: SC.teal }} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-5 pb-20 text-center">
        <div className="rounded-2xl p-8" style={{ background: SC.card, border: `1px solid ${SC.border}` }}>
          <h2 className="text-2xl font-bold">{content.ctaTitle}</h2>
          <p className="mt-3 text-lg" style={{ color: SC.muted }}>{content.ctaText}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link href="/privacidade" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm" style={{ background: `rgb(var(--sc-teal-rgb) / 0.09)`, color: SC.teal, border: `1px solid rgb(var(--sc-teal-rgb) / 0.27)` }}>
              {content.ctaBtn1}
            </Link>
            <Link href="/contato" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm" style={{ background: SC.gold, color: "#1a1407" }}>
              {content.ctaBtn2} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <LifetimeValueCTA />
      <SiteFooter />
    </div>
  )
}

export default function Seguranca() {
  return <SecurityPage content={PT_CONTENT} lang="pt" />
}
