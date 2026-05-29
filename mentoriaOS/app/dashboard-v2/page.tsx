"use client"

import { useEffect, useState } from "react"
import { Search, Bell, TrendingUp, TrendingDown, LineChart } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Mentorado {
  id: string
  nome: string
  nicho: string
  status: string
  foco_macro: string
}

interface MetricaAtual {
  leads_gerados: number
  leads_trend: number
  vendas_reais: number
  vendas_trend: number
  investido: number
  dificuldades: string
  tarefas_executadas: string[]
  briefing_ia: string
  pauta_call: string[]
}

export default function DashboardV2() {
  const [mentorados, setMentorados] = useState<Mentorado[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [metricas, setMetricas] = useState<MetricaAtual | null>(null)
  const [loading, setLoading] = useState(true)

  // 1. Buscar mentorados ao montar
  useEffect(() => {
    const buscarMentorados = async () => {
      try {
        const { data, error } = await supabase
          .from("mentorados")
          .select("*")
          .eq("status", "Ativo")

        if (error) throw error
        setMentorados(data || [])
        if (data && data.length > 0) {
          setSelectedId(data[0].id)
        }
      } catch (error) {
        console.error("Erro ao buscar mentorados:", error)
      } finally {
        setLoading(false)
      }
    }

    buscarMentorados()
  }, [])

  // 2. Buscar métricas quando mentorado muda
  useEffect(() => {
    if (!selectedId) return

    const buscarMetricas = async () => {
      try {
        const { data, error } = await supabase
          .from("metricas_semanais")
          .select("*")
          .eq("mentorado_id", selectedId)
          .order("criado_em", { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== "PGRST116") throw error

        if (data) {
          setMetricas({
            leads_gerados: data.leads_gerados,
            leads_trend: data.leads_trend || 0,
            vendas_reais: data.vendas_reais,
            vendas_trend: data.vendas_trend || 0,
            investido: data.investido,
            dificuldades: data.dificuldades || "",
            tarefas_executadas: data.tarefas_executadas || [],
            briefing_ia: data.briefing_ia || "Carregando análise IA...",
            pauta_call: data.pauta_call || [],
          })
        }
      } catch (error) {
        console.error("Erro ao buscar métricas:", error)
      }
    }

    buscarMetricas()
  }, [selectedId])

  // 3. Escutar atualizações em tempo real
  useEffect(() => {
    if (!selectedId) return

    const canalRealtime = supabase
      .channel(`metricas-${selectedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "metricas_semanais",
          filter: `mentorado_id=eq.${selectedId}`,
        },
        (payload) => {
          console.log("Nova métrica recebida em tempo real!", payload.new)
          setMetricas({
            leads_gerados: payload.new.leads_gerados,
            leads_trend: payload.new.leads_trend || 0,
            vendas_reais: payload.new.vendas_reais,
            vendas_trend: payload.new.vendas_trend || 0,
            investido: payload.new.investido,
            dificuldades: payload.new.dificuldades || "",
            tarefas_executadas: payload.new.tarefas_executadas || [],
            briefing_ia: payload.new.briefing_ia || "Carregando análise IA...",
            pauta_call: payload.new.pauta_call || [],
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canalRealtime)
    }
  }, [selectedId])

  const selected = mentorados.find((m) => m.id === selectedId) || mentorados[0]
  const filtered = mentorados.filter((m) =>
    m.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Carregando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800/50 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
              Ω
            </div>
            <div className="text-sm">
              <p className="font-bold text-white">S.O. MENTORIA</p>
              <p className="text-xs text-slate-400">MENTOR: Rodrigo Paes</p>
            </div>
          </div>
          <div className="flex-1 max-w-xs mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar Mentorado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="w-5 h-5 text-slate-400 cursor-pointer" />
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              RP
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-slate-900/50 border-r border-slate-800/50 p-6 max-h-[calc(100vh-69px)] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Mentorados Ativos</h3>
          <div className="space-y-2">
            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`w-full text-left p-3 rounded transition-all flex items-center gap-2 text-sm ${
                  selectedId === m.id
                    ? "bg-blue-500/20 border border-blue-500/50 text-white"
                    : "text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                {m.nome}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8 max-h-[calc(100vh-69px)] overflow-y-auto">
          <div className="max-w-6xl">
            {/* Header Card */}
            {selected && (
              <div className="bg-slate-900/60 border border-slate-800/50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selected.nome}{" "}
                      <span className="text-slate-400 text-sm font-normal">
                        (Nicho: {selected.nicho})
                      </span>
                    </h2>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-semibold rounded">
                    ATIVO
                  </span>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-slate-400">Foco:</span>{" "}
                    <span className="text-white font-semibold">{selected.foco_macro}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Métricas Section */}
            {metricas && (
              <>
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">
                    Métricas da Semana (Tendências)
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Leads */}
                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-lg p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-emerald-400">1. LEADS GERADOS</p>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">{metricas.leads_gerados}</p>
                      <p className="text-xs text-emerald-400 font-semibold">
                        {metricas.leads_trend > 0 ? "+" : ""}{metricas.leads_trend}% sem.ant
                      </p>
                    </div>

                    {/* Vendas */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-lg p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-purple-400">2. VENDAS REAIS</p>
                        {metricas.vendas_trend < 0 ? (
                          <TrendingDown className="w-4 h-4 text-rose-400" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">
                        R$ {metricas.vendas_reais.toLocaleString("pt-BR")}
                      </p>
                      <p className={`text-xs font-semibold ${metricas.vendas_trend < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        {metricas.vendas_trend > 0 ? "+" : ""}{metricas.vendas_trend}% sem.ant
                      </p>
                    </div>

                    {/* Investimento */}
                    <div className="bg-gradient-to-br from-slate-500/10 to-slate-500/5 border border-slate-500/30 rounded-lg p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-300">3. INVESTIDO</p>
                        <LineChart className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">
                        R$ {metricas.investido.toLocaleString("pt-BR")}
                      </p>
                      <p className="text-xs text-slate-400 font-semibold">—</p>
                    </div>
                  </div>
                </div>

                {/* Briefing IA */}
                <div className="bg-slate-900/60 border border-slate-800/50 rounded-lg p-6 mb-8">
                  <h3 className="text-xs font-bold text-slate-300 uppercase mb-4">
                    Briefing da IA (Claude 3.5 Sonnet)
                  </h3>

                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-slate-200 mb-2">🔴 DIAGNÓSTICO DO GARGALO:</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{metricas.briefing_ia}</p>
                  </div>

                  {metricas.pauta_call.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 mb-3">📋 PAUTA DA CALL SUGERIDA:</h4>
                      <ul className="space-y-2">
                        {metricas.pauta_call.map((item, i) => (
                          <li key={i} className="text-sm text-slate-300 flex gap-3">
                            <span className="text-slate-400 font-semibold flex-shrink-0">{i + 1}.</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Cards */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-900/60 border border-slate-800/50 rounded-lg p-6">
                    <h3 className="text-xs font-bold text-slate-300 uppercase mb-4">📥 Entrada Bruta do Aluno</h3>
                    <p className="text-sm text-slate-300">
                      Dificuldades:{" "}
                      <span className="text-slate-200 font-semibold">"{metricas.dificuldades}"</span>
                    </p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/50 rounded-lg p-6">
                    <h3 className="text-xs font-bold text-slate-300 uppercase mb-4">✅ Tarefas Executadas</h3>
                    <ul className="space-y-2">
                      {metricas.tarefas_executadas.map((task, i) => (
                        <li key={i} className="text-sm text-slate-300 flex gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}

            {!metricas && (
              <div className="bg-slate-900/60 border border-slate-800/50 rounded-lg p-12 text-center">
                <p className="text-slate-400">Nenhuma métrica registrada para este mentorado.</p>
                <p className="text-slate-500 text-sm mt-2">
                  Aguardando o mentorado preencher o formulário semanal...
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
