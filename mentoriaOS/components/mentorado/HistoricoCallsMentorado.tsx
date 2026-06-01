"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Calendar, FileText } from "lucide-react"

interface CallHistorico {
  id: string
  data_call: string
  titulo: string
  principal: string
  resumo_estruturado: any
  status_entrega: any
  alinhamento_pendencias: any
  transcricao: string
}

interface HistoricoCallsProps {
  mentoradoId: string
}

export function HistoricoCallsMentorado({ mentoradoId }: HistoricoCallsProps) {
  const [resumao, setResumao] = useState<any>(null)
  const [calls, setCalls] = useState<CallHistorico[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchHistorico()
  }, [mentoradoId])

  async function fetchHistorico() {
    try {
      setLoading(true)
      const response = await fetch(`/api/mentorado/${mentoradoId}/resumao`)

      if (!response.ok) throw new Error("Erro ao carregar histórico")

      const data = await response.json()
      setCalls(data.calls || [])
      setResumao(data.resumao)
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
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-slate-400">Carregando histórico...</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* RESUMÃO CONSOLIDADO */}
      {resumao && (
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 border border-purple-700">
          <h3 className="text-lg font-bold text-white mb-4">📊 Resumão das Calls</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-2">Total de Calls</p>
              <p className="text-3xl font-bold text-white">
                {resumao.total_calls}
              </p>
            </div>

            <div className="bg-green-900/30 rounded-lg p-4 border border-green-700/50">
              <p className="text-sm text-green-300 mb-2">✅ O que foi feito</p>
              <ul className="text-sm text-green-200 space-y-1">
                {resumao.o_que_foi_feito?.slice(0, 3).map((item: string, i: number) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-700/50">
              <p className="text-sm text-yellow-300 mb-2">⚠️ O que falta</p>
              <ul className="text-sm text-yellow-200 space-y-1">
                {resumao.o_que_falta?.slice(0, 3).map((item: string, i: number) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
              <p className="text-sm text-blue-300 mb-2">🎯 Próxima abordagem</p>
              <p className="text-sm text-blue-200">
                {typeof resumao.proxima_abordagem === 'string'
                  ? resumao.proxima_abordagem
                  : resumao.proxima_abordagem?.foco}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CARDS DE CALLS */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Últimas Calls ({calls.length})
        </h3>

        <div className="space-y-3">
          <AnimatePresence>
            {calls.map((call, idx) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() =>
                    setExpandedId(expandedId === call.id ? null : call.id)
                  }
                  className="w-full text-left bg-slate-800 hover:bg-slate-700 rounded-lg p-4 border border-slate-700 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-blue-400">
                          {new Date(call.data_call).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-sm text-slate-400">
                          {call.titulo}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">
                        {call.principal || "Sem resumo"}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedId === call.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* DETALHE EXPANDIDO */}
                <AnimatePresence>
                  {expandedId === call.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-slate-900 border border-t-0 border-slate-700 rounded-b-lg p-4 overflow-hidden"
                    >
                      {call.resumo_estruturado?.bullets && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-white mb-2">
                            📋 Pontos principais
                          </p>
                          <ul className="text-sm text-slate-300 space-y-1 ml-4">
                            {call.resumo_estruturado.bullets.map(
                              (b: string, i: number) => (
                                <li key={i}>• {b}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {call.status_entrega && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-green-400 mb-2">
                            ✅ Entregues
                          </p>
                          <p className="text-sm text-slate-300">
                            {typeof call.status_entrega === "string"
                              ? call.status_entrega
                              : JSON.stringify(call.status_entrega)}
                          </p>
                        </div>
                      )}

                      {call.alinhamento_pendencias && (
                        <div>
                          <p className="text-sm font-semibold text-yellow-400 mb-2">
                            ⏳ Pendências
                          </p>
                          <p className="text-sm text-slate-300">
                            {typeof call.alinhamento_pendencias === "string"
                              ? call.alinhamento_pendencias
                              : JSON.stringify(call.alinhamento_pendencias)}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {calls.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma call registrada ainda</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
