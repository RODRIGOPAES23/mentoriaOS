"use client"

import { useState, useEffect } from "react"
import { AlertCircle, DollarSign } from "lucide-react"
import { C } from "@/utils/theme"

interface Props {
  mentoradoId: string
  onIrFinanceiro?: () => void
}

/** Faixa de aviso quando o mentorado tem mensalidade vencendo em ≤3 dias (ou vencida). */
export default function AvisoPagamento({ mentoradoId, onIrFinanceiro }: Props) {
  const [aviso, setAviso] = useState<{ valor: number; dias: number; vencido: boolean } | null>(null)

  useEffect(() => {
    fetch(`/api/dashboard/pagamentos?mentoradoId=${mentoradoId}&t=${Date.now()}`)
      .then(r => r.json())
      .then(j => {
        const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
        const pendentes = (j.pagamentos || []).filter((p: any) => p.status !== "pago")
        let melhor: any = null
        for (const p of pendentes) {
          if (!p.data_vencimento) continue
          const [y, mo, d] = p.data_vencimento.split("T")[0].split("-").map(Number)
          const dias = Math.ceil((new Date(y, mo - 1, d).getTime() - hoje.getTime()) / 86400000)
          if (dias <= 3) {
            if (!melhor || dias < melhor.dias) melhor = { valor: Number(p.valor || 0), dias, vencido: dias < 0 }
          }
        }
        setAviso(melhor)
      })
      .catch(() => {})
  }, [mentoradoId])

  if (!aviso) return null

  const cor = aviso.vencido || aviso.dias <= 1 ? C.red : aviso.dias === 2 ? C.amber : "#eab308"
  const texto = aviso.vencido
    ? `Mensalidade VENCIDA — R$ ${aviso.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
    : aviso.dias === 0
      ? `Cobrança hoje — R$ ${aviso.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      : `Cobrança em breve — R$ ${aviso.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} vence em ${aviso.dias} dia${aviso.dias > 1 ? "s" : ""}`

  return (
    <button onClick={onIrFinanceiro}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
      style={{ background: `${cor}14`, border: `1px solid ${cor}44` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cor}22` }}>
        {aviso.vencido ? <AlertCircle className="w-4 h-4" style={{ color: cor }} /> : <DollarSign className="w-4 h-4" style={{ color: cor }} />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: cor }}>{texto}</p>
        <p className="text-[11px]" style={{ color: C.muted }}>Clique para ver o financeiro</p>
      </div>
    </button>
  )
}
