"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Sparkles, BarChart3, Brain, CheckCircle2, Zap, Calendar, Users, Target } from "lucide-react"
import { useRouter } from "next/navigation"

interface Mentor { id: string; nome: string; nicho_foco?: string; foto_url?: string }

function iniciais(nome: string) {
  return nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

export default function HomePage() {
  const router = useRouter()
  const [mentores, setMentores] = useState<Mentor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [showSetup, setShowSetup] = useState(false)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [metodo, setMetodo] = useState("")
  const [filosofia, setFilosofia] = useState("")
  const [nicho, setNicho] = useState("")
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    fetch("/api/mentors/list", { cache: "no-store" })
      .then(r => r.json())
      .then(j => setMentores(j.mentores || []))
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  const selecionarMentor = (mentorId: string) => {
    localStorage.setItem("mentorSelecionado", mentorId)
    router.push("/dashboard")
  }

  const cadastrarMentor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !email.trim()) return
    setSalvando(true)
    try {
      const res = await fetch("/api/mentors/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, metodo_trabalho: metodo, filosofia, nicho_foco: nicho }),
      })
      if (res.ok) {
        const json = await res.json()
        localStorage.setItem("mentorSelecionado", json.mentor.id)
        router.push("/dashboard")
      } else {
        const err = await res.json()
        alert(`Erro: ${err.error}`)
      }
    } finally { setSalvando(false) }
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-600/30">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-slate-500 text-sm">Carregando CKlareza...</p>
        </div>
      </div>
    )
  }

  // ── SELETOR DE MENTOR ─────────────────────────────────────────────────────
  if (mentores.length > 0 && !showSetup) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">CKlareza</h1>
              <p className="text-[10px] text-slate-400 tracking-widest">MENTORIA INTELIGENTE</p>
            </div>
          </div>
        </nav>

        {/* Seletor */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-teal-600/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Bem-vindo de volta!</h2>
              <p className="text-slate-500 mt-1.5 text-sm">Selecione seu perfil de mentor para continuar</p>
            </div>

            <div className="space-y-2.5">
              {mentores.map(mentor => (
                <button key={mentor.id} onClick={() => selecionarMentor(mentor.id)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all duration-200 group text-left shadow-sm">
                  <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-slate-100 group-hover:ring-teal-200 transition-all shrink-0">
                    {mentor.foto_url
                      ? <img src={mentor.foto_url} alt={mentor.nome} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-slate-900 flex items-center justify-center text-sm font-bold text-white">{iniciais(mentor.nome)}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{mentor.nome}</p>
                    {mentor.nicho_foco && <p className="text-xs text-slate-400 truncate">{mentor.nicho_foco}</p>}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            <button onClick={() => setShowSetup(true)}
              className="w-full mt-4 py-3 text-sm font-semibold text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors border border-dashed border-slate-300 hover:border-teal-300">
              + Adicionar novo mentor
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── SETUP / LANDING ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">CKlareza</h1>
            <p className="text-[10px] text-slate-400 tracking-widest">MENTORIA INTELIGENTE</p>
          </div>
        </div>
        {!showSetup && (
          <button onClick={() => setShowSetup(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Começar agora
          </button>
        )}
      </nav>

      {showSetup ? (
        /* ── FORM SETUP ────────────────────────────────────────────────── */
        <div className="flex items-center justify-center min-h-[calc(100vh-65px)] p-6">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Configure sua conta</h2>
              <p className="text-slate-500 mt-1.5 text-sm">Preencha os dados do perfil do mentor</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <form onSubmit={cadastrarMentor} className="space-y-4">
                {[
                  { label: "Nome completo", key: "nome", setter: setNome, val: nome, ph: "Victor Sidoni", required: true },
                  { label: "Email", key: "email", setter: setEmail, val: email, ph: "victor@exemplo.com", required: true },
                  { label: "Nicho de atuação", key: "nicho", setter: setNicho, val: nicho, ph: "Marketing Digital e Tráfego Pago", required: false },
                  { label: "Método de trabalho", key: "metodo", setter: setMetodo, val: metodo, ph: "Ex: 4 pilares de conversão", required: false },
                  { label: "Filosofia de mentoria", key: "filosofia", setter: setFilosofia, val: filosofia, ph: "Ex: Resultado antes de escala", required: false },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">{f.label}</label>
                    <input required={f.required} value={f.val} onChange={e => f.setter(e.target.value)} placeholder={f.ph}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all" />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowSetup(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={salvando}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors">
                    {salvando ? "Criando..." : "Criar conta →"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* ── HERO + FEATURES ──────────────────────────────────────────── */
        <>
          {/* Hero */}
          <section className="px-8 py-24 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-semibold rounded-full mb-6">
                <Sparkles className="w-4 h-4" /> Plataforma de Mentoria com IA
              </div>
              <h2 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Clareza total em<br />
                <span className="text-teal-600">cada jornada de mentoria</span>
              </h2>
              <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
                Acompanhe sessões, metas e resultados dos seus mentorados com análise de IA em tempo real. Tudo num só lugar, sem perder contexto.
              </p>
              <button onClick={() => setShowSetup(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl shadow-xl shadow-teal-600/25 transition-all hover:shadow-teal-600/40 hover:-translate-y-0.5">
                Começar gratuitamente <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>

          {/* Features */}
          <section className="px-8 pb-24 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Brain, cor: "teal", titulo: "Briefing IA", desc: "Análise automática do gargalo, evolução das métricas e pauta de call sugerida pelo Gemini." },
                { icon: BarChart3, cor: "blue", titulo: "Histórico & Evolução", desc: "8 semanas de dados em visualização interativa. Compare métricas e identifique padrões." },
                { icon: CheckCircle2, cor: "emerald", titulo: "Check-in Semanal", desc: "Mentorados preenchem formulário simples. Dados fluem direto para seu dashboard." },
                { icon: Calendar, cor: "violet", titulo: "Calendário de Sessões", desc: "Agende calls, adicione links do Meet/Zoom e receba alertas de próximas sessões." },
                { icon: Target, cor: "amber", titulo: "Análise de Call IA", desc: "Cole a transcrição de qualquer call e a IA extrai tarefas e compromissos automaticamente." },
                { icon: Users, cor: "rose", titulo: "Multi-Mentor", desc: "Suporte para vários mentores. Cada um com mentorados, dados e sessões isoladas." },
              ].map(f => {
                const Icon = f.icon
                const bg: Record<string, string> = {
                  teal: "bg-teal-50 text-teal-600", blue: "bg-blue-50 text-blue-600",
                  emerald: "bg-emerald-50 text-emerald-600", violet: "bg-violet-50 text-violet-600",
                  amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600",
                }
                return (
                  <div key={f.titulo} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${bg[f.cor]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">{f.titulo}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
