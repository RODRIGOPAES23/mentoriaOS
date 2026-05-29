"use client"

import { useState } from "react"
import { ArrowRight, BarChart3, Brain, CheckCircle2, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [showSetup, setShowSetup] = useState(false)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [metodo, setMetodo] = useState("")
  const [filosofia, setFilosofia] = useState("")
  const [nicho, setNicho] = useState("")
  const [salvando, setSalvando] = useState(false)

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !email.trim() || !metodo.trim()) {
      alert("Preencha nome, email e método de trabalho")
      return
    }

    setSalvando(true)
    try {
      const res = await fetch("/api/mentor/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, metodo_trabalho: metodo, filosofia, nicho_foco: nicho }),
      })

      if (res.ok) {
        router.push("/dashboard")
      } else {
        const err = await res.json()
        alert(`Erro: ${err.error}`)
      }
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* ── HEADER ── */}
        <nav className="flex items-center justify-between px-8 py-6 border-b border-slate-700/20 backdrop-blur-xl bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center font-bold">
              Ω
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              mentoriaOS
            </h1>
          </div>
          <p className="text-sm text-slate-400">Sistema Operacional de Mentoria</p>
        </nav>

        {/* ── HERO ── */}
        <section className="px-8 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Sistema Inteligente de
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Mentoria & Check-ins
              </span>
            </h2>

            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
              Acompanhe o progresso dos seus mentorados com análise IA em tempo real. Diagnósticos automáticos,
              histórico de evolução e briefings inteligentes para cada mentoria.
            </p>

            <button
              onClick={() => setShowSetup(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/50"
            >
              Começar Setup <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="px-8 py-20 max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-16">4 Pilares da Mentoria</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/30 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-xl font-bold mb-3">Briefing IA (Gemini Flash)</h4>
              <p className="text-slate-300 leading-relaxed">
                Análise automática do gargalo atual, evolução das métricas e pauta de call sugerida.
                Tudo gerado por IA econômica em tempo real.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="text-xl font-bold mb-3">Histórico & Evolução</h4>
              <p className="text-slate-300 leading-relaxed">
                Visualize 8 semanas de dados em um modal interativo. Compare métricas, veja tendências
                e identifique padrões de crescimento (ou queda).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold mb-3">Check-in Semanal</h4>
              <p className="text-slate-300 leading-relaxed">
                Mentorados preenchem formulário simples com: leads, vendas, investimento, vídeos e
                dificuldades. Dados fluem direto para o dashboard.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30 rounded-2xl p-8 hover:border-amber-500/50 transition-all duration-300">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-500/30 transition-colors">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <h4 className="text-xl font-bold mb-3">Sidebar Responsivo</h4>
              <p className="text-slate-300 leading-relaxed">
                Interface moderna com sidebar recolhível. Perfeito em desktop (listas completas) e
                mobile (apenas avatares). Toggle suave.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-8 py-20 text-center">
          <h3 className="text-3xl font-bold mb-6">Pronto para começar?</h3>
          <p className="text-slate-300 mb-8 text-lg">
            Configure seu perfil de mentor em menos de 2 minutos
          </p>
          <button
            onClick={() => setShowSetup(true)}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-blue-500/50"
          >
            Ir para Setup <ArrowRight className="w-5 h-5" />
          </button>
        </section>

        {/* ── FOOTER ── */}
        <footer className="px-8 py-8 border-t border-slate-700/20 text-center text-sm text-slate-500">
          <p>mentoriaOS v1.3 • Powered by Supabase + Claude + Gemini Flash</p>
        </footer>
      </div>

      {/* ── MODAL SETUP ── */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
              <h2 className="text-2xl font-bold">Setup do Mentor</h2>
              <button
                onClick={() => setShowSetup(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSetup} className="p-6 space-y-5">
              <p className="text-slate-300 mb-6">
                Conte-nos sobre você e seu método de trabalho com mentorados. Essas informações serão usadas
                para personalizar as análises de IA.
              </p>

              {/* Nome */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Nome (obrigatório)</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email (obrigatório)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                  required
                />
              </div>

              {/* Nicho */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Nicho de Atuação</label>
                <input
                  type="text"
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  placeholder="Ex: Tráfego Digital, E-commerce, SaaS"
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                />
              </div>

              {/* Método de Trabalho */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Método de Trabalho (obrigatório)
                </label>
                <textarea
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value)}
                  placeholder="Descreva como você trabalha com mentorados. Ex: Análise semanal de métricas, feedback direto, ajustes de estratégia..."
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors resize-none"
                  required
                />
              </div>

              {/* Filosofia */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Filosofia de Mentoria</label>
                <textarea
                  value={filosofia}
                  onChange={(e) => setFilosofia(e.target.value)}
                  placeholder="Qual é sua filosofia? Ex: Data-driven, ágil, foco em resultados, mentoria customizada..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSetup(false)}
                  className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {salvando ? "Salvando..." : "Ir para Dashboard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
