"use client"

import { Calendar, Clock, User } from "lucide-react"
import { motion } from "framer-motion"
import { C } from "@/utils/theme"

interface CallItem {
  id: string
  mentorado_id: string
  data_hora: string
  titulo?: string
  mentorado_nome?: string
  status: string
}

interface Bloco4Props {
  calls: CallItem[]
  accent?: string
  onAbrirMentorado?: (id: string) => void
}

export function Bloco4Calls({ calls, accent = C.violet, onAbrirMentorado }: Bloco4Props) {
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]
  const callsFormatadas = calls?.map((call) => {
    const data = new Date(call.data_hora)
    const dia = data.getDate().toString().padStart(2, "0")
    const mes = (data.getMonth() + 1).toString().padStart(2, "0")
    const hora = data.getHours().toString().padStart(2, "0")
    const min = data.getMinutes().toString().padStart(2, "0")
    return { ...call, data_formatada: `${dia}/${mes}`, dia_semana: diasSemana[data.getDay()], hora_formatada: `${hora}:${min}` }
  }) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
          <Calendar className="w-4 h-4" style={{ color: accent }} />
        </div>
        <h2 className="text-base font-semibold" style={{ color: C.text }}>Próximas Calls</h2>
      </div>

      {callsFormatadas.length === 0 ? (
        <div className="text-center py-8" style={{ color: C.muted }}>
          <p>Nenhuma call agendada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {callsFormatadas.map((call) => (
            <motion.div key={call.id} whileHover={{ x: 4 }}
              onClick={() => onAbrirMentorado?.(call.mentorado_id)}
              title={call.mentorado_nome ? `Abrir ${call.mentorado_nome}` : undefined}
              className="rounded-xl p-3 cursor-pointer transition-colors"
              style={{ background: C.input, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center rounded-lg px-3 py-2 min-w-fit" style={{ background: `${accent}1a` }}>
                  <span className="text-sm font-bold" style={{ color: accent }}>{call.data_formatada}</span>
                  <span className="text-xs" style={{ color: `${accent}cc` }}>{call.dia_semana}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4" style={{ color: C.muted }} />
                    <span className="font-semibold" style={{ color: C.text }}>{call.hora_formatada}</span>
                    <span className="text-xs" style={{ color: C.muted }}>{call.titulo || "Call com mentorado"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: C.muted }}>
                    <User className="w-4 h-4" />
                    {call.mentorado_nome}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
