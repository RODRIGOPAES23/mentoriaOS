"use client"

import { Users, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { C } from "@/utils/theme"

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
  accent?: string
  onIrMentorados?: () => void
}

export function Bloco2Mentorados({ total, prox_30_dias, prox_60_dias, ultimo_mes, accent = C.green, onIrMentorados }: Bloco2Props) {
  const cards = [
    { label: "Total", valor: total, cor: accent },
    { label: "Renovação próx 30d", valor: prox_30_dias.length, cor: C.blue },
    { label: "Renovação próx 60d", valor: prox_60_dias.length, cor: C.violet },
    { label: "Último mês", valor: ultimo_mes.length, cor: C.red },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.blue}18`, border: `1px solid ${C.blue}30` }}>
          <Users className="w-4 h-4" style={{ color: C.blue }} />
        </div>
        <h2 className="text-base font-semibold" style={{ color: C.text }}>Mentorados Ativos</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        {cards.map((c, i) => (
          <button key={i} onClick={onIrMentorados} title="Ver mentorados"
            className="rounded-xl p-2.5 text-left transition-all hover:-translate-y-0.5"
            style={{ background: `${c.cor}14`, border: `1px solid ${c.cor}33` }}>
            <p className="text-[11px] mb-0.5" style={{ color: c.cor }}>{c.label}</p>
            <p className="text-xl font-bold" style={{ color: c.cor }}>{c.valor}</p>
          </button>
        ))}
      </div>

      {ultimo_mes.length > 0 && (
        <div className="rounded-xl p-3" style={{ background: `${C.red}10`, border: `1px solid ${C.red}33` }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.red }} />
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: C.red }}>Alunos em Último Mês</p>
              <div className="flex flex-wrap gap-2">
                {ultimo_mes.map((m) => (
                  <span key={m.id} className="px-2 py-1 rounded text-xs" style={{ background: `${C.red}22`, color: "#fca5a5" }}>{m.nome}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
