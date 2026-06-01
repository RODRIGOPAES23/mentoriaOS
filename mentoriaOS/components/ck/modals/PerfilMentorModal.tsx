"use client"

import { X } from "lucide-react"
import { C } from "@/utils/theme"

interface MentorDados {
  id?: string; nome: string; metodo_trabalho?: string; filosofia?: string; nicho_foco?: string; foto_url?: string
}
interface PerfilEdit { nome: string; nicho_foco: string; metodo_trabalho: string; filosofia: string }

interface Props {
  mentorDados: MentorDados | null
  mentorNome: string
  mentorId: string | null
  editandoPerfil: boolean
  setEditandoPerfil: (v: boolean) => void
  perfilEdit: PerfilEdit
  setPerfilEdit: (fn: (p: any) => any) => void
  salvandoPerfil: boolean
  onSalvar: () => void
  onUploadFoto: (file: File, type: "mentor", id: string) => void
  onClose: () => void
}

export default function PerfilMentorModal({
  mentorDados, mentorNome, mentorId, editandoPerfil, setEditandoPerfil,
  perfilEdit, setPerfilEdit, salvandoPerfil, onSalvar, onUploadFoto, onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4" style={{ background: "#00000070" }} onClick={onClose}>
      <div className="rounded-2xl shadow-2xl w-full max-w-lg" style={{ background: C.card2, border: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h2 className="text-base font-semibold text-white">Meu Perfil</h2>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: C.muted }}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-center mb-2">
            <label className="cursor-pointer">
              <div className="w-20 h-20 rounded-2xl overflow-hidden transition-all" style={{ border: `3px solid ${C.border}` }}>
                {mentorDados?.foto_url
                  ? <img src={mentorDados.foto_url} alt={mentorNome} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: "#0a1628" }}>{mentorNome.slice(0, 2).toUpperCase()}</div>}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files?.[0]
                if (file && mentorId) onUploadFoto(file, "mentor", mentorId)
              }} />
            </label>
          </div>
          {!editandoPerfil ? (
            <>
              <div className="text-center">
                <p className="text-lg font-bold text-white">{mentorDados?.nome || mentorNome}</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: C.green }}>{mentorDados?.nicho_foco || "—"}</p>
              </div>
              <button onClick={() => { setPerfilEdit(() => ({ nome: mentorDados?.nome || "", nicho_foco: mentorDados?.nicho_foco || "", metodo_trabalho: mentorDados?.metodo_trabalho || "", filosofia: mentorDados?.filosofia || "" })); setEditandoPerfil(true) }}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors" style={{ background: C.green, color: "#0a1628" }}>
                Editar Perfil
              </button>
            </>
          ) : (
            <>
              {[
                { label: "Nome", key: "nome" }, { label: "Nicho Foco", key: "nicho_foco" },
                { label: "Método de Trabalho", key: "metodo_trabalho" }, { label: "Filosofia", key: "filosofia" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{f.label}</label>
                  <input value={(perfilEdit as any)[f.key]} onChange={e => setPerfilEdit(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all"
                    style={{ background: "#0a1628", border: `1px solid ${C.border}` }}
                    onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
                </div>
              ))}
              <div className="flex gap-3">
                <button onClick={() => setEditandoPerfil(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors" style={{ background: C.card, color: C.muted, border: `1px solid ${C.border}` }}>Cancelar</button>
                <button onClick={onSalvar} disabled={salvandoPerfil}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all" style={{ background: C.green, color: "#0a1628" }}>
                  {salvandoPerfil ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
