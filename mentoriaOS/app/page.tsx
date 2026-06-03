import Link from "next/link"
import {
  Sparkles, LayoutDashboard, DollarSign, KanbanSquare, Brain,
  Building2, ArrowRight, Check, Phone, ShieldCheck, Star,
} from "lucide-react"

const GOLD = "#d4af37"
const GOLD_LIGHT = "#f0d97d"
const TEAL = "#13a3a3"
const BG = "#0a1420"
const CARD = "#0f2030"
const BORDER = "#1e3450"
const MUTED = "#7fa0bd"

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

const FEATURES = [
  { icon: LayoutDashboard, cor: TEAL, t: "Dashboard de operação", d: "Tudo que importa numa tela: pendências, calls, progresso e renovações — sem rolar." },
  { icon: DollarSign, cor: "#22c55e", t: "Financeiro inteligente", d: "Cobranças, inadimplência e projeção. Saiba quem paga, quanto e quando — e cobre na hora certa." },
  { icon: KanbanSquare, cor: "#4c9aff", t: "Atividades em Kanban", d: "As tarefas de todos os mentorados num quadro: a fazer, atrasadas e concluídas." },
  { icon: Brain, cor: "#a855f7", t: "Briefing com IA", d: "A IA lê os check-ins e entrega o diagnóstico e a pauta da próxima call, prontos." },
  { icon: Phone, cor: GOLD, t: "Calls + Portal do aluno", d: "Agenda, esteira de calls e um portal onde o mentorado faz check-in e acompanha a jornada." },
  { icon: Building2, cor: TEAL, t: "White-label de verdade", d: "Sua marca, suas cores, seu domínio. O motor é nosso, a identidade é da sua empresa." },
]

export default function LandingPage() {
  return (
    <div style={{ background: BG, color: "#fff" }} className="min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: `${BG}cc`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm" style={{ color: MUTED }}>
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#whitelabel" className="hover:text-white transition-colors">White-label</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
          </nav>
          <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: GOLD, color: "#1a1407" }}>
            Entrar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(60% 50% at 50% 0%, ${TEAL}22 0%, transparent 70%)` }} />
        <div className="relative max-w-4xl mx-auto px-5 pt-20 pb-16 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6" style={{ background: `${GOLD}14`, border: `1px solid ${GOLD}33`, color: GOLD_LIGHT }}>
            <Star className="w-3.5 h-3.5" /> Plataforma de mentoria white-label
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Transforme acompanhamento em<br />
            <span style={{ background: `linear-gradient(90deg, ${GOLD_LIGHT}, ${GOLD})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              Lifetime Value
            </span>
          </h1>
          <p className="text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed" style={{ color: MUTED }}>
            A plataforma que organiza financeiro, atividades e calls da sua mentoria — com inteligência que mostra <span className="text-white font-semibold">quem precisa de você agora</span>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
            <Link href="/login" className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold transition-all hover:-translate-y-0.5"
              style={{ background: GOLD, color: "#1a1407" }}>
              Acessar o sistema <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#recursos" className="px-6 py-3.5 rounded-xl text-base font-semibold transition-all"
              style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#fff" }}>
              Ver recursos
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs" style={{ color: MUTED }}>
            {["Sem cartão para testar", "White-label", "Dados protegidos"].map(x => (
              <span key={x} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" style={{ color: TEAL }} /> {x}</span>
            ))}
          </div>
        </div>

        {/* mock visual */}
        <div className="relative max-w-4xl mx-auto px-5 pb-4">
          <div className="rounded-2xl p-2" style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: `0 30px 80px -20px ${TEAL}33` }}>
            <div className="rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-3" style={{ background: BG }}>
              {[
                { l: "A receber", v: "R$ 12.4k", c: "#22c55e" },
                { l: "Calls na semana", v: "8", c: "#4c9aff" },
                { l: "Tarefas atrasadas", v: "3", c: "#ff5470" },
                { l: "Mentorados", v: "24", c: GOLD },
              ].map(k => (
                <div key={k.l} className="rounded-lg p-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                  <p className="text-2xl font-bold" style={{ color: k.c }}>{k.v}</p>
                  <p className="text-[11px] mt-1" style={{ color: MUTED }}>{k.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Tudo para operar sua mentoria</h2>
          <p className="mt-3 text-lg" style={{ color: MUTED }}>Um sistema, não dez planilhas.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.t} className="rounded-2xl p-6 transition-all hover:-translate-y-1" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.cor}18`, border: `1px solid ${f.cor}33` }}>
                <f.icon className="w-5 h-5" style={{ color: f.cor }} />
              </div>
              <h3 className="font-bold text-lg">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHITE-LABEL */}
      <section id="whitelabel" className="py-20" style={{ background: CARD, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-5xl mx-auto px-5 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold tracking-widest" style={{ color: TEAL }}>WHITE-LABEL</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">Sua marca. Nosso motor.</h2>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: MUTED }}>
              Coloque seu logo, suas cores e seu domínio. Seus clientes veem a sua empresa — e você entrega
              uma experiência de mentoria de nível enterprise sem construir nada.
            </p>
            <ul className="mt-6 space-y-2.5">
              {["Logo, cores e domínio próprios", "Vários mentores por empresa", "Cada um vê só o que é seu", "Revenda para outros clientes"].map(x => (
                <li key={x} className="flex items-center gap-2.5 text-sm"><Check className="w-4 h-4 shrink-0" style={{ color: GOLD }} /> {x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl p-8 text-center" style={{ background: BG, border: `1px solid ${BORDER}` }}>
            <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: GOLD }} />
            <p className="text-lg font-semibold">Painel de controle do dono</p>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>Gerencie todas as empresas, mentores e mentorados num só lugar — e venda white-label em minutos.</p>
          </div>
        </div>
      </section>

      {/* PLANOS / CTA */}
      <section id="planos" className="max-w-3xl mx-auto px-5 py-24 text-center">
        <Brain className="w-10 h-10 mx-auto mb-4" style={{ color: "#a855f7" }} />
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Pronto para elevar sua mentoria?</h2>
        <p className="mt-5 text-lg" style={{ color: MUTED }}>Entre agora e veja sua operação organizada em minutos.</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold mt-9 transition-all hover:-translate-y-0.5"
          style={{ background: GOLD, color: "#1a1407" }}>
          Acessar o sistema <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs" style={{ color: MUTED }}>© {new Date().getFullYear()} CKlareza · Lifetime Value · cklareza.com</p>
          <Link href="/login" className="text-sm font-semibold" style={{ color: GOLD }}>Entrar →</Link>
        </div>
      </footer>
    </div>
  )
}
