"use client"

import { UserPlus, X } from "lucide-react"
import { C } from "@/utils/theme"

interface Props {
  novo: { nome: string; nicho: string; foco_macro: string; data_inicio: string }
  setNovo: (fn: (n: any) => any) => void
  salvando: boolean
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function CadastroMentoradoModal({ novo, setNovo, salvando, onSubmit, onClose }: Props) {
  const inputStyle = { background: C.bg, border: `1px solid ${C.border}` }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4" style={{ background: "#00000070" }} onClick={onClose}>
      <div className="rounded-2xl shadow-2xl w-full max-w-lg" style={{ background: C.card2, border: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${C.green}18`, border: `1px solid ${C.green}33` }}>
              <UserPlus className="w-5 h-5" style={{ color: C.green }} />
            </div>
            <h2 className="text-base font-semibold text-white">Novo Mentorado</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: C.muted }}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {[
            { label: "Nome Completo", key: "nome", placeholder: "Ex: Ana Silva" },
            { label: "Nicho de Atuação", key: "nicho", placeholder: "Ex: Marketing Digital" },
            { label: "Foco Macro", key: "foco_macro", placeholder: "Ex: Estruturação Comercial" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{f.label}</label>
              <input required value={(novo as any)[f.key]} onChange={e => setNovo(n => ({ ...n, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none transition-all"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Data de Início</label>
            <input type="date" required value={novo.data_inicio} onChange={e => setNovo(n => ({ ...n, data_inicio: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all" style={inputStyle} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors" style={{ background: C.card, color: C.muted, border: `1px solid ${C.border}` }}>Cancelar</button>
            <button type="submit" disabled={salvando}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all"
              style={{ background: `${C.green}22`, border: `1px solid ${C.green}55`, color: C.green }}>
              {salvando ? "Salvando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
