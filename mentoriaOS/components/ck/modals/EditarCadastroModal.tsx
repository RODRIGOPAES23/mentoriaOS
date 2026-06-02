"use client"

import { useEffect, useState } from "react"
import { X, Loader2, Briefcase } from "lucide-react"
import { C } from "@/utils/theme"
import { FormCadastroMentorado } from "@/components/forms/FormCadastroMentorado"

interface Props {
  mentoradoId: string
  nome: string
  onClose: () => void
  onSalvo: () => void
}

/** Edição do CADASTRO COMPLETO do mentorado (visão do mentor):
 *  19 campos do form + seção "Operação da Mentoria" (foco, término, metas, faturamento). */
export default function EditarCadastroModal({ mentoradoId, nome, onClose, onSalvo }: Props) {
  const [initial, setInitial] = useState<any | null>(null)
  const [erro, setErro] = useState("")
  // Campos operacionais (não fazem parte do form de intake)
  const [op, setOp] = useState({ foco_macro: "", meta_atual: "", data_fim: "", faturamento_atual: "", meta_faturamento: "" })

  useEffect(() => {
    fetch(`/api/dashboard/mentorados/${mentoradoId}?t=${Date.now()}`)
      .then(r => r.json())
      .then(j => {
        const m = j.mentorado || {}
        setInitial(m)
        setOp({
          foco_macro: m.foco_macro || "",
          meta_atual: m.meta_atual || "",
          data_fim: (m.data_fim || "").split("T")[0],
          faturamento_atual: m.faturamento_atual != null ? String(m.faturamento_atual) : "",
          meta_faturamento: m.meta_faturamento != null ? String(m.meta_faturamento) : "",
        })
      })
      .catch(() => setErro("Não foi possível carregar o cadastro."))
  }, [mentoradoId])

  const salvar = async (data: any) => {
    const res = await fetch(`/api/dashboard/mentorados/${mentoradoId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        status: initial?.status || "Ativo",
        foco_macro: op.foco_macro || initial?.foco_macro || "Definir foco",
        meta_atual: op.meta_atual || null,
        data_fim: op.data_fim || null,
        faturamento_atual: op.faturamento_atual || null,
        meta_faturamento: op.meta_faturamento || null,
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || "Erro ao salvar")
    onSalvo()
  }

  const inputStyle = { background: C.input, border: `1px solid ${C.border}` }
  const inputCls = "w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all"

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center backdrop-blur-sm p-4 overflow-y-auto"
      style={{ background: "#00000070" }} onClick={onClose}>
      <div className="w-full max-w-3xl my-8 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-white">Editar cadastro — {nome}</h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: C.muted }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {erro ? (
          <p className="text-sm text-center py-10 rounded-2xl" style={{ color: C.red, background: C.card, border: `1px solid ${C.border}` }}>{erro}</p>
        ) : !initial ? (
          <div className="flex items-center justify-center py-16 rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: C.green }} />
          </div>
        ) : (
          <>
            {/* Seção Operação da Mentoria (campos do mentor) */}
            <div className="rounded-2xl p-6 space-y-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" style={{ color: C.blue }} />
                <h3 className="text-sm font-bold text-white">Operação da Mentoria</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Foco Macro</label>
                  <input value={op.foco_macro} onChange={e => setOp(o => ({ ...o, foco_macro: e.target.value }))}
                    placeholder="Ex: Estruturação comercial" className={inputCls} style={inputStyle} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Meta / Ação da Semana</label>
                  <input value={op.meta_atual} onChange={e => setOp(o => ({ ...o, meta_atual: e.target.value }))}
                    placeholder="Ex: Gravar 3 vídeos" className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Término da Mentoria</label>
                  <input type="date" value={op.data_fim} onChange={e => setOp(o => ({ ...o, data_fim: e.target.value }))}
                    className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Faturamento Atual (R$)</label>
                  <input type="number" value={op.faturamento_atual} onChange={e => setOp(o => ({ ...o, faturamento_atual: e.target.value }))}
                    placeholder="8000" className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Meta 12 Meses (R$)</label>
                  <input type="number" value={op.meta_faturamento} onChange={e => setOp(o => ({ ...o, meta_faturamento: e.target.value }))}
                    placeholder="50000" className={inputCls} style={inputStyle} />
                </div>
              </div>
              <p className="text-[11px]" style={{ color: C.muted }}>Salvar com o botão do cadastro abaixo grava tudo de uma vez.</p>
            </div>

            {/* Form de intake (19 campos) — o botão Salvar dele grava o conjunto todo */}
            <FormCadastroMentorado mentoradoId={mentoradoId} initialData={initial} onSave={salvar} />
          </>
        )}
      </div>
    </div>
  )
}
