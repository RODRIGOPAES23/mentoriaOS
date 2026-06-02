"use client"

import { useEffect, useState, memo } from "react"
import { motion } from "framer-motion"
import { Bloco1Financeiro } from "./Bloco1Financeiro"
import { Bloco2Mentorados } from "./Bloco2Mentorados"
import { Bloco3Progresso } from "./Bloco3Progresso"
import { Bloco4Calls } from "./Bloco4Calls"
import { C } from "@/utils/theme"

interface DashboardMentorProps {
  mentorId: string
  accent?: string
  onAbrirMentorado?: (id: string) => void
}

function DashboardMentorBase({ mentorId, accent = C.green, onAbrirMentorado }: DashboardMentorProps) {
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
          className="w-8 h-8 border-2 rounded-full"
          style={{ borderColor: accent, borderTopColor: "transparent" }}
        />
        <span className="ml-3" style={{ color: C.muted }}>Carregando dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl p-6" style={{ background: `${C.red}10`, border: `1px solid ${C.red}33` }}>
        <p style={{ color: "#fca5a5" }}>{error}</p>
        <button onClick={fetchDashboard}
          className="mt-4 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors"
          style={{ background: C.red }}>
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="text-center py-20" style={{ color: C.muted }}>
        <p>Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start"
    >
      {/* COLUNA ESQUERDA: Pendências · Próximas Calls · Mentorados (empilhados) */}
      <div className="space-y-4">
        <Bloco1Financeiro
          vence_24h={dashboard.bloco1_financeiro?.vence_24h || 0}
          vence_2_dias={dashboard.bloco1_financeiro?.vence_2_dias || 0}
          vence_3_dias={dashboard.bloco1_financeiro?.vence_3_dias || 0}
          total_pendente={dashboard.bloco1_financeiro?.total_pendente || 0}
          proximos={dashboard.bloco1_financeiro?.proximos || []}
          accent={accent}
          onAbrirMentorado={onAbrirMentorado}
        />
        <Bloco4Calls calls={dashboard.bloco4_calls || []} accent={accent} />
        <Bloco2Mentorados
          total={dashboard.bloco2_mentorados?.total || 0}
          prox_30_dias={dashboard.bloco2_mentorados?.prox_30_dias || []}
          prox_60_dias={dashboard.bloco2_mentorados?.prox_60_dias || []}
          ultimo_mes={dashboard.bloco2_mentorados?.ultimo_mes || []}
          accent={accent}
        />
      </div>

      {/* COLUNA DIREITA: Progresso de Tarefas */}
      <Bloco3Progresso
        alunoMaisAtrasado={dashboard.bloco3_progresso?.alunoMaisAtrasado}
        progresoGeral={dashboard.bloco3_progresso?.progresoGeral || []}
      />
    </motion.div>
  )
}

// memo: só re-renderiza se mentorId/accent mudarem (não a cada toggle de modal do pai)
export const DashboardMentor = memo(DashboardMentorBase)
