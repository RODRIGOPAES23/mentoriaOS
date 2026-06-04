"use client"

import { useState } from "react"
import { User, Moon, Building2, Check, ShieldCheck, Download, Loader2 } from "lucide-react"
import { C } from "@/utils/theme"
import AdminView from "../AdminView"

interface Props {
  mentorId: string
  accent: string
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

type Aba = "geral" | "tema" | "empresa" | "lgpd"

const inputCls = "w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all"

/** Central única de configurações. Geral = perfil do mentor (ex-"Meu Perfil"). Empresa (AdminView) vive aqui. */
export default function ConfiguracoesView({
  mentorId, accent, mentorNome, mentorDados, perfilEdit, setPerfilEdit,
  salvandoPerfil, onSalvarPerfil, onUploadFoto, onAbrirMentorado, initialTab = "geral",
}: Props) {
  const [aba, setAba] = useState<Aba>(initialTab)

  const abas = [
    { id: "geral" as const, label: "Meu Perfil", icon: User },
    { id: "tema" as const, label: "Tema", icon: Moon },
    { id: "empresa" as const, label: "Empresa", icon: Building2 },
    { id: "lgpd" as const, label: "Dados", icon: ShieldCheck },
  ]

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

      {aba === "empresa" && (
        <AdminView mentorId={mentorId} accent={accent} onAbrirMentorado={onAbrirMentorado} />
      )}

      {aba === "lgpd" && (
        <LgpdView mentorId={mentorId} accent={accent} />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA DADOS & LGPD — exportar dados do mentor
// ─────────────────────────────────────────────────────────────────────────────
function LgpdView({ mentorId, accent }: { mentorId: string; accent: string }) {
  const [exportando, setExportando] = useState(false)
  const [msg, setMsg] = useState("")
  const C2 = { card: "#0f2540", input: "#0c1c2c", border: "#1e3a5f", muted: "#4d7fa8", blue: "#4c9aff", green: "#00d68f" }

  const exportar = async () => {
    setExportando(true); setMsg("")
    try {
      const res = await fetch(`/api/lgpd/exportar?mentorId=${mentorId}`)
      if (!res.ok) { setMsg("Erro ao exportar."); return }
      const blob = await res.blob()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `dados-mentor-${new Date().toISOString().slice(0,10)}.json`
      a.click()
    } catch { setMsg("Erro ao exportar.") }
    finally { setExportando(false) }
  }

  return (
    <div className="max-w-lg space-y-5">
      <div className="rounded-2xl p-6 space-y-4" style={{ background: C2.card, border: `1px solid ${C2.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${C2.green}18`, border: `1px solid ${C2.green}33` }}>
            <ShieldCheck className="w-5 h-5" style={{ color: C2.green }} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Proteção de dados (LGPD)</h3>
            <p className="text-xs mt-0.5" style={{ color: C2.muted }}>Lei 13.709/2018 · Seus direitos como titular</p>
          </div>
        </div>

        <div className="text-xs space-y-2 leading-relaxed" style={{ color: C2.muted }}>
          <p>Os dados da sua conta (nome, e-mail, metodologia) e o registro dos seus mentorados são tratados pela CKlareza exclusivamente para a prestação do serviço de gestão de mentoria.</p>
          <p>Você é o <strong className="text-white">controlador dos dados dos seus mentorados</strong> perante a LGPD — e nós somos o operador. Cada mentorado também pode exportar e anonimizar os próprios dados pelo portal.</p>
        </div>

        {msg && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: `${C2.green}12`, border: `1px solid ${C2.green}33`, color: C2.green }}>{msg}</p>}

        <button onClick={exportar} disabled={exportando}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
          style={{ background: `${C2.blue}18`, border: `1px solid ${C2.blue}44`, color: C2.blue }}>
          {exportando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Exportar meus dados (JSON)
        </button>

        <div className="text-xs rounded-xl px-4 py-3 space-y-1" style={{ background: C2.input, border: `1px solid ${C2.border}` }}>
          <p className="font-semibold text-white">Solicitar exclusão da conta</p>
          <p style={{ color: C2.muted }}>Envie um e-mail para <strong className="text-white">contactus@cklareza.com</strong> com o assunto <strong className="text-white">"[LGPD] Exclusão de conta"</strong>. Responderemos em até 15 dias úteis.</p>
        </div>

        <a href="/privacidade" target="_blank" rel="noopener" className="block text-center text-xs underline" style={{ color: C2.muted }}>
          Ver política de privacidade completa
        </a>
      </div>
    </div>
  )
}
