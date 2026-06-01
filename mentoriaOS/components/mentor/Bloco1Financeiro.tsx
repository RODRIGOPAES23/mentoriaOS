"use client"

import { AlertCircle, TrendingDown } from "lucide-react"
import { motion } from "framer-motion"
import { C } from "@/utils/theme"

interface Bloco1Props {
  vence_24h: number
  vence_2_dias: number
  vence_3_dias: number
  total_pendente: number
}

export function Bloco1Financeiro({ vence_24h, vence_2_dias, vence_3_dias, total_pendente }: Bloco1Props) {
  const items = [
    { label: "Vence em 24h", valor: vence_24h, cor: C.red },
    { label: "Vence em 2 dias", valor: vence_2_dias, cor: C.amber },
    { label: "Vence em 3 dias", valor: vence_3_dias, cor: "#eab308" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.red}18`, border: `1px solid ${C.red}30` }}>
          <TrendingDown className="w-4 h-4" style={{ color: C.red }} />
        </div>
        <h2 className="text-base font-semibold text-white">Pendências Financeiras</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-xl p-4" style={{ background: `${item.cor}14`, border: `1px solid ${item.cor}33` }}>
            <p className="text-xs mb-2" style={{ color: item.cor }}>{item.label}</p>
            <p className="text-2xl font-bold text-white">R$ {item.valor.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-4" style={{ background: "#0a1628", border: `1px solid ${C.border}` }}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.amber }} />
          <div>
            <p className="text-sm font-semibold text-white mb-1">Total Pendente</p>
            <p className="text-3xl font-bold" style={{ color: C.green }}>R$ {total_pendente.toFixed(2)}</p>
            <p className="text-xs mt-2" style={{ color: C.muted }}>Clique em um aluno para acompanhar o pagamento</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
