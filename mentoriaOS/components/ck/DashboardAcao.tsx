"use client"

import { useState, useEffect, memo } from "react"
import {
  AlertTriangle, DollarSign, Calendar, Users, ChevronRight, Phone,
  TrendingUp, Loader2, Sparkles
} from "lucide-react"
import { C } from "@/utils/theme"

interface AtencaoItem {
  id: string; nome: string; nicho: string; foto_url?: string
  mentor_nome: string; progresso: number; vencidas: number
  valorPendente: number; diasRestantesMentoria: number | null
  score: number; motivos: string[]
}
interface AgendaItem {
  id: string; mentorado_nome: string; data_hora: string; titulo?: string; link_call?: string; hoje: boolean
}
interface AcaoData {
  urgencias: { vencidas: number; financeiro_a_vencer: number; calls_hoje: number }
  atencao: AtencaoItem[]
  agenda: AgendaItem[]
  pulso: { total_mentorados: number; total_mentores: number; progresso_medio: number; total_pendente: number }
}

interface Props {
  mentorId: string
  accent: string
  onAbrirMentorado: (id: string) => void
  onAgendar: () => void
  onIrCalendario: () => void
}

function iniciais(n: string) { return n.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase() }
function fmtMoeda(v: number) { return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` }

function DashboardAcaoBase({ mentorId, accent, onAbrirMentorado, onAgendar, onIrCalendario }: Props) {
  const [data, setData] = useState<AcaoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/dashboard/acao?mentorId=${mentorId}&t=${Date.now()}`)
      .then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [mentorId])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: accent }} />
      <span className="ml-3" style={{ color: C.muted }}>Carregando painel...</span>
    </div>
  )
  if (!data) return null

  const { urgencias, atencao, agenda, pulso } = data
  const corScore = (s: number) => s >= 20 ? C.red : s >= 10 ? C.amber : C.blue
  const corProg = (p: number) => p >= 70 ? C.green : p >= 40 ? C.amber : C.red

  return (
    <div className="space-y-5">
      {/* ── 1. FAIXA DE URGÊNCIAS (chips acionáveis) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Tarefas vencidas", valor: String(urgencias.vencidas), cor: C.red, icon: AlertTriangle,
            sub: urgencias.vencidas > 0 ? "precisam de atenção" : "tudo em dia", onClick: () => { const el = document.getElementById("bloco-atencao"); el?.scrollIntoView({ behavior: "smooth" }) } },
          { label: "A vencer (≤3 dias)", valor: fmtMoeda(urgencias.financeiro_a_vencer), cor: C.amber, icon: DollarSign,
            sub: "pagamentos próximos", onClick: () => { const el = document.getElementById("bloco-atencao"); el?.scrollIntoView({ behavior: "smooth" }) } },
          { label: "Calls hoje", valor: String(urgencias.calls_hoje), cor: accent, icon: Calendar,
            sub: urgencias.calls_hoje > 0 ? "agendadas para hoje" : "nenhuma hoje", onClick: onIrCalendario },
        ].map((u, i) => (
          <button key={i} onClick={u.onClick}
            className="text-left rounded-2xl p-5 transition-all hover:-translate-y-0.5"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = `${u.cor}66`}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${u.cor}18`, border: `1px solid ${u.cor}30` }}>
                <u.icon className="w-4 h-4" style={{ color: u.cor }} />
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: C.muted }} />
            </div>
            <p className="text-2xl font-bold text-white">{u.valor}</p>
            <p className="text-xs mt-0.5" style={{ color: C.muted }}>{u.label}</p>
            <p className="text-[10px] mt-1" style={{ color: u.cor }}>{u.sub}</p>
          </button>
        ))}
      </div>

      {/* ── 2. PRECISA DE ATENÇÃO (lista priorizada por score) ── */}
      <div id="bloco-atencao" className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.red}18`, border: `1px solid ${C.red}30` }}>
              <AlertTriangle className="w-4 h-4" style={{ color: C.red }} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Precisa de Atenção</h3>
              <p className="text-[11px]" style={{ color: C.muted }}>Priorizado por urgência · clique para abrir o aluno</p>
            </div>
          </div>
          <span className="text-xs" style={{ color: C.muted }}>{atencao.length} aluno{atencao.length !== 1 ? "s" : ""}</span>
        </div>

        {atencao.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2" style={{ color: C.green }} />
            <p className="text-sm" style={{ color: C.muted }}>Tudo sob controle! Nenhum aluno precisa de atenção imediata. 🎉</p>
          </div>
        ) : (
          <div>
            {atencao.map(a => (
              <button key={a.id} onClick={() => onAbrirMentorado(a.id)}
                className="w-full px-6 py-3.5 flex items-center gap-4 text-left transition-colors"
                style={{ borderBottom: `1px solid ${C.border}40` }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.card2}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                {/* selo de urgência */}
                <div className="w-1.5 h-12 rounded-full shrink-0" style={{ background: corScore(a.score) }} />
                {/* avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0" style={{ border: `1px solid ${C.border}` }}>
                  {a.foto_url
                    ? <img src={a.foto_url} alt={a.nome} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: C.input, color: accent }}>{iniciais(a.nome)}</div>}
                </div>
                {/* nome + motivos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{a.nome}</p>
                    <span className="text-[10px]" style={{ color: C.muted }}>· {a.mentor_nome}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {a.motivos.map((m, i) => (
                      <span key={i} className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{ background: `${corScore(a.score)}18`, color: corScore(a.score) }}>{m}</span>
                    ))}
                  </div>
                </div>
                {/* progresso mini */}
                <div className="hidden md:flex items-center gap-2 w-24">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
                    <div className="h-full rounded-full" style={{ width: `${a.progresso}%`, background: corProg(a.progresso) }} />
                  </div>
                  <span className="text-xs font-bold w-8" style={{ color: corProg(a.progresso) }}>{a.progresso}%</span>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: C.muted }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. AGENDA ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
              <Calendar className="w-4 h-4" style={{ color: accent }} />
            </div>
            <h3 className="text-sm font-semibold text-white">Próximas Calls</h3>
          </div>
          <button onClick={onAgendar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: `${accent}18`, border: `1px solid ${accent}44`, color: accent }}>
            <Calendar className="w-3.5 h-3.5" /> Agendar
          </button>
        </div>
        {agenda.length === 0 ? (
          <p className="px-6 py-8 text-sm text-center" style={{ color: C.muted }}>Nenhuma sessão agendada.</p>
        ) : (
          <div>
            {agenda.slice(0, 5).map(s => (
              <div key={s.id} className="px-6 py-3.5 flex items-center gap-4" style={{ borderBottom: `1px solid ${C.border}40` }}>
                <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0"
                  style={{ background: s.hoje ? `${accent}20` : C.input, border: `1px solid ${s.hoje ? `${accent}44` : C.border}` }}>
                  <span className="text-[10px] font-bold" style={{ color: s.hoje ? accent : C.muted }}>
                    {new Date(s.data_hora).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{s.mentorado_nome}</p>
                  <p className="text-xs" style={{ color: C.muted }}>
                    {s.hoje && <span style={{ color: accent }}>Hoje · </span>}
                    {new Date(s.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {s.link_call && (
                  <a href={s.link_call} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: `${accent}18`, border: `1px solid ${accent}44`, color: accent }}>
                    <Phone className="w-3.5 h-3.5" /> Entrar
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. PULSO DA EMPRESA ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Mentorados", valor: String(pulso.total_mentorados), icon: Users, cor: accent },
          { label: "Mentores", valor: String(pulso.total_mentores), icon: Users, cor: C.blue },
          { label: "Progresso médio", valor: `${pulso.progresso_medio}%`, icon: TrendingUp, cor: corProg(pulso.progresso_medio) },
          { label: "Total a receber", valor: fmtMoeda(pulso.total_pendente), icon: DollarSign, cor: C.amber },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${s.cor}18`, border: `1px solid ${s.cor}30` }}>
              <s.icon className="w-4 h-4" style={{ color: s.cor }} />
            </div>
            <p className="text-xl font-bold text-white">{s.valor}</p>
            <p className="text-[11px] mt-0.5" style={{ color: C.muted }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(DashboardAcaoBase)
