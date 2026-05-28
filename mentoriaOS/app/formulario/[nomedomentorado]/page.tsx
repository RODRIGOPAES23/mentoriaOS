"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { submitCheckinAction } from "@/app/actions/submitCheckin"
import type { Mentorado } from "@/lib/supabase"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function FormularioPersonalizado() {
  const params = useParams()
  const router = useRouter()
  const nomeParametro = params.nomedomentorado as string
  const [mentorado, setMentorado] = useState<Mentorado | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    vendas_reais: 0,
    leads_gerados: 0,
    investimento_trafego: 0,
    videos_postados: 0,
    dificuldades_texto: "",
    tarefas_executadas: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchMentorado() {
      try {
        setLoading(true)
        // ✅ CORREÇÃO CRÍTICA: Buscar por slug exato (não ILIKE)
        // Isto evita buscas ambíguas que podem trazer o mentorado errado

        const { data, error: queryError } = await supabase
          .from("mentorados")
          .select("*")
          .eq("slug", nomeParametro) // ✅ Busca exata e única por slug
          .single()

        if (queryError || !data) {
          setError(`Mentorado com slug "${nomeParametro}" não encontrado`)
          return
        }

        setMentorado(data)
      } catch (err) {
        setError("Erro ao carregar mentorado")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (nomeParametro) {
      fetchMentorado()
    }
  }, [nomeParametro])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("texto") || name.includes("executadas")
        ? value
        : parseFloat(value) || 0,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mentorado) return

    setSubmitting(true)
    try {
      const result = await submitCheckinAction(mentorado.id, {
        vendas_reais: formData.vendas_reais,
        leads_gerados: formData.leads_gerados,
        investimento_trafego: formData.investimento_trafego,
        videos_postados: formData.videos_postados,
        dificuldades_texto: formData.dificuldades_texto,
        tarefas_executadas: formData.tarefas_executadas
          .split("\n")
          .filter(Boolean),
      })

      if (result.status !== "success") {
        throw new Error(result.message || "Erro ao enviar check-in")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/dashboard?mentorado=${mentorado.id}`)
      }, 2000)
    } catch (err) {
      setError("Erro ao enviar check-in")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando formulário...</div>
      </div>
    )
  }

  if (error || !mentorado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-red-500/50 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">❌ Erro</h1>
          <p className="text-slate-300 mb-6">{error || "Mentorado não encontrado"}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-2xl mx-auto pt-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            mentoriaOS
          </h1>
          <p className="text-slate-400">Check-in Semanal</p>
          <p className="text-blue-300 text-lg font-semibold mt-4">{mentorado.nome}</p>
          <p className="text-slate-400 text-sm">{mentorado.nicho}</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
            ✅ Check-in enviado com sucesso! Redirecionando...
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            ❌ {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 space-y-8"
        >
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
                  name="vendas_reais"
                  value={formData.vendas_reais}
                  onChange={handleInputChange}
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
                  name="leads_gerados"
                  value={formData.leads_gerados}
                  onChange={handleInputChange}
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
                  name="investimento_trafego"
                  value={formData.investimento_trafego}
                  onChange={handleInputChange}
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
                  name="videos_postados"
                  value={formData.videos_postados}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-6 text-purple-400">📝 Contexto</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ❌ Suas maiores dificuldades essa semana?
              </label>
              <textarea
                name="dificuldades_texto"
                value={formData.dificuldades_texto}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 text-white min-h-24 resize-none"
                placeholder="Descreva os principais desafios..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ✅ Quais tarefas você executou?
              </label>
              <textarea
                name="tarefas_executadas"
                value={formData.tarefas_executadas}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 text-white min-h-24 resize-none"
                placeholder="Liste as tarefas completadas (uma por linha)..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3 px-6 rounded-lg transition-all duration-300 text-white"
          >
            {submitting ? "Enviando..." : "🚀 Enviar Check-in"}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-8">
          Dados serão analisados pela IA em tempo real
        </p>
      </div>
    </div>
  )
}
