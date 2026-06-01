"use client"

import { useState } from "react"
import { CalendarDays, Columns3 } from "lucide-react"
import { C } from "@/utils/theme"
import CalendarioView from "../CalendarioView"
import KanbanCalls from "../KanbanCalls"
import type { Mentorado } from "../types"

/** Operação de calls: alterna entre a agenda clássica e a esteira Kanban de 4 estágios. */
export default function CalendarioOperacao({ mentorId, mentorados, accent, onAgendar }: {
  mentorId: string
  mentorados: Mentorado[]
  accent: string
  onAgendar: () => void
}) {
  const [modo, setModo] = useState<"agenda" | "esteira">("agenda")

  const tabs = [
    { id: "agenda" as const, label: "Agenda", icon: CalendarDays },
    { id: "esteira" as const, label: "Esteira", icon: Columns3 },
  ]

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-1 rounded-xl p-1 w-fit" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setModo(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
            style={modo === t.id ? { background: accent, color: C.input } : { color: C.muted }}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {modo === "agenda"
        ? <CalendarioView mentorId={mentorId} mentorados={mentorados} onAgendar={onAgendar} />
        : <KanbanCalls mentorId={mentorId} />}
    </div>
  )
}
