"use client"

import { useEffect, useState } from "react"

export default function FormPage({ params }: { params: { mentoradoId: string } }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [mentorado, setMentorado] = useState<{ nome: string; nicho: string } | null>(null)

  const [formData, setFormData] = useState({
    vendas_reais: "",
    leads_gerados: "",
    investimento_trafego: "",
    videos_postados: "",
    dificuldades_texto: "",
    tarefas_executadas: "",
  })

  // Carrega o nome do mentorado (valida o link)
  useEffect(() => {
    fetch(`/api/form/${params.mentoradoId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.mentorado) setMentorado(j.mentorado)
        else setError("Link inválido ou mentorado não encontrado.")
      })
      .catch(() => setError("Não foi possível carregar o formulário."))
  }, [params.mentoradoId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/form/${params.mentoradoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Erro ao enviar")
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar check-in")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-10 max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ✅
          </div>
          <h1 className="text-2xl font-bold mb-2">Check-in enviado!</h1>
          <p className="text-slate-400">
            Obrigado{mentorado ? `, ${mentorado.nome.split(" ")[0]}` : ""}! Seus dados já
            estão no painel do seu mentor.
          </p>
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
          <p className="text-slate-400">
            Check-in Semanal{mentorado ? ` · ${mentorado.nome}` : ""}
          </p>
          {mentorado?.nicho && (
            <p className="text-slate-500 text-sm">{mentorado.nicho}</p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 space-y-8"
        >
          <div>
            <h2 className="text-xl font-semibold mb-6 text-blue-400">📊 Métricas da Semana</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">💰 Vendas Reais (R$)</label>
                <input
                  type="number" step="0.01" required
                  value={formData.vendas_reais}
                  onChange={(e) => setFormData({ ...formData, vendas_reais: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">📊 Leads Gerados</label>
                <input
                  type="number" required
                  value={formData.leads_gerados}
                  onChange={(e) => setFormData({ ...formData, leads_gerados: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">💵 Investimento em Tráfego (R$)</label>
                <input
                  type="number" step="0.01" required
                  value={formData.investimento_trafego}
                  onChange={(e) => setFormData({ ...formData, investimento_trafego: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">🎬 Vídeos Postados</label>
                <input
                  type="number"
                  value={formData.videos_postados}
                  onChange={(e) => setFormData({ ...formData, videos_postados: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-6 text-purple-400">📝 Contexto</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">❌ Suas maiores dificuldades essa semana?</label>
              <textarea
                value={formData.dificuldades_texto}
                onChange={(e) => setFormData({ ...formData, dificuldades_texto: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 text-white min-h-24 resize-none"
                placeholder="Descreva os principais desafios..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">✅ Quais tarefas você executou? (uma por linha)</label>
              <textarea
                value={formData.tarefas_executadas}
                onChange={(e) => setFormData({ ...formData, tarefas_executadas: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-purple-500 text-white min-h-24 resize-none"
                placeholder="Liste as tarefas completadas..."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !mentorado}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3 px-6 rounded-lg transition-all duration-300 text-white"
          >
            {loading ? "Enviando..." : "🚀 Enviar Check-in"}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-8">
          Os dados aparecem em tempo real no painel do seu mentor
        </p>
      </div>
    </div>
  )
}
