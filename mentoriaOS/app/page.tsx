"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Sparkles, LayoutDashboard, DollarSign, KanbanSquare, Brain,
  Building2, ArrowRight, Check, Phone, ShieldCheck, Star, Globe, Heart,
} from "lucide-react"

const GOLD = "#d4af37"
const GOLD_LIGHT = "#f0d97d"
const TEAL = "#13a3a3"
const BG = "#0a1420"
const CARD = "#0f2030"
const BORDER = "#1e3450"
const MUTED = "#7fa0bd"

type Lang = "pt" | "en" | "es"
const LANGS: { code: Lang; label: string }[] = [
  { code: "pt", label: "PT" }, { code: "en", label: "EN" }, { code: "es", label: "ES" },
]

const T: Record<Lang, any> = {
  pt: {
    nav: ["Recursos", "White-label", "Propósito", "Planos"], entrar: "Entrar",
    badge: "Plataforma de mentoria white-label",
    h1a: "Transforme acompanhamento em", h1b: "Lifetime Value",
    sub: "A plataforma que organiza financeiro, atividades e calls da sua mentoria — com inteligência que mostra ",
    subStrong: "quem precisa de você agora.",
    cta1: "Acessar o sistema", cta2: "Ver recursos",
    trust: ["Sem cartão para testar", "White-label", "Dados protegidos"],
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
    wlText: "Coloque seu logo, suas cores e seu domínio. Seus clientes veem a sua empresa — e você entrega uma experiência de mentoria de nível enterprise sem construir nada.",
    wlBullets: ["Logo, cores e domínio próprios", "Vários mentores por empresa", "Cada um vê só o que é seu", "Revenda para outros clientes"],
    wlCardT: "Painel de controle do dono", wlCardD: "Gerencie todas as empresas, mentores e mentorados num só lugar.",
    propLabel: "NOSSO PROPÓSITO", propT: "Transformar vidas.",
    propText: "Não vendemos software — damos ao mentor o tempo e a clareza para fazer o que importa: transformar a vida de quem confia nele. Cada recurso aqui existe para isso.",
    ctaT: "Pronto para elevar sua mentoria?", ctaS: "Entre agora e veja sua operação organizada em minutos.", ctaBtn: "Acessar o sistema",
    foot: "Entrar →",
  },
  en: {
    nav: ["Features", "White-label", "Purpose", "Plans"], entrar: "Sign in",
    badge: "White-label mentorship platform",
    h1a: "Turn follow-up into", h1b: "Lifetime Value",
    sub: "The platform that organizes your mentorship's finances, tasks and calls — with intelligence that shows ",
    subStrong: "who needs you right now.",
    cta1: "Access the system", cta2: "See features",
    trust: ["No card to try", "White-label", "Protected data"],
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
    wlText: "Add your logo, colors and domain. Your clients see your company — and you deliver an enterprise-grade mentorship experience without building anything.",
    wlBullets: ["Own logo, colors and domain", "Multiple mentors per company", "Each sees only what's theirs", "Resell to other clients"],
    wlCardT: "Owner control panel", wlCardD: "Manage all companies, mentors and mentees in one place.",
    propLabel: "OUR PURPOSE", propT: "Transform lives.",
    propText: "We don't sell software — we give mentors the time and clarity to do what matters: transform the life of those who trust them. Every feature here exists for that.",
    ctaT: "Ready to elevate your mentorship?", ctaS: "Sign in now and see your operation organized in minutes.", ctaBtn: "Access the system",
    foot: "Sign in →",
  },
  es: {
    nav: ["Recursos", "White-label", "Propósito", "Planes"], entrar: "Entrar",
    badge: "Plataforma de mentoría white-label",
    h1a: "Convierte el seguimiento en", h1b: "Lifetime Value",
    sub: "La plataforma que organiza las finanzas, tareas y calls de tu mentoría — con inteligencia que muestra ",
    subStrong: "quién te necesita ahora.",
    cta1: "Acceder al sistema", cta2: "Ver recursos",
    trust: ["Sin tarjeta para probar", "White-label", "Datos protegidos"],
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
    wlText: "Pon tu logo, colores y dominio. Tus clientes ven tu empresa — y entregas una experiencia de mentoría enterprise sin construir nada.",
    wlBullets: ["Logo, colores y dominio propios", "Varios mentores por empresa", "Cada uno ve solo lo suyo", "Revende a otros clientes"],
    wlCardT: "Panel de control del dueño", wlCardD: "Gestiona todas las empresas, mentores y mentoreados en un solo lugar.",
    propLabel: "NUESTRO PROPÓSITO", propT: "Transformar vidas.",
    propText: "No vendemos software — le damos al mentor el tiempo y la claridad para hacer lo que importa: transformar la vida de quien confía en él.",
    ctaT: "¿Listo para elevar tu mentoría?", ctaS: "Entra ahora y ve tu operación organizada en minutos.", ctaBtn: "Acceder al sistema",
    foot: "Entrar →",
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
            <a href="#recursos" className="hover:text-white transition-colors">{t.nav[0]}</a>
            <a href="#whitelabel" className="hover:text-white transition-colors">{t.nav[1]}</a>
            <a href="#proposito" className="hover:text-white transition-colors">{t.nav[2]}</a>
            <a href="#planos" className="hover:text-white transition-colors">{t.nav[3]}</a>
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

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(60% 50% at 50% 0%, ${TEAL}22 0%, transparent 70%)` }} />
        <div className="relative max-w-4xl mx-auto px-5 pt-20 pb-14 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6" style={{ background: `${GOLD}14`, border: `1px solid ${GOLD}33`, color: GOLD_LIGHT }}>
            <Star className="w-3.5 h-3.5" /> {t.badge}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            {t.h1a}<br />
            <span style={{ background: `linear-gradient(90deg, ${GOLD_LIGHT}, ${GOLD})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{t.h1b}</span>
          </h1>
          <p className="text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed" style={{ color: MUTED }}>
            {t.sub}<span className="text-white font-semibold">{t.subStrong}</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
            <Link href="/login" className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold transition-all hover:-translate-y-0.5" style={{ background: GOLD, color: "#1a1407" }}>
              {t.cta1} <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#recursos" className="px-6 py-3.5 rounded-xl text-base font-semibold transition-all" style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#fff" }}>{t.cta2}</a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-xs" style={{ color: MUTED }}>
            {t.trust.map((x: string) => <span key={x} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" style={{ color: TEAL }} /> {x}</span>)}
          </div>
        </div>

        <div className="relative max-w-3xl mx-auto px-5 pb-4">
          <div className="rounded-2xl p-1.5 overflow-hidden" style={{ background: CARD, border: `1px solid ${GOLD}33`, boxShadow: `0 30px 90px -20px ${GOLD}40` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="CKlareza — Lifetime Value" className="w-full rounded-xl block" />
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">{t.recT}</h2>
          <p className="mt-3 text-lg" style={{ color: MUTED }}>{t.recS}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.feats.map((f: string[], i: number) => {
            const Icon = FEAT_ICONS[i]; const cor = FEAT_CORES[i]
            return (
              <div key={i} className="rounded-2xl p-6 transition-all hover:-translate-y-1" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${cor}18`, border: `1px solid ${cor}33` }}>
                  <Icon className="w-5 h-5" style={{ color: cor }} />
                </div>
                <h3 className="font-bold text-lg">{f[0]}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>{f[1]}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* PROPÓSITO */}
      <section id="proposito" className="py-16" style={{ background: `linear-gradient(180deg, ${BG}, ${CARD})`, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-3xl mx-auto px-5 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}44` }}>
            <Heart className="w-6 h-6" style={{ color: GOLD }} />
          </div>
          <span className="text-xs font-bold tracking-[0.3em]" style={{ color: TEAL }}>{t.propLabel}</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3" style={{ background: `linear-gradient(90deg, ${GOLD_LIGHT}, ${GOLD})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{t.propT}</h2>
          <p className="mt-5 text-lg leading-relaxed" style={{ color: MUTED }}>{t.propText}</p>
        </div>
      </section>

      {/* WHITE-LABEL */}
      <section id="whitelabel" className="py-20" style={{ background: CARD, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-5xl mx-auto px-5 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold tracking-widest" style={{ color: TEAL }}>{t.wlLabel}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">{t.wlT}</h2>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: MUTED }}>{t.wlText}</p>
            <ul className="mt-6 space-y-2.5">
              {t.wlBullets.map((x: string) => <li key={x} className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 shrink-0" style={{ color: GOLD }} /> {x}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl p-8 text-center" style={{ background: BG, border: `1px solid ${BORDER}` }}>
            <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: GOLD }} />
            <p className="text-lg font-semibold">{t.wlCardT}</p>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>{t.wlCardD}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="planos" className="max-w-3xl mx-auto px-5 py-24 text-center">
        <Brain className="w-10 h-10 mx-auto mb-4" style={{ color: "#a855f7" }} />
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t.ctaT}</h2>
        <p className="mt-5 text-lg" style={{ color: MUTED }}>{t.ctaS}</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold mt-9 transition-all hover:-translate-y-0.5" style={{ background: GOLD, color: "#1a1407" }}>
          {t.ctaBtn} <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs" style={{ color: MUTED }}>© {new Date().getFullYear()} CKlareza · Lifetime Value · cklareza.com</p>
          <Link href="/login" className="text-sm font-semibold" style={{ color: GOLD }}>{t.foot}</Link>
        </div>
      </footer>
    </div>
  )
}
