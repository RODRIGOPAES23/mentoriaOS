"use client"

import { useState } from "react"
import { User, Moon, Building2, Check } from "lucide-react"
import { C } from "@/utils/theme"
import AdminView from "../AdminView"

interface Props {
  mentorId: string
  accent: string
  isAdmin: boolean
  mentorNome: string
  perfilEdit: { nome: string; nicho_foco: string; metodo_trabalho: string; filosofia: string }
  setPerfilEdit: (fn: (p: any) => any) => void
  salvandoPerfil: boolean
  onSalvarPerfil: () => void
  onAbrirMentorado: (id: string) => void
}

type Aba = "geral" | "tema" | "empresa"

/** Central de configurações com abas internas. Empresa (AdminView) vive aqui. */
export default function ConfiguracoesView({
  mentorId, accent, isAdmin, mentorNome, perfilEdit, setPerfilEdit, salvandoPerfil, onSalvarPerfil, onAbrirMentorado,
}: Props) {
  const [aba, setAba] = useState<Aba>("geral")

  const abas = [
    { id: "geral" as const, label: "Geral", icon: User, show: true },
    { id: "tema" as const, label: "Tema", icon: Moon, show: true },
    { id: "empresa" as const, label: "Empresa", icon: Building2, show: isAdmin },
  ].filter(a => a.show)

  return (
    <div className="p-6">
      <div className="flex gap-1 rounded-xl p-1 w-fit mb-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        {abas.map(a => (
          <button key={a.id} onClick={() => setAba(a.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
            style={aba === a.id ? { background: accent, color: C.input } : { color: C.muted }}>
            <a.icon className="w-4 h-4" /> {a.label}
          </button>
        ))}
      </div>

      {aba === "geral" && (
        <div className="max-w-lg rounded-2xl p-6 space-y-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="font-semibold text-white">Perfil do Mentor</h3>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Nome</label>
            <input value={perfilEdit.nome || mentorNome} onChange={e => setPerfilEdit(p => ({ ...p, nome: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all"
              style={{ background: C.input, border: `1px solid ${C.border}` }}
              onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = C.border} />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Nicho Foco</label>
            <input value={perfilEdit.nicho_foco} onChange={e => setPerfilEdit(p => ({ ...p, nicho_foco: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all"
              style={{ background: C.input, border: `1px solid ${C.border}` }}
              onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = C.border} />
          </div>
          <button onClick={onSalvarPerfil} disabled={salvandoPerfil}
            className="w-full py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors"
            style={{ background: accent, color: C.input }}>
            {salvandoPerfil ? "Salvando..." : "Salvar"}
          </button>
        </div>
      )}

      {aba === "tema" && (
        <div className="max-w-lg rounded-2xl p-6 space-y-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="font-semibold text-white">Aparência</h3>
          <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: C.input, border: `1px solid ${C.border}` }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${accent}18`, border: `1px solid ${accent}44` }}>
              <Moon className="w-4 h-4" style={{ color: accent }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Modo escuro</p>
              <p className="text-[11px]" style={{ color: C.muted }}>Tema único da plataforma (Plecto Navy). Cor de destaque definida pela empresa.</p>
            </div>
            <Check className="w-4 h-4" style={{ color: C.green }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: C.muted }}>Accent atual:</span>
            <span className="w-5 h-5 rounded-md" style={{ background: accent, border: `1px solid ${C.border}` }} />
            <span className="text-xs font-mono" style={{ color: C.muted }}>{accent}</span>
          </div>
        </div>
      )}

      {aba === "empresa" && isAdmin && (
        <AdminView mentorId={mentorId} accent={accent} onAbrirMentorado={onAbrirMentorado} />
      )}
    </div>
  )
}
