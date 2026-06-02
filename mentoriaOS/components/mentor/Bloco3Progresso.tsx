"use client"

import { Zap, Target } from "lucide-react"
import { motion } from "framer-motion"
import { C } from "@/utils/theme"

interface ProgressoItem {
  mentorado_id: string
  mentorado_nome: string
  percentual_conclusao: number
  tarefas_concluidas: number
  total_tarefas: number
  tarefas_atrasadas: number
}

interface Bloco3Props {
  alunoMaisAtrasado?: ProgressoItem
  progresoGeral: ProgressoItem[]
  onAbrirMentorado?: (id: string) => void
}

export function Bloco3Progresso({ alunoMaisAtrasado, progresoGeral, onAbrirMentorado }: Bloco3Props) {
  const alunosComAtraso = progresoGeral?.filter((p) => p.tarefas_atrasadas! > 0) || []
  const corBar = (pct: number) => pct >= 70 ? C.green : pct >= 40 ? C.amber : C.red

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.green}18`, border: `1px solid ${C.green}30` }}>
          <Target className="w-4 h-4" style={{ color: C.green }} />
        </div>
        <h2 className="text-base font-semibold text-white">Progresso de Tarefas</h2>
      </div>

      {alunoMaisAtrasado && (
        <button onClick={() => onAbrirMentorado?.(alunoMaisAtrasado.mentorado_id)} title={`Abrir ${alunoMaisAtrasado.mentorado_nome}`}
          className="w-full text-left mb-3 rounded-xl p-3 transition-all hover:-translate-y-0.5" style={{ background: `${C.amber}10`, border: `1px solid ${C.amber}33` }}>
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.amber }} />
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1.5" style={{ color: C.amber }}>Aluno Mais Atrasado</p>
              <p className="text-base font-bold text-white mb-1.5">{alunoMaisAtrasado.mentorado_nome}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: C.border }}>
                  <div className="h-2 rounded-full" style={{ width: `${alunoMaisAtrasado.percentual_conclusao || 0}%`, background: C.amber }} />
                </div>
                <span className="text-sm" style={{ color: C.muted }}>{Math.round(alunoMaisAtrasado.percentual_conclusao || 0)}%</span>
              </div>
              <p className="text-xs mt-2" style={{ color: C.amber }}>
                {alunoMaisAtrasado.tarefas_atrasadas} tarefas atrasadas · {alunoMaisAtrasado.tarefas_concluidas}/{alunoMaisAtrasado.total_tarefas} concluídas
              </p>
            </div>
          </div>
        </button>
      )}

      {alunosComAtraso.length > 0 ? (
        <div>
          <p className="text-sm font-semibold mb-3" style={{ color: C.muted }}>
            Acompanhamento {alunosComAtraso.length === 1 ? "de 1 aluno" : `de ${alunosComAtraso.length} alunos`}
          </p>
          <div className="space-y-2">
            {alunosComAtraso.slice(0, 3).map((item) => (
              <button key={item.mentorado_id} onClick={() => onAbrirMentorado?.(item.mentorado_id)} title={`Abrir ${item.mentorado_nome}`}
                className="w-full text-left rounded-xl p-2.5 transition-colors" style={{ background: C.input, border: `1px solid ${C.border}` }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = `${C.red}55`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{item.mentorado_nome}</span>
                  <span className="text-xs" style={{ color: C.red }}>{item.tarefas_atrasadas} atrasadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: C.border }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${item.percentual_conclusao || 0}%`, background: corBar(item.percentual_conclusao || 0) }} />
                  </div>
                  <span className="text-xs" style={{ color: C.muted }}>{item.tarefas_concluidas}/{item.total_tarefas}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8" style={{ color: C.muted }}>
          <p>Nenhum aluno com tarefas atrasadas 🎉</p>
        </div>
      )}
    </motion.div>
  )
}
