"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, AlertCircle, Loader2 } from "lucide-react"
import { C } from "@/utils/theme"

interface Subtarefa {
  id: string
  descricao: string
  ordem: number
  status: string
  observacao_validacao?: string
  data_validacao?: string
}

interface TarefaPontual {
  id: string
  titulo: string
  descricao?: string
  status: string
  tarefas_pontuais_subtarefas: Subtarefa[]
  progresso: number
  subtarefas_validadas: number
  subtarefas_total: number
}

interface Props {
  mentoradoId: string
  mentorId: string | null
}

/** Visão do MENTOR: igual à do mentorado, mas com botão de VALIDAR subtarefas. */
export default function TarefasPontuaisMentor({ mentoradoId, mentorId }: Props) {
  const [tarefas, setTarefas] = useState<TarefaPontual[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [validando, setValidando] = useState<string | null>(null)

  const buscar = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/mentorado/${mentoradoId}/tarefas-pontuais?t=${Date.now()}`)
      const j = await r.json()
      setTarefas(j.tarefas || [])
    } catch { setTarefas([]) }
    finally { setLoading(false) }
  }, [mentoradoId])

  useEffect(() => { buscar() }, [buscar])

  const validarSub = async (tarefaId: string, sub: Subtarefa) => {
    if (!mentorId) return
    setValidando(sub.id)
    const novo_status = sub.status === "validado" ? "pending" : "validado"
    await fetch(`/api/mentorado/${mentoradoId}/tarefas-pontuais/${tarefaId}/validar`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtarefa_id: sub.id, novo_status, mentor_id: mentorId }),
    })
    setValidando(null)
    buscar()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: C.amber }} />
        <span className="ml-3" style={{ color: C.muted }}>Carregando tarefas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5" style={{ color: C.amber }} />
        <h3 className="text-base font-semibold" style={{ color: C.text }}>Tarefas Pontuais</h3>
        <span className="text-[11px]" style={{ color: C.muted }}>· você valida as subtarefas concluídas</span>
      </div>

      {tarefas.length === 0 ? (
        <div className="text-center py-10 rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted }}>
          <p className="text-sm">Nenhuma tarefa pontual. Crie tarefas para este mentorado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tarefas.map(tarefa => (
            <div key={tarefa.id}>
              <button onClick={() => setExpandedId(expandedId === tarefa.id ? null : tarefa.id)}
                className="w-full text-left rounded-2xl p-4 transition-all" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="mb-3">
                  <h4 className="font-semibold mb-1" style={{ color: C.text }}>{tarefa.titulo}</h4>
                  {tarefa.descricao && <p className="text-sm" style={{ color: C.muted }}>{tarefa.descricao}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: C.border }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${tarefa.progresso}%`, background: C.amber }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: C.amber }}>{tarefa.progresso}%</span>
                </div>
                <p className="text-xs mt-2" style={{ color: C.muted }}>
                  {tarefa.subtarefas_validadas}/{tarefa.subtarefas_total} validadas
                </p>
              </button>

              <AnimatePresence>
                {expandedId === tarefa.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="rounded-b-2xl p-4 overflow-hidden" style={{ background: C.input, border: `1px solid ${C.border}`, borderTop: "none" }}>
                    <p className="text-sm font-semibold mb-3" style={{ color: C.text }}>Subtarefas:</p>
                    <div className="space-y-2">
                      {tarefa.tarefas_pontuais_subtarefas.map(sub => {
                        const validado = sub.status === "validado"
                        return (
                          <div key={sub.id} className="flex items-center gap-3 rounded-lg p-3" style={{ background: `${C.card}80` }}>
                            <button onClick={() => validarSub(tarefa.id, sub)} disabled={validando === sub.id}
                              title={validado ? "Desfazer validação" : "Validar subtarefa"}
                              className="shrink-0 transition-all hover:scale-110">
                              {validando === sub.id
                                ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: C.amber }} />
                                : validado
                                  ? <CheckCircle2 className="w-5 h-5" style={{ color: C.green }} />
                                  : <Circle className="w-5 h-5" style={{ color: C.muted }} />}
                            </button>
                            <div className="flex-1">
                              <p className="text-sm" style={{ color: validado ? C.muted : "#fff", textDecoration: validado ? "line-through" : "none" }}>
                                {sub.descricao}
                              </p>
                              {validado && sub.data_validacao && (
                                <p className="text-xs mt-0.5" style={{ color: C.green }}>
                                  ✓ Validado em {new Date(sub.data_validacao).toLocaleDateString("pt-BR")}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
