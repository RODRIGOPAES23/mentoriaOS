"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Bloco1Financeiro } from "./Bloco1Financeiro"
import { Bloco2Mentorados } from "./Bloco2Mentorados"
import { Bloco3Progresso } from "./Bloco3Progresso"
import { Bloco4Calls } from "./Bloco4Calls"

interface DashboardMentorProps {
  mentorId: string
}

export function DashboardMentor({ mentorId }: DashboardMentorProps) {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [mentorId])

  async function fetchDashboard() {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/dashboard/mentor?mentor_id=${mentorId}`
      )

      if (!response.ok) {
        throw new Error("Erro ao carregar dashboard")
      }

      const data = await response.json()
      setDashboard(data.blocos)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      console.error("Erro:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-slate-400">Carregando dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6">
        <p className="text-red-300">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-white text-sm transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
      className="space-y-6"
    >
      {/* BLOCO 1: Pendências Financeiras */}
      <Bloco1Financeiro
        vence_24h={dashboard.bloco1_financeiro?.vence_24h || 0}
        vence_2_dias={dashboard.bloco1_financeiro?.vence_2_dias || 0}
        vence_3_dias={dashboard.bloco1_financeiro?.vence_3_dias || 0}
        total_pendente={dashboard.bloco1_financeiro?.total_pendente || 0}
      />

      {/* BLOCO 2: Mentorados + Renovações */}
      <Bloco2Mentorados
        total={dashboard.bloco2_mentorados?.total || 0}
        prox_30_dias={dashboard.bloco2_mentorados?.prox_30_dias || []}
        prox_60_dias={dashboard.bloco2_mentorados?.prox_60_dias || []}
        ultimo_mes={dashboard.bloco2_mentorados?.ultimo_mes || []}
      />

      {/* BLOCO 3: Progresso de Tarefas */}
      <Bloco3Progresso
        alunoMaisAtrasado={dashboard.bloco3_progresso?.alunoMaisAtrasado}
        progresoGeral={dashboard.bloco3_progresso?.progresoGeral || []}
      />

      {/* BLOCO 4: Calendário de Calls */}
      <Bloco4Calls calls={dashboard.bloco4_calls || []} />
    </motion.div>
  )
}
