"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Calendar, FileText } from "lucide-react"
import { C } from "@/utils/theme"

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

  useEffect(() => { fetchHistorico() }, [mentoradoId])

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
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 rounded-full" style={{ borderColor: C.blue, borderTopColor: "transparent" }} />
        <span className="ml-3" style={{ color: C.muted }}>Carregando histórico...</span>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* RESUMÃO CONSOLIDADO */}
      {resumao && (
        <div className="rounded-2xl p-6" style={{ background: `linear-gradient(135deg, ${C.card} 0%, ${C.violet}18 100%)`, border: `1px solid ${C.border}` }}>
          <h3 className="text-lg font-bold text-white mb-4">📊 Resumão das Calls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ background: C.input }}>
              <p className="text-sm mb-2" style={{ color: C.muted }}>Total de Calls</p>
              <p className="text-3xl font-bold text-white">{resumao.total_calls}</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: `${C.green}10`, border: `1px solid ${C.green}33` }}>
              <p className="text-sm mb-2" style={{ color: C.green }}>✅ O que foi feito</p>
              <ul className="text-sm space-y-1" style={{ color: "#a7f3d0" }}>
                {resumao.o_que_foi_feito?.slice(0, 3).map((item: string, i: number) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
            <div className="rounded-xl p-4" style={{ background: `${C.amber}10`, border: `1px solid ${C.amber}33` }}>
              <p className="text-sm mb-2" style={{ color: C.amber }}>⚠️ O que falta</p>
              <ul className="text-sm space-y-1" style={{ color: "#fde68a" }}>
                {resumao.o_que_falta?.slice(0, 3).map((item: string, i: number) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
            <div className="rounded-xl p-4" style={{ background: `${C.blue}10`, border: `1px solid ${C.blue}33` }}>
              <p className="text-sm mb-2" style={{ color: C.blue }}>🎯 Próxima abordagem</p>
              <p className="text-sm" style={{ color: "#bfdbfe" }}>
                {typeof resumao.proxima_abordagem === "string" ? resumao.proxima_abordagem : resumao.proxima_abordagem?.foco}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CARDS DE CALLS */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{ color: C.blue }} />
          Últimas Calls ({calls.length})
        </h3>

        <div className="space-y-3">
          <AnimatePresence>
            {calls.map((call, idx) => (
              <motion.div key={call.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <button onClick={() => setExpandedId(expandedId === call.id ? null : call.id)}
                  className="w-full text-left rounded-2xl p-4 transition-all"
                  style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold" style={{ color: C.blue }}>
                          {new Date(call.data_call).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-sm" style={{ color: C.muted }}>{call.titulo}</span>
                      </div>
                      <p className="text-sm" style={{ color: "#94b4cc" }}>{call.principal || "Sem resumo"}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedId === call.id ? "rotate-180" : ""}`} style={{ color: C.muted }} />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === call.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="rounded-b-2xl p-4 overflow-hidden" style={{ background: C.input, border: `1px solid ${C.border}`, borderTop: "none" }}>
                      {call.resumo_estruturado?.bullets && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-white mb-2">📋 Pontos principais</p>
                          <ul className="text-sm space-y-1 ml-4" style={{ color: "#94b4cc" }}>
                            {call.resumo_estruturado.bullets.map((b: string, i: number) => <li key={i}>• {b}</li>)}
                          </ul>
                        </div>
                      )}
                      {call.status_entrega && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold mb-2" style={{ color: C.green }}>✅ Entregues</p>
                          <p className="text-sm" style={{ color: "#94b4cc" }}>
                            {typeof call.status_entrega === "string" ? call.status_entrega : JSON.stringify(call.status_entrega)}
                          </p>
                        </div>
                      )}
                      {call.alinhamento_pendencias && (
                        <div>
                          <p className="text-sm font-semibold mb-2" style={{ color: C.amber }}>⏳ Pendências</p>
                          <p className="text-sm" style={{ color: "#94b4cc" }}>
                            {typeof call.alinhamento_pendencias === "string" ? call.alinhamento_pendencias : JSON.stringify(call.alinhamento_pendencias)}
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
          <div className="text-center py-12" style={{ color: C.muted }}>
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma call registrada ainda</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
