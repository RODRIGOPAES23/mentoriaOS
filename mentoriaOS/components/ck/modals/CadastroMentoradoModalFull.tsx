"use client"

import { X } from "lucide-react"
import { C } from "@/utils/theme"
import { FormCadastroMentorado } from "@/components/forms/FormCadastroMentorado"

interface Props {
  mentorId: string
  onClose: () => void
  onCriado: (id?: string) => void
}

/** Modal de cadastro COMPLETO do mentorado (19 campos, 5 seções). */
export default function CadastroMentoradoModalFull({ mentorId, onClose, onCriado }: Props) {
  const handleSave = async (data: any) => {
    const res = await fetch("/api/dashboard/mentorados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, mentor_id: mentorId }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || "Erro ao cadastrar")
    onCriado(json.mentorado?.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center backdrop-blur-sm p-4 overflow-y-auto"
      style={{ background: "#00000070" }} onClick={onClose}>
      <div className="w-full max-w-3xl my-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-lg font-bold text-white">Novo Mentorado</h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: C.muted }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <FormCadastroMentorado onSave={handleSave} />
      </div>
    </div>
  )
}
