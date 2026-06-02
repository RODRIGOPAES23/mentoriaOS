"use client"

import { TrendingDown, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { C } from "@/utils/theme"

interface PagItem {
  id: string
  mentorado_id: string
  nome: string
  valor: number
  dias: number | null
  vencido: boolean
}

interface Bloco1Props {
  vence_24h: number
  vence_2_dias: number
  vence_3_dias: number
  total_pendente: number
  proximos?: PagItem[]
  accent?: string
  onAbrirMentorado?: (id: string) => void
}

function fmt(v: number) { return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` }

function prazoLabel(p: PagItem) {
  if (p.vencido) return "vencido"
  if (p.dias === 0) return "vence hoje"
  if (p.dias === 1) return "em 24h"
  return `em ${p.dias} dias`
}
function prazoCor(p: PagItem) {
  if (p.vencido) return C.red
  if (p.dias !== null && p.dias <= 1) return C.red
  if (p.dias === 2) return C.amber
  return "#eab308"
}

export function Bloco1Financeiro({ vence_24h, vence_2_dias, vence_3_dias, total_pendente, proximos = [], onAbrirMentorado }: Bloco1Props) {
  const janelas = [
    { label: "Em 24h", valor: vence_24h, cor: C.red },
    { label: "Em 2 dias", valor: vence_2_dias, cor: C.amber },
    { label: "Em 3 dias", valor: vence_3_dias, cor: "#eab308" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.red}18`, border: `1px solid ${C.red}30` }}>
            <TrendingDown className="w-4 h-4" style={{ color: C.red }} />
          </div>
          <h2 className="text-base font-semibold text-white">Pendências Financeiras</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Total a receber</p>
          <p className="text-lg font-bold" style={{ color: C.green }}>{fmt(total_pendente)}</p>
        </div>
      </div>

      {/* Janelas por prazo (resumo) */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {janelas.map((j, i) => (
          <div key={i} className="rounded-xl p-2.5 text-center" style={{ background: `${j.cor}14`, border: `1px solid ${j.cor}33` }}>
            <p className="text-[10px] mb-0.5" style={{ color: j.cor }}>{j.label}</p>
            <p className="text-base font-bold text-white">{fmt(j.valor)}</p>
          </div>
        ))}
      </div>

      {/* Lista NOMINAL — quem paga, quanto, quando (spec do Vitor) */}
      {proximos.length === 0 ? (
        <p className="text-sm text-center py-3" style={{ color: C.muted }}>Nenhuma cobrança nos próximos dias 🎉</p>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.muted }}>A receber / cobrar</p>
          {proximos.map(p => {
            const cor = prazoCor(p)
            return (
              <button key={p.id}
                onClick={() => onAbrirMentorado?.(p.mentorado_id)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors"
                style={{ background: C.input, border: `1px solid ${C.border}` }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = `${cor}55`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}>
                <div className="w-1.5 h-8 rounded-full shrink-0" style={{ background: cor }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{p.nome}</p>
                  <p className="text-[11px]" style={{ color: cor }}>{prazoLabel(p)}</p>
                </div>
                <p className="text-sm font-bold text-white shrink-0">{fmt(p.valor)}</p>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: C.muted }} />
              </button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
