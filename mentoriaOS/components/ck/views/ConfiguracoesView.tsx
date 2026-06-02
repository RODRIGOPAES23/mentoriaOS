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
  mentorDados: { foto_url?: string } | null
  perfilEdit: { nome: string; nicho_foco: string; metodo_trabalho: string; filosofia: string }
  setPerfilEdit: (fn: (p: any) => any) => void
  salvandoPerfil: boolean
  onSalvarPerfil: () => void
  onUploadFoto: (file: File, type: "mentor" | "mentorado", id: string) => void
  onAbrirMentorado: (id: string) => void
  initialTab?: Aba
}

type Aba = "geral" | "tema" | "empresa"

const inputCls = "w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all"

/** Central única de configurações. Geral = perfil do mentor (ex-"Meu Perfil"). Empresa (AdminView) vive aqui. */
export default function ConfiguracoesView({
  mentorId, accent, isAdmin, mentorNome, mentorDados, perfilEdit, setPerfilEdit,
  salvandoPerfil, onSalvarPerfil, onUploadFoto, onAbrirMentorado, initialTab = "geral",
}: Props) {
  const [aba, setAba] = useState<Aba>(initialTab)

  const abas = [
    { id: "geral" as const, label: "Meu Perfil", icon: User, show: true },
    { id: "tema" as const, label: "Tema", icon: Moon, show: true },
    { id: "empresa" as const, label: "Empresa", icon: Building2, show: isAdmin },
  ].filter(a => a.show)

  const inputStyle = { background: C.input, border: `1px solid ${C.border}` }
  const focus = (e: any) => (e.target.style.borderColor = accent)
  const blur = (e: any) => (e.target.style.borderColor = C.border)

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
          <div className="flex items-center gap-4">
            <label className="cursor-pointer shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 transition-all" style={{ borderColor: C.border }}>
                {mentorDados?.foto_url
                  ? <img src={mentorDados.foto_url} alt={mentorNome} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white" style={{ background: C.input }}>{mentorNome.slice(0, 2).toUpperCase()}</div>}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files?.[0]
                if (file) onUploadFoto(file, "mentor", mentorId)
              }} />
            </label>
            <div>
              <h3 className="font-semibold text-white">Perfil do Mentor</h3>
              <p className="text-xs" style={{ color: C.muted }}>Clique na foto para trocar</p>
            </div>
          </div>

          {[
            { k: "nome", label: "Nome", ph: mentorNome, area: false },
            { k: "nicho_foco", label: "Nicho Foco", ph: "Ex: Marketing e Tráfego", area: false },
            { k: "metodo_trabalho", label: "Método de Trabalho", ph: "Ex: 4 pilares de conversão", area: true },
            { k: "filosofia", label: "Filosofia de Mentoria", ph: "Ex: Resultado antes de escala", area: true },
          ].map(f => (
            <div key={f.k}>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{f.label}</label>
              {f.area ? (
                <textarea rows={3} value={(perfilEdit as any)[f.k]} placeholder={f.ph}
                  onChange={e => setPerfilEdit(p => ({ ...p, [f.k]: e.target.value }))}
                  className={inputCls + " resize-none leading-relaxed"} style={inputStyle} onFocus={focus} onBlur={blur} />
              ) : (
                <input value={f.k === "nome" ? (perfilEdit.nome || mentorNome) : (perfilEdit as any)[f.k]} placeholder={f.ph}
                  onChange={e => setPerfilEdit(p => ({ ...p, [f.k]: e.target.value }))}
                  className={inputCls} style={inputStyle} onFocus={focus} onBlur={blur} />
              )}
            </div>
          ))}

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
