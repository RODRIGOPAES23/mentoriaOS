"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Sparkles, LayoutDashboard, DollarSign, KanbanSquare, Brain,
  Building2, ArrowRight, Check, Phone, ShieldCheck, Star, Globe, Heart, Sun, Moon,
} from "lucide-react"
import { LifetimeValueCTA } from "@/components/site/SiteChrome"

type Theme = "dark" | "light"

// Paleta reativa ao tema. Light = Google-Clean. Dark = cyberpunk neon (ciano + verde) sobre #060913.
const PALETTES: Record<Theme, any> = {
  light: {
    bg: "#ffffff", card: "#f8f9fa", card2: "#f3f4f6", border: "#e5e7eb",
    muted: "#5f6368", ink: "#1f2937",
    gold: "#d4af37", goldLight: "#f0d97d", goldDeep: "#9a7916", teal: "#0f8a8a",
    onAccent: "#1a1407",
  },
  dark: {
    bg: "#060913", card: "#0c1322", card2: "#111c30", border: "#1e3a5f",
    muted: "#93a8c9", ink: "#e8f1ff",
    gold: "#22d3ee", goldLight: "#67e8f9", goldDeep: "#3dd7f0", teal: "#34d399",
    onAccent: "#04121a",
  },
}

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
    vidT: "Veja a CKlareza em ação", vidS: "Em poucos minutos, entenda como tudo funciona.",
    vid1: "Conheça a plataforma", vid2: "Organização & banco de dados",
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
    segLabel: "CONFIANÇA", segT: "Segurança em primeiro lugar", segS: "Construída para empresas que levam privacidade e proteção de dados a sério.",
    segItens: ["100 em SEO e Boas Práticas — Google PageSpeed", "Conforme à LGPD (Lei 13.709/2018)", "Dados criptografados (em trânsito e repouso)", "Isolamento de dados por papel e empresa"],
    segCta: "Saiba mais sobre segurança",
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
    vidT: "See CKlareza in action", vidS: "In a few minutes, see how it all works.",
    vid1: "Meet the platform", vid2: "Organization & database",
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
    segLabel: "TRUST", segT: "Security first", segS: "Built for companies that take privacy and data protection seriously.",
    segItens: ["100 in SEO & Best Practices — Google PageSpeed", "LGPD compliant (Law 13.709/2018)", "Encrypted data (in transit and at rest)", "Data isolation by role and company"],
    segCta: "Learn more about security",
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
    vidT: "Mira CKlareza en acción", vidS: "En pocos minutos, mira cómo funciona todo.",
    vid1: "Conoce la plataforma", vid2: "Organización y base de datos",
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
    segLabel: "CONFIANZA", segT: "Seguridad primero", segS: "Construida para empresas que se toman en serio la privacidad y la protección de datos.",
    segItens: ["100 en SEO y Buenas Prácticas — Google PageSpeed", "Conforme a LGPD (Ley 13.709/2018)", "Datos cifrados (en tránsito y reposo)", "Aislamiento de datos por rol y empresa"],
    segCta: "Conoce más sobre seguridad",
    faq: [
      ["¿Qué es CKlareza?", "Una plataforma de mentoría white-label: organiza las finanzas, tareas y calls de tus mentoreados en un solo lugar, con tu marca e inteligencia que muestra quién necesita atención ahora."],
      ["¿CKlareza es white-label?", "Sí. Usa tu logo, tus colores y tu dominio propio. Tus clientes ven tu empresa — el motor es CKlareza."],
      ["¿Para quién es CKlareza?", "Para mentores y empresas de mentoría que quieren profesionalizar el seguimiento y aumentar la retención (Lifetime Value)."],
      ["¿Necesito instalar algo?", "No. Es 100% web, sin instalación. Accede desde el navegador y pruébalo sin tarjeta."],
    ],
  },
}

function Logo({ size = "md", c }: { size?: "md" | "sm"; c: any }) {
  return (
    <div className="flex items-center gap-2">
      <Sparkles className="shrink-0" style={{ color: c.gold, width: size === "sm" ? 18 : 22, height: size === "sm" ? 18 : 22 }} />
      <div className="leading-none">
        <span className="font-bold tracking-tight" style={{ fontSize: size === "sm" ? 18 : 22, color: c.goldDeep }}>CKlareza</span>
        {size === "md" && <span className="block text-[9px] tracking-[0.25em] mt-0.5" style={{ color: c.teal }}>LIFETIME VALUE</span>}
      </div>
    </div>
  )
}

const FEAT_ICONS = [LayoutDashboard, DollarSign, KanbanSquare, Brain, Phone, Building2]

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("pt")
  const [openLang, setOpenLang] = useState(false)
  const [theme, setTheme] = useState<Theme>("dark")  // abre em DARK por padrão

  useEffect(() => {
    const saved = localStorage.getItem("ck_lang") as Lang | null
    if (saved && LANGS.some(l => l.code === saved)) setLang(saved)
    else {
      const nav = navigator.language.slice(0, 2)
      if (nav === "en" || nav === "es") setLang(nav as Lang)
    }
    const savedTheme = localStorage.getItem("ck_theme")
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme)
  }, [])

  const t = T[lang]
  const c = PALETTES[theme]
  const featCores = [c.teal, "#22c55e", "#4c9aff", "#a855f7", c.goldDeep, c.teal]
  const escolher = (l: Lang) => { setLang(l); localStorage.setItem("ck_lang", l); setOpenLang(false) }
  const toggleTheme = () => setTheme(prev => {
    const next: Theme = prev === "dark" ? "light" : "dark"
    localStorage.setItem("ck_theme", next)
    return next
  })

  // Link de navegação com hover ciente do tema
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="transition-colors" style={{ color: c.muted }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = c.ink}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = c.muted}>{children}</Link>
  )

  return (
    <div style={{ background: c.bg, color: c.ink, transition: "background 0.3s, color 0.3s" }} className="min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: `${c.bg}cc`, borderBottom: `1px solid ${c.border}` }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo c={c} />
          <nav className="hidden md:flex items-center gap-7 text-sm">
            <NavLink href="/recursos">{t.nav[0]}</NavLink>
            <NavLink href="/precos">{t.nav[3]}</NavLink>
            <NavLink href="/sobre">{t.nav[2]}</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/contato">Contato</NavLink>
          </nav>
          <div className="flex items-center gap-2.5">
            {/* Toggle tema sol/lua */}
            <button onClick={toggleTheme} title={theme === "dark" ? "Tema claro" : "Tema escuro"} aria-label="Alternar tema"
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all"
              style={{ color: c.gold, border: `1px solid ${c.border}`, background: `${c.gold}10` }}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Seletor de idioma */}
            <div className="relative">
              <button onClick={() => setOpenLang(o => !o)} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm" style={{ color: c.muted, border: `1px solid ${c.border}` }}>
                <Globe className="w-4 h-4" /> {lang.toUpperCase()}
              </button>
              {openLang && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenLang(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 rounded-lg overflow-hidden" style={{ background: c.card, border: `1px solid ${c.border}` }}>
                    {LANGS.map(l => (
                      <button key={l.code} onClick={() => escolher(l.code)}
                        className="block w-full text-left px-4 py-2 text-sm transition-colors"
                        style={{ color: l.code === lang ? c.gold : c.ink }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = c.card2}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>{l.label}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all" style={{ background: c.gold, color: c.onAccent, boxShadow: `0 6px 20px ${c.gold}40` }}>
              {t.entrar} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(60% 50% at 50% 0%, ${c.gold}1f 0%, transparent 70%)` }} />
        <div className="relative max-w-4xl mx-auto px-5 pt-14 pb-8 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: `${c.gold}18`, border: `1px solid ${c.gold}40`, color: c.goldDeep }}>
            <Star className="w-3.5 h-3.5" style={{ color: c.goldDeep }} /> {t.badge}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]" style={{ color: c.ink }}>
            {t.h1a}<br />
            <span style={{ color: c.goldDeep }}>{t.h1b}</span>
          </h1>
          <p className="text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed" style={{ color: c.muted }}>
            {t.sub}<span className="font-semibold" style={{ color: c.ink }}>{t.subStrong}</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
            <Link href="/login" className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold transition-all hover:-translate-y-0.5" style={{ background: c.gold, color: c.onAccent, boxShadow: `0 10px 30px ${c.gold}40` }}>
              {t.cta1} <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#recursos" className="px-6 py-3.5 rounded-xl text-base font-semibold transition-all" style={{ background: c.card, border: `1px solid ${c.border}`, color: c.ink }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = c.card2}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = c.card}>{t.cta2}</a>
          </div>
        </div>

        {/* VÍDEO PRINCIPAL — "Conheça a plataforma" (logo no topo) */}
        <div className="relative max-w-3xl mx-auto px-5 pb-6">
          <div className="rounded-2xl overflow-hidden" style={{ background: "#000", border: `2px solid ${c.gold}55`, boxShadow: `0 30px 90px -25px ${c.gold}55` }}>
            <video src="/video-cklareza.mp4" autoPlay muted loop playsInline controls className="w-full h-auto block" />
          </div>
          <p className="text-center text-sm mt-3 font-semibold flex items-center justify-center gap-2" style={{ color: c.muted }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: c.gold }} /> {t.vid1}
          </p>
        </div>

        {/* TRUST — abaixo do vídeo, em destaque */}
        <div className="relative max-w-3xl mx-auto px-5 pb-14">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {t.trust.map((x: string) => (
              <span key={x} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: `${c.teal}16`, border: `1px solid ${c.teal}55`, color: c.ink, boxShadow: `0 6px 22px ${c.teal}26` }}>
                <Check className="w-4 h-4 shrink-0" style={{ color: c.teal }} /> {x}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* VÍDEO — Organização & banco de dados */}
      <section id="videos" className="max-w-3xl mx-auto px-5 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: c.ink }}>{t.vid2}</h2>
          <p className="mt-3 text-lg" style={{ color: c.muted }}>{t.vidS}</p>
        </div>
        <div className="rounded-2xl overflow-hidden" style={{ background: c.card, border: `1px solid ${c.border}`, boxShadow: `0 20px 50px -25px ${c.gold}33` }}>
          <video src="/video-organizacao.mp4" controls preload="metadata" playsInline className="w-full h-auto block bg-black" />
          <div className="px-5 py-4 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full" style={{ background: c.teal }} />
            <span className="text-sm font-semibold" style={{ color: c.ink }}>{t.vid2}</span>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: c.ink }}>{t.recT}</h2>
          <p className="mt-3 text-lg" style={{ color: c.muted }}>{t.recS}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.feats.map((f: string[], i: number) => {
            const Icon = FEAT_ICONS[i]; const cor = featCores[i]
            return (
              <div key={i} className="rounded-2xl p-6 transition-all hover:-translate-y-1" style={{ background: c.card, border: `1px solid ${c.border}` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${cor}1f`, border: `1px solid ${cor}44` }}>
                  <Icon className="w-5 h-5" style={{ color: cor }} />
                </div>
                <h3 className="font-bold text-lg" style={{ color: c.ink }}>{f[0]}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: c.muted }}>{f[1]}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* PROPÓSITO */}
      <section id="proposito" className="py-16" style={{ background: `linear-gradient(180deg, ${c.bg}, ${c.card})`, borderTop: `1px solid ${c.border}` }}>
        <div className="max-w-3xl mx-auto px-5 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${c.gold}1f`, border: `1px solid ${c.gold}44` }}>
            <Heart className="w-6 h-6" style={{ color: c.gold }} />
          </div>
          <span className="text-xs font-bold tracking-[0.3em]" style={{ color: c.teal }}>{t.propLabel}</span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-3" style={{ color: c.goldDeep }}>{t.propT}</h2>
          <p className="mt-5 text-lg leading-relaxed" style={{ color: c.muted }}>{t.propText}</p>
        </div>
      </section>

      {/* WHITE-LABEL */}
      <section id="whitelabel" className="py-20" style={{ background: c.card, borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
        <div className="max-w-5xl mx-auto px-5 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold tracking-widest" style={{ color: c.teal }}>{t.wlLabel}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3" style={{ color: c.ink }}>{t.wlT}</h2>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: c.muted }}>{t.wlText}</p>
            <ul className="mt-6 space-y-2.5">
              {t.wlBullets.map((x: string) => <li key={x} className="flex items-center gap-2.5 text-sm" style={{ color: c.ink }}><Check className="w-4 h-4 shrink-0" style={{ color: c.gold }} /> {x}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl p-8 text-center" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
            <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: c.gold }} />
            <p className="text-lg font-semibold" style={{ color: c.ink }}>{t.wlCardT}</p>
            <p className="mt-2 text-sm" style={{ color: c.muted }}>{t.wlCardD}</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8" style={{ color: c.ink }}>{t.faqT}</h2>
        <div className="space-y-3">
          {t.faq.map((qa: string[], i: number) => (
            <details key={i} className="rounded-xl p-5" style={{ background: c.card, border: `1px solid ${c.border}` }}>
              <summary className="font-semibold cursor-pointer list-none flex items-center justify-between gap-3" style={{ color: c.ink }}>
                {qa[0]}<span className="text-xl shrink-0" style={{ color: c.gold }}>+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: c.muted }}>{qa[1]}</p>
            </details>
          ))}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "FAQPage",
          mainEntity: t.faq.map((qa: string[]) => ({ "@type": "Question", name: qa[0], acceptedAnswer: { "@type": "Answer", text: qa[1] } })),
        }) }} />
      </section>

      {/* CONFIANÇA & SEGURANÇA */}
      <section className="py-20" style={{ background: c.card, borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-12">
            <ShieldCheck className="w-10 h-10 mx-auto mb-4" style={{ color: c.teal }} />
            <span className="text-xs font-bold tracking-[0.3em]" style={{ color: c.teal }}>{t.segLabel}</span>
            <h2 className="text-3xl font-bold mt-3" style={{ color: c.ink }}>{t.segT}</h2>
            <p className="mt-3 text-lg" style={{ color: c.muted }}>{t.segS}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {t.segItens.map((item: string) => (
              <div key={item} className="flex items-start gap-3 rounded-xl p-4" style={{ background: `${c.teal}14`, border: `1px solid ${c.teal}33` }}>
                <Check className="w-5 h-5 shrink-0 mt-1" style={{ color: c.teal }} />
                <span className="text-sm" style={{ color: c.ink }}>{item}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/seguranca" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm" style={{ background: `${c.teal}18`, color: c.teal, border: `1px solid ${c.teal}44` }}>
              {t.segCta} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="planos" className="max-w-3xl mx-auto px-5 py-24 text-center">
        <Brain className="w-10 h-10 mx-auto mb-4" style={{ color: "#a855f7" }} />
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight" style={{ color: c.ink }}>{t.ctaT}</h2>
        <p className="mt-5 text-lg" style={{ color: c.muted }}>{t.ctaS}</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold mt-9 transition-all hover:-translate-y-0.5" style={{ background: c.gold, color: c.onAccent, boxShadow: `0 12px 36px ${c.gold}44` }}>
          {t.ctaBtn} <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* LIFETIME VALUE */}
      <LifetimeValueCTA />

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" c={c} />
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-xs" style={{ color: c.muted }}>© {new Date().getFullYear()} CKlareza · Lifetime Value · cklareza.com</p>
            <div className="flex items-center gap-1.5" style={{ opacity: 0.75 }}>
              <span className="text-[9px]" style={{ color: c.muted, letterSpacing: "0.08em" }}>POWERED BY</span>
              <Sparkles className="w-2.5 h-2.5" style={{ color: c.gold }} />
              <span className="text-[10px] font-bold" style={{ color: c.goldDeep }}>CKlareza</span>
              <span className="text-[9px]" style={{ color: c.muted }}>·</span>
              <Brain className="w-2.5 h-2.5" style={{ color: c.teal }} />
              <span className="text-[10px] font-bold" style={{ color: c.teal, letterSpacing: "0.04em" }}>GRATIDÃO</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacidade" className="text-xs" style={{ color: c.muted }}>Privacidade</Link>
            <Link href="/login" className="text-sm font-semibold" style={{ color: c.gold }}>{t.foot}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
