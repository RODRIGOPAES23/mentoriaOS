"use client"

import { Calendar, Clock, User } from "lucide-react"
import { motion } from "framer-motion"

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
}

export function Bloco4Calls({ calls }: Bloco4Props) {
  // Formatar calls com data e hora legíveis
  const callsFormatadas = calls?.map((call) => {
    const data = new Date(call.data_hora)
    const diasSemana = [
      "Dom",
      "Seg",
      "Ter",
      "Qua",
      "Qui",
      "Sex",
      "Sab",
    ]
    const dia = data.getDate().toString().padStart(2, "0")
    const mes = (data.getMonth() + 1).toString().padStart(2, "0")
    const hora = data.getHours().toString().padStart(2, "0")
    const min = data.getMinutes().toString().padStart(2, "0")

    return {
      ...call,
      data_formatada: `${dia}/${mes}`,
      dia_semana: diasSemana[data.getDay()],
      hora_formatada: `${hora}:${min}`,
    }
  }) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700"
    >
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-semibold text-white">Próximas Calls</h2>
      </div>

      {callsFormatadas.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p>Nenhuma call agendada próximo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {callsFormatadas.map((call) => (
            <motion.div
              key={call.id}
              whileHover={{ x: 4 }}
              className="bg-slate-700/50 hover:bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-purple-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center justify-center bg-purple-900/50 rounded px-3 py-2 min-w-fit">
                  <span className="text-sm font-bold text-purple-300">
                    {call.data_formatada}
                  </span>
                  <span className="text-xs text-purple-400">
                    {call.dia_semana}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-white">
                      {call.hora_formatada}
                    </span>
                    <span className="text-xs text-slate-400">
                      {call.titulo || "Call com mentorado"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
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
