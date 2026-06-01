"use client"

import { X, Trash2 } from "lucide-react"
import { C } from "@/utils/theme"
import type { Mentorado } from "../types"

interface EditData {
  nome: string; nicho: string; foco_macro: string; status: string
  cidade: string; data_fim: string; faturamento_atual: string; meta_faturamento: string; meta_atual: string
}

interface Props {
  selected: Mentorado
  selectedId: string
  editData: EditData
  setEditData: (fn: (d: any) => any) => void
  editando: boolean
  onSubmit: (e: React.FormEvent) => void
  onDelete: (id: string) => void
  onUploadFoto: (file: File, type: "mentorado", id: string) => void
  onClose: () => void
}

export default function EditarMentoradoModal({ selected, selectedId, editData, setEditData, editando, onSubmit, onDelete, onUploadFoto, onClose }: Props) {
  const inputStyle = { background: C.input, border: `1px solid ${C.border}` }
  const onFocus = (e: any) => e.target.style.borderColor = C.green
  const onBlur = (e: any) => e.target.style.borderColor = C.border

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 overflow-y-auto" style={{ background: "#00000070" }} onClick={onClose}>
      <div className="rounded-2xl shadow-2xl w-full max-w-lg my-4" style={{ background: C.card2, border: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <div className="w-9 h-9 rounded-full overflow-hidden transition-all" style={{ border: `2px solid ${C.border}` }}>
                {selected.foto_url
                  ? <img src={selected.foto_url} alt={selected.nome} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ background: C.input }}>{selected.nome.slice(0, 2).toUpperCase()}</div>}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files?.[0]
                if (file && selectedId) onUploadFoto(file, "mentorado", selectedId)
              }} />
            </label>
            <h2 className="text-base font-semibold text-white">Editar Mentorado</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: C.muted }}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {[
            { label: "Nome", key: "nome" }, { label: "Nicho", key: "nicho" },
            { label: "Foco Macro", key: "foco_macro" }, { label: "Cidade", key: "cidade" },
            { label: "Meta/Ação da Semana", key: "meta_atual" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{f.label}</label>
              <input value={(editData as any)[f.key]} onChange={e => setEditData(d => ({ ...d, [f.key]: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Término da Mentoria</label>
            <input type="date" value={editData.data_fim} onChange={e => setEditData(d => ({ ...d, data_fim: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Faturamento Atual (R$)", key: "faturamento_atual", ph: "8000" },
              { label: "Meta 12 Meses (R$)", key: "meta_faturamento", ph: "50000" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{f.label}</label>
                <input type="number" value={(editData as any)[f.key]} placeholder={f.ph}
                  onChange={e => setEditData(d => ({ ...d, [f.key]: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors" style={{ background: C.card, color: C.muted, border: `1px solid ${C.border}` }}>Cancelar</button>
            <button type="submit" disabled={editando}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all" style={{ background: C.green, color: C.input }}>
              {editando ? "Salvando..." : "Salvar Mudanças"}
            </button>
          </div>
          <div className="pt-4 mt-2" style={{ borderTop: `1px solid ${C.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: C.muted }}>Zona de Perigo</p>
            <button type="button" onClick={() => { if (selectedId) onDelete(selectedId) }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{ background: `${C.red}15`, color: "#fca5a5", border: `1px solid ${C.red}33` }}>
              <Trash2 className="w-4 h-4" /> Deletar Mentorado
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
