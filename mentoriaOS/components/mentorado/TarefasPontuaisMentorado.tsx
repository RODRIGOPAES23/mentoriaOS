"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { C } from "@/utils/theme"

interface Subtarefa {
  id: string
  descricao: string
  ordem: number
  status: string
  validado_por?: string
  data_validacao?: string
  observacao_validacao?: string
}

interface TarefaPontual {
  id: string
  titulo: string
  descricao?: string
  data_vencimento?: string
  status: string
  tarefas_pontuais_subtarefas: Subtarefa[]
  progresso: number
  subtarefas_validadas: number
  subtarefas_total: number
}

interface TarefasPonitaisProps {
  mentoradoId: string
}

export function TarefasPontuaisMentorado({ mentoradoId }: TarefasPonitaisProps) {
  const [tarefas, setTarefas] = useState<TarefaPontual[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { fetchTarefas() }, [mentoradoId])

  async function fetchTarefas() {
    try {
      setLoading(true)
      const response = await fetch(`/api/mentorado/${mentoradoId}/tarefas-pontuais`)
      if (!response.ok) throw new Error("Erro ao carregar tarefas")
      const data = await response.json()
      setTarefas(data.tarefas || [])
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 rounded-full" style={{ borderColor: C.amber, borderTopColor: "transparent" }} />
        <span className="ml-3" style={{ color: C.muted }}>Carregando tarefas...</span>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <AlertCircle className="w-5 h-5" style={{ color: C.amber }} />
        Tarefas Pontuais
      </h3>

      {tarefas.length === 0 ? (
        <div className="text-center py-12 rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted }}>
          <p>Nenhuma tarefa pontual no momento</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {tarefas.map((tarefa, idx) => (
              <motion.div key={tarefa.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <button onClick={() => setExpandedId(expandedId === tarefa.id ? null : tarefa.id)}
                  className="w-full text-left rounded-2xl p-4 transition-all"
                  style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{tarefa.titulo}</h4>
                      {tarefa.descricao && <p className="text-sm" style={{ color: C.muted }}>{tarefa.descricao}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 rounded-full h-2 overflow-hidden" style={{ background: C.border }}>
                      <div className="h-2 rounded-full transition-all" style={{ width: `${tarefa.progresso}%`, background: C.amber }} />
                    </div>
                    <span className="text-sm font-bold min-w-fit" style={{ color: C.amber }}>{tarefa.progresso}%</span>
                  </div>

                  <p className="text-xs mt-2" style={{ color: C.muted }}>
                    {tarefa.subtarefas_validadas}/{tarefa.subtarefas_total} subtarefas validadas
                  </p>
                </button>

                <AnimatePresence>
                  {expandedId === tarefa.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="rounded-b-2xl p-4 overflow-hidden" style={{ background: C.input, border: `1px solid ${C.border}`, borderTop: "none" }}>
                      <p className="text-sm font-semibold text-white mb-4">Subtarefas:</p>
                      <div className="space-y-2">
                        {tarefa.tarefas_pontuais_subtarefas.map((sub) => (
                          <div key={sub.id} className="flex items-start gap-3 rounded-lg p-3" style={{ background: `${C.card}80` }}>
                            {sub.status === "validado"
                              ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.green }} />
                              : <Circle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.muted }} />}
                            <div className="flex-1">
                              <p className="text-sm" style={{ color: sub.status === "validado" ? C.muted : "#fff", textDecoration: sub.status === "validado" ? "line-through" : "none" }}>
                                {sub.descricao}
                              </p>
                              {sub.status === "validado" && (
                                <p className="text-xs mt-1" style={{ color: C.green }}>
                                  ✓ Validado em {new Date(sub.data_validacao || "").toLocaleDateString("pt-BR")}
                                </p>
                              )}
                              {sub.observacao_validacao && (
                                <p className="text-xs mt-1" style={{ color: C.muted }}>{sub.observacao_validacao}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
