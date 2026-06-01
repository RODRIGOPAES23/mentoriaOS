"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, AlertCircle } from "lucide-react"

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

  useEffect(() => {
    fetchTarefas()
  }, [mentoradoId])

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
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-slate-400">Carregando tarefas...</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-amber-400" />
        Tarefas Pontuais
      </h3>

      {tarefas.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-800 rounded-lg p-6">
          <p>Nenhuma tarefa pontual no momento</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {tarefas.map((tarefa, idx) => (
              <motion.div
                key={tarefa.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() =>
                    setExpandedId(expandedId === tarefa.id ? null : tarefa.id)
                  }
                  className="w-full text-left bg-slate-800 hover:bg-slate-700 rounded-lg p-4 border border-slate-700 hover:border-amber-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">
                        {tarefa.titulo}
                      </h4>
                      {tarefa.descricao && (
                        <p className="text-sm text-slate-400">
                          {tarefa.descricao}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* BARRA DE PROGRESSO */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all"
                        style={{ width: `${tarefa.progresso}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-amber-400 min-w-fit">
                      {tarefa.progresso}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    {tarefa.subtarefas_validadas}/{tarefa.subtarefas_total} subtarefas validadas
                  </p>
                </button>

                {/* DETALHE EXPANDIDO */}
                <AnimatePresence>
                  {expandedId === tarefa.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-slate-900 border border-t-0 border-slate-700 rounded-b-lg p-4 overflow-hidden"
                    >
                      <p className="text-sm font-semibold text-white mb-4">
                        Subtarefas:
                      </p>

                      <div className="space-y-2">
                        {tarefa.tarefas_pontuais_subtarefas.map(
                          (sub) => (
                            <div
                              key={sub.id}
                              className="flex items-start gap-3 bg-slate-800/50 rounded p-3"
                            >
                              {sub.status === "validado" ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                              )}

                              <div className="flex-1">
                                <p
                                  className={`text-sm ${
                                    sub.status === "validado"
                                      ? "text-slate-400 line-through"
                                      : "text-white"
                                  }`}
                                >
                                  {sub.descricao}
                                </p>

                                {sub.status === "validado" && (
                                  <p className="text-xs text-green-400 mt-1">
                                    ✓ Validado em{" "}
                                    {new Date(
                                      sub.data_validacao || ""
                                    ).toLocaleDateString("pt-BR")}
                                  </p>
                                )}

                                {sub.observacao_validacao && (
                                  <p className="text-xs text-slate-400 mt-1">
                                    {sub.observacao_validacao}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        )}
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
