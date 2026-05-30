"use client"

import { useState } from "react"
import { X, Zap, CheckCircle2, Users, Lightbulb, ListTodo, Loader2, Link2 } from "lucide-react"

interface Props {
  mentoradoId: string
  mentorId: string
  nomeMentorado: string
  onClose: () => void
  onTarefasCriadas: () => void
}

export default function AnalisarCallModal({ mentoradoId, mentorId, nomeMentorado, onClose, onTarefasCriadas }: Props) {
  const [modo, setModo] = useState<"link" | "texto">("texto")
  const [inputUrl, setInputUrl] = useState("")
  const [transcricao, setTranscricao] = useState("")
  const [analisando, setAnalisando] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [erro, setErro] = useState("")

  const analisar = async () => {
    const texto = modo === "texto" ? transcricao : `[URL: ${inputUrl}]\n\n${transcricao}`
    if (!texto.trim()) { setErro("Cole a transcrição da call antes de analisar."); return }

    setAnalisando(true)
    setErro("")
    try {
      const res = await fetch("/api/dashboard/call-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentoradoId,
          mentorId,
          transcricao: texto,
          fonte: modo === "link" ? inputUrl : "texto",
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Erro na análise")
      setResultado(json)
      onTarefasCriadas()
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setAnalisando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Analisar Call com IA</h2>
              <p className="text-xs text-slate-400">{nomeMentorado} · Extrai tarefas e compromissos automaticamente</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {!resultado ? (
            <>
              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl">
                <button onClick={() => setModo("texto")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${modo === "texto" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  Colar Transcrição
                </button>
                <button onClick={() => setModo("link")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${modo === "link" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  Link do Fathom
                </button>
              </div>

              {/* Link do Fathom */}
              {modo === "link" && (
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">URL do Fathom</label>
                  <div className="flex gap-2 mt-1.5">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="url" placeholder="https://fathom.video/share/..."
                        value={inputUrl} onChange={e => setInputUrl(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Cole também a transcrição abaixo (o Fathom requer JS para renderizar).</p>
                </div>
              )}

              {/* Transcrição */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {modo === "link" ? "Transcrição (copie do Fathom)" : "Transcrição da Call"}
                </label>
                <textarea
                  value={transcricao}
                  onChange={e => setTranscricao(e.target.value)}
                  rows={10}
                  placeholder="Cole aqui o texto completo da transcrição da call...

Exemplo:
Victor Sidoni: Olá Natasha, bem-vinda ao onboarding! Vamos começar entendendo sua situação atual...
Natasha: Oi Victor! Estou faturando em torno de R$8.000/mês mas quero chegar em R$30.000..."
                  className="w-full mt-1.5 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none font-mono leading-relaxed"
                />
                <p className="text-xs text-slate-500 mt-1">{transcricao.length} caracteres · IA analisa até 12.000</p>
              </div>

              {erro && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{erro}</p>
              )}

              <button onClick={analisar} disabled={analisando || !transcricao.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg">
                {analisando ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Analisando com IA...</>
                ) : (
                  <><Zap className="w-5 h-5" /> Analisar e Criar Tarefas</>
                )}
              </button>
            </>
          ) : (
            /* RESULTADO */
            <div className="space-y-5">
              {/* Tarefas da mentorada */}
              {resultado.analise?.tarefas_mentorado?.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ListTodo className="w-4 h-4 text-amber-400" />
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      Tarefas da {nomeMentorado} ({resultado.tarefas_criadas} criadas ✅)
                    </p>
                  </div>
                  <div className="space-y-2">
                    {resultado.analise.tarefas_mentorado.map((t: any, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                          t.prioridade === "alta" ? "bg-red-500/20 text-red-400" :
                          t.prioridade === "media" ? "bg-amber-500/20 text-amber-400" :
                          "bg-slate-500/20 text-slate-400"
                        }`}>{t.prioridade?.toUpperCase() || "—"}</span>
                        <p className="text-sm text-white">{t.texto}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compromissos da equipe */}
              {resultado.analise?.compromissos_equipe?.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-blue-400" />
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Nós prometemos (Equipe)</p>
                  </div>
                  <div className="space-y-2">
                    {resultado.analise.compromissos_equipe.map((c: any, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 flex-shrink-0">{c.responsavel}</span>
                        <p className="text-sm text-white">{c.texto}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumo */}
              {resultado.analise?.resumo && (
                <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-purple-400" />
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">Resumo da Call</p>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{resultado.analise.resumo}</p>
                </div>
              )}

              {/* Insights */}
              {resultado.analise?.insights?.length > 0 && (
                <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Insights</p>
                  <ul className="space-y-1">
                    {resultado.analise.insights.map((ins: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {ins}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setResultado(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors">
                  Nova Análise
                </button>
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors">
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
