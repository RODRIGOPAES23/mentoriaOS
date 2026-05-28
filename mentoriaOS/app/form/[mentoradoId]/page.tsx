"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function FormPage({ params }: { params: { mentoradoId: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    vendas_reais: 0,
    leads_gerados: 0,
    investimento_trafego: 0,
    videos_postados: 0,
    dificuldades_texto: "",
    tarefas_executadas: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 1. Salvar checkin
      const { data: checkin, error: checkinError } = await supabase
        .from("checkins")
        .insert([
          {
            mentorado_id: params.mentoradoId,
            vendas_reais: parseFloat(String(formData.vendas_reais)),
            leads_gerados: parseInt(String(formData.leads_gerados)),
            investimento_trafego: parseFloat(String(formData.investimento_trafego)),
            videos_postados: parseInt(String(formData.videos_postados)),
            dificuldades_texto: formData.dificuldades_texto,
            tarefas_executadas: formData.tarefas_executadas.split("\n").filter(Boolean),
          },
        ])
        .select()
        .single()

      if (checkinError) throw checkinError

      // 2. Chamar análise IA
      const analysisResponse = await fetch("/api/analyze-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkinId: checkin.id,
          mentoradoId: params.mentoradoId,
        }),
      })

      if (!analysisResponse.ok) {
        throw new Error("Falha na análise IA")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/dashboard?mentorado=${params.mentoradoId}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar checkin")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-2xl mx-auto pt-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            mentoriaOS
          </h1>
          <p className="text-slate-400">Check-in Semanal</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 space-y-8"
        >
          {/* Métricas */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-blue-400">📊 Métricas da Semana</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  💰 Vendas Reais (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.vendas_reais}
                  onChange={(e) =>
                    setFormData({ ...formData, vendas_reais: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  📊 Leads Gerados
                </label>
                <input
                  type="number"
                  value={formData.leads_gerados}
                  onChange={(e) =>
                    setFormData({ ...formData, leads_gerados: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  💵 Investimento em Tráfego (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.investimento_trafego}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      investimento_trafego: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  🎬 Vídeos Postados
                </label>
                <input
                  type="number"
                  value={formData.videos_postados}
                  onChange={(e) =>
                    setFormData({ ...formData, videos_postados: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Contexto */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-purple-400">📝 Contexto</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ❌ Suas maiores dificuldades essa semana?
              </label>
              <textarea
                value={formData.dificuldades_texto}
                onChange={(e) =>
                  setFormData({ ...formData, dificuldades_texto: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 text-white min-h-24 resize-none"
                placeholder="Descreva os principais desafios..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ✅ Quais tarefas você executou?
              </label>
              <textarea
                value={formData.tarefas_executadas}
                onChange={(e) =>
                  setFormData({ ...formData, tarefas_executadas: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 text-white min-h-24 resize-none"
                placeholder="Liste as tarefas completadas (uma por linha)..."
              />
            </div>
          </div>

          {/* Mensagens */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-300 text-sm">
              ✅ Check-in enviado! Analisando seus dados...
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3 px-6 rounded-lg transition-all duration-300 text-white"
          >
            {loading ? "Enviando..." : success ? "✅ Enviado!" : "🚀 Enviar Check-in"}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-8">
          Dados serão analisados pela IA em tempo real
        </p>
      </div>
    </div>
  )
}
