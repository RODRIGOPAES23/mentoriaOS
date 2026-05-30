"use client"

import { useState } from "react"
import { X, Calendar } from "lucide-react"

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Agendar Sessão</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={salvar} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Mentorado</label>
            <select value={form.mentoradoId} onChange={e => setForm(f => ({ ...f, mentoradoId: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
              {mentorados.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Título</label>
            <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Data</label>
              <input type="date" required value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Hora</label>
              <input type="time" required value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Link da call (opcional)</label>
            <input type="url" placeholder="https://meet.google.com/..." value={form.link_call} onChange={e => setForm(f => ({ ...f, link_call: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
          </div>

          {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{erro}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={salvando}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors">
              {salvando ? "Agendando..." : "Agendar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
