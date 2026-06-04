"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Sparkles, LayoutDashboard, DollarSign, KanbanSquare, Brain,
  Building2, ArrowRight, Check, Phone, ShieldCheck, Star, Globe, Heart,
} from "lucide-react"

const GOLD = "#d4af37"
const GOLD_LIGHT = "#f0d97d"
const TEAL = "#13a3a3"
const BG = "#ffffff"
const CARD = "#f8f9fa"
const BORDER = "#e5e7eb"
const MUTED = "#6b7280"

type Lang = "pt" | "en" | "es"
const LANGS: { code: Lang; label: string }[] = [
  { code: "pt", label: "PT" }, { code: "en", label: "EN" }, { code: "es", label: "ES" },
]

const T: Record<Lang, any> = {
  pt: {
    nav: ["Recursos", "White-label", "Propósito", "Planos"], entrar: "Entrar",
    badge: "A Evolução da Mentoria Digital",
    h1a: "Sua mentoria merece", h1b: "clareza absoluta.",
    sub: "Abandone o caos das planilhas e do WhatsApp. CKlareza é o ecossistema premium para mentores que transformam resultados em ",
    subStrong: "legado.",
    cta1: "Começar Grátis", cta2: "Ver Demo",
    trust: ["Sem cartão para testar", "Dados protegidos (LGPD)", "Verificado no Google"],
    mock: ["A receber", "Calls na semana", "Tarefas atrasadas", "Mentorados"],
    recT: "Tudo para operar sua mentoria", recS: "Um sistema, não dez planilhas.",
    feats: [
      ["Dashboard de operação", "Tudo que importa numa tela: pendências, calls, progresso e renovações — sem rolar."],
      ["Financeiro inteligente", "Cobranças, inadimplência e projeção. Saiba quem paga, quanto e quando."],
      ["Atividades em Kanban", "As tarefas de todos os mentorados num quadro: a fazer, atrasadas e concluídas."],
      ["Briefing com IA", "A IA lê os check-ins e entrega o diagnóstico e a pauta da próxima call, prontos."],
      ["Calls + Portal do aluno", "Agenda, esteira de calls e um portal onde o mentorado faz check-in e acompanha a jornada."],
      ["White-label de verdade", "Sua marca, suas cores, seu domínio. O motor é nosso, a identidade é da sua empresa."],
    ],
    wlLabel: "WHITE-LABEL", wlT: "Sua marca. Nosso motor.",
    wlText: "Seus clientes com CKlareza na sua marca, seu estilo, seu método e sua filosofia.",
    wlBullets: ["Logo, cores e domínio próprios", "Vários mentores por empresa", "Cada um vê só o que é seu", "Revenda para outros clientes"],
    wlCardT: "Painel de controle do dono", wlCardD: "Gerencie todas as empresas, mentores e mentorados num só lugar.",
    propLabel: "NOSSO PROPÓSITO", propT: "Transformar vidas.",
    propText: "Não vendemos software — damos ao mentor o tempo e a clareza para fazer o que importa: transformar a vida de quem confia nele. Cada recurso aqui existe para isso.",
    ctaT: "Pronto para elevar sua mentoria?", ctaS: "Entre agora e veja sua operação organizada em minutos.", ctaBtn: "Acessar o sistema",
    foot: "Entrar →",
    faqT: "Perguntas frequentes",
    faq: [
      ["O que é o CKlareza?", "É uma plataforma de mentoria white-label: você organiza o financeiro, as atividades e as calls dos seus mentorados num só lugar, com a sua marca e uma inteligência que mostra quem precisa de atenção agora."],
      ["O CKlareza é white-label?", "Sim. Você usa o seu logo, as suas cores e o seu domínio próprio. Seus clientes veem a sua empresa — o motor é o CKlareza."],
      ["Para quem é o CKlareza?", "Para mentores e empresas de mentoria que querem profissionalizar o acompanhamento e aumentar a retenção (Lifetime Value) dos mentorados."],
      ["Preciso instalar algo?", "Não. É 100% web, sem instalação. Você acessa pelo navegador e pode testar sem cartão."],
    ],
  },
  en: {
    nav: ["Features", "White-label", "Purpose", "Plans"], entrar: "Sign in",
    badge: "The Evolution of Digital Mentoring",
    h1a: "Your mentorship deserves", h1b: "absolute clarity.",
    sub: "Leave behind the chaos of spreadsheets and WhatsApp. CKlareza is the premium ecosystem for mentors who transform results into ",
    subStrong: "legacy.",
    cta1: "Start Free", cta2: "See Demo",
    trust: ["No card to try", "Protected data (LGPD)", "Verified by Google"],
    mock: ["To receive", "Calls this week", "Overdue tasks", "Mentees"],
    recT: "Everything to run your mentorship", recS: "One system, not ten spreadsheets.",
    feats: [
      ["Operations dashboard", "Everything that matters on one screen: dues, calls, progress and renewals — no scrolling."],
      ["Smart finance", "Charges, overdue and forecast. Know who pays, how much and when."],
      ["Kanban activities", "Every mentee's tasks on one board: to do, overdue and done."],
      ["AI briefing", "AI reads the check-ins and delivers the diagnosis and next-call agenda, ready."],
      ["Calls + Mentee portal", "Schedule, call pipeline and a portal where the mentee checks in and tracks the journey."],
      ["True white-label", "Your brand, your colors, your domain. The engine is ours, the identity is your company's."],
    ],
    wlLabel: "WHITE-LABEL", wlT: "Your brand. Our engine.",
    wlText: "Your clients experience CKlareza under your brand, your style, your method and your philosophy.",
    wlBullets: ["Own logo, colors and domain", "Multiple mentors per company", "Each sees only what's theirs", "Resell to other clients"],
    wlCardT: "Owner control panel", wlCardD: "Manage all companies, mentors and mentees in one place.",
    propLabel: "OUR PURPOSE", propT: "Transform lives.",
    propText: "We don't sell software — we give mentors the time and clarity to do what matters: transform the life of those who trust them. Every feature here exists for that.",
    ctaT: "Ready to elevate your mentorship?", ctaS: "Sign in now and see your operation organized in minutes.", ctaBtn: "Access the system",
    foot: "Sign in →",
    faqT: "Frequently asked questions",
    faq: [
      ["What is CKlareza?", "A white-label mentorship platform: organize your mentees' finances, tasks and calls in one place, under your brand, with intelligence that shows who needs attention now."],
      ["Is CKlareza white-label?", "Yes. Use your own logo, colors and domain. Your clients see your company — the engine is CKlareza."],
      ["Who is CKlareza for?", "For mentors and mentorship companies that want to professionalize follow-up and increase mentee retention (Lifetime Value)."],
      ["Do I need to install anything?", "No. It's 100% web, no install. Access it from the browser and try it without a card."],
    ],
  },
  es: {
    nav: ["Recursos", "White-label", "Propósito", "Planes"], entrar: "Entrar",
    badge: "La Evolución de la Mentoría Digital",
    h1a: "Tu mentoría merece", h1b: "claridad absoluta.",
    sub: "Abandona el caos de las hojas de cálculo y WhatsApp. CKlareza es el ecosistema premium para mentores que transforman resultados en ",
    subStrong: "legado.",
    cta1: "Comenzar Gratis", cta2: "Ver Demo",
    trust: ["Sin tarjeta para probar", "Datos protegidos (LGPD)", "Verificado por Google"],
    mock: ["Por cobrar", "Calls esta semana", "Tareas vencidas", "Mentoreados"],
    recT: "Todo para operar tu mentoría", recS: "Un sistema, no diez planillas.",
    feats: [
      ["Panel de operación", "Todo lo que importa en una pantalla: pendientes, calls, progreso y renovaciones."],
      ["Finanzas inteligentes", "Cobros, morosidad y proyección. Sabe quién paga, cuánto y cuándo."],
      ["Actividades en Kanban", "Las tareas de todos los mentoreados en un tablero: por hacer, vencidas y hechas."],
      ["Briefing con IA", "La IA lee los check-ins y entrega el diagnóstico y la agenda de la próxima call."],
      ["Calls + Portal del alumno", "Agenda, pipeline de calls y un portal donde el mentoreado hace check-in."],
      ["White-label real", "Tu marca, tus colores, tu dominio. El motor es nuestro, la identidad es de tu empresa."],
    ],
    wlLabel: "WHITE-LABEL", wlT: "Tu marca. Nuestro motor.",
    wlText: "Tus clientes con CKlareza en tu marca, tu estilo, tu método y tu filosofía.",
    wlBullets: ["Logo, colores y dominio propios", "Varios mentores por empresa", "Cada uno ve solo lo suyo", "Revende a otros clientes"],
    wlCardT: "Panel de control del dueño", wlCardD: "Gestiona todas las empresas, mentores y mentoreados en un solo lugar.",
    propLabel: "NUESTRO PROPÓSITO", propT: "Transformar vidas.",
    propText: "No vendemos software — le damos al mentor el tiempo y la claridad para hacer lo que importa: transformar la vida de quien confía en él.",
    ctaT: "¿Listo para elevar tu mentoría?", ctaS: "Entra ahora y ve tu operación organizada en minutos.", ctaBtn: "Acceder al sistema",
    foot: "Entrar →",
    faqT: "Preguntas frecuentes",
    faq: [
      ["¿Qué es CKlareza?", "Una plataforma de mentoría white-label: organiza las finanzas, tareas y calls de tus mentoreados en un solo lugar, con tu marca e inteligencia que muestra quién necesita atención ahora."],
      ["¿CKlareza es white-label?", "Sí. Usa tu logo, tus colores y tu dominio propio. Tus clientes ven tu empresa — el motor es CKlareza."],
      ["¿Para quién es CKlareza?", "Para mentores y empresas de mentoría que quieren profesionalizar el seguimiento y aumentar la retención (Lifetime Value)."],
      ["¿Necesito instalar algo?", "No. Es 100% web, sin instalación. Accede desde el navegador y pruébalo sin tarjeta."],
    ],
  },
}

function Logo({ size = "md" }: { size?: "md" | "sm" }) {
  return (
    <div className="flex items-center gap-2">
      <Sparkles className="shrink-0" style={{ color: GOLD, width: size === "sm" ? 18 : 22, height: size === "sm" ? 18 : 22 }} />
      <div className="leading-none">
        <span className="font-bold tracking-tight" style={{
          fontSize: size === "sm" ? 18 : 22,
          background: `linear-gradient(180deg, ${GOLD_LIGHT} 0%, ${GOLD} 55%, #9c7d2e 100%)`,
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        }}>CKlareza</span>
        {size === "md" && <span className="block text-[9px] tracking-[0.25em] mt-0.5" style={{ color: TEAL }}>LIFETIME VALUE</span>}
      </div>
    </div>
  )
}

const FEAT_ICONS = [LayoutDashboard, DollarSign, KanbanSquare, Brain, Phone, Building2]
const FEAT_CORES = [TEAL, "#22c55e", "#4c9aff", "#a855f7", GOLD, TEAL]

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("pt")
  const [openLang, setOpenLang] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("ck_lang") as Lang | null
    if (saved && LANGS.some(l => l.code === saved)) { setLang(saved); return }
    const nav = navigator.language.slice(0, 2)
    if (nav === "en" || nav === "es") setLang(nav as Lang)
  }, [])

  const t = T[lang]
  const escolher = (l: Lang) => { setLang(l); localStorage.setItem("ck_lang", l); setOpenLang(false) }

  return (
    <div style={{ background: BG, color: "#fff" }} className="min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: `${BG}cc`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm" style={{ color: MUTED }}>
            <Link href="/recursos" className="hover:text-white transition-colors">{t.nav[0]}</Link>
            <Link href="/precos" className="hover:text-white transition-colors">{t.nav[3]}</Link>
            <Link href="/sobre" className="hover:text-white transition-colors">{t.nav[2]}</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/contato" className="hover:text-white transition-colors">Contato</Link>
          </nav>
          <div className="flex items-center gap-3">
            {/* Seletor de idioma */}
            <div className="relative">
              <button onClick={() => setOpenLang(o => !o)} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm" style={{ color: MUTED, border: `1px solid ${BORDER}` }}>
                <Globe className="w-4 h-4" /> {lang.toUpperCase()}
              </button>
              {openLang && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenLang(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 rounded-lg overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                    {LANGS.map(l => (
                      <button key={l.code} onClick={() => escolher(l.code)}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-white/5"
                        style={{ color: l.code === lang ? GOLD : "#fff" }}>{l.label}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all" style={{ background: GOLD, color: "#1a1407" }}>
              {t.entrar} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO 3D */}
      <section className="relative overflow-hidden" style={{ perspective: "1200px" }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(60% 50% at 50% 0%, ${TEAL}33 0%, transparent 70%)` }} />
        <div className="relative max-w-5xl mx-auto px-5 pt-24 pb-20 text-center" style={{ transformStyle: "preserve-3d" }}>
          <div style={{ transform: "rotateX(8deg) rotateZ(-2deg)", transformStyle: "preserve-3d", transition: "transform 0.6s ease" }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-8 font-bold" style={{ background: `${GOLD}18`, border: `2px solid ${GOLD}44`, color: GOLD_LIGHT, boxShadow: `0 10px 40px ${GOLD}22` }}>
              <Star className="w-4 h-4 animate-pulse" /> {t.badge}
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]" style={{ transform: "translateZ(20px)", textShadow: `0 20px 40px ${GOLD}40` }}>
              {t.h1a}<br />
              <span style={{
                background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, ${GOLD_LIGHT})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                display: "inline-block",
                filter: "drop-shadow(0 10px 30px " + GOLD + "44)"
              }}>{t.h1b}</span>
            </h1>
            <p className="text-xl md:text-2xl mt-8 max-w-3xl mx-auto leading-relaxed font-light" style={{ color: MUTED, transform: "translateZ(10px)" }}>
              {t.sub}<span className="font-semibold" style={{ color: "#fff" }}>{t.subStrong}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12" style={{ transform: "translateZ(15px)" }}>
            <Link href="/login" className="flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold transition-all hover:scale-105" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#1a1407", boxShadow: `0 20px 50px ${GOLD}44`, cursor: "pointer" }}>
              {t.cta1} <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#recursos" className="px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:scale-105" style={{ background: CARD, border: `2px solid ${BORDER}`, color: "#fff", boxShadow: `0 10px 30px rgba(0,0,0,0.1)`, backdropFilter: "blur(10px)" }}>{t.cta2}</a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10 text-sm font-semibold" style={{ transform: "translateZ(5px)", color: MUTED }}>
            {t.trust.map((x: string) => <span key={x} className="flex items-center gap-2.5"><Check className="w-4 h-4" style={{ color: GOLD }} /> {x}</span>)}
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto px-5 pb-8" style={{ perspective: "1000px" }}>
          <div style={{
            transform: "rotateX(15deg) rotateY(-5deg)",
            transformStyle: "preserve-3d",
            transition: "transform 0.6s ease"
          }} className="rounded-3xl p-2 overflow-hidden" style={{ background: CARD, border: `2px solid ${GOLD}44`, boxShadow: `0 40px 120px -30px ${GOLD}50, inset 0 1px 0 ${GOLD}22` }}>
            <Image src="/logo.jpg" alt="CKlareza — plataforma de mentoria white-label, Lifetime Value"
              width={1200} height={655} priority sizes="(max-width: 768px) 100vw, 768px"
              className="w-full h-auto rounded-2xl block" />
          </div>
        </div>
      </section>

      {/* RECURSOS — BENTO GRID 3D */}
      <section id="recursos" className="max-w-6xl mx-auto px-5 py-24" style={{ perspective: "1500px" }}>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{t.recT}</h2>
          <p className="mt-4 text-xl" style={{ color: MUTED }}>{t.recS}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: "1200px" }}>
          {t.feats.map((f: string[], i: number) => {
            const Icon = FEAT_ICONS[i]; const cor = FEAT_CORES[i]
            const rotateX = [12, -8, 10, -6, 14, -4][i] || 0
            const rotateY = [-8, 6, -10, 8, -5, 12][i] || 0
            const translateZ = [40, 30, 50, 25, 45, 20][i] || 30

            return (
              <div key={i}
                className="rounded-2xl p-8 transition-all duration-500 cursor-pointer group"
                style={{
                  background: CARD,
                  border: `2px solid ${cor}33`,
                  transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
                  transformStyle: "preserve-3d",
                  boxShadow: `0 ${Math.abs(rotateX) * 2}px ${Math.abs(rotateY) * 3}px ${cor}44, inset 0 1px 0 ${cor}22`,
                }}>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${cor}22, ${cor}11)`,
                    border: `2px solid ${cor}44`,
                    boxShadow: `0 10px 30px ${cor}33, inset 0 1px 2px ${cor}22`,
                    transform: "translateZ(10px)"
                  }}>
                  <Icon className="w-7 h-7" style={{ color: cor, filter: "drop-shadow(0 4px 8px " + cor + "33)" }} />
                </div>
                <h3 className="font-bold text-xl leading-tight" style={{ transform: "translateZ(8px)" }}>{f[0]}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED, transform: "translateZ(6px)" }}>{f[1]}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* PROPÓSITO 3D */}
      <section id="proposito" className="py-24" style={{ background: `linear-gradient(180deg, ${BG}00, ${CARD}80, ${BG}00)`, borderTop: `2px solid ${GOLD}33`, perspective: "1200px" }}>
        <div className="max-w-4xl mx-auto px-5 text-center" style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}>
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{
            background: `linear-gradient(135deg, ${GOLD}33, ${GOLD}11)`,
            border: `2px solid ${GOLD}44`,
            boxShadow: `0 20px 50px ${GOLD}44, inset 0 1px 2px ${GOLD}22`,
            transform: "translateZ(15px)"
          }}>
            <Heart className="w-8 h-8" style={{ color: GOLD, filter: "drop-shadow(0 4px 12px " + GOLD + "44)" }} />
          </div>
          <span className="inline-block text-xs font-bold tracking-[0.3em] px-4 py-2 rounded-full" style={{ color: TEAL, background: `${TEAL}11`, border: `1px solid ${TEAL}33`, transform: "translateZ(10px)" }}>{t.propLabel}</span>
          <h2 className="text-5xl md:text-6xl font-black mt-6 tracking-tight" style={{
            background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}, ${GOLD_LIGHT})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            transform: "translateZ(12px)",
            textShadow: "0 20px 40px " + GOLD + "33",
            filter: "drop-shadow(0 10px 25px " + GOLD + "44)"
          }}>{t.propT}</h2>
          <p className="mt-6 text-xl leading-relaxed max-w-2xl mx-auto font-light" style={{ color: MUTED, transform: "translateZ(8px)" }}>{t.propText}</p>
        </div>
      </section>

      {/* WHITE-LABEL 3D */}
      <section id="whitelabel" className="py-24" style={{ background: `linear-gradient(180deg, ${CARD}, ${BG})`, borderTop: `2px solid ${TEAL}33`, borderBottom: `2px solid ${TEAL}33`, perspective: "1200px" }}>
        <div className="max-w-5xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
          <div style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}>
            <span className="inline-block text-xs font-bold tracking-widest px-3 py-1.5 rounded-full" style={{ color: TEAL, background: `${TEAL}11`, border: `1px solid ${TEAL}33` }}>{t.wlLabel}</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-6 tracking-tight">{t.wlT}</h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: MUTED }}>{t.wlText}</p>
            <ul className="mt-8 space-y-3.5">
              {t.wlBullets.map((x: string, idx: number) => <li key={x} className="flex items-center gap-3 text-sm font-medium" style={{ transform: `translateZ(${(idx+1)*5}px)` }}>
                <Check className="w-5 h-5 shrink-0" style={{ color: GOLD, filter: "drop-shadow(0 2px 4px " + GOLD + "33)" }} /> {x}
              </li>)}
            </ul>
          </div>
          <div className="rounded-3xl p-10 text-center" style={{
            background: `linear-gradient(135deg, ${BG}, ${CARD}80)`,
            border: `2px solid ${TEAL}44`,
            boxShadow: `0 30px 80px ${TEAL}33, inset 0 1px 2px ${TEAL}11`,
            transformStyle: "preserve-3d",
            transform: "perspective(1200px) rotateX(5deg) rotateY(-10deg) translateZ(30px)"
          }}>
            <div style={{ transform: "translateZ(15px)" }}>
              <ShieldCheck className="w-12 h-12 mx-auto mb-4" style={{ color: GOLD, filter: "drop-shadow(0 6px 15px " + GOLD + "44)" }} />
              <p className="text-xl font-bold">{t.wlCardT}</p>
              <p className="mt-3 text-sm" style={{ color: MUTED }}>{t.wlCardD}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ (AI Overviews / featured snippets) */}
      <section id="faq" className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t.faqT}</h2>
        <div className="space-y-3">
          {t.faq.map((qa: string[], i: number) => (
            <details key={i} className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between gap-3">
                {qa[0]}<span className="text-xl shrink-0" style={{ color: GOLD }}>+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>{qa[1]}</p>
            </details>
          ))}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "FAQPage",
          mainEntity: t.faq.map((qa: string[]) => ({ "@type": "Question", name: qa[0], acceptedAnswer: { "@type": "Answer", text: qa[1] } })),
        }) }} />
      </section>

      {/* CONFIANÇA & SEGURANÇA 3D */}
      <section className="py-24" style={{ background: `linear-gradient(180deg, ${BG}, ${CARD})`, borderTop: `2px solid ${TEAL}33`, borderBottom: `2px solid ${TEAL}33`, perspective: "1200px" }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-16" style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}>
            <div className="w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mb-4" style={{
              background: `linear-gradient(135deg, ${TEAL}22, ${TEAL}11)`,
              border: `2px solid ${TEAL}44`,
              boxShadow: `0 15px 40px ${TEAL}33, inset 0 1px 2px ${TEAL}11`
            }}>
              <ShieldCheck className="w-7 h-7" style={{ color: TEAL, filter: "drop-shadow(0 4px 10px " + TEAL + "44)" }} />
            </div>
            <span className="inline-block text-xs font-bold tracking-[0.3em] px-4 py-2 rounded-full" style={{ color: TEAL, background: `${TEAL}11`, border: `1px solid ${TEAL}33` }}>CONFIANÇA</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-5 tracking-tight">Segurança em primeiro lugar</h2>
            <p className="mt-4 text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: MUTED }}>Construída para empresas que levam privacidade e proteção de dados a sério.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {[
              "100 em SEO e Boas Práticas — Google PageSpeed",
              "Conforme à LGPD (Lei 13.709/2018)",
              "Dados criptografados (em trânsito e repouso)",
              "Isolamento de dados por papel e empresa"
            ].map((text, idx) => (
              <div key={idx}
                className="flex items-start gap-4 rounded-2xl p-6 transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${TEAL}11, ${TEAL}08)`,
                  border: `2px solid ${TEAL}33`,
                  boxShadow: `0 ${idx*2}px ${idx*3}px ${TEAL}22, inset 0 1px 2px ${TEAL}11`,
                  transformStyle: "preserve-3d",
                  transform: `perspective(1200px) rotateX(${idx%2===0 ? 3 : -3}deg) rotateY(${idx%2===0 ? -2 : 2}deg) translateZ(${15+idx*5}px)`
                }}>
                <Check className="w-6 h-6 shrink-0 mt-1" style={{ color: TEAL, filter: "drop-shadow(0 2px 4px " + TEAL + "33)" }} />
                <span className="text-sm leading-relaxed font-medium">{text}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/seguranca" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105" style={{
              background: `linear-gradient(135deg, ${TEAL}18, ${TEAL}11)`,
              color: TEAL,
              border: `2px solid ${TEAL}44`,
              boxShadow: `0 10px 30px ${TEAL}22`
            }}>
              Saiba mais sobre segurança <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA FINAL 3D */}
      <section id="planos" className="max-w-4xl mx-auto px-5 py-24 text-center" style={{ perspective: "1200px" }}>
        <div style={{ transformStyle: "preserve-3d", transform: "translateZ(40px)" }}>
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{
            background: `linear-gradient(135deg, #a855f711, #a855f7)`,
            border: `2px solid #a855f744`,
            boxShadow: `0 20px 50px #a855f744, inset 0 1px 2px #a855f722`
          }}>
            <Brain className="w-8 h-8" style={{ color: "#a855f7", filter: "drop-shadow(0 4px 12px #a855f744)" }} />
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1]" style={{ transform: "translateZ(15px)" }}>{t.ctaT}</h2>
          <p className="mt-6 text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: MUTED, transform: "translateZ(10px)" }}>{t.ctaS}</p>
          <div style={{ transform: "translateZ(20px)" }}>
            <Link href="/login" className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold mt-12 transition-all duration-300 hover:scale-110" style={{
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              color: "#1a1407",
              boxShadow: `0 20px 60px ${GOLD}44, inset 0 1px 2px ${GOLD}22`,
              cursor: "pointer"
            }}>
              {t.ctaBtn} <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-xs" style={{ color: MUTED }}>© {new Date().getFullYear()} CKlareza · Lifetime Value · cklareza.com</p>
            <div className="flex items-center gap-1.5" style={{ opacity: 0.65 }}>
              <span className="text-[9px]" style={{ color: MUTED, letterSpacing: "0.08em" }}>POWERED BY</span>
              <Sparkles className="w-2.5 h-2.5" style={{ color: GOLD }} />
              <span className="text-[10px] font-bold" style={{ background: `linear-gradient(180deg, ${GOLD}, #9c7d2e)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>CKlareza</span>
              <span className="text-[9px]" style={{ color: MUTED }}>·</span>
              <Brain className="w-2.5 h-2.5" style={{ color: TEAL }} />
              <span className="text-[10px] font-bold" style={{ color: TEAL, letterSpacing: "0.04em" }}>GRATIDÃO</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacidade" className="text-xs" style={{ color: MUTED }}>Privacidade</Link>
            <Link href="/login" className="text-sm font-semibold" style={{ color: GOLD }}>{t.foot}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
