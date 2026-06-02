"use client"

import { useEffect, useState } from "react"
import { X, Loader2 } from "lucide-react"
import { C } from "@/utils/theme"
import { FormCadastroMentorado } from "@/components/forms/FormCadastroMentorado"

interface Props {
  mentoradoId: string
  nome: string
  onClose: () => void
  onSalvo: () => void
}

/** Modal de edição do CADASTRO COMPLETO (19 campos) do mentorado — visão do mentor. */
export default function EditarCadastroModal({ mentoradoId, nome, onClose, onSalvo }: Props) {
  const [initial, setInitial] = useState<any | null>(null)
  const [erro, setErro] = useState("")

  useEffect(() => {
    fetch(`/api/dashboard/mentorados/${mentoradoId}?t=${Date.now()}`)
      .then(r => r.json())
      .then(j => setInitial(j.mentorado || {}))
      .catch(() => setErro("Não foi possível carregar o cadastro."))
  }, [mentoradoId])

  const salvar = async (data: any) => {
    const res = await fetch(`/api/dashboard/mentorados/${mentoradoId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || "Erro ao salvar")
    onSalvo()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center backdrop-blur-sm p-4 overflow-y-auto"
      style={{ background: "#00000070" }} onClick={onClose}>
      <div className="w-full max-w-3xl my-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3 px-1">
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
          <FormCadastroMentorado mentoradoId={mentoradoId} initialData={initial} onSave={salvar} />
        )}
      </div>
    </div>
  )
}
