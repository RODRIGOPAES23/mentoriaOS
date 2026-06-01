"use client"

import { Zap, Target } from "lucide-react"
import { motion } from "framer-motion"

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
}

export function Bloco3Progresso({
  alunoMaisAtrasado,
  progresoGeral,
}: Bloco3Props) {
  const alunosComAtraso = progresoGeral?.filter((p) => p.tarefas_atrasadas! > 0) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700"
    >
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-5 h-5 text-green-400" />
        <h2 className="text-lg font-semibold text-white">Progresso de Tarefas</h2>
      </div>

      {alunoMaisAtrasado && (
        <div className="mb-6 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-300 mb-2">
                Aluno Mais Atrasado
              </p>
              <p className="text-lg font-bold text-white mb-1">
                {alunoMaisAtrasado.mentorado_nome}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${alunoMaisAtrasado.percentual_conclusao || 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-slate-300">
                  {Math.round(alunoMaisAtrasado.percentual_conclusao || 0)}%
                </span>
              </div>
              <p className="text-xs text-yellow-300 mt-2">
                {alunoMaisAtrasado.tarefas_atrasadas} tarefas atrasadas ·{" "}
                {alunoMaisAtrasado.tarefas_concluidas}/{alunoMaisAtrasado.total_tarefas}{" "}
                concluídas
              </p>
            </div>
          </div>
        </div>
      )}

      {alunosComAtraso.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-300 mb-3">
            Acompanhamento {alunosComAtraso.length === 1 ? "de 1 aluno" : `de ${alunosComAtraso.length} alunos`}
          </p>
          <div className="space-y-3">
            {alunosComAtraso.slice(0, 5).map((item) => (
              <div key={item.mentorado_id} className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">
                    {item.mentorado_nome}
                  </span>
                  <span className="text-xs text-red-400">
                    {item.tarefas_atrasadas} atrasadas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-600 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${item.percentual_conclusao || 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">
                    {item.tarefas_concluidas}/{item.total_tarefas}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {alunosComAtraso.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p>Nenhum aluno com tarefas atrasadas 🎉</p>
        </div>
      )}
    </motion.div>
  )
}
