"use client"

import { Users, AlertTriangle, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

interface Mentorado {
  id: string
  nome: string
  foto_url?: string
  status: string
  data_fim?: string
  faturamento_atual?: number
  meta_faturamento?: number
}

interface Bloco2Props {
  total: number
  prox_30_dias: Mentorado[]
  prox_60_dias: Mentorado[]
  ultimo_mes: Mentorado[]
}

export function Bloco2Mentorados({
  total,
  prox_30_dias,
  prox_60_dias,
  ultimo_mes,
}: Bloco2Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700"
    >
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Mentorados Ativos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-slate-300 text-sm mb-1">Total</p>
          <p className="text-3xl font-bold text-white">{total}</p>
        </div>
        <div className="bg-blue-700/30 rounded-lg p-4 border border-blue-500/50">
          <p className="text-blue-300 text-sm mb-1">Renovação próx 30d</p>
          <p className="text-3xl font-bold text-blue-400">{prox_30_dias.length}</p>
        </div>
        <div className="bg-purple-700/30 rounded-lg p-4 border border-purple-500/50">
          <p className="text-purple-300 text-sm mb-1">Renovação próx 60d</p>
          <p className="text-3xl font-bold text-purple-400">{prox_60_dias.length}</p>
        </div>
        <div className="bg-red-700/30 rounded-lg p-4 border border-red-500/50">
          <p className="text-red-300 text-sm mb-1">Último mês</p>
          <p className="text-3xl font-bold text-red-400">{ultimo_mes.length}</p>
        </div>
      </div>

      {ultimo_mes.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-300 mb-2">
                Alunos em Último Mês
              </p>
              <div className="flex flex-wrap gap-2">
                {ultimo_mes.map((m) => (
                  <span
                    key={m.id}
                    className="bg-red-700/50 text-red-200 px-2 py-1 rounded text-xs"
                  >
                    {m.nome}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
