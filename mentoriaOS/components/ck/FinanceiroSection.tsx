"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, CheckCircle2, Clock, AlertCircle, Trash2, DollarSign, Pencil, X } from "lucide-react"

interface Pagamento {
  id: string
  valor: number
  data_vencimento: string
  data_pagamento: string | null
  status: "pendente" | "pago" | "atrasado"
  descricao: string | null
  parcela: number
  mentorado_id: string
}

interface FinanceiroSectionProps {
  mentoradoId: string | null
  mentorId: string | null
}

function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("T")[0].split("-").map(Number)
  return new Date(y, m - 1, d)
}

function getStatusPagamento(p: Pagamento): "pago" | "atrasado" | "hoje" | "proximo" | "pendente" {
  if (p.status === "pago") return "pago"
  const venc = parseDateLocal(p.data_vencimento)
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1)
  venc.setHours(0, 0, 0, 0)
  if (venc < hoje) return "atrasado"
  if (venc.getTime() === hoje.getTime()) return "hoje"
  if (venc.getTime() === amanha.getTime()) return "proximo"
  return "pendente"
}

export default function FinanceiroSection({ mentoradoId, mentorId }: FinanceiroSectionProps) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ valor: "", data_vencimento: "", descricao: "", parcela: "1", status: "pendente" })

  const buscar = useCallback(async () => {
    if (!mentoradoId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/pagamentos?mentoradoId=${mentoradoId}&t=${Date.now()}`)
      const json = await res.json()
      setPagamentos(json.pagamentos || [])
    } finally {
      setLoading(false)
    }
  }, [mentoradoId])

  useEffect(() => { buscar() }, [mentoradoId, buscar])

  const resetForm = () => {
    setForm({ valor: "", data_vencimento: "", descricao: "", parcela: "1", status: "pendente" })
    setEditId(null)
    setShowForm(false)
  }

  const abrirEdicao = (p: Pagamento) => {
    setForm({
      valor: String(p.valor ?? ""),
      data_vencimento: (p.data_vencimento || "").split("T")[0],
      descricao: p.descricao || "",
      parcela: String(p.parcela ?? 1),
      status: p.status || "pendente",
    })
    setEditId(p.id)
    setShowForm(true)
  }

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.data_vencimento) return
    if (editId) {
      // Edição (ex.: mudar data de vencimento, valor, status)
      await fetch(`/api/dashboard/pagamentos/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor: parseFloat(form.valor) || 0,
          data_vencimento: form.data_vencimento,
          descricao: form.descricao || null,
          parcela: parseInt(form.parcela) || 1,
          status: form.status,
        }),
      })
    } else {
      if (!mentoradoId || !mentorId) return
      await fetch("/api/dashboard/pagamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentoradoId, mentorId,
          valor: parseFloat(form.valor) || 0,
          data_vencimento: form.data_vencimento,
          descricao: form.descricao || null,
          parcela: parseInt(form.parcela) || 1,
        }),
      })
    }
    resetForm()
    buscar()
  }

  const marcarPago = async (id: string) => {
    await fetch(`/api/dashboard/pagamentos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "pago" }),
    })
    buscar()
  }

  const deletar = async (id: string) => {
    if (!confirm("Remover pagamento?")) return
    await fetch(`/api/dashboard/pagamentos/${id}`, { method: "DELETE" })
    buscar()
  }

  const totalPendente = pagamentos.filter(p => p.status !== "pago").reduce((s, p) => s + Number(p.valor), 0)
  const totalPago = pagamentos.filter(p => p.status === "pago").reduce((s, p) => s + Number(p.valor), 0)

  if (!mentoradoId) return null

  return (
    <div className="mb-6 rounded-lg p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-green-600 rounded-full" />
          <h3 className="text-lg font-semibold" style={{ color: C.text }}>Financeiro</h3>
        </div>
        <button
          onClick={() => { if (showForm) { resetForm() } else { setForm({ valor: "", data_vencimento: "", descricao: "", parcela: "1", status: "pendente" }); setEditId(null); setShowForm(true) } }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-semibold transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Pagamento
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-emerald-400">R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-emerald-400/70 uppercase tracking-widest mt-0.5">Recebido</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-amber-400">R$ {totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] text-amber-400/70 uppercase tracking-widest mt-0.5">A Receber</p>
        </div>
      </div>

      {/* Form em POPUP (modal) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          style={{ background: "#00000070" }} onClick={resetForm}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl" style={{ background: C.bg, border: `1px solid ${C.border}` }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <h3 className="text-sm font-bold" style={{ color: C.text }}>{editId ? "Editar pagamento" : "Novo pagamento"}</h3>
              <button onClick={resetForm} className="p-1.5 rounded-lg transition-colors" style={{ color: C.muted }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={salvar} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Valor (R$)</label>
                  <input type="number" step="0.01" placeholder="0,00" value={form.valor}
                    onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: C.input, border: `1px solid ${C.border}`, color: C.text }} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Vencimento</label>
                  <input type="date" required value={form.data_vencimento}
                    onChange={e => setForm(f => ({ ...f, data_vencimento: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: C.input, border: `1px solid ${C.border}`, color: C.text }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Descrição</label>
                  <input type="text" placeholder="Ex: Parcela 1/12" value={form.descricao}
                    onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: C.input, border: `1px solid ${C.border}`, color: C.text }} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Parcela #</label>
                  <input type="number" min="1" value={form.parcela}
                    onChange={e => setForm(f => ({ ...f, parcela: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: C.input, border: `1px solid ${C.border}`, color: C.text }} />
                </div>
              </div>
              {editId && (
                <div>
                  <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: C.input, border: `1px solid ${C.border}`, color: C.text }}>
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                  </select>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={resetForm}
                  className="flex-1 py-2 rounded-lg text-sm transition-colors" style={{ background: C.card2, color: C.muted, border: `1px solid ${C.border}` }}>
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors">
                  {editId ? "Salvar mudanças" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <p className="text-slate-400 text-sm text-center py-3">Carregando...</p>
      ) : pagamentos.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-3">Nenhum pagamento cadastrado</p>
      ) : (
        <div className="space-y-2">
          {pagamentos.map(p => {
            const statusCalc = getStatusPagamento(p)
            const venc = parseDateLocal(p.data_vencimento).toLocaleDateString("pt-BR")
            return (
              <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg group transition-colors ${
                statusCalc === "pago" ? "bg-emerald-500/10 border border-emerald-500/20" :
                statusCalc === "atrasado" ? "bg-red-500/10 border border-red-500/20" :
                statusCalc === "hoje" || statusCalc === "proximo" ? "bg-amber-500/10 border border-amber-500/20" :
                ""
              }`} style={!["pago", "atrasado", "hoje", "proximo"].includes(statusCalc) ? { background: C.card2 } : undefined}>
                {/* Ícone */}
                <div className="flex-shrink-0">
                  {statusCalc === "pago" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
                   statusCalc === "atrasado" ? <AlertCircle className="w-4 h-4 text-red-400" /> :
                   statusCalc === "hoje" || statusCalc === "proximo" ? <Clock className="w-4 h-4 text-amber-400" /> :
                   <DollarSign className="w-4 h-4 text-slate-400" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold" style={{ color: C.text }}>
                      R$ {Number(p.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    {p.descricao && <span className="text-xs text-slate-400 truncate">{p.descricao}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      statusCalc === "pago" ? "text-emerald-400" :
                      statusCalc === "atrasado" ? "text-red-400" :
                      statusCalc === "hoje" ? "text-amber-400" :
                      statusCalc === "proximo" ? "text-amber-300" : "text-slate-400"
                    }`}>
                      {statusCalc === "pago" ? "✓ Pago" :
                       statusCalc === "atrasado" ? "⚠ Atrasado" :
                       statusCalc === "hoje" ? "ATENÇÃO — Vence hoje" :
                       statusCalc === "proximo" ? "Vence amanhã" : `Vence ${venc}`}
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {statusCalc !== "pago" && (
                    <button onClick={() => marcarPago(p.id)}
                      className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 text-[10px] font-bold transition-colors">
                      PAGO
                    </button>
                  )}
                  <button onClick={() => abrirEdicao(p)} title="Editar pagamento"
                    className="p-1 rounded hover:bg-blue-500/20 transition-colors">
                    <Pencil className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                  <button onClick={() => deletar(p.id)} title="Remover pagamento"
                    className="p-1 rounded hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
