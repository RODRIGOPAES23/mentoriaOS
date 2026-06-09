"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Sparkles, LayoutDashboard, DollarSign, KanbanSquare, Brain,
  Building2, ArrowRight, Check, Phone, ShieldCheck, Star, Globe, Heart, Sun, Moon,
  Clock, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Play, Zap, Target
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

// ─── COPY ─────────────────────────────────────────────────────────────────────
const T: Record<Lang, any> = {
  pt: {
    nav: ["Recursos", "Preços", "Cases", "FAQ"], entrar: "Entrar",

    // HERO
    badge: "Organize toda sua mentoria em um só lugar",
    h1a: "Organize.", h1b: "Centralize.",
    h1c: "Acompanhe.",
    sub: "Tudo da sua mentoria em uma plataforma: financeiro, atividades, calls e o progresso de cada aluno. Sua marca, nosso motor. ",
    subStrong: "Comece grátis, sem cartão.",
    cta1: "Ver Demo — 2 minutos",
    cta2: "Criar conta gratuita →",
    trust: ["Sem cartão para testar", "Dados protegidos (LGPD)", "Setup em 5 minutos"],

    // PROVA SOCIAL
    proofLabel: "RESULTADO REAL",
    proofTitle: "De 45 min para 2 min por call.",
    proofDesc: "Termo Laser usou CKlareza para escalar a operação. A equipe parou de perder noites preparando pautas. Churn caiu pela metade. MRR cresceu 40%.",
    proofName: "— Termo Laser, agência de infoprodutos",
    proofStats: [["−50%", "Churn"], ["+40%", "MRR"], ["45→2min", "Prep/call"]],

    // DOR + IMPLICAÇÕES
    painLabel: "VOCÊ RECONHECE ISSO?",
    painTitle: "A realidade de 90% dos mentores:",
    pains: [
      {
        dor: "45 minutos preparando pauta pra CADA call (10 alunos = 7h30 por semana)",
        impl: "São 7h30 semanais que deveriam ir para captação, posicionamento e crescimento. Em vez disso, você está esgotado com operação — e sua energia criativa vai embora antes da primeira call.",
      },
      {
        dor: "Não sabe quais alunos vão cancelar até sumirem do WhatsApp",
        impl: "Cada cancelamento high-ticket que você poderia ter evitado é R$5.000 a R$20.000 que saem da sua receita. Sem sistema, você só descobre quando já é tarde demais para agir.",
      },
      {
        dor: "Financeiro espalhado em planilhas, pagamentos perdidos",
        impl: "Sem visibilidade real do MRR, você não consegue decidir se vale contratar, anunciar ou aumentar o preço. Você opera no escuro em um negócio que deveria ter total previsibilidade.",
      },
      {
        dor: "Parece amador usando Calendly genérico, formulários avulsos, Google Drive",
        impl: "No high-ticket, percepção é tudo. Um mentor com ferramenta genérica cobra menos, retém menos e escala mais devagar — porque o aluno não sente que está em algo premium.",
      },
    ],

    // IMAGINE
    imagineLabel: "AGORA IMAGINE",
    imagineTitle: "Como seria sua rotina se...",
    imagines: [
      "A pauta da call estivesse pronta 30 segundos após o check-in do aluno — sem você tocar em nada",
      "Você soubesse com 30 dias de antecedência exatamente quem está pensando em cancelar",
      "Seu MRR estivesse sempre visível e atualizado, sem planilha, sem adivinhação",
      "Seus alunos vissem só a sua marca — logo, cores, domínio próprio — do check-in ao portal",
    ],
    imagineCta: "Isso existe. E você pode testar hoje.",

    // SOLUÇÃO — FEATURES (benefícios, não vantagens)
    solLabel: "A SOLUÇÃO",
    solTitle: "CKlareza resolve tudo isso em uma tela.",
    feats: [
      {
        title: "Entre em cada call com autoridade total",
        desc: "A IA lê o check-in do aluno e entrega a pauta exata — o que discutir, onde ele travou, o que priorizar. De 45 min de preparação para 30 segundos. Isso é o que justifica o seu ticket alto.",
      },
      {
        title: "Salve contratos antes de perdê-los",
        desc: "O Radar de Churn analisa frequência de check-ins, padrão de respostas e engajamento — e te avisa com 30 dias de antecedência quando o aluno está esfriando. Você age antes de receber o cancelamento.",
      },
      {
        title: "Previsibilidade total do seu caixa",
        desc: "Cobranças, inadimplência e projeção de MRR num dashboard. Decida sobre investimento, contratação e expansão com dados — não com chute.",
      },
      {
        title: "Zero planilha, zero caos de tarefas",
        desc: "As atividades de todos os alunos num Kanban único. A fazer, atrasadas, concluídas. Você sabe exatamente onde cada aluno está em 5 segundos.",
      },
      {
        title: "Portal premium que aumenta retenção",
        desc: "Seu aluno faz check-in, acompanha a jornada e se sente parte de algo sério. Um portal profissional comunica valor — e alunos que sentem o valor cancelam menos.",
      },
      {
        title: "Sua marca, não a nossa",
        desc: "Logo, cores e domínio próprios. Seus alunos veem só você — o motor é CKlareza. Você entrega uma experiência premium sem construir tecnologia do zero.",
      },
    ],

    // ROI CHURN
    churnLabel: "ROI DO RADAR DE CHURN",
    churnTitle: "1 aluno salvo já paga meses de CKlareza.",
    churnDesc: "O Radar analisa 3 sinais: frequência de check-in, qualidade das respostas e engajamento no portal. Quando o padrão muda, você recebe o alerta — com tempo para agir.",
    churnCalc: [
      ["Ticket médio (ex: R$2.000/aluno/mês)", "R$24.000/ano por aluno"],
      ["Custo anual do CKlareza (10 alunos)", "R$11.820/ano"],
      ["Salvar 1 aluno já cobre", "≈ 2x o custo anual"],
    ],
    churnNote: "Calcule com o seu ticket: qualquer aluno retido por 6+ meses paga o sistema inteiro.",

    // CALCULADORA
    calcLabel: "CALCULADORA DE DESCONTO",
    calcTitle: "Quanto você paga por mentorado?",
    calcSub: "Mova o slider e veja o preço exato para o seu volume",
    calcSliderLabel: "Número de mentorados",
    calcPerUnit: "por mentorado/mês",
    calcTotal: "Total mensal",
    calcSavings: "Economia/ano",
    calcDiscount: "de desconto",
    calcCta: "Criar conta gratuita com",
    calcNote: "Trial de 14 dias · sem cartão · sem compromisso",

    // PRICING
    priceLabel: "PLANOS",
    priceTitle: "Transparente por mentorado.",
    priceDesc: "Pague pelo que usa. Volume alto = desconto automático. Cancele quando quiser.",

    // WHITE-LABEL
    wlLabel: "WHITE-LABEL",
    wlT: "Sua marca. Nosso motor.",
    wlText: "Seus clientes experienciam o CKlareza com o seu branding — logo, cores, domínio e método. Você aparece como proprietário da tecnologia.",
    wlBullets: ["Logo, cores e domínio próprios", "Vários mentores por empresa", "Cada um vê só o que é seu", "Revenda para outros clientes"],
    wlCardT: "Painel de controle do dono", wlCardD: "Gerencie todas as empresas, mentores e mentorados num só lugar.",

    // SEGURANÇA
    segLabel: "CONFIANÇA",
    segT: "Segurança em primeiro lugar",
    segS: "Construída para operações que levam dados dos alunos a sério.",
    segItens: ["100 em SEO e Boas Práticas — Google PageSpeed", "Conforme à LGPD (Lei 13.709/2018)", "Dados criptografados (em trânsito e repouso)", "Isolamento de dados por papel e empresa"],
    segCta: "Saiba mais sobre segurança",

    // FAQ
    faqT: "Perguntas frequentes",
    faq: [
      ["Quanto tempo leva para configurar?", "5 minutos. Você cria conta, importa seus alunos e já está operando. Sem instalação, 100% web."],
      ["Preciso de cartão de crédito para testar?", "Não. Você cria conta gratuitamente, explora o sistema e só entra com cartão quando quiser assinar."],
      ["O Radar de Churn realmente funciona?", "Sim. Ele analisa frequência de check-ins, padrões de resposta e engajamento do aluno — e te avisa quando o sinal muda. Mentores que usam o Radar agem antes que o aluno decida cancelar."],
      ["O briefing com IA substitui meu julgamento?", "Não — ele potencializa. A IA organiza o que o aluno trouxe e sugere a pauta. Você decide o que usar. O resultado é entrar na call com 10x mais clareza, em 30 segundos."],
      ["O CKlareza é white-label?", "Sim, nos planos com mais de 20 mentorados. Você usa seu logo, suas cores e seu domínio. Seus alunos veem só a sua marca."],
      ["Para quem é o CKlareza?", "Para mentores e empresas de mentoria high-ticket que querem profissionalizar a operação, reduzir churn e escalar sem trabalhar mais horas."],
      ["Posso cancelar quando quiser?", "Sim. Sem multa, sem burocracia. Cancele com 1 clique."],
    ],

    // CTA FINAL
    ctaT: "Pronto para entrar na próxima call com clareza total?",
    ctaS: "Crie sua conta gratuita. Explore o sistema. Veja a IA preparar uma call em 30 segundos.",
    ctaBtn: "Criar conta gratuita — sem cartão",
    ctaSub: "Ou se preferir, veja a demo primeiro",
  },

  en: {
    nav: ["Features", "Pricing", "Cases", "FAQ"], entrar: "Sign in",
    badge: "Manage all your mentorships in one place",
    h1a: "Organize.", h1b: "Centralize.",
    h1c: "Track.",
    sub: "Everything your mentorship needs in one platform: finances, activities, calls and each student's progress. Your brand, our engine. ",
    subStrong: "Start free, no card required.",
    cta1: "Watch Demo — 2 minutes",
    cta2: "Create free account →",
    trust: ["No card to test", "Protected data (LGPD)", "5-minute setup"],
    proofLabel: "REAL RESULT",
    proofTitle: "From 45 min to 2 min per call.",
    proofDesc: "Termo Laser used CKlareza to scale operations. The team stopped losing nights preparing agendas. Churn dropped in half. MRR grew 40%.",
    proofName: "— Termo Laser, infoproduct agency",
    proofStats: [["−50%", "Churn"], ["+40%", "MRR"], ["45→2min", "Prep/call"]],
    painLabel: "SOUND FAMILIAR?",
    painTitle: "The reality for 90% of mentors:",
    pains: [
      {
        dor: "45 minutes preparing agenda for EACH call (10 students = 7.5h/week gone)",
        impl: "That's 7.5h weekly that should go toward acquisition, positioning and growth. Instead, you're exhausted by operations — and your creative energy disappears before the first call.",
      },
      {
        dor: "No idea which students will cancel until they vanish from WhatsApp",
        impl: "Every high-ticket cancellation you could have prevented is $1,000–$4,000 leaving your revenue. Without a system, you only find out when it's already too late to act.",
      },
      {
        dor: "Finances scattered across spreadsheets, payments lost",
        impl: "Without real MRR visibility, you can't decide whether to hire, advertise or raise prices. You're operating blind in a business that should have total predictability.",
      },
      {
        dor: "Looks amateur using generic Calendly, random forms, Google Drive",
        impl: "In high-ticket, perception is everything. A mentor with generic tools charges less, retains less and scales slower — because students don't feel they're in something premium.",
      },
    ],
    imagineLabel: "NOW IMAGINE",
    imagineTitle: "What if your routine looked like this...",
    imagines: [
      "The call agenda ready 30 seconds after the student's check-in — without you touching anything",
      "You knew 30 days in advance exactly who is thinking about canceling",
      "Your MRR always visible and updated — no spreadsheet, no guessing",
      "Your students only see your brand — logo, colors, custom domain — from check-in to portal",
    ],
    imagineCta: "This exists. And you can try it today.",
    solLabel: "THE SOLUTION",
    solTitle: "CKlareza solves all of this in one screen.",
    feats: [
      { title: "Enter every call with complete authority", desc: "AI reads the student's check-in and delivers the exact agenda — what to discuss, where they're stuck, what to prioritize. From 45 min of prep to 30 seconds. That's what justifies your high ticket." },
      { title: "Save contracts before losing them", desc: "The Churn Radar analyzes 3 signals: check-in frequency, response quality and portal engagement. When the pattern changes, you get an alert — with time to act, not just mourn the cancellation." },
      { title: "Total cash flow predictability", desc: "Charges, overdue and MRR forecast in one dashboard. Decide on investment, hiring and expansion with data — not guesswork." },
      { title: "Zero spreadsheet, zero task chaos", desc: "All students' activities in a single Kanban. To do, overdue, done. You know exactly where each student is in 5 seconds." },
      { title: "Premium portal that increases retention", desc: "Your student checks in, tracks their journey and feels part of something serious. A professional portal communicates value — and students who feel value cancel less." },
      { title: "Your brand, not ours", desc: "Own logo, colors and domain. Your students only see you — the engine is CKlareza. You deliver a premium experience without building technology from scratch." },
    ],
    churnLabel: "CHURN RADAR ROI",
    churnTitle: "1 student saved already pays months of CKlareza.",
    churnDesc: "The Radar monitors 3 signals: check-in frequency, response quality, and portal engagement. When the pattern shifts, you receive the alert — with time to act.",
    churnCalc: [
      ["Average ticket (ex: $400/student/month)", "$4,800/year per student"],
      ["Annual CKlareza cost (10 students)", "$2,400/year"],
      ["Saving 1 student already covers", "≈ 2x the annual cost"],
    ],
    churnNote: "Calculate with your ticket: any student retained 6+ months pays for the entire system.",
    calcLabel: "DISCOUNT CALCULATOR",
    calcTitle: "What do you pay per mentee?",
    calcSub: "Move the slider and see the exact price for your volume",
    calcSliderLabel: "Number of mentees",
    calcPerUnit: "per mentee/month",
    calcTotal: "Monthly total",
    calcSavings: "Annual savings",
    calcDiscount: "discount",
    calcCta: "Create free account with",
    calcNote: "14-day trial · no card · no commitment",
    priceLabel: "PRICING",
    priceTitle: "Transparent per mentee.",
    priceDesc: "Pay for what you use. High volume = automatic discount. Cancel anytime.",
    wlLabel: "WHITE-LABEL", wlT: "Your brand. Our engine.",
    wlText: "Your clients experience CKlareza with your branding — logo, colors, domain and method.",
    wlBullets: ["Own logo, colors and domain", "Multiple mentors per company", "Each sees only what's theirs", "Resell to other clients"],
    wlCardT: "Owner control panel", wlCardD: "Manage all companies, mentors and mentees in one place.",
    segLabel: "TRUST", segT: "Security first", segS: "Built for operations that take student data seriously.",
    segItens: ["100 in SEO & Best Practices — Google PageSpeed", "LGPD compliant (Law 13.709/2018)", "Encrypted data (in transit and at rest)", "Data isolation by role and company"],
    segCta: "Learn more about security",
    faqT: "Frequently asked questions",
    faq: [
      ["How long does setup take?", "5 minutes. Create account, import your students and you're running. No install, 100% web."],
      ["Do I need a credit card to test?", "No. You create an account for free, explore the system, and only add a card when you want to subscribe."],
      ["Does the Churn Radar really work?", "Yes. It analyzes check-in frequency, response patterns and student engagement — and alerts you when the signal changes. Mentors who use the Radar act before the student decides to cancel."],
      ["Does AI briefing replace my judgment?", "No — it amplifies it. AI organizes what the student brought and suggests the agenda. You decide what to use. The result is entering the call with 10x more clarity in 30 seconds."],
      ["Is CKlareza white-label?", "Yes, on plans with more than 20 mentees. Use your own logo, colors and domain."],
      ["Who is CKlareza for?", "For high-ticket mentors and mentorship companies who want to professionalize operations, reduce churn and scale without working more hours."],
      ["Can I cancel anytime?", "Yes. No penalty, no hassle. Cancel with 1 click."],
    ],
    ctaT: "Ready to enter your next call with complete clarity?",
    ctaS: "Create your free account. Explore the system. Watch AI prepare a call in 30 seconds.",
    ctaBtn: "Create free account — no card",
    ctaSub: "Or watch the demo first",
  },

  es: {
    nav: ["Recursos", "Precios", "Cases", "FAQ"], entrar: "Entrar",
    badge: "Gestiona todas tus mentorias en un solo lugar",
    h1a: "Organiza.", h1b: "Centraliza.",
    h1c: "Acompaña.",
    sub: "Todo lo que tu mentoría necesita en una plataforma: finanzas, actividades, calls y el progreso de cada alumno. Tu marca, nuestro motor. ",
    subStrong: "Comienza gratis, sin tarjeta.",
    cta1: "Ver Demo — 2 minutos",
    cta2: "Crear cuenta gratuita →",
    trust: ["Sin tarjeta para probar", "Datos protegidos (LGPD)", "Setup en 5 minutos"],
    proofLabel: "RESULTADO REAL",
    proofTitle: "De 45 min a 2 min por call.",
    proofDesc: "Termo Laser usó CKlareza para escalar la operación. El equipo dejó de perder noches preparando agendas. El churn cayó a la mitad. El MRR creció 40%.",
    proofName: "— Termo Laser, agencia de infoproductos",
    proofStats: [["−50%", "Churn"], ["+40%", "MRR"], ["45→2min", "Prep/call"]],
    painLabel: "¿TE SUENA FAMILIAR?",
    painTitle: "La realidad del 90% de los mentores:",
    pains: [
      {
        dor: "45 minutos preparando agenda para CADA call (10 alumnos = 7,5h/semana perdidas)",
        impl: "Son 7h30 semanales que deberían ir a captación, posicionamiento y crecimiento. En cambio, llegas agotado a la operación — y tu energía creativa se va antes de la primera call.",
      },
      {
        dor: "No sabes qué alumnos van a cancelar hasta que desaparecen del WhatsApp",
        impl: "Cada cancelación high-ticket que podrías haber evitado son $1,000–$4,000 que salen de tu facturación. Sin sistema, solo lo descubres cuando ya es demasiado tarde.",
      },
      {
        dor: "Finanzas dispersas en planillas, pagos perdidos",
        impl: "Sin visibilidad real del MRR, no puedes decidir si contratar, anunciar o subir el precio. Operas a ciegas en un negocio que debería tener total previsibilidad.",
      },
      {
        dor: "Parece amateur usando Calendly genérico, formularios sueltos, Google Drive",
        impl: "En high-ticket, la percepción lo es todo. Un mentor con herramienta genérica cobra menos, retiene menos y escala más lento — porque el alumno no siente que está en algo premium.",
      },
    ],
    imagineLabel: "AHORA IMAGINA",
    imagineTitle: "¿Cómo sería tu rutina si...",
    imagines: [
      "La agenda de la call estuviera lista 30 segundos después del check-in del alumno — sin que toques nada",
      "Supieras con 30 días de antelación exactamente quién está pensando en cancelar",
      "Tu MRR siempre visible y actualizado — sin planilla, sin adivinar",
      "Tus alumnos solo vieran tu marca — logo, colores, dominio propio — del check-in al portal",
    ],
    imagineCta: "Esto existe. Y puedes probarlo hoy.",
    solLabel: "LA SOLUCIÓN",
    solTitle: "CKlareza resuelve todo esto en una pantalla.",
    feats: [
      { title: "Entra a cada call con autoridad total", desc: "La IA lee el check-in del alumno y entrega la agenda exacta — qué discutir, dónde se bloqueó, qué priorizar. De 45 min de preparación a 30 segundos. Eso es lo que justifica tu ticket alto." },
      { title: "Salva contratos antes de perderlos", desc: "El Radar de Churn analiza 3 señales: frecuencia de check-in, calidad de respuestas y engagement en el portal. Cuando el patrón cambia, recibes la alerta — con tiempo para actuar." },
      { title: "Previsibilidad total de tu caja", desc: "Cobros, morosidad y proyección de MRR en un dashboard. Decide sobre inversión, contratación y expansión con datos — no con intuición." },
      { title: "Cero planilla, cero caos de tareas", desc: "Las actividades de todos los alumnos en un Kanban único. Por hacer, vencidas, completadas. Sabes exactamente dónde está cada alumno en 5 segundos." },
      { title: "Portal premium que aumenta la retención", desc: "Tu alumno hace check-in, sigue su jornada y se siente parte de algo serio. Un portal profesional comunica valor — y los alumnos que sienten el valor cancelan menos." },
      { title: "Tu marca, no la nuestra", desc: "Logo, colores y dominio propios. Tus alumnos solo ven a ti — el motor es CKlareza. Ofreces una experiencia premium sin construir tecnología desde cero." },
    ],
    churnLabel: "ROI DEL RADAR DE CHURN",
    churnTitle: "1 alumno salvado ya paga meses de CKlareza.",
    churnDesc: "El Radar monitorea 3 señales: frecuencia de check-in, calidad de respuestas y engagement en el portal. Cuando el patrón cambia, recibes la alerta — con tiempo para actuar.",
    churnCalc: [
      ["Ticket promedio (ej: $400/alumno/mes)", "$4.800/año por alumno"],
      ["Costo anual CKlareza (10 alumnos)", "$2.400/año"],
      ["Salvar 1 alumno ya cubre", "≈ 2x el costo anual"],
    ],
    churnNote: "Calcula con tu ticket: cualquier alumno retenido 6+ meses paga todo el sistema.",
    calcLabel: "CALCULADORA DE DESCUENTO",
    calcTitle: "¿Cuánto pagas por mentoreado?",
    calcSub: "Mueve el slider y ve el precio exacto para tu volumen",
    calcSliderLabel: "Número de mentoreados",
    calcPerUnit: "por mentoreado/mes",
    calcTotal: "Total mensual",
    calcSavings: "Ahorro/año",
    calcDiscount: "de descuento",
    calcCta: "Crear cuenta gratuita con",
    calcNote: "Trial de 14 días · sin tarjeta · sin compromiso",
    priceLabel: "PLANES",
    priceTitle: "Transparente por mentoreado.",
    priceDesc: "Paga por lo que usas. Volumen alto = descuento automático. Cancela cuando quieras.",
    wlLabel: "WHITE-LABEL", wlT: "Tu marca. Nuestro motor.",
    wlText: "Tus clientes experimentan CKlareza con tu branding — logo, colores, dominio y método.",
    wlBullets: ["Logo, colores y dominio propios", "Varios mentores por empresa", "Cada uno ve solo lo suyo", "Revende a otros clientes"],
    wlCardT: "Panel de control del dueño", wlCardD: "Gestiona todas las empresas, mentores y mentoreados en un solo lugar.",
    segLabel: "CONFIANZA", segT: "Seguridad primero", segS: "Construida para operaciones que se toman en serio los datos de sus alumnos.",
    segItens: ["100 en SEO y Buenas Prácticas — Google PageSpeed", "Conforme a LGPD (Ley 13.709/2018)", "Datos cifrados (en tránsito y reposo)", "Aislamiento de datos por rol y empresa"],
    segCta: "Conoce más sobre seguridad",
    faqT: "Preguntas frecuentes",
    faq: [
      ["¿Cuánto tiempo lleva la configuración?", "5 minutos. Crea cuenta, importa tus alumnos y ya estás operando. Sin instalación, 100% web."],
      ["¿Necesito tarjeta de crédito para probar?", "No. Creas cuenta gratis, exploras el sistema y solo pones tarjeta cuando quieras suscribirte."],
      ["¿El Radar de Churn realmente funciona?", "Sí. Analiza frecuencia de check-ins, patrones de respuesta y engagement del alumno — y te avisa cuando la señal cambia. Los mentores que usan el Radar actúan antes de que el alumno decida cancelar."],
      ["¿El briefing con IA reemplaza mi criterio?", "No — lo amplifica. La IA organiza lo que el alumno trajo y sugiere la agenda. Tú decides qué usar. El resultado es entrar a la call con 10x más claridad en 30 segundos."],
      ["¿CKlareza es white-label?", "Sí, en planes con más de 20 mentoreados. Usa tu logo, tus colores y tu dominio."],
      ["¿Para quién es CKlareza?", "Para mentores y empresas de mentoría high-ticket que quieren reducir el churn y escalar sin trabajar más horas."],
      ["¿Puedo cancelar cuando quiera?", "Sí. Sin multa, sin burocracia. Cancela con 1 clic."],
    ],
    ctaT: "¿Listo para entrar a tu próxima call con claridad total?",
    ctaS: "Crea tu cuenta gratuita. Explora el sistema. Mira a la IA preparar una call en 30 segundos.",
    ctaBtn: "Crear cuenta gratuita — sin tarjeta",
    ctaSub: "O mira la demo primero",
  },
}

// ─── Lógica de preço ──────────────────────────────────────────────────────────
// Base: R$197/mentorado · Descontos fixos por faixa:
// até 20 → 50% off (R$98,50) | 21-50 → 60% off (R$78,80)
// 51-99  → 70% off (R$59,10) | 100+  → 80% off (R$39,40)
function calcDescPct(n: number): number {
  if (n <= 20) return 50
  if (n <= 50) return 60
  if (n <= 99) return 70
  return 80
}
function calcPrecoUnit(n: number): number { return 197 * (1 - calcDescPct(n) / 100) }
function calcTotal(n: number): number { return Math.round(calcPrecoUnit(n) * n) }
function calcDesconto(n: number): number { return calcDescPct(n) }
function calcEconomia(n: number): number { return Math.round(197 * n - calcTotal(n)) }

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
  const [calcN, setCalcN] = useState(10)
  const [openPain, setOpenPain] = useState<number | null>(null)

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

      {/* ── NAV ── */}
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
            <Link href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: c.gold, color: c.onAccent, boxShadow: `0 6px 20px ${c.gold}40` }}>
              {t.entrar} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(60% 50% at 50% 0%, ${c.gold}1f 0%, transparent 70%)` }} />
        <div className="relative max-w-4xl mx-auto px-5 pt-14 pb-8 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: `${c.gold}18`, border: `1px solid ${c.gold}40`, color: c.goldDeep }}>
            <Star className="w-3.5 h-3.5" style={{ color: c.goldDeep }} /> {t.badge}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]" style={{ color: c.ink }}>
            <span style={{ color: "#ef4444" }}>Quanto você pagaria</span>{" "}
            <span style={{ color: c.ink }}>para não errar?</span>
          </h1>
          <p className="text-lg md:text-xl mt-5 max-w-2xl mx-auto leading-relaxed" style={{ color: c.muted }}>
            Pare de perder <strong style={{ color: c.ink }}>7h30 por semana</strong> preparando calls
            que você poderia simplesmente <em>não preparar</em>.
          </p>
          <p className="text-base md:text-lg mt-3 max-w-2xl mx-auto leading-relaxed" style={{ color: c.muted }}>
            A CKlareza automatiza o seu briefing com{" "}
            <strong style={{ color: c.ink }}>Inteligência Artificial</strong>, centraliza a gestão financeira
            e prevê quem vai cancelar com{" "}
            <strong style={{ color: c.ink }}>30 dias de antecedência</strong>.
            Opere mais, trabalhe menos —{" "}
            <strong style={{ color: c.gold }}>tudo com a sua marca</strong>.
          </p>

          {/* CTAs — Demo primeiro (Avanço), depois conta */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
            <a href="#video"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold transition-all hover:-translate-y-0.5"
              style={{ background: c.gold, color: c.onAccent, boxShadow: `0 10px 30px ${c.gold}40` }}>
              <Play className="w-4 h-4" /> {t.cta1}
            </a>
            <Link href="/comecar"
              className="px-6 py-3.5 rounded-xl text-base font-semibold transition-all"
              style={{ background: c.card, border: `1px solid ${c.border}`, color: c.ink }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = c.card2}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = c.card}>
              {t.cta2}
            </Link>
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

        {/* VIDEO — Demonstração de Capacidade */}
        <div id="video" className="relative max-w-3xl mx-auto px-5 pb-6">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "#000", border: `2px solid ${c.gold}55`, boxShadow: `0 30px 90px -25px ${c.gold}55` }}>
            <video src="/video-cklareza.mp4" autoPlay muted loop playsInline controls className="w-full h-auto block" />
          </div>
          <p className="text-center text-sm mt-3 font-semibold flex items-center justify-center gap-2" style={{ color: c.muted }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: c.gold }} /> Conheça a plataforma em 2 minutos
          </p>
          {/* CTA abaixo do vídeo — Avanço natural */}
          <div className="text-center mt-5">
            <Link href="/comecar"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5"
              style={{ background: c.gold, color: c.onAccent, boxShadow: `0 8px 24px ${c.gold}40` }}>
              {t.cta2} <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs mt-2" style={{ color: c.muted }}>Sem cartão · Setup em 5 min</p>
          </div>
        </div>
      </section>

      {/* ── PROVA SOCIAL — Case Termo Laser ── */}
      <section id="prova" className="max-w-4xl mx-auto px-5 py-16">
        <div className="rounded-2xl p-8 md:p-12 text-center"
          style={{ background: `${c.gold}10`, border: `2px solid ${c.gold}40` }}>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
            style={{ background: `${c.gold}20`, color: c.goldDeep }}>
            {t.proofLabel}
          </span>
          <p className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: c.gold }}>{t.proofTitle}</p>
          <p className="text-lg max-w-2xl mx-auto mb-4" style={{ color: c.muted }}>{t.proofDesc}</p>
          <p className="text-sm font-semibold" style={{ color: c.muted }}>{t.proofName}</p>
          <div className="grid grid-cols-3 gap-6 mt-8">
            {t.proofStats.map(([val, label]: string[]) => (
              <div key={label} className="text-center">
                <p className="text-2xl md:text-3xl font-extrabold" style={{ color: c.gold }}>{val}</p>
                <p className="text-sm mt-1" style={{ color: c.muted }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOR COM IMPLICAÇÕES ── */}
      <section className="max-w-4xl mx-auto px-5 py-12">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: c.border, color: c.muted }}>
            {t.painLabel}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: c.ink }}>{t.painTitle}</h2>
        </div>
        <div className="space-y-3">
          {t.pains.map((pain: { dor: string; impl: string }, i: number) => (
            <div key={i} className="rounded-xl overflow-hidden"
              style={{ border: `1px solid rgba(239,68,68,0.2)`, background: `rgba(239,68,68,0.03)` }}>
              <button
                className="w-full flex items-start gap-3 p-5 text-left"
                onClick={() => setOpenPain(openPain === i ? null : i)}>
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#ef4444" }} />
                <span className="flex-1 font-semibold" style={{ color: c.ink }}>{pain.dor}</span>
                <span className="shrink-0 mt-0.5" style={{ color: c.muted }}>
                  {openPain === i
                    ? <ChevronUp className="w-4 h-4" />
                    : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>
              {openPain === i && (
                <div className="px-5 pb-5 pt-0">
                  <div className="flex gap-2.5 p-4 rounded-lg"
                    style={{ background: `rgba(239,68,68,0.07)`, borderLeft: `3px solid rgba(239,68,68,0.4)` }}>
                    <Target className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#ef4444" }} />
                    <p className="text-sm leading-relaxed" style={{ color: c.muted }}>{pain.impl}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── IMAGINE — Necessidade de Solução (SPIN) ── */}
      <section className="max-w-4xl mx-auto px-5 py-16">
        <div className="rounded-2xl p-8 md:p-12"
          style={{ background: `${c.teal}08`, border: `2px solid ${c.teal}30` }}>
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
              style={{ background: `${c.teal}18`, color: c.teal }}>
              {t.imagineLabel}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: c.ink }}>
              {t.imagineTitle}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {t.imagines.map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: c.card, border: `1px solid ${c.border}` }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${c.teal}20` }}>
                  <Check className="w-3.5 h-3.5" style={{ color: c.teal }} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: c.muted }}>{item}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-base font-bold" style={{ color: c.teal }}>{t.imagineCta}</p>
        </div>
      </section>

      {/* ── SOLUÇÃO — FEATURES como Benefícios ── */}
      <section id="recursos" className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: `${c.gold}18`, color: c.goldDeep }}>
            {t.solLabel}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: c.ink }}>{t.solTitle}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.feats.map(({ title, desc }: { title: string; desc: string }, i: number) => {
            const Icon = FEAT_ICONS[i]
            return (
              <div key={i} className="p-6 rounded-2xl" style={{ background: c.card, border: `1px solid ${c.border}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${featCores[i]}18` }}>
                  <Icon className="w-5 h-5" style={{ color: featCores[i] }} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: c.ink }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: c.muted }}>{desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── ROI DO RADAR DE CHURN — destrói objeção de preço ── */}
      <section className="max-w-4xl mx-auto px-5 pb-16">
        <div className="rounded-2xl p-8 md:p-10"
          style={{ background: `${c.gold}0a`, border: `2px solid ${c.gold}50` }}>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: `${c.gold}20`, color: c.goldDeep }}>
                {t.churnLabel}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3" style={{ color: c.ink }}>
                {t.churnTitle}
              </h2>
              <p className="text-base mb-4" style={{ color: c.muted }}>{t.churnDesc}</p>
              <p className="text-xs italic" style={{ color: c.muted }}>{t.churnNote}</p>
            </div>
            <div className="flex-1 w-full">
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
                {t.churnCalc.map(([label, value]: string[], i: number) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4"
                    style={{
                      background: i === 2 ? `${c.gold}15` : i % 2 === 0 ? c.card : c.card2,
                      borderTop: i > 0 ? `1px solid ${c.border}` : undefined,
                    }}>
                    <span className="text-sm" style={{ color: c.muted }}>{label}</span>
                    <span className={`font-bold text-sm`}
                      style={{ color: i === 2 ? c.gold : c.teal }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <Link href="/comecar"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: c.gold, color: c.onAccent }}>
                  Quero proteger meus contratos <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALCULADORA ── */}
      <section id="calculadora" className="max-w-3xl mx-auto px-5 py-16">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: `${c.gold}18`, color: c.goldDeep }}>
            {t.calcLabel}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: c.ink }}>{t.calcTitle}</h2>
          <p style={{ color: c.muted }}>{t.calcSub}</p>
        </div>

        <div className="rounded-2xl p-8 md:p-10" style={{ background: c.card, border: `2px solid ${c.gold}40` }}>
          {/* Slider */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold" style={{ color: c.muted }}>{t.calcSliderLabel}</label>
              <span className="text-2xl font-extrabold" style={{ color: c.gold }}>{calcN}</span>
            </div>
            <input
              type="range" min={1} max={100} step={1} value={calcN}
              onChange={e => setCalcN(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, ${c.gold} ${calcN}%, ${c.card2} ${calcN}%)`, accentColor: c.gold }}
            />
            <div className="flex justify-between text-xs mt-2" style={{ color: c.muted }}>
              <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 rounded-xl" style={{ background: c.card2, border: `1px solid ${c.border}` }}>
              <p className="text-2xl font-extrabold" style={{ color: c.gold }}>
                R${calcPrecoUnit(calcN).toFixed(2).replace(".", ",")}
              </p>
              <p className="text-xs mt-1" style={{ color: c.muted }}>{t.calcPerUnit}</p>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: c.card2, border: `1px solid ${c.border}` }}>
              <p className="text-2xl font-extrabold" style={{ color: c.ink }}>
                R${calcTotal(calcN).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs mt-1" style={{ color: c.muted }}>{t.calcTotal}</p>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: `${c.teal}15`, border: `1px solid ${c.teal}40` }}>
              <p className="text-2xl font-extrabold" style={{ color: c.teal }}>{calcDesconto(calcN)}%</p>
              <p className="text-xs mt-1" style={{ color: c.muted }}>{t.calcDiscount}</p>
            </div>
            <div className="text-center p-4 rounded-xl" style={{ background: `${c.teal}15`, border: `1px solid ${c.teal}40` }}>
              <p className="text-2xl font-extrabold" style={{ color: c.teal }}>
                R${(calcEconomia(calcN) * 12).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs mt-1" style={{ color: c.muted }}>{t.calcSavings}</p>
            </div>
          </div>

          {/* Barra visual */}
          <div className="mb-6">
            <div className="flex justify-between text-xs mb-1" style={{ color: c.muted }}>
              <span>Sem CKlareza — R${(197 * calcN).toLocaleString("pt-BR")}/mês</span>
              <span style={{ color: c.teal }}>{calcDesconto(calcN)}% off</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: c.card2 }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${100 - calcDesconto(calcN)}%`, background: `linear-gradient(to right, ${c.gold}, ${c.teal})` }} />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span style={{ color: c.gold }}>Com CKlareza — R${calcTotal(calcN).toLocaleString("pt-BR")}/mês</span>
              <span style={{ color: c.muted }}>Base: R$197/mentorado</span>
            </div>
          </div>

          <div className="text-center">
            <Link href="/comecar"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5"
              style={{ background: c.gold, color: c.onAccent, boxShadow: `0 8px 24px ${c.gold}40` }}>
              {t.calcCta} {calcN} mentorados <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs mt-3" style={{ color: c.muted }}>✦ {t.calcNote}</p>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="precos" className="max-w-4xl mx-auto px-5 pb-16">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: `${c.gold}18`, color: c.goldDeep }}>
            {t.priceLabel}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: c.ink }}>{t.priceTitle}</h2>
          <p style={{ color: c.muted }}>{t.priceDesc}</p>
        </div>

        {/* Tabela referência */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ border: `1px solid ${c.border}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: c.card2 }}>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: c.muted }}>Mentorados</th>
                <th className="text-right px-5 py-3 font-semibold" style={{ color: c.muted }}>R$/unidade</th>
                <th className="text-right px-5 py-3 font-semibold" style={{ color: c.muted }}>Total/mês</th>
                <th className="text-right px-5 py-3 font-semibold" style={{ color: c.teal }}>Desconto</th>
              </tr>
            </thead>
            <tbody>
              {[10, 20, 30, 50, 60, 100].map((n, i) => (
                <tr key={n} onClick={() => setCalcN(n)} className="cursor-pointer transition-colors"
                  style={{ background: calcN === n ? `${c.gold}12` : i % 2 === 0 ? c.card : c.card2, borderTop: `1px solid ${c.border}` }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${c.gold}10`}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = calcN === n ? `${c.gold}12` : i % 2 === 0 ? c.card : c.card2}>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: calcN === n ? c.gold : c.ink }}>{n} mentorados</td>
                  <td className="px-5 py-3.5 text-right" style={{ color: c.muted }}>R${calcPrecoUnit(n).toFixed(2).replace(".", ",")}</td>
                  <td className="px-5 py-3.5 text-right font-bold" style={{ color: calcN === n ? c.gold : c.ink }}>R${calcTotal(n).toLocaleString("pt-BR")}</td>
                  <td className="px-5 py-3.5 text-right font-bold" style={{ color: c.teal }}>{calcDesconto(n)}% off</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs mb-8" style={{ color: c.muted }}>↑ Clique em qualquer linha para atualizar a calculadora</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Solo */}
          <div className="p-7 rounded-2xl" style={{ background: c.card, border: `1px solid ${c.border}` }}>
            <h3 className="font-bold text-xl mb-1" style={{ color: c.ink }}>Solo</h3>
            <p className="text-sm mb-4" style={{ color: c.muted }}>Até 20 mentorados — perfeito para mentores solo</p>
            <div className="flex items-end gap-1.5 mb-1">
              <span className="text-4xl font-extrabold" style={{ color: c.ink }}>50% off</span>
            </div>
            <p className="text-sm mb-1" style={{ color: c.teal }}>R$98,50/mentorado · base era R$197</p>
            <p className="text-xs mb-5" style={{ color: c.muted }}>10 mentorados = R$985/mês</p>
            <ul className="space-y-2 mb-6">
              {["Dashboard de operação", "Briefing com IA", "Financeiro básico", "Portal do aluno", "Suporte por email"].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: c.muted }}>
                  <Check className="w-4 h-4 shrink-0" style={{ color: c.teal }} /> {f}
                </li>
              ))}
            </ul>
            <Link href="/comecar"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold"
              style={{ background: c.card2, color: c.ink, border: `1px solid ${c.border}` }}>
              Criar conta gratuita <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Empresa */}
          <div className="relative p-7 rounded-2xl"
            style={{ background: `${c.gold}10`, border: `2px solid ${c.gold}`, boxShadow: `0 20px 60px -15px ${c.gold}30` }}>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: c.gold, color: c.onAccent }}>
              MAIS POPULAR
            </span>
            <h3 className="font-bold text-xl mb-1" style={{ color: c.ink }}>Empresa</h3>
            <p className="text-sm mb-4" style={{ color: c.muted }}>21–50 mentorados — escale sem trabalhar mais</p>
            <div className="flex items-end gap-1.5 mb-1">
              <span className="text-4xl font-extrabold" style={{ color: c.gold }}>60% off</span>
            </div>
            <p className="text-sm mb-1" style={{ color: c.teal }}>R$78,80/mentorado · base era R$197</p>
            <div className="text-xs mb-5 space-y-0.5" style={{ color: c.muted }}>
              <p>30 mentorados = <strong style={{ color: c.ink }}>R$2.364/mês</strong></p>
              <p>50 mentorados = <strong style={{ color: c.ink }}>R$3.940/mês</strong></p>
            </div>
            <ul className="space-y-2 mb-6">
              {["Tudo do Solo", "Radar de churn antecipado", "Analytics avançado", "White-label completo", "Suporte prioritário (4h)"].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: c.muted }}>
                  <Check className="w-4 h-4 shrink-0" style={{ color: c.teal }} /> {f}
                </li>
              ))}
            </ul>
            <Link href="/comecar"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold"
              style={{ background: c.gold, color: c.onAccent }}>
              Criar conta gratuita <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: c.muted }}>
          Agências e múltiplos mentores?{" "}
          <Link href="/contato" className="font-semibold" style={{ color: c.goldDeep }}>Fale sobre Enterprise →</Link>
        </p>
      </section>

      {/* ── WHITE-LABEL ── */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-10 items-center"
          style={{ background: c.card, border: `1px solid ${c.border}` }}>
          <div className="flex-1">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
              style={{ background: `${c.gold}18`, color: c.goldDeep }}>{t.wlLabel}</span>
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

      {/* ── SEGURANÇA ── */}
      <section className="max-w-4xl mx-auto px-5 py-12">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: c.border, color: c.muted }}>{t.segLabel}</span>
          <h2 className="text-3xl font-extrabold mb-2" style={{ color: c.ink }}>{t.segT}</h2>
          <p style={{ color: c.muted }}>{t.segS}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {t.segItens.map((item: string, i: number) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl"
              style={{ background: c.card, border: `1px solid ${c.border}` }}>
              <ShieldCheck className="w-5 h-5 shrink-0" style={{ color: c.teal }} />
              <span className="text-sm" style={{ color: c.muted }}>{item}</span>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/seguranca" className="text-sm font-semibold" style={{ color: c.goldDeep }}>{t.segCta} →</Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="text-3xl font-extrabold text-center mb-10" style={{ color: c.ink }}>{t.faqT}</h2>
        <div className="space-y-3">
          {t.faq.map(([q, a]: string[], i: number) => (
            <div key={i} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
              <button className="w-full flex items-center justify-between p-5 text-left font-semibold"
                style={{ background: c.card, color: c.ink }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {q}
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: c.muted }} />
                  : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: c.muted }} />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed" style={{ background: c.card, color: c.muted }}>{a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="max-w-3xl mx-auto px-5 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4" style={{ color: c.ink }}>{t.ctaT}</h2>
        <p className="text-lg mb-8" style={{ color: c.muted }}>{t.ctaS}</p>
        <Link href="/comecar"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition-all hover:-translate-y-1"
          style={{ background: c.gold, color: c.onAccent, boxShadow: `0 15px 40px ${c.gold}40` }}>
          {t.ctaBtn} <ArrowRight className="w-5 h-5" />
        </Link>
        <p className="mt-4 text-sm" style={{ color: c.muted }}>
          {t.ctaSub} —{" "}
          <a href="#video" className="font-semibold" style={{ color: c.goldDeep }}>ver demo agora →</a>
        </p>
      </section>

      <LifetimeValueCTA c={c} lang={lang} />
      <SiteFooter c={c} lang={lang} />
    </div>
  )
}
