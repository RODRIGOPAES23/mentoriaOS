"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { ListTodo, AlertTriangle, CheckCircle2, ChevronRight, Loader2 } from "lucide-react"
import { C } from "@/utils/theme"
import type { Mentorado } from "./types"

interface Tarefa {
  id: string
  texto: string
  status: string
  data_vencimento: string | null
  mentorado_id: string
  mentorado_nome?: string
}

type ColId = "afazer" | "atrasadas" | "concluidas"

const COLUNAS: { id: ColId; label: string; cor: string; icon: typeof ListTodo; hint: string }[] = [
  { id: "afazer",     label: "A fazer",    cor: C.blue,  icon: ListTodo,      hint: "Pendentes no prazo" },
  { id: "atrasadas",  label: "Atrasadas",  cor: C.red,   icon: AlertTriangle, hint: "Pendentes vencidas" },
  { id: "concluidas", label: "Concluídas", cor: C.green, icon: CheckCircle2,  hint: "Finalizadas" },
]

// Drop numa coluna define o status persistido (Atrasadas é derivada da data → também 'pending')
const STATUS_DESTINO: Record<ColId, "pending" | "completed"> = {
  afazer: "pending", atrasadas: "pending", concluidas: "completed",
}

function venceu(d: string | null): boolean {
  if (!d) return false
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const [y, mo, dd] = d.split("T")[0].split("-").map(Number)
  return new Date(y, mo - 1, dd) < hoje
}

function colunaDe(t: Tarefa): ColId {
  if (t.status === "completed") return "concluidas"
  return venceu(t.data_vencimento) ? "atrasadas" : "afazer"
}

function fmtVenc(d: string | null) {
  if (!d) return "sem prazo"
  const [y, mo, dd] = d.split("T")[0].split("-").map(Number)
  return new Date(y, mo - 1, dd).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

function CardTarefa({ t, onAbrir }: { t: Tarefa; onAbrir: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: t.id })
  const col = colunaDe(t)
  return (
    <div ref={setNodeRef}
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        opacity: isDragging ? 0.4 : 1, background: C.card2, border: `1px solid ${C.border}`,
      }}
      className="rounded-xl p-3 space-y-2">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <p className="text-sm text-white leading-snug" style={{ textDecoration: col === "concluidas" ? "line-through" : "none", opacity: col === "concluidas" ? 0.7 : 1 }}>{t.texto}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onAbrir}
          className="flex items-center gap-1 text-[11px] font-semibold rounded-lg px-2 py-0.5 transition-colors"
          style={{ background: C.input, border: `1px solid ${C.border}`, color: C.muted }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.muted}>
          {t.mentorado_nome || "—"} <ChevronRight className="w-3 h-3" />
        </button>
        <span className="ml-auto text-[11px]" style={{ color: col === "atrasadas" ? C.red : C.muted }}>{fmtVenc(t.data_vencimento)}</span>
      </div>
    </div>
  )
}

function Coluna({ col, tarefas, onAbrir }: { col: typeof COLUNAS[number]; tarefas: Tarefa[]; onAbrir: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <div ref={setNodeRef}
      className="flex-1 min-w-[240px] rounded-2xl p-3 flex flex-col"
      style={{ background: C.card, border: `1px solid ${isOver ? col.cor : C.border}`, transition: "border-color .15s" }}>
      <div className="flex items-center gap-2 mb-1 px-1">
        <col.icon className="w-4 h-4" style={{ color: col.cor }} />
        <h3 className="text-sm font-bold text-white">{col.label}</h3>
        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${col.cor}18`, color: col.cor }}>{tarefas.length}</span>
      </div>
      <p className="text-[10px] mb-3 px-1" style={{ color: C.muted }}>{col.hint}</p>
      <div className="flex-1 space-y-2 min-h-[140px]">
        {tarefas.map(t => <CardTarefa key={t.id} t={t} onAbrir={() => onAbrir(t.mentorado_id)} />)}
        {tarefas.length === 0 && <div className="h-full flex items-center justify-center text-[11px]" style={{ color: C.border }}>vazio</div>}
      </div>
    </div>
  )
}

/** Kanban GLOBAL de atividades (tarefas de todos os mentorados). Drag muda o status. */
export default function KanbanAtividades({ mentorados, onAbrirMentorado }: {
  mentorados: Mentorado[]
  onAbrirMentorado: (id: string) => void
}) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(true)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const carregar = useCallback(async () => {
    if (mentorados.length === 0) { setTarefas([]); setLoading(false); return }
    setLoading(true)
    const listas = await Promise.all(mentorados.map(m =>
      fetch(`/api/dashboard/tarefas?mentoradoId=${m.id}&status=all&t=${Date.now()}`)
        .then(r => r.json()).then(j => (j.tarefas || []).map((t: any) => ({ ...t, mentorado_id: m.id, mentorado_nome: m.nome })))
        .catch(() => [])
    ))
    setTarefas(listas.flat())
    setLoading(false)
  }, [mentorados])

  useEffect(() => { carregar() }, [carregar])

  const mudarStatus = useCallback(async (id: string, status: "pending" | "completed") => {
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    await fetch(`/api/dashboard/tarefas/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    }).catch(() => {})
  }, [])

  const onDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e
    if (!over) return
    const destino = over.id as ColId
    const t = tarefas.find(x => x.id === active.id)
    if (!t) return
    const novoStatus = STATUS_DESTINO[destino]
    if (t.status !== novoStatus) mudarStatus(String(active.id), novoStatus)
  }, [tarefas, mudarStatus])

  const porColuna = useMemo(() => {
    const map: Record<ColId, Tarefa[]> = { afazer: [], atrasadas: [], concluidas: [] }
    for (const t of tarefas) map[colunaDe(t)].push(t)
    return map
  }, [tarefas])

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: C.green }} />
    </div>
  )

  return (
    <div className="p-6">
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {COLUNAS.map(col => (
            <Coluna key={col.id} col={col} tarefas={porColuna[col.id]} onAbrir={onAbrirMentorado} />
          ))}
        </div>
      </DndContext>
    </div>
  )
}
