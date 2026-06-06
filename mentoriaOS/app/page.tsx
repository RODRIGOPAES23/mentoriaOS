"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Sparkles, LayoutDashboard, DollarSign, KanbanSquare, Brain,
  Building2, ArrowRight, Check, Phone, ShieldCheck, Star, Globe, Heart, Sun, Moon,
  Clock, TrendingUp, AlertCircle, ChevronDown, ChevronUp
} from "lucide-react"
import { LifetimeValueCTA, SiteFooter } from "@/components/site/SiteChrome"

type Theme = "dark" | "light"

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

    // HERO NOVO (Hormozi-style: dor + ganho financeiro direto)
    badge: "Usado por mentores high-ticket no Brasil",
    h1a: "Pare de perder", h1b: "10 horas por semana",
    h1c: "em admin da sua mentoria.",
    sub: "CKlareza automatiza briefing de calls com IA, centraliza financeiro e mostra quem vai cancelar antes que aconteça. Escale de 10 para 20 alunos ",
    subStrong: "sem trabalhar mais.",
    cta1: "Testar Grátis (sem cartão)", cta2: "Ver Demo 2 min",
    trust: ["Sem cartão para testar", "Dados protegidos (LGPD)", "Setup em 5 minutos"],

    // PROVA SOCIAL
    proofLabel: "RESULTADO REAL",
    proofTitle: "De 45 min para 2 min por call.",
    proofDesc: "Termo Laser usou CKlareza para escalar a operação. Churn caiu pela metade. Tempo de prep de call caiu de 45 min para 2 min. MRR cresceu 40%.",
    proofName: "— Termo Laser, agência de infoprodutos",

    // DOR
    painLabel: "VOCÊ RECONHECE ISSO?",
    painTitle: "A realidade de 90% dos mentores:",
    pains: [
      "45 minutos preparando pauta pra CADA call (10 alunos = 7h30 por semana)",
      "Não sabe quais alunos vão cancelar até sumirem do WhatsApp",
      "Financeiro espalhado em planilhas, pagamentos perdidos",
      "Parece amador usando links de terceiros (Calendly genérico, formulários avulsos)",
    ],

    // SOLUÇÃO
    solLabel: "A SOLUÇÃO",
    solTitle: "CKlareza resolve tudo isso em uma tela.",

    mock: ["A receber", "Calls na semana", "Tarefas atrasadas", "Mentorados"],
    recT: "Tudo para operar sua mentoria", recS: "Um sistema, não dez planilhas.",
    vidT: "Veja a CKlareza em ação", vidS: "Em 2 minutos, veja como a IA prepara suas calls.",
    vid1: "Conheça a plataforma", vid2: "Organização & banco de dados",
    feats: [
      ["Briefing com IA em 30 segundos", "A IA lê o check-in do aluno e entrega a pauta exata da call. De 45 min para 30 seg. Economize 7h+ por semana."],
      ["Radar de churn antecipado", "Veja quem está estagnado e vai cancelar em 30 dias. Aja antes — salve o contrato antes de perder."],
      ["Financeiro centralizado", "Cobranças, inadimplência e projeção de MRR. Saiba exatamente quanto você vai faturar esse mês."],
      ["Atividades em Kanban", "As tarefas de todos os alunos num quadro: a fazer, atrasadas e concluídas. Zero planilha."],
      ["Portal do aluno profissional", "Seu aluno faz check-in, acompanha a jornada e se sente parte de algo sério. Aumenta retenção."],
      ["White-label de verdade", "Sua marca, suas cores, seu domínio. Seus alunos veem só você — o motor é CKlareza."],
    ],
    wlLabel: "WHITE-LABEL", wlT: "Sua marca. Nosso motor.",
    wlText: "Seus clientes com CKlareza na sua marca, seu estilo, seu método e sua filosofia.",
    wlBullets: ["Logo, cores e domínio próprios", "Vários mentores por empresa", "Cada um vê só o que é seu", "Revenda para outros clientes"],
    wlCardT: "Painel de controle do dono", wlCardD: "Gerencie todas as empresas, mentores e mentorados num só lugar.",
    propLabel: "NOSSO PROPÓSITO", propT: "Transformar vidas.",
    propText: "Não vendemos software — damos ao mentor o tempo e a clareza para fazer o que importa: transformar a vida de quem confia nele. Cada recurso aqui existe para isso.",

    // PRICING NOVO (transparente)
    priceLabel: "PLANOS",
    priceTitle: "Simples, transparente, justo.",
    priceDesc: "Sem surpresas. Cancele quando quiser.",
    plans: [
      {
        name: "Starter",
        price: "R$297",
        period: "/mês",
        desc: "Para mentores solo começando a profissionalizar.",
        features: ["Até 10 mentorados", "Dashboard de operação", "Briefing com IA", "Financeiro básico", "Portal do aluno", "Suporte por email"],
        cta: "Começar Grátis",
        highlight: false,
      },
      {
        name: "Professional",
        price: "R$697",
        period: "/mês",
        desc: "Para mentores que querem escalar sem trabalhar mais.",
        features: ["Até 30 mentorados", "Tudo do Starter", "Radar de churn antecipado", "Analytics avançado", "White-label básico", "Suporte prioritário (4h)"],
        cta: "Começar Grátis",
        highlight: true,
        badge: "MAIS POPULAR",
      },
      {
        name: "Enterprise",
        price: "Sob consulta",
        period: "",
        desc: "Para agências e operações com múltiplos mentores.",
        features: ["Mentorados ilimitados", "Tudo do Professional", "White-label completo", "Múltiplos mentores", "SLA 99.9%", "Gerente de conta dedicado"],
        cta: "Falar com Vendas",
        highlight: false,
      },
    ],

    ctaT: "Pronto para recuperar suas 10 horas semanais?", ctaS: "Teste grátis por 14 dias. Sem cartão. Setup em 5 minutos.", ctaBtn: "Começar Agora — É Grátis",
    foot: "Entrar →",
    faqT: "Perguntas frequentes",
    segLabel: "CONFIANÇA", segT: "Segurança em primeiro lugar", segS: "Construída para empresas que levam privacidade e proteção de dados a sério.",
    segItens: ["100 em SEO e Boas Práticas — Google PageSpeed", "Conforme à LGPD (Lei 13.709/2018)", "Dados criptografados (em trânsito e repouso)", "Isolamento de dados por papel e empresa"],
    segCta: "Saiba mais sobre segurança",
    faq: [
      ["Quanto tempo leva para configurar?", "5 minutos. Você cria conta, importa seus alunos e já está operando. Sem instalação, 100% web."],
      ["Realmente funciona com IA para briefing?", "Sim. A IA lê o check-in do aluno (enviado pelo portal) e gera a pauta da call automaticamente. Clientes economizam 7-10h por semana."],
      ["O CKlareza é white-label?", "Sim, nos planos Professional e Enterprise. Você usa seu logo, suas cores e seu domínio. Seus alunos veem só a sua marca."],
      ["Para quem é o CKlareza?", "Para mentores e empresas de mentoria high-ticket que querem profissionalizar a operação, reduzir churn e escalar sem trabalhar mais."],
      ["Posso cancelar quando quiser?", "Sim. Sem multa, sem burocracia. Cancele com 1 clique."],
      ["Preciso instalar algo?", "Não. É 100% web, sem instalação. Acesse pelo navegador e teste sem cartão."],
    ],
  },
  en: {
    nav: ["Features", "White-label", "Purpose", "Plans"], entrar: "Sign in",
    badge: "Used by high-ticket mentors in Brazil",
    h1a: "Stop losing", h1b: "10 hours a week",
    h1c: "on mentorship admin.",
    sub: "CKlareza automates call briefing with AI, centralizes finances and shows who's about to cancel before it happens. Scale from 10 to 20 students ",
    subStrong: "without working more.",
    cta1: "Try Free (no card)", cta2: "Watch 2-min Demo",
    trust: ["No card to try", "Protected data (LGPD)", "5-minute setup"],
    proofLabel: "REAL RESULT",
    proofTitle: "From 45 min to 2 min per call.",
    proofDesc: "Termo Laser used CKlareza to scale their operation. Churn dropped by half. Call prep time dropped from 45 min to 2 min. MRR grew 40%.",
    proofName: "— Termo Laser, infoproduct agency",
    painLabel: "SOUND FAMILIAR?",
    painTitle: "The reality for 90% of mentors:",
    pains: [
      "45 minutes preparing agenda for EACH call (10 students = 7.5h/week gone)",
      "No idea which students will cancel until they vanish from WhatsApp",
      "Finances scattered across spreadsheets, payments lost",
      "Looks amateur using generic third-party links",
    ],
    solLabel: "THE SOLUTION",
    solTitle: "CKlareza solves all of this in one screen.",
    mock: ["To receive", "Calls this week", "Overdue tasks", "Mentees"],
    recT: "Everything to run your mentorship", recS: "One system, not ten spreadsheets.",
    vidT: "See CKlareza in action", vidS: "In 2 minutes, see how AI prepares your calls.",
    vid1: "Meet the platform", vid2: "Organization & database",
    feats: [
      ["AI Briefing in 30 seconds", "AI reads the student's check-in and delivers the exact call agenda. From 45 min to 30 sec. Save 7h+ per week."],
      ["Churn radar", "See who's stagnant and about to cancel in 30 days. Act before it happens."],
      ["Centralized finances", "Charges, overdue and MRR forecast. Know exactly how much you'll earn this month."],
      ["Kanban activities", "All students' tasks on one board: to do, overdue and done. Zero spreadsheet."],
      ["Professional student portal", "Your student checks in, tracks their journey. Increases retention."],
      ["True white-label", "Your brand, your colors, your domain. Students only see you."],
    ],
    wlLabel: "WHITE-LABEL", wlT: "Your brand. Our engine.",
    wlText: "Your clients experience CKlareza under your brand, your style, your method and your philosophy.",
    wlBullets: ["Own logo, colors and domain", "Multiple mentors per company", "Each sees only what's theirs", "Resell to other clients"],
    wlCardT: "Owner control panel", wlCardD: "Manage all companies, mentors and mentees in one place.",
    propLabel: "OUR PURPOSE", propT: "Transform lives.",
    propText: "We don't sell software — we give mentors the time and clarity to do what matters: transform the life of those who trust them.",
    priceLabel: "PRICING",
    priceTitle: "Simple, transparent, fair.",
    priceDesc: "No surprises. Cancel anytime.",
    plans: [
      { name: "Starter", price: "$59", period: "/mo", desc: "For solo mentors starting to professionalize.", features: ["Up to 10 mentees", "Operations dashboard", "AI briefing", "Basic finances", "Student portal", "Email support"], cta: "Start Free", highlight: false },
      { name: "Professional", price: "$139", period: "/mo", desc: "For mentors who want to scale without working more.", features: ["Up to 30 mentees", "Everything in Starter", "Churn radar", "Advanced analytics", "Basic white-label", "Priority support (4h)"], cta: "Start Free", highlight: true, badge: "MOST POPULAR" },
      { name: "Enterprise", price: "Custom", period: "", desc: "For agencies and multi-mentor operations.", features: ["Unlimited mentees", "Everything in Professional", "Full white-label", "Multiple mentors", "99.9% SLA", "Dedicated account manager"], cta: "Talk to Sales", highlight: false },
    ],
    ctaT: "Ready to get your 10 hours back?", ctaS: "Free 14-day trial. No card. 5-minute setup.", ctaBtn: "Start Now — It's Free",
    foot: "Sign in →",
    faqT: "Frequently asked questions",
    segLabel: "TRUST", segT: "Security first", segS: "Built for companies that take privacy and data protection seriously.",
    segItens: ["100 in SEO & Best Practices — Google PageSpeed", "LGPD compliant (Law 13.709/2018)", "Encrypted data (in transit and at rest)", "Data isolation by role and company"],
    segCta: "Learn more about security",
    faq: [
      ["How long does setup take?", "5 minutes. Create account, import your students and you're running. No install, 100% web."],
      ["Does the AI briefing really work?", "Yes. AI reads the student check-in and generates the call agenda automatically. Clients save 7-10h/week."],
      ["Is CKlareza white-label?", "Yes, on Professional and Enterprise plans. Use your own logo, colors and domain."],
      ["Who is CKlareza for?", "For high-ticket mentors and mentorship companies that want to reduce churn and scale without working more."],
      ["Can I cancel anytime?", "Yes. No penalty, no hassle. Cancel with 1 click."],
      ["Do I need to install anything?", "No. 100% web. Access from the browser and try without a card."],
    ],
  },
  es: {
    nav: ["Recursos", "White-label", "Propósito", "Planes"], entrar: "Entrar",
    badge: "Usado por mentores high-ticket en Brasil",
    h1a: "Deja de perder", h1b: "10 horas por semana",
    h1c: "en admin de tu mentoría.",
    sub: "CKlareza automatiza el briefing de calls con IA, centraliza finanzas y muestra quién va a cancelar antes de que pase. Escala de 10 a 20 alumnos ",
    subStrong: "sin trabajar más.",
    cta1: "Probar Gratis (sin tarjeta)", cta2: "Ver Demo 2 min",
    trust: ["Sin tarjeta para probar", "Datos protegidos (LGPD)", "Setup en 5 minutos"],
    proofLabel: "RESULTADO REAL",
    proofTitle: "De 45 min a 2 min por call.",
    proofDesc: "Termo Laser usó CKlareza para escalar la operación. El churn cayó a la mitad. El tiempo de preparación de call bajó de 45 min a 2 min. El MRR creció 40%.",
    proofName: "— Termo Laser, agencia de infoproductos",
    painLabel: "¿TE SUENA FAMILIAR?",
    painTitle: "La realidad del 90% de los mentores:",
    pains: [
      "45 minutos preparando agenda para CADA call (10 alumnos = 7,5h/semana perdidas)",
      "No sabes qué alumnos van a cancelar hasta que desaparecen del WhatsApp",
      "Finanzas dispersas en planillas, pagos perdidos",
      "Parece amateur usando links genéricos de terceros",
    ],
    solLabel: "LA SOLUCIÓN",
    solTitle: "CKlareza resuelve todo esto en una pantalla.",
    mock: ["Por cobrar", "Calls esta semana", "Tareas vencidas", "Mentoreados"],
    recT: "Todo para operar tu mentoría", recS: "Un sistema, no diez planillas.",
    vidT: "Mira CKlareza en acción", vidS: "En 2 minutos, mira cómo la IA prepara tus calls.",
    vid1: "Conoce la plataforma", vid2: "Organización y base de datos",
    feats: [
      ["Briefing con IA en 30 segundos", "La IA lee el check-in del alumno y entrega la agenda exacta de la call. De 45 min a 30 seg. Ahorra 7h+ por semana."],
      ["Radar de churn anticipado", "Ve quién está estancado y va a cancelar en 30 días. Actúa antes de perderlo."],
      ["Finanzas centralizadas", "Cobros, morosidad y proyección de MRR. Sabe exactamente cuánto vas a facturar este mes."],
      ["Actividades en Kanban", "Las tareas de todos los alumnos en un tablero. Cero planilla."],
      ["Portal del alumno profesional", "Tu alumno hace check-in y sigue su jornada. Aumenta la retención."],
      ["White-label real", "Tu marca, tus colores, tu dominio. Tus alumnos solo ven a ti."],
    ],
    wlLabel: "WHITE-LABEL", wlT: "Tu marca. Nuestro motor.",
    wlText: "Tus clientes con CKlareza en tu marca, tu estilo, tu método y tu filosofía.",
    wlBullets: ["Logo, colores y dominio propios", "Varios mentores por empresa", "Cada uno ve solo lo suyo", "Revende a otros clientes"],
    wlCardT: "Panel de control del dueño", wlCardD: "Gestiona todas las empresas, mentores y mentoreados en un solo lugar.",
    propLabel: "NUESTRO PROPÓSITO", propT: "Transformar vidas.",
    propText: "No vendemos software — le damos al mentor el tiempo y la claridad para hacer lo que importa: transformar la vida de quien confía en él.",
    priceLabel: "PLANES",
    priceTitle: "Simple, transparente, justo.",
    priceDesc: "Sin sorpresas. Cancela cuando quieras.",
    plans: [
      { name: "Starter", price: "R$297", period: "/mes", desc: "Para mentores solo que empiezan a profesionalizarse.", features: ["Hasta 10 mentoreados", "Panel de operación", "Briefing con IA", "Finanzas básicas", "Portal del alumno", "Soporte por email"], cta: "Comenzar Gratis", highlight: false },
      { name: "Professional", price: "R$697", period: "/mes", desc: "Para mentores que quieren escalar sin trabajar más.", features: ["Hasta 30 mentoreados", "Todo el Starter", "Radar de churn", "Analytics avanzado", "White-label básico", "Soporte prioritario (4h)"], cta: "Comenzar Gratis", highlight: true, badge: "MÁS POPULAR" },
      { name: "Enterprise", price: "A consultar", period: "", desc: "Para agencias y operaciones multi-mentor.", features: ["Mentoreados ilimitados", "Todo el Professional", "White-label completo", "Múltiples mentores", "SLA 99.9%", "Account manager dedicado"], cta: "Hablar con Ventas", highlight: false },
    ],
    ctaT: "¿Listo para recuperar tus 10 horas semanales?", ctaS: "Prueba gratis por 14 días. Sin tarjeta. Setup en 5 minutos.", ctaBtn: "Empezar Ahora — Es Gratis",
    foot: "Entrar →",
    faqT: "Preguntas frecuentes",
    segLabel: "CONFIANZA", segT: "Seguridad primero", segS: "Construida para empresas que se toman en serio la privacidad y la protección de datos.",
    segItens: ["100 en SEO y Buenas Prácticas — Google PageSpeed", "Conforme a LGPD (Ley 13.709/2018)", "Datos cifrados (en tránsito y reposo)", "Aislamiento de datos por rol y empresa"],
    segCta: "Conoce más sobre seguridad",
    faq: [
      ["¿Cuánto tiempo lleva la configuración?", "5 minutos. Crea cuenta, importa tus alumnos y ya estás operando. Sin instalación, 100% web."],
      ["¿El briefing con IA realmente funciona?", "Sí. La IA lee el check-in del alumno y genera la agenda de la call automáticamente. Los clientes ahorran 7-10h/semana."],
      ["¿CKlareza es white-label?", "Sí, en los planes Professional y Enterprise. Usa tu logo, tus colores y tu dominio."],
      ["¿Para quién es CKlareza?", "Para mentores y empresas de mentoría high-ticket que quieren reducir el churn y escalar sin trabajar más."],
      ["¿Puedo cancelar cuando quiera?", "Sí. Sin multa, sin burocracia. Cancela con 1 clic."],
      ["¿Necesito instalar algo?", "No. 100% web. Accede desde el navegador y pruébalo sin tarjeta."],
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

const FEAT_ICONS = [Brain, AlertCircle, DollarSign, KanbanSquare, Phone, Building2]

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("pt")
  const [openLang, setOpenLang] = useState(false)
  const [theme, setTheme] = useState<Theme>("dark")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
  const featCores = [c.teal, "#ef4444", "#22c55e", "#4c9aff", "#a855f7", c.goldDeep]
  const escolher = (l: Lang) => { setLang(l); localStorage.setItem("ck_lang", l); setOpenLang(false) }
  const toggleTheme = () => setTheme(prev => {
    const next: Theme = prev === "dark" ? "light" : "dark"
    localStorage.setItem("ck_theme", next)
    return next
  })

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
            <NavLink href="#recursos">Recursos</NavLink>
            <NavLink href="#precos">Preços</NavLink>
            <NavLink href="#prova">Cases</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </nav>
          <div className="flex items-center gap-2.5">
            <button onClick={toggleTheme} title={theme === "dark" ? "Tema claro" : "Tema escuro"} aria-label="Alternar tema"
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all"
              style={{ color: c.gold, border: `1px solid ${c.border}`, background: `${c.gold}10` }}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
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

      {/* HERO — Hormozi style: dor + ganho direto */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(60% 50% at 50% 0%, ${c.gold}1f 0%, transparent 70%)` }} />
        <div className="relative max-w-4xl mx-auto px-5 pt-14 pb-8 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: `${c.gold}18`, border: `1px solid ${c.gold}40`, color: c.goldDeep }}>
            <Star className="w-3.5 h-3.5" style={{ color: c.goldDeep }} /> {t.badge}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]" style={{ color: c.ink }}>
            {t.h1a} <span style={{ color: "#ef4444" }}>{t.h1b}</span><br />
            <span style={{ color: c.ink }}>{t.h1c}</span>
          </h1>
          <p className="text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed" style={{ color: c.muted }}>
            {t.sub}<span className="font-semibold" style={{ color: c.ink }}>{t.subStrong}</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
            <Link href="/login" className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold transition-all hover:-translate-y-0.5" style={{ background: c.gold, color: c.onAccent, boxShadow: `0 10px 30px ${c.gold}40` }}>
              {t.cta1} <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#prova" className="px-6 py-3.5 rounded-xl text-base font-semibold transition-all" style={{ background: c.card, border: `1px solid ${c.border}`, color: c.ink }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = c.card2}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = c.card}>{t.cta2}</a>
          </div>
          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            {t.trust.map((tr: string, i: number) => (
              <span key={i} className="flex items-center gap-1.5 text-sm" style={{ color: c.muted }}>
                <Check className="w-4 h-4" style={{ color: c.teal }} /> {tr}
              </span>
            ))}
          </div>
        </div>

        {/* VIDEO */}
        <div className="relative max-w-3xl mx-auto px-5 pb-6">
          <div className="rounded-2xl overflow-hidden" style={{ background: "#000", border: `2px solid ${c.gold}55`, boxShadow: `0 30px 90px -25px ${c.gold}55` }}>
            <video src="/video-cklareza.mp4" autoPlay muted loop playsInline controls className="w-full h-auto block" />
          </div>
          <p className="text-center text-sm mt-3 font-semibold flex items-center justify-center gap-2" style={{ color: c.muted }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: c.gold }} /> {t.vid1}
          </p>
        </div>
      </section>

      {/* PROVA SOCIAL — Case Termo Laser */}
      <section id="prova" className="max-w-4xl mx-auto px-5 py-16">
        <div className="rounded-2xl p-8 md:p-12 text-center" style={{ background: `${c.gold}10`, border: `2px solid ${c.gold}40` }}>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ background: `${c.gold}20`, color: c.goldDeep }}>
            {t.proofLabel}
          </span>
          <p className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: c.gold }}>{t.proofTitle}</p>
          <p className="text-lg max-w-2xl mx-auto mb-4" style={{ color: c.muted }}>{t.proofDesc}</p>
          <p className="text-sm font-semibold" style={{ color: c.muted }}>{t.proofName}</p>
          <div className="grid grid-cols-3 gap-6 mt-8">
            {[["−50%", "Churn"], ["40%", "MRR"], ["45min→2min", "Prep/call"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-2xl md:text-3xl font-extrabold" style={{ color: c.gold }}>{val}</p>
                <p className="text-sm mt-1" style={{ color: c.muted }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOR */}
      <section className="max-w-4xl mx-auto px-5 py-12">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: `${c.border}`, color: c.muted }}>
            {t.painLabel}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: c.ink }}>{t.painTitle}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {t.pains.map((pain: string, i: number) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: `rgba(239,68,68,0.05)`, border: `1px solid rgba(239,68,68,0.15)` }}>
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#ef4444" }} />
              <p style={{ color: c.muted }}>{pain}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOLUÇÃO — FEATURES */}
      <section id="recursos" className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: `${c.gold}18`, color: c.goldDeep }}>
            {t.solLabel}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: c.ink }}>{t.solTitle}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.feats.map(([title, desc]: string[], i: number) => {
            const Icon = FEAT_ICONS[i]
            return (
              <div key={i} className="p-6 rounded-2xl" style={{ background: c.card, border: `1px solid ${c.border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${featCores[i]}18` }}>
                  <Icon className="w-5 h-5" style={{ color: featCores[i] }} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: c.ink }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: c.muted }}>{desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: `${c.gold}18`, color: c.goldDeep }}>
            {t.priceLabel}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: c.ink }}>{t.priceTitle}</h2>
          <p style={{ color: c.muted }}>{t.priceDesc}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {t.plans.map((plan: any, i: number) => (
            <div key={i} className="relative p-7 rounded-2xl flex flex-col" style={{
              background: plan.highlight ? `${c.gold}10` : c.card,
              border: `2px solid ${plan.highlight ? c.gold : c.border}`,
              boxShadow: plan.highlight ? `0 20px 60px -15px ${c.gold}30` : "none"
            }}>
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold" style={{ background: c.gold, color: c.onAccent }}>
                  {plan.badge}
                </span>
              )}
              <div className="mb-6">
                <h3 className="font-bold text-xl mb-1" style={{ color: c.ink }}>{plan.name}</h3>
                <p className="text-sm mb-4" style={{ color: c.muted }}>{plan.desc}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold" style={{ color: plan.highlight ? c.gold : c.ink }}>{plan.price}</span>
                  <span className="text-sm mb-1" style={{ color: c.muted }}>{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f: string, j: number) => (
                  <li key={j} className="flex items-center gap-2 text-sm" style={{ color: c.muted }}>
                    <Check className="w-4 h-4 shrink-0" style={{ color: c.teal }} /> {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.name === "Enterprise" ? "/contato" : "/login"} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all" style={{
                background: plan.highlight ? c.gold : c.card2,
                color: plan.highlight ? c.onAccent : c.ink,
                border: plan.highlight ? "none" : `1px solid ${c.border}`
              }}>
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* WHITE-LABEL */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center" style={{ background: c.card, border: `1px solid ${c.border}` }}>
          <div className="flex-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ background: `${c.gold}18`, color: c.goldDeep }}>{t.wlLabel}</span>
            <h2 className="text-3xl font-extrabold mb-4" style={{ color: c.ink }}>{t.wlT}</h2>
            <p className="text-lg mb-6" style={{ color: c.muted }}>{t.wlText}</p>
            <ul className="space-y-3">
              {t.wlBullets.map((b: string, i: number) => (
                <li key={i} className="flex items-center gap-2" style={{ color: c.muted }}>
                  <Check className="w-4 h-4 shrink-0" style={{ color: c.teal }} /> {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 p-6 rounded-xl" style={{ background: c.card2, border: `1px solid ${c.border}` }}>
            <p className="font-bold mb-2" style={{ color: c.ink }}>{t.wlCardT}</p>
            <p className="text-sm" style={{ color: c.muted }}>{t.wlCardD}</p>
          </div>
        </div>
      </section>

      {/* SEGURANÇA */}
      <section className="max-w-4xl mx-auto px-5 py-12">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: `${c.border}`, color: c.muted }}>{t.segLabel}</span>
          <h2 className="text-3xl font-extrabold mb-2" style={{ color: c.ink }}>{t.segT}</h2>
          <p style={{ color: c.muted }}>{t.segS}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {t.segItens.map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: c.card, border: `1px solid ${c.border}` }}>
              <ShieldCheck className="w-5 h-5 shrink-0" style={{ color: c.teal }} />
              <span className="text-sm" style={{ color: c.muted }}>{item}</span>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/seguranca" className="text-sm font-semibold" style={{ color: c.goldDeep }}>{t.segCta} →</Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="text-3xl font-extrabold text-center mb-10" style={{ color: c.ink }}>{t.faqT}</h2>
        <div className="space-y-3">
          {t.faq.map(([q, a]: string[], i: number) => (
            <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
              <button className="w-full flex items-center justify-between p-5 text-left font-semibold"
                style={{ background: c.card, color: c.ink }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {q}
                {openFaq === i ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: c.muted }} /> : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: c.muted }} />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ background: c.card, color: c.muted }}>{a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-3xl mx-auto px-5 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: c.ink }}>{t.ctaT}</h2>
        <p className="text-lg mb-8" style={{ color: c.muted }}>{t.ctaS}</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition-all hover:-translate-y-1"
          style={{ background: c.gold, color: c.onAccent, boxShadow: `0 15px 40px ${c.gold}40` }}>
          {t.ctaBtn} <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      <LifetimeValueCTA c={c} lang={lang} />
      <SiteFooter c={c} lang={lang} />
    </div>
  )
}
