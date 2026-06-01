"use client"

import { useEffect, useState, useCallback } from "react"
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { Calendar, Phone, Sparkles, CheckCircle2, ArrowRight, Clock } from "lucide-react"
import { C } from "@/utils/theme"

interface Sessao {
  id: string
  titulo: string | null
  data_hora: string
  status: string
  link_call: string | null
  mentorado_id: string
  mentorado_nome?: string
}

type ColId = "agendada" | "realizada" | "em_analise" | "concluida"

const COLUNAS: { id: ColId; label: string; cor: string; icon: typeof Calendar; hint: string }[] = [
  { id: "agendada",   label: "Agendadas",    cor: C.blue,   icon: Calendar,    hint: "Link liberado 15min antes" },
  { id: "realizada",  label: "Realizadas",   cor: C.amber,  icon: Clock,       hint: "Aguardando notas/validação" },
  { id: "em_analise", label: "Em Análise IA", cor: C.violet, icon: Sparkles,    hint: "Transcrição na IA" },
  { id: "concluida",  label: "Concluídas",   cor: C.green,  icon: CheckCircle2, hint: "Briefing acoplado" },
]

const PROXIMO: Record<ColId, ColId | null> = {
  agendada: "realizada", realizada: "em_analise", em_analise: "concluida", concluida: null,
}

function normalizaStatus(s: string): ColId {
  if (s === "realizada" || s === "em_analise" || s === "concluida") return s
  return "agendada"
}

function fmtDH(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " · " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function linkLiberado(iso: string) {
  return Date.now() >= new Date(iso).getTime() - 15 * 60 * 1000
}

function CardSessao({ s, onAvancar }: { s: Sessao; onAvancar: (s: Sessao) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: s.id })
  const col = normalizaStatus(s.status)
  const prox = PROXIMO[col]
  const liberado = col === "agendada" && s.link_call && linkLiberado(s.data_hora)
  return (
    <div ref={setNodeRef}
      style={{
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        opacity: isDragging ? 0.4 : 1, background: C.card2, border: `1px solid ${C.border}`,
      }}
      className="rounded-xl p-3 space-y-2">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <p className="text-sm font-semibold text-white truncate">{s.mentorado_nome || "—"}</p>
        <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>{fmtDH(s.data_hora)}</p>
        {s.titulo && s.titulo !== "Sessão de Mentoria" && (
          <p className="text-[11px] truncate" style={{ color: C.muted }}>{s.titulo}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {col === "agendada" && (
          liberado
            ? <a href={s.link_call!} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg"
                style={{ background: `${C.green}18`, border: `1px solid ${C.green}44`, color: C.green }}>
                <Phone className="w-3 h-3" /> Entrar
              </a>
            : <span className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-lg" style={{ color: C.muted, border: `1px solid ${C.border}` }}>
                <Clock className="w-3 h-3" /> {s.link_call ? "15min antes" : "sem link"}
              </span>
        )}
        {prox && (
          <button onClick={() => onAvancar(s)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg ml-auto transition-all"
            style={{ background: C.input, border: `1px solid ${C.border}`, color: C.muted }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.muted}>
            avançar <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

function Coluna({ col, sessoes, onAvancar }: { col: typeof COLUNAS[number]; sessoes: Sessao[]; onAvancar: (s: Sessao) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <div ref={setNodeRef}
      className="flex-1 min-w-[220px] rounded-2xl p-3 flex flex-col"
      style={{ background: C.card, border: `1px solid ${isOver ? col.cor : C.border}`, transition: "border-color .15s" }}>
      <div className="flex items-center gap-2 mb-1 px-1">
        <col.icon className="w-4 h-4" style={{ color: col.cor }} />
        <h3 className="text-sm font-bold text-white">{col.label}</h3>
        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${col.cor}18`, color: col.cor }}>{sessoes.length}</span>
      </div>
      <p className="text-[10px] mb-3 px-1" style={{ color: C.muted }}>{col.hint}</p>
      <div className="flex-1 space-y-2 min-h-[120px]">
        {sessoes.map(s => <CardSessao key={s.id} s={s} onAvancar={onAvancar} />)}
        {sessoes.length === 0 && <div className="h-full flex items-center justify-center text-[11px]" style={{ color: C.border }}>vazio</div>}
      </div>
    </div>
  )
}

/** Esteira operacional de calls em 4 estágios. Drag entre colunas (ou botão "avançar") muda o status. */
export default function KanbanCalls({ mentorId }: { mentorId: string }) {
  const [sessoes, setSessoes] = useState<Sessao[]>([])
  const [loading, setLoading] = useState(true)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const carregar = useCallback(() => {
    fetch(`/api/dashboard/sessoes?mentorId=${mentorId}&t=${Date.now()}`)
      .then(r => r.json())
      .then(j => { setSessoes(j.sessoes || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [mentorId])

  useEffect(() => { carregar() }, [carregar])

  const mudarStatus = useCallback(async (id: string, status: ColId) => {
    setSessoes(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    await fetch(`/api/dashboard/sessoes/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    }).catch(() => {})
  }, [])

  const onDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e
    if (!over) return
    const destino = over.id as ColId
    const sessao = sessoes.find(s => s.id === active.id)
    if (sessao && normalizaStatus(sessao.status) !== destino) mudarStatus(String(active.id), destino)
  }, [sessoes, mudarStatus])

  const avancar = useCallback((s: Sessao) => {
    const prox = PROXIMO[normalizaStatus(s.status)]
    if (prox) mudarStatus(s.id, prox)
  }, [mudarStatus])

  if (loading) return <div className="p-8 text-center text-sm" style={{ color: C.muted }}>Carregando esteira...</div>

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUNAS.map(col => (
          <Coluna key={col.id} col={col}
            sessoes={sessoes.filter(s => normalizaStatus(s.status) === col.id)}
            onAvancar={avancar} />
        ))}
      </div>
    </DndContext>
  )
}
