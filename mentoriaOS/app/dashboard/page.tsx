"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Search, Bell, TrendingUp, TrendingDown, Minus, Target, BarChart3, Zap, CheckCircle2, AlertCircle, Clock, Link2, Copy, Check, UserPlus, X, RefreshCw } from "lucide-react"
import type { CheckinRow } from "@/lib/supabase"

interface Mentorado {
  id: string
  nome: string
  nicho: string
  status: string
  foco_macro: string
  data_inicio: string
}

interface BriefingIA {
  diagnostico: string
  pauta: string[]
}

function gerarBriefing(m: Mentorado, c: CheckinRow): BriefingIA {
  const conversao = c.vendas_reais / (c.leads_gerados || 1)
  const roi = ((c.vendas_reais - c.investimento_trafego) / (c.investimento_trafego || 1)) * 100

  return {
    diagnostico: `Volume de leads ${c.leads_gerados > 300 ? "positivo" : "abaixo do esperado"} (${c.leads_gerados} leads), mas a conversão comercial está em R$${conversao.toFixed(0)}/lead. ROI de ${roi.toFixed(0)}%. Foco em: ${m.foco_macro}.`,
    pauta: [
      `Auditar os últimos 5 atendimentos comerciais (0-10m)`,
      `Revisar script e alinhar criativos com o nicho "${m.nicho}" (10-25m)`,
      `Definir meta de conversão e próximos KPIs para destravar crescimento (25-30m)`,
    ],
  }
}

// Sparkline component (SVG mini-gráfico)
function Sparkline({ trend }: { trend: boolean | null }) {
  const points = trend === true ? "0,30 15,20 30,25 45,15 60,10" : trend === false ? "0,10 15,20 30,15 45,25 60,30" : "0,20 15,20 30,20 45,20 60,20"
  return (
    <svg width="60" height="30" viewBox="0 0 60 30" className="w-full h-auto">
      <polyline points={points} fill="none" stroke={trend === true ? "#10b981" : trend === false ? "#ef4444" : "#9ca3af"} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export default function DashboardPage() {
  const [mentorados, setMentorados] = useState<Mentorado[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [checkin, setCheckin] = useState<CheckinRow | null>(null)
  const [briefing, setBriefing] = useState<BriefingIA | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [showCadastro, setShowCadastro] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [novo, setNovo] = useState({ nome: "", nicho: "", foco_macro: "", data_inicio: "" })
  const [atualizando, setAtualizando] = useState(false)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null)

  const [briefingLoading, setBriefingLoading] = useState(false)
  const briefingCache = useRef<Map<string, BriefingIA>>(new Map())

  // Buscar checkin mais recente (via API server-side: ignora RLS).
  // cache:"no-store" + cache-buster garantem dado sempre fresco (sem cache do browser/edge).
  // Define só o checkin; o briefing IA é gerado por um effect separado (1x por check-in).
  const buscarCheckin = useCallback(async (mentoradoId: string) => {
    try {
      const res = await fetch(`/api/dashboard/checkin?mentoradoId=${mentoradoId}&t=${Date.now()}`, {
        cache: "no-store",
      })
      const json = await res.json()
      setCheckin((json.checkin as CheckinRow | null) ?? null)
      setUltimaAtualizacao(new Date())
    } catch {
      setCheckin(null)
    }
  }, [])

  // Atualização manual / sob demanda do mentorado selecionado
  const refreshAgora = useCallback(async () => {
    if (!selectedId) return
    setAtualizando(true)
    await buscarCheckin(selectedId)
    setAtualizando(false)
  }, [selectedId, buscarCheckin])

  // Carrega lista de mentorados (reutilizável após cadastro)
  const recarregarMentorados = useCallback(async (selecionarId?: string) => {
    try {
      const res = await fetch(`/api/dashboard/mentorados?t=${Date.now()}`, { cache: "no-store" })
      const json = await res.json()
      const lista = (json.mentorados || []) as Mentorado[]
      setMentorados(lista)
      if (lista.length > 0) {
        setSelectedId(selecionarId && lista.some((m) => m.id === selecionarId) ? selecionarId : lista[0].id)
      }
    } catch {
      // mantém vazio
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    recarregarMentorados()
  }, [recarregarMentorados])

  // Gerar / copiar link do formulário do mentorado selecionado
  const copiarLink = useCallback(async () => {
    if (!selectedId) return
    const link = `${window.location.origin}/form/${selectedId}`
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      // fallback silencioso
    }
    setLinkCopiado(true)
    setTimeout(() => setLinkCopiado(false), 2500)
  }, [selectedId])

  // Cadastrar novo mentorado
  const cadastrarMentorado = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novo.nome.trim()) return
    setSalvando(true)
    try {
      const res = await fetch("/api/dashboard/mentorados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novo),
      })
      const json = await res.json()
      if (res.ok && json.mentorado) {
        setShowCadastro(false)
        setNovo({ nome: "", nicho: "", foco_macro: "", data_inicio: "" })
        await recarregarMentorados(json.mentorado.id)
      }
    } finally {
      setSalvando(false)
    }
  }, [novo, recarregarMentorados])

  // Buscar checkin quando mentorado muda
  useEffect(() => {
    if (!selectedId || mentorados.length === 0) return
    buscarCheckin(selectedId)
  }, [selectedId, mentorados, buscarCheckin])

  // Gera o Briefing IA (Gemini Flash via OpenRouter) 1x por check-in.
  // Cache por id evita chamar a IA a cada polling. Template entra como
  // fallback instantâneo enquanto a IA responde (ou se ela falhar).
  useEffect(() => {
    if (!checkin || !selected) {
      setBriefing(null)
      return
    }
    const cid = checkin.id
    const cached = briefingCache.current.get(cid)
    if (cached) {
      setBriefing(cached)
      return
    }
    setBriefing(gerarBriefing(selected, checkin)) // fallback instantâneo
    setBriefingLoading(true)
    let cancelado = false
    fetch("/api/dashboard/briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentoradoId: selected.id, checkinId: cid }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (cancelado) return
        if (j?.briefing && Array.isArray(j.briefing.pauta)) {
          briefingCache.current.set(cid, j.briefing)
          setBriefing(j.briefing)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setBriefingLoading(false)
      })
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkin?.id, selectedId])

  // Auto-refresh (polling): novos check-ins enviados pelo mentorado aparecem
  // sem reload. Realtime via anon é bloqueado pelo RLS, então usamos polling.
  useEffect(() => {
    if (!selectedId || mentorados.length === 0) return
    const id = setInterval(() => buscarCheckin(selectedId), 8000)
    return () => clearInterval(id)
  }, [selectedId, mentorados, buscarCheckin])

  // Atualiza na hora quando o mentor volta para a aba do dashboard
  // (ex.: enviou o form no celular/outra aba e voltou aqui).
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "visible" && selectedId) {
        buscarCheckin(selectedId)
      }
    }
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onFocus)
    return () => {
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onFocus)
    }
  }, [selectedId, mentorados, buscarCheckin])

  const selected = mentorados.find((m) => m.id === selectedId)
  const filtered = mentorados.filter((m) =>
    m.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <p className="text-slate-400 text-sm">Conectando ao banco de dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex overflow-hidden">
      {/* ── SIDEBAR ESQUERDA ── */}
      <aside className="w-64 flex-shrink-0 bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-r border-slate-700/20 flex flex-col overflow-y-auto" data-test="premium-sidebar-v2">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700/20">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg">Ω</div>
            <div>
              <h1 className="text-sm font-bold text-white">S.O. MENTORIA</h1>
              <p className="text-[10px] text-slate-500">MENTOR: Rodrigo Paes</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar mentorado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Botão Cadastrar Mentorado */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setShowCadastro(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition-all duration-200"
          >
            <UserPlus className="w-4 h-4" /> Cadastrar Mentorado
          </button>
        </div>

        {/* Mentorados List */}
        <div className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mt-4 mb-3">Mentorados Ativos</p>
          {filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className={`w-full group relative p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                selectedId === m.id
                  ? "bg-gradient-to-r from-blue-600/30 to-blue-500/20 border border-blue-500/40 shadow-lg shadow-blue-500/10"
                  : "bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600/50"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {m.nome.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-white truncate">{m.nome}</p>
                <p className="text-[10px] text-slate-400 truncate">{m.nicho}</p>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                m.status === "Ativo" ? "bg-emerald-400 shadow-lg shadow-emerald-400/50" : "bg-slate-500"
              }`} />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/20">
          <div className="text-[10px] text-slate-500 text-center">
            <p>Dashboard v2.0</p>
            <p className="mt-1">Powered by Supabase + Claude</p>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* NAVBAR TOPO */}
        <nav className="flex-shrink-0 bg-gradient-to-r from-slate-900/40 via-slate-900/20 to-transparent backdrop-blur-xl border-b border-slate-700/20 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {selected?.nome || "Dashboard"}
            </h2>
            <div className="hidden md:block text-sm text-slate-500">
              {selected?.nicho && `• ${selected.nicho}`}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-300 transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">RP</div>
          </div>
        </nav>

        {/* CONTENT SCROLL */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {selected ? (
              <>
                {/* ── HEADER INFO CARD ── */}
                <div className="group bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 shadow-2xl hover:border-slate-700/50 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">
                        {selected.nome}
                        <span className="text-slate-400 text-sm font-normal ml-2">({selected.nicho})</span>
                      </h1>
                      <div className="flex gap-4 text-sm text-slate-400">
                        <span>📅 Início: <span className="text-slate-300">{selected.data_inicio}</span></span>
                        <span>🎯 Foco: <span className="text-slate-300">{selected.foco_macro}</span></span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full shadow-lg shadow-emerald-500/10">
                        ATIVO
                      </span>
                      <button
                        onClick={copiarLink}
                        title="Copiar link do formulário para enviar ao mentorado"
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                          linkCopiado
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                            : "bg-blue-500/15 border-blue-500/30 text-blue-300 hover:bg-blue-500/25 hover:border-blue-500/50"
                        }`}
                      >
                        {linkCopiado ? (
                          <><Check className="w-3.5 h-3.5" /> Link copiado!</>
                        ) : (
                          <><Link2 className="w-3.5 h-3.5" /> Gerar Link do Formulário</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── MÉTRICAS GRID 3 COLUNAS ── */}
                <div>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">📊 Métricas da Semana</p>
                    <div className="flex items-center gap-3">
                      {ultimaAtualizacao && (
                        <span className="text-[10px] text-slate-500">
                          Atualizado {ultimaAtualizacao.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      )}
                      <button
                        onClick={refreshAgora}
                        disabled={atualizando}
                        title="Atualizar agora"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all disabled:opacity-60"
                      >
                        <RefreshCw className={`w-3 h-3 ${atualizando ? "animate-spin" : ""}`} />
                        {atualizando ? "Atualizando" : "Atualizar"}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {/* LEADS */}
                    <div className="group bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-xl p-5 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Leads Gerados</p>
                        <Target className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="mb-3">
                        <p className="text-3xl font-bold text-white">{checkin?.leads_gerados ?? "—"}</p>
                        {checkin ? (
                          <p className="text-xs text-emerald-400 font-semibold mt-1">↑ +15% vs sem.ant</p>
                        ) : (
                          <p className="text-xs text-slate-500 mt-1">Sem dados</p>
                        )}
                      </div>
                      {checkin && <Sparkline trend={checkin.leads_gerados > 300} />}
                    </div>

                    {/* VENDAS */}
                    <div className="group bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/30 rounded-xl p-5 shadow-xl hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Vendas Reais</p>
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="mb-3">
                        <p className="text-3xl font-bold text-white">
                          {checkin ? `R$ ${checkin.vendas_reais.toLocaleString("pt-BR")}` : "—"}
                        </p>
                        {checkin ? (
                          <p className="text-xs text-red-400 font-semibold mt-1">↓ -30% vs sem.ant</p>
                        ) : (
                          <p className="text-xs text-slate-500 mt-1">Sem dados</p>
                        )}
                      </div>
                      {checkin && <Sparkline trend={false} />}
                    </div>

                    {/* INVESTIDO */}
                    <div className="group bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent border border-slate-600/30 rounded-xl p-5 shadow-xl hover:shadow-2xl hover:border-slate-600/50 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Investido</p>
                        <Zap className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="mb-3">
                        <p className="text-3xl font-bold text-white">
                          {checkin ? `R$ ${checkin.investimento_trafego.toLocaleString("pt-BR")}` : "—"}
                        </p>
                        {checkin ? (
                          <p className="text-xs text-slate-400 font-semibold mt-1">— Estável</p>
                        ) : (
                          <p className="text-xs text-slate-500 mt-1">Sem dados</p>
                        )}
                      </div>
                      {checkin && <Sparkline trend={null} />}
                    </div>
                  </div>
                </div>

                {/* ── BRIEFING IA ── */}
                <div className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">🤖 Briefing da IA (Gemini Flash)</p>
                      {briefingLoading && (
                        <span className="flex items-center gap-1.5 text-[10px] text-blue-300">
                          <Zap className="w-3 h-3 animate-pulse" /> Gerando análise inteligente…
                        </span>
                      )}
                    </div>

                    {briefing ? (
                      <div className="space-y-5">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Diagnóstico do Gargalo</p>
                            <p className="text-sm text-slate-300 leading-relaxed">{briefing.diagnostico}</p>
                          </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-blue-400" />
                            </div>
                            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Pauta da Call (30-60 min)</p>
                          </div>
                          <ol className="space-y-2 ml-14">
                            {briefing.pauta.map((item, i) => (
                              <li key={i} className="text-sm text-slate-300 flex gap-2">
                                <span className="font-semibold text-slate-500 flex-shrink-0">{i + 1}.</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm italic">
                        Aguardando dados do formulário semanal para gerar briefing...
                      </div>
                    )}
                  </div>
                </div>

                {/* ── BLOCOS INFERIORES GRID 2 ── */}
                <div className="grid grid-cols-2 gap-6">
                  {/* DIFICULDADES */}
                  <div className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-slate-700/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-5 h-5 text-orange-400" />
                      <p className="text-sm font-bold text-white">Entrada Bruta - Aluno</p>
                    </div>
                    {checkin?.dificuldades_texto ? (
                      <p className="text-sm text-slate-300 leading-relaxed">
                        <span className="text-slate-500 text-xs uppercase tracking-widest block mb-2 font-semibold">Dificuldades</span>
                        "{checkin.dificuldades_texto}"
                      </p>
                    ) : (
                      <p className="text-slate-500 text-sm italic">Sem dificuldades registradas.</p>
                    )}
                  </div>

                  {/* TAREFAS */}
                  <div className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-slate-700/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <p className="text-sm font-bold text-white">Tarefas Executadas</p>
                    </div>
                    {checkin?.tarefas_executadas?.length ? (
                      <ul className="space-y-2.5">
                        {(checkin.tarefas_executadas as string[]).map((task, i) => (
                          <li key={i} className="flex gap-3 text-sm">
                            <span className="text-emerald-400 font-bold flex-shrink-0 mt-0.5">✓</span>
                            <span className="text-slate-300">{task}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 text-sm italic">Nenhuma tarefa registrada.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-96">
                <p className="text-slate-500">Selecione um mentorado na sidebar.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── MODAL: CADASTRAR MENTORADO ── */}
      {showCadastro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowCadastro(false)}
        >
          <div
            className="w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Cadastrar Mentorado</h2>
              </div>
              <button onClick={() => setShowCadastro(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={cadastrarMentorado} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nome *</label>
                <input
                  autoFocus required
                  value={novo.nome}
                  onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nicho</label>
                <input
                  value={novo.nicho}
                  onChange={(e) => setNovo({ ...novo, nicho: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                  placeholder="Ex: Tráfego Local"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Foco Macro</label>
                <input
                  value={novo.foco_macro}
                  onChange={(e) => setNovo({ ...novo, foco_macro: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                  placeholder="Ex: Estruturação Comercial"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Data de Início</label>
                <input
                  type="date"
                  value={novo.data_inicio}
                  onChange={(e) => setNovo({ ...novo, data_inicio: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/60 transition-colors [color-scheme:dark]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCadastro(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando || !novo.nome.trim()}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {salvando ? "Salvando..." : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
