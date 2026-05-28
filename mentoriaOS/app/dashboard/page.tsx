"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Mentorado, Checkin, AnaliseIA } from "@/lib/supabase"

export default function DashboardPage() {
  const [mentorados, setMentorados] = useState<Mentorado[]>([])
  const [selectedMentorado, setSelectedMentorado] = useState<Mentorado | null>(null)
  const [checkin, setCheckin] = useState<Checkin | null>(null)
  const [analise, setAnalise] = useState<AnaliseIA | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMentorados()
  }, [])

  const fetchMentorados = async () => {
    try {
      const { data, error } = await supabase.from("mentorados").select("*").order("created_at")

      if (error) throw error
      setMentorados(data)
      if (data.length > 0) {
        setSelectedMentorado(data[0])
        fetchMentoradoData(data[0].id)
      }
    } catch (error) {
      console.error("Erro ao carregar mentorados:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMentoradoData = async (mentoradoId: string) => {
    try {
      // Fetch último checkin
      const { data: checkinData, error: checkinError } = await supabase
        .from("checkins")
        .select("*")
        .eq("mentorado_id", mentoradoId)
        .order("data_envio", { ascending: false })
        .limit(1)
        .single()

      if (!checkinError && checkinData) {
        setCheckin(checkinData)

        // Fetch análise desse checkin
        const { data: analiseData, error: analiseError } = await supabase
          .from("analises_ia")
          .select("*")
          .eq("checkin_id", checkinData.id)
          .single()

        if (!analiseError && analiseData) {
          setAnalise(analiseData)
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
  }

  const handleMentoradoChange = (mentorado: Mentorado) => {
    setSelectedMentorado(mentorado)
    setCheckin(null)
    setAnalise(null)
    fetchMentoradoData(mentorado.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/40 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                mentoriaOS
              </h1>
              <p className="text-sm text-slate-400">Dashboard do Mentor</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Selecionar Mentorado
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mentorados.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMentoradoChange(m)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedMentorado?.id === m.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                }`}
              >
                <div className="font-semibold text-lg">👤 {m.nome}</div>
                <div className="text-sm text-slate-400">{m.nicho}</div>
                <div className="text-xs text-green-400 mt-2">✅ {m.status}</div>
              </button>
            ))}
          </div>
        </div>

        {selectedMentorado && (
          <>
            {/* Info Card */}
            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-8">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-400">Nome:</span>
                  <span className="ml-2 font-semibold">{selectedMentorado.nome}</span>
                </div>
                <div>
                  <span className="text-slate-400">Nicho:</span>
                  <span className="ml-2 font-semibold">{selectedMentorado.nicho}</span>
                </div>
                <div>
                  <span className="text-slate-400">Foco:</span>
                  <span className="ml-2 font-semibold">{selectedMentorado.foco_macro}</span>
                </div>
              </div>
            </div>

            {checkin ? (
              <>
                {/* Métricas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <MetricCard
                    icon="📊"
                    label="Leads Gerados"
                    value={checkin.leads_gerados}
                    unit=""
                  />
                  <MetricCard
                    icon="💰"
                    label="Vendas"
                    value={checkin.vendas_reais}
                    unit="R$"
                    decimals={2}
                  />
                  <MetricCard
                    icon="💵"
                    label="Investimento"
                    value={checkin.investimento_trafego}
                    unit="R$"
                    decimals={2}
                  />
                  <MetricCard
                    icon="🎬"
                    label="Vídeos"
                    value={checkin.videos_postados}
                    unit=""
                  />
                </div>

                {/* Briefing IA */}
                {analise && (
                  <div className="space-y-6">
                    {/* Diagnóstico */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-yellow-400 mb-4">
                        🎯 DIAGNÓSTICO DO MAIOR GARGALO
                      </h3>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-slate-300 whitespace-pre-wrap">
                          {analise.gargalo_identificado}
                        </p>
                      </div>
                    </div>

                    {/* Sugestão Estratégica */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-green-500/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-green-400 mb-4">
                        💡 SUGESTÃO DE DIRECIONAMENTO
                      </h3>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-slate-300 whitespace-pre-wrap">
                          {analise.sugestao_estrategica}
                        </p>
                      </div>
                    </div>

                    {/* Pauta da Call */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-blue-400 mb-4">
                        📋 PAUTA PRONTA PARA A CALL (30-60 min)
                      </h3>
                      <div className="prose prose-invert max-w-none">
                        <div className="text-slate-300 whitespace-pre-wrap">
                          {analise.pauta_call_pronta}
                        </div>
                      </div>
                    </div>

                    {/* Contexto Bruto */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-600/50 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-slate-300 mb-4">📝 CONTEXTO BRUTO</h3>

                      {checkin.dificuldades_texto && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-slate-400 mb-2">❌ Dificuldades:</h4>
                          <p className="text-slate-300 whitespace-pre-wrap">
                            {checkin.dificuldades_texto}
                          </p>
                        </div>
                      )}

                      {checkin.tarefas_executadas && Array.isArray(checkin.tarefas_executadas) && (
                        <div>
                          <h4 className="font-semibold text-slate-400 mb-2">✅ Tarefas Executadas:</h4>
                          <ul className="space-y-1 text-slate-300">
                            {checkin.tarefas_executadas.map((tarefa, idx) => (
                              <li key={idx}>• {tarefa}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Data da análise */}
                    <div className="text-xs text-slate-500 text-center">
                      Análise gerada em {new Date(analise.data_analise).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(analise.data_analise).toLocaleTimeString("pt-BR")}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-12 text-center">
                <p className="text-slate-400">
                  Nenhum checkin disponível ainda para {selectedMentorado.nome}
                </p>
                <a
                  href={`/form/${selectedMentorado.id}`}
                  className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Solicitar Check-in
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  decimals = 0,
}: {
  icon: string
  label: string
  value: number
  unit: string
  decimals?: number
}) {
  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm text-slate-400 mb-2">{label}</div>
      <div className="text-2xl font-bold">
        {unit}
        {decimals > 0 ? value.toFixed(decimals) : value}
      </div>
    </div>
  )
}
