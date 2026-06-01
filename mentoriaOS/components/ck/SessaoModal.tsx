"use client"

import { useState } from "react"
import { X, Calendar } from "lucide-react"
import { C } from "@/utils/theme"

interface MentoradoOpt { id: string; nome: string }

interface Props {
  mentorId: string
  mentorados: MentoradoOpt[]
  mentoradoIdInicial?: string
  onClose: () => void
  onCriado: () => void
}

export default function SessaoModal({ mentorId, mentorados, mentoradoIdInicial, onClose, onCriado }: Props) {
  const [form, setForm] = useState({
    mentoradoId: mentoradoIdInicial || mentorados[0]?.id || "",
    titulo: "Sessão de Mentoria",
    data: "",
    hora: "",
    duracao_min: "60",
    link_call: "",
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.mentoradoId || !form.data || !form.hora) {
      setErro("Preencha mentorado, data e hora.")
      return
    }
    setSalvando(true)
    setErro("")
    const data_hora = new Date(`${form.data}T${form.hora}:00`).toISOString()
    const res = await fetch("/api/dashboard/sessoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentoradoId: form.mentoradoId,
        mentorId,
        titulo: form.titulo,
        data_hora,
        duracao_min: parseInt(form.duracao_min) || 60,
        link_call: form.link_call || null,
      }),
    })
    setSalvando(false)
    if (res.ok) { onCriado(); onClose() }
    else { const j = await res.json(); setErro(j.error || "Erro ao agendar") }
  }

  const inputStyle = { background: C.input, border: `1px solid ${C.border}` }
  const onFocus = (e: any) => e.target.style.borderColor = C.green
  const onBlur = (e: any) => e.target.style.borderColor = C.border

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4" style={{ background: "#00000070" }} onClick={onClose}>
      <div className="rounded-2xl shadow-2xl w-full max-w-lg" style={{ background: C.card2, border: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${C.green}18`, border: `1px solid ${C.green}33` }}>
              <Calendar className="w-5 h-5" style={{ color: C.green }} />
            </div>
            <h2 className="text-base font-semibold text-white">Agendar Sessão</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: C.muted }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={salvar} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Mentorado</label>
            <select value={form.mentoradoId} onChange={e => setForm(f => ({ ...f, mentoradoId: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all" style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
              {mentorados.map(m => <option key={m.id} value={m.id} style={{ background: C.input }}>{m.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Título</label>
            <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Data</label>
              <input type="date" required value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Hora</label>
              <input type="time" required value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Link da call (opcional)</label>
            <input type="url" placeholder="https://meet.google.com/..." value={form.link_call} onChange={e => setForm(f => ({ ...f, link_call: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none transition-all" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          {erro && <p className="text-sm rounded-lg px-3 py-2" style={{ background: `${C.red}18`, border: `1px solid ${C.red}33`, color: "#fca5a5" }}>{erro}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors" style={{ background: C.card, color: C.muted, border: `1px solid ${C.border}` }}>
              Cancelar
            </button>
            <button type="submit" disabled={salvando}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all" style={{ background: C.green, color: C.input }}>
              {salvando ? "Agendando..." : "Agendar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
