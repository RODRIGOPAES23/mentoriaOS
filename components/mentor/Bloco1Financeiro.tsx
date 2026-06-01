"use client"

import { AlertCircle, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"

interface Bloco1Props {
  vence_24h: number
  vence_2_dias: number
  vence_3_dias: number
  total_pendente: number
}

export function Bloco1Financeiro({
  vence_24h,
  vence_2_dias,
  vence_3_dias,
  total_pendente,
}: Bloco1Props) {
  const items = [
    {
      label: "Vence em 24h",
      valor: vence_24h,
      urgencia: "alta",
      color: "from-red-600 to-red-700",
    },
    {
      label: "Vence em 2 dias",
      valor: vence_2_dias,
      urgencia: "média",
      color: "from-orange-600 to-orange-700",
    },
    {
      label: "Vence em 3 dias",
      valor: vence_3_dias,
      urgencia: "baixa",
      color: "from-yellow-600 to-yellow-700",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700"
    >
      <div className="flex items-center gap-3 mb-6">
        <TrendingDown className="w-5 h-5 text-red-400" />
        <h2 className="text-lg font-semibold text-white">Pendências Financeiras</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${item.color} rounded-lg p-4 text-white`}
          >
            <p className="text-sm opacity-90 mb-2">{item.label}</p>
            <p className="text-2xl font-bold">R$ {item.valor.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white mb-1">
              Total Pendente
            </p>
            <p className="text-3xl font-bold text-green-400">
              R$ {total_pendente.toFixed(2)}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Clique em um aluno para acompanhar o pagamento
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
