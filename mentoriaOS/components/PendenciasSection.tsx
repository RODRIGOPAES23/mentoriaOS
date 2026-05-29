"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronDown, Plus, Trash2, AlertCircle } from "lucide-react"

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

export default function PendenciasSection({ mentoradoId, mentorId }: PendenciasSectionProps) {
  const [tarefasPending, setTarefasPending] = useState<Tarefa[]>([])
  const [tarefasCompleted, setTarefasCompleted] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedCompleted, setExpandedCompleted] = useState(false)
  const [novoTexto, setNovoTexto] = useState("")
  const [novaDataVencimento, setNovaDataVencimento] = useState("")

  // Buscar tarefas do mentorado
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

  // Buscar tarefas ao montar ou mudar mentoradoId
  useEffect(() => {
    buscarTarefas()
  }, [mentoradoId, buscarTarefas])

  // Criar nova tarefa
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

  // Marcar tarefa como completa/incompleta
  const toggleTarefa = async (tarefaId: string, novoStatus: "pending" | "completed") => {
    try {
      const res = await fetch(`/api/dashboard/tarefas/${tarefaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      })

      if (res.ok) {
        buscarTarefas()
      }
    } catch (e) {
      console.error("Erro ao atualizar tarefa:", e)
    }
  }

  // Deletar tarefa
  const deletarTarefa = async (tarefaId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta tarefa?")) return

    try {
      const res = await fetch(`/api/dashboard/tarefas/${tarefaId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        buscarTarefas()
      }
    } catch (e) {
      console.error("Erro ao deletar tarefa:", e)
    }
  }

  // Função auxiliar para formatação de data
  const formatarData = (dataStr: string | null) => {
    if (!dataStr) return ""
    const data = new Date(dataStr)
    const hoje = new Date()
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    const dataFormatada = data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })

    if (data.toDateString() === hoje.toDateString()) return "Hoje"
    if (data.toDateString() === amanha.toDateString()) return "Amanhã"
    if (data < hoje) return `Vencida: ${dataFormatada}`
    return dataFormatada
  }

  // Verificar se tarefa está vencida
  const estaVencida = (data: string | null) => {
    if (!data) return false
    const dataVencimento = new Date(data)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    dataVencimento.setHours(0, 0, 0, 0)
    return dataVencimento < hoje
  }

  // Se não houver mentorado selecionado
  if (!mentoradoId) {
    return (
      <div className="mb-6 p-4 rounded-lg bg-slate-500/10 border border-slate-600/20 backdrop-blur-md">
        <p className="text-slate-400 text-sm">Selecione um mentorado para visualizar pendências</p>
      </div>
    )
  }

  return (
    <div className="mb-6 space-y-4">
      {/* SEÇÃO DE TAREFAS PENDENTES */}
      <div className="rounded-lg bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-slate-600/30 backdrop-blur-md p-5 hover:border-slate-500/50 transition-all">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
            <h3 className="text-lg font-semibold text-white">Pendências</h3>
            {tarefasPending.length > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-gradient-to-br from-amber-500 to-orange-600 rounded-full">
                {tarefasPending.length}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">Clique para concluir</p>
        </div>

        {/* LISTA DE PENDÊNCIAS */}
        <div className="space-y-2 mb-4">
          {loading ? (
            <p className="text-slate-400 text-sm py-2">Carregando...</p>
          ) : tarefasPending.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">Nenhuma pendência! 🎉</p>
          ) : (
            tarefasPending.map((tarefa) => {
              const vencida = estaVencida(tarefa.data_vencimento)
              return (
                <div
                  key={tarefa.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-600/20 hover:bg-slate-600/40 transition-colors group"
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleTarefa(tarefa.id, "completed")}
                    className="mt-1 w-5 h-5 rounded border border-slate-500 bg-slate-700 cursor-pointer accent-green-500"
                  />

                  {/* Texto + Data */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm break-words">{tarefa.texto}</p>
                    {tarefa.data_vencimento && (
                      <div className="flex items-center gap-1 mt-1">
                        {vencida ? (
                          <>
                            <AlertCircle className="w-3 h-3 text-red-400" />
                            <span className="text-xs text-red-400">{formatarData(tarefa.data_vencimento)}</span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">{formatarData(tarefa.data_vencimento)}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Botão Deletar */}
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

        {/* FORM NOVA TAREFA */}
        <form onSubmit={criarTarefa} className="flex flex-col gap-2 pt-3 border-t border-slate-600/30">
          <input
            type="text"
            placeholder="Nova tarefa..."
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-700/50 border border-slate-600/30 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors text-sm"
          />

          <div className="flex gap-2">
            <input
              type="date"
              value={novaDataVencimento}
              onChange={(e) => setNovaDataVencimento(e.target.value)}
              className="flex-1 px-3 py-2 rounded bg-slate-700/50 border border-slate-600/30 text-white focus:outline-none focus:border-slate-500 transition-colors text-sm"
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

      {/* SEÇÃO DE COMPLETADAS */}
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
            <ChevronDown
              className={`w-4 h-4 text-green-400 transition-transform ${expandedCompleted ? "rotate-180" : ""}`}
            />
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
                    className="mt-1 w-5 h-5 rounded border border-slate-500 bg-slate-700 cursor-pointer accent-green-500"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-slate-400 text-sm line-through break-words">{tarefa.texto}</p>
                    {tarefa.data_completada && (
                      <p className="text-xs text-slate-500 mt-1">
                        ✓ Concluída em {new Date(tarefa.data_completada).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
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
