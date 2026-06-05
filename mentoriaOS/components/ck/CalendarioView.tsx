"use client"

import { useState, useEffect } from "react"
import { Calendar, Phone } from "lucide-react"
import { C } from "@/utils/theme"
import type { Mentorado } from "./types"

/** Calendário de sessões agendadas do mentor. */
export default function CalendarioView({ mentorId, onAgendar }: {
  mentorId: string
  mentorados?: Mentorado[]
  onAgendar: () => void
}) {
  const [sessoes, setSessoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/dashboard/sessoes?mentorId=${mentorId}&proximas=1`)
      .then(r => r.json())
      .then(j => { setSessoes(j.sessoes || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [mentorId])

  const fmtDH = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) + " · " +
      d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ color: C.text }}>Calendário de Sessões</h2>
        <button onClick={onAgendar}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all"
          style={{ background: `${C.green}18`, border: `1px solid ${C.green}44`, color: C.green }}>
          <Calendar className="w-4 h-4" /> Nova Sessão
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-semibold" style={{ color: C.text }}>Próximas sessões agendadas</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: C.muted }}>Carregando...</div>
        ) : sessoes.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: C.border }} />
            <p className="text-sm" style={{ color: C.muted }}>Nenhuma sessão agendada</p>
            <button onClick={onAgendar} className="mt-4 text-sm font-semibold hover:underline" style={{ color: C.green }}>
              Agendar primeira sessão →
            </button>
          </div>
        ) : (
          <div>
            {sessoes.map(s => (
              <div key={s.id} className="px-6 py-4 flex items-center gap-4" style={{ borderBottom: `1px solid ${C.border}40` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${C.green}18`, border: `1px solid ${C.green}30` }}>
                  <Calendar className="w-5 h-5" style={{ color: C.green }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: C.text }}>{s.mentorado_nome}</p>
                  <p className="text-xs mt-0.5 capitalize" style={{ color: C.muted }}>{fmtDH(s.data_hora)}</p>
                </div>
                {s.titulo && s.titulo !== "Sessão de Mentoria" && (
                  <span className="hidden sm:block text-xs px-2 py-1 rounded-lg" style={{ color: C.muted, background: C.bg, border: `1px solid ${C.border}` }}>{s.titulo}</span>
                )}
                {s.link_call && (
                  <a href={s.link_call} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                    style={{ background: `${C.green}18`, border: `1px solid ${C.green}44`, color: C.green }}>
                    <Phone className="w-3.5 h-3.5" /> Entrar
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
