"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronDown, Plus, Trash2, AlertCircle, Clock } from "lucide-react"
import { getRealtimeClient } from "@/lib/supabase-realtime"
import { C } from "@/utils/theme"

interface Tarefa {
  id: string
  texto: string
  status: "pending" | "completed"
  data_vencimento: string | null
  data_criacao: string
  data_completada: string | null
  mentorado_id: string
}

interface PendenciasSectionProps {
  mentoradoId: string | null
  mentorId: string | null
}

// Parse date string como data LOCAL (evita bug UTC-3 que mostrava "Vencida" para tarefas de hoje)
function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("T")[0].split("-").map(Number)
  return new Date(y, m - 1, d)
}

export default function PendenciasSection({ mentoradoId, mentorId }: PendenciasSectionProps) {
  const [tarefasPending, setTarefasPending] = useState<Tarefa[]>([])
  const [tarefasCompleted, setTarefasCompleted] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedCompleted, setExpandedCompleted] = useState(false)
  const [novoTexto, setNovoTexto] = useState("")
  const [novaDataVencimento, setNovaDataVencimento] = useState("")

  const buscarTarefas = useCallback(async () => {
    if (!mentoradoId) {
      setTarefasPending([])
      setTarefasCompleted([])
      return
    }
    setLoading(true)
    try {
      const [resPending, resCompleted] = await Promise.all([
        fetch(`/api/dashboard/tarefas?mentoradoId=${mentoradoId}&status=pending&t=${Date.now()}`),
        fetch(`/api/dashboard/tarefas?mentoradoId=${mentoradoId}&status=completed&t=${Date.now()}`),
      ])
      const dataPending = await resPending.json()
      const dataCompleted = await resCompleted.json()
      setTarefasPending(dataPending.tarefas || [])
      setTarefasCompleted(dataCompleted.tarefas || [])
    } catch (e) {
      console.error("Erro ao buscar tarefas:", e)
    } finally {
      setLoading(false)
    }
  }, [mentoradoId])

  useEffect(() => {
    buscarTarefas()
  }, [mentoradoId, buscarTarefas])

  // ── Realtime: escuta INSERT/UPDATE/DELETE em tarefas deste mentorado ──────
  useEffect(() => {
    if (!mentoradoId) return
    const supabase = getRealtimeClient()
    const channel = supabase
      .channel(`tarefas-${mentoradoId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tarefas", filter: `mentorado_id=eq.${mentoradoId}` },
        () => buscarTarefas()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [mentoradoId, buscarTarefas])

  const criarTarefa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoTexto.trim() || !mentoradoId || !mentorId) return
    try {
      const res = await fetch("/api/dashboard/tarefas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentoradoId,
          mentorId,
          texto: novoTexto.trim(),
          data_vencimento: novaDataVencimento || null,
        }),
      })
      if (res.ok) {
        setNovoTexto("")
        setNovaDataVencimento("")
        buscarTarefas()
      }
    } catch (e) {
      console.error("Erro ao criar tarefa:", e)
    }
  }

  const toggleTarefa = async (tarefaId: string, novoStatus: "pending" | "completed") => {
    try {
      const res = await fetch(`/api/dashboard/tarefas/${tarefaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      })
      if (res.ok) buscarTarefas()
    } catch (e) {
      console.error("Erro ao atualizar tarefa:", e)
    }
  }

  const deletarTarefa = async (tarefaId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta tarefa?")) return
    try {
      const res = await fetch(`/api/dashboard/tarefas/${tarefaId}`, { method: "DELETE" })
      if (res.ok) buscarTarefas()
    } catch (e) {
      console.error("Erro ao deletar tarefa:", e)
    }
  }

  // Classifica o estado do vencimento
  type StatusData = "hoje" | "amanha" | "vencida" | "futuro" | null
  const getStatusData = (dataStr: string | null): StatusData => {
    if (!dataStr) return null
    const data = parseDateLocal(dataStr)
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
    const amanha = new Date(hoje); amanha.setDate(hoje.getDate() + 1)
    data.setHours(0, 0, 0, 0)
    if (data.getTime() === hoje.getTime()) return "hoje"
    if (data.getTime() === amanha.getTime()) return "amanha"
    if (data < hoje) return "vencida"
    return "futuro"
  }

  const formatarData = (dataStr: string | null) => {
    if (!dataStr) return ""
    const data = parseDateLocal(dataStr)
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  }

  const renderBadgeData = (dataStr: string | null) => {
    const status = getStatusData(dataStr)
    if (!status) return null
    const formatted = formatarData(dataStr)

    if (status === "hoje") return (
      <div className="flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3 text-yellow-400" />
        <span className="text-xs font-bold text-yellow-400">ATENÇÃO — Hoje</span>
      </div>
    )
    if (status === "vencida") return (
      <div className="flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3 text-red-400" />
        <span className="text-xs text-red-400 font-semibold">Vencida {formatted}</span>
      </div>
    )
    if (status === "amanha") return (
      <div className="flex items-center gap-1 mt-1">
        <Clock className="w-3 h-3 text-blue-400" />
        <span className="text-xs text-blue-400">Amanhã</span>
      </div>
    )
    return (
      <span className="text-xs text-slate-400 mt-1 block">{formatted}</span>
    )
  }

  if (!mentoradoId) {
    return (
      <div className="mb-6 p-4 rounded-lg bg-slate-500/10 border border-slate-600/20 backdrop-blur-md">
        <p className="text-slate-400 text-sm">Selecione um mentorado para visualizar pendências</p>
      </div>
    )
  }

  return (
    <div className="mb-6 space-y-4">
      {/* PENDÊNCIAS */}
      <div className="rounded-lg p-5 transition-all" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
            <h3 className="text-lg font-semibold" style={{ color: C.text }}>Pendências</h3>
            {tarefasPending.length > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-gradient-to-br from-amber-500 to-orange-600 rounded-full">
                {tarefasPending.length}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">Clique para concluir</p>
        </div>

        <div className="space-y-2 mb-4">
          {loading ? (
            <p className="text-slate-400 text-sm py-2">Carregando...</p>
          ) : tarefasPending.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">Nenhuma pendência! 🎉</p>
          ) : (
            tarefasPending.map((tarefa) => {
              const status = getStatusData(tarefa.data_vencimento)
              const isVencida = status === "vencida"
              const isHoje = status === "hoje"
              return (
                <div
                  key={tarefa.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors group ${
                    isVencida ? "bg-red-500/10 border border-red-500/20" :
                    isHoje ? "bg-yellow-500/10 border border-yellow-500/20" :
                    ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleTarefa(tarefa.id, "completed")}
                    className="mt-1 w-5 h-5 rounded border border-gray-300 bg-white cursor-pointer accent-green-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm break-words" style={{ color: C.text }}>{tarefa.texto}</p>
                    {renderBadgeData(tarefa.data_vencimento)}
                  </div>
                  <button
                    onClick={() => deletarTarefa(tarefa.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20"
                    title="Deletar tarefa"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        <form onSubmit={criarTarefa} className="flex flex-col gap-2 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
          <input
            type="text"
            placeholder="Nova tarefa..."
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            className="w-full px-3 py-2 rounded focus:outline-none transition-colors text-sm" style={{ background: C.input, border: `1px solid ${C.border}`, color: C.text }}
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={novaDataVencimento}
              onChange={(e) => setNovaDataVencimento(e.target.value)}
              className="flex-1 px-3 py-2 rounded focus:outline-none transition-colors text-sm" style={{ background: C.input, border: `1px solid ${C.border}`, color: C.text }}
            />
            <button
              type="submit"
              disabled={!novoTexto.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </form>
      </div>

      {/* COMPLETADAS */}
      {tarefasCompleted.length > 0 && (
        <div className="rounded-lg bg-slate-700/20 border border-slate-600/20 backdrop-blur-md overflow-hidden">
          <button
            onClick={() => setExpandedCompleted(!expandedCompleted)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-600 rounded-full" />
              <h4 className="text-sm font-semibold text-green-400">Completadas Hoje</h4>
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-600/30 rounded-full">
                {tarefasCompleted.length}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-green-400 transition-transform ${expandedCompleted ? "rotate-180" : ""}`} />
          </button>

          {expandedCompleted && (
            <div className="px-4 pb-4 space-y-2 border-t border-slate-600/20">
              {tarefasCompleted.map((tarefa) => (
                <div
                  key={tarefa.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-600/10 hover:bg-slate-600/20 transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => toggleTarefa(tarefa.id, "pending")}
                    className="mt-1 w-5 h-5 rounded border border-gray-300 bg-white cursor-pointer accent-green-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-400 text-sm line-through break-words">{tarefa.texto}</p>
                    {tarefa.data_completada && (
                      <p className="text-xs text-slate-500 mt-1">
                        ✓ Concluída {new Date(tarefa.data_completada).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deletarTarefa(tarefa.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/20"
                    title="Deletar tarefa"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
