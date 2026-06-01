"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { C } from "@/utils/theme"
import type { Mentorado } from "./types"

/** Item de mentorado arrastável (DnD) na lista lateral. */
export default function SortableMentoradoItem({ m, selectedId, onClick }: {
  m: Mentorado
  selectedId: string
  onClick: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  const isSelected = selectedId === m.id
  const ini = m.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div ref={setNodeRef}
      style={{ ...style, background: isSelected ? C.green : "transparent", border: `1px solid ${isSelected ? C.green : "transparent"}` }}
      className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
      onClick={onClick}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = C.card2 }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent" }}
    >
      <div {...attributes} {...listeners} className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <GripVertical className="w-3.5 h-3.5" style={{ color: isSelected ? "#0a1628" : C.muted }} />
      </div>
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0" style={{ border: `2px solid ${isSelected ? "#ffffff33" : C.border}` }}>
        {m.foto_url
          ? <img src={m.foto_url} alt={m.nome} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ background: isSelected ? "#ffffff22" : "#0a1628" }}>{ini}</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: isSelected ? "#0a1628" : "#fff" }}>{m.nome}</p>
        <p className="text-[10px] truncate" style={{ color: isSelected ? "#0a162899" : C.muted }}>{m.nicho}</p>
      </div>
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: m.status === "Ativo" ? (isSelected ? "#0a1628" : C.green) : C.border }} />
    </div>
  )
}
