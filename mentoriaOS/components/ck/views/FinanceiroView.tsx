"use client"

import { useEffect, useState, useMemo } from "react"
import { DollarSign, AlertCircle, TrendingUp, CheckCircle2, ChevronRight, Wallet } from "lucide-react"
import { C } from "@/utils/theme"
import type { Mentorado } from "../types"

interface Pagamento {
  id: string
  valor: number
  data_vencimento: string | null
  data_pagamento: string | null
  status: string
  descricao: string | null
  mentorado_id: string
}

const brl = (n: number) => "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })

function diasAte(d: string | null): number | null {
  if (!d) return null
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const [y, mo, dd] = d.split("T")[0].split("-").map(Number)
  return Math.ceil((new Date(y, mo - 1, dd).getTime() - hoje.getTime()) / 86400000)
}

/** Financeiro macro da operação: projeção de faturamento, inadimplência e fila de cobrança. */
export default function FinanceiroView({ mentorId, accent, mentorados, onAbrirMentorado }: {
  mentorId: string
  accent: string
  mentorados: Mentorado[]
  onAbrirMentorado: (id: string) => void
}) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/dashboard/pagamentos?mentorId=${mentorId}&t=${Date.now()}`)
      .then(r => r.json())
      .then(j => { setPagamentos(j.pagamentos || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [mentorId])

  const nomeDe = (id: string) => mentorados.find(m => m.id === id)?.nome || "—"

  const kpis = useMemo(() => {
    const pendentes = pagamentos.filter(p => p.status !== "pago")
    const vencidos = pendentes.filter(p => (diasAte(p.data_vencimento) ?? 99) < 0)
    const pagos = pagamentos.filter(p => p.status === "pago")
    const aReceber = pendentes.reduce((s, p) => s + Number(p.valor || 0), 0)
    const inadimplencia = vencidos.reduce((s, p) => s + Number(p.valor || 0), 0)
    const recebido = pagos.reduce((s, p) => s + Number(p.valor || 0), 0)
    const projecao = mentorados.reduce((s, m) => s + Number(m.meta_faturamento || m.faturamento_atual || 0), 0)
    return { aReceber, inadimplencia, recebido, projecao, vencidosCount: vencidos.length }
  }, [pagamentos, mentorados])

  const fila = useMemo(() => {
    return pagamentos
      .filter(p => p.status !== "pago")
      .map(p => ({ ...p, dias: diasAte(p.data_vencimento), vencido: (diasAte(p.data_vencimento) ?? 99) < 0 }))
      .sort((a, b) => (a.dias ?? 999) - (b.dias ?? 999))
  }, [pagamentos])

  const cards = [
    { label: "A receber", valor: kpis.aReceber, icon: Wallet, cor: accent },
    { label: "Inadimplência", valor: kpis.inadimplencia, icon: AlertCircle, cor: C.red, sub: `${kpis.vencidosCount} vencido(s)` },
    { label: "Recebido", valor: kpis.recebido, icon: CheckCircle2, cor: C.green },
    { label: "Projeção da operação", valor: kpis.projecao, icon: TrendingUp, cor: C.blue, sub: "soma das metas" },
  ]

  return (
    <div className="p-6 space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${c.cor}18`, border: `1px solid ${c.cor}30` }}>
              <c.icon className="w-4 h-4" style={{ color: c.cor }} />
            </div>
            <p className="text-2xl font-bold text-white">{brl(c.valor)}</p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>{c.label}</p>
            {c.sub && <p className="text-[10px] mt-1 font-semibold" style={{ color: c.cor }}>{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Fila de cobrança */}
      <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-6 py-4 flex items-center gap-2.5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <DollarSign className="w-4 h-4" style={{ color: accent }} />
          <h3 className="text-sm font-semibold text-white">Fila de cobrança</h3>
          <span className="text-xs" style={{ color: C.muted }}>· pendentes ordenados por vencimento</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: C.muted }}>Carregando...</div>
        ) : fila.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: C.green }} />
            <p className="text-sm" style={{ color: C.muted }}>Nenhuma cobrança pendente. Operação em dia.</p>
          </div>
        ) : (
          <div>
            {fila.map(p => {
              const cor = p.vencido ? C.red : (p.dias ?? 99) <= 3 ? C.amber : C.muted
              const prazo = p.vencido ? `vencido há ${Math.abs(p.dias ?? 0)}d`
                : p.dias === 0 ? "vence hoje"
                : `vence em ${p.dias}d`
              return (
                <button key={p.id} onClick={() => onAbrirMentorado(p.mentorado_id)}
                  className="w-full px-6 py-3.5 flex items-center gap-4 text-left transition-colors"
                  style={{ borderBottom: `1px solid ${C.border}40` }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.card2}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{nomeDe(p.mentorado_id)}</p>
                    {p.descricao && <p className="text-[11px] truncate" style={{ color: C.muted }}>{p.descricao}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">{brl(Number(p.valor || 0))}</p>
                    <p className="text-[11px] font-semibold" style={{ color: cor }}>{prazo}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" style={{ color: C.muted }} />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
