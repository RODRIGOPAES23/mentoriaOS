"use client"

import DonutProgress from "./DonutProgress"
import { Calendar, Clock, Target, Sparkles, CheckCircle2, Circle, ArrowRight, Video, AlertTriangle, ChevronRight } from "lucide-react"

interface Mentorado {
  id: string
  nome: string
  nicho: string
  foto_url?: string | null
  progresso: number
  pendentes: number
  vencidas: number
  statusTag: "pronto" | "pendencias" | "atencao" | "sem_dados"
  diasRestantes: number | null
  proximaSessao?: { data_hora: string; titulo: string } | null
}

interface Overview {
  proximaSessao: {
    titulo: string
    data_hora: string
    mentorado_nome: string
    mentorado_foto?: string | null
    link_call?: string | null
  } | null
  foco: {
    nome: string
    progresso: number
    meta: string
    insights: string[]
    checklist: { texto: string; done: boolean }[]
  } | null
  mentorados: Mentorado[]
}

interface Props {
  data: Overview | null
  loading: boolean
  onAbrirMentorado: (id: string) => void
  onAgendar: () => void
}

const STATUS_CFG: Record<Mentorado["statusTag"], { label: string; cls: string }> = {
  pronto:     { label: "Pronto para Sessão", cls: "bg-teal-50 text-teal-700 border-teal-200" },
  pendencias: { label: "Metas Pendentes",    cls: "bg-amber-50 text-amber-700 border-amber-200" },
  atencao:    { label: "Atenção",            cls: "bg-red-50 text-red-700 border-red-200" },
  sem_dados:  { label: "Sem dados",          cls: "bg-slate-100 text-slate-500 border-slate-200" },
}

function fmtDataHora(iso: string) {
  const d = new Date(iso)
  const dia = d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)} | ${hora} (GMT-3)`
}

function iniciais(nome: string) {
  return nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

export default function VisaoGeral({ data, loading, onAbrirMentorado, onAgendar }: Props) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse-soft" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[0,1,2].map(i => <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse-soft" />)}
        </div>
      </div>
    )
  }

  const foco = data?.foco
  const proxima = data?.proximaSessao
  const mentorados = data?.mentorados || []

  return (
    <div className="space-y-6">
      {/* ── BLOCO PRÓXIMA SESSÃO ── */}
      <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-6 sm:p-7 shadow-sm animate-fade-in-up">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-teal-600/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-teal-600/30">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-teal-400 uppercase tracking-widest mb-1">Próxima Sessão</p>
              {proxima ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{proxima.mentorado_nome}</h2>
                  <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {fmtDataHora(proxima.data_hora)}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white">Nenhuma sessão agendada</h2>
                  <p className="text-sm text-slate-400 mt-1">Agende a próxima call de mentoria.</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {proxima?.link_call && (
              <a href={proxima.link_call} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors">
                <Video className="w-4 h-4" /> Entrar
              </a>
            )}
            <button onClick={onAgendar}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors">
              Agendar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── GRID 3 COLUNAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 — Progresso da Jornada */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-fade-in-up">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Progresso da Jornada</h3>
          {foco ? (
            <>
              <div className="flex justify-center mb-5">
                <DonutProgress value={foco.progresso} label="das metas" />
              </div>
              <div className="space-y-2">
                {foco.checklist.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center">Nenhuma tarefa registrada</p>
                ) : foco.checklist.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {c.done
                      ? <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      : <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />}
                    <span className={`text-xs ${c.done ? "text-slate-400 line-through" : "text-slate-600"}`}>{c.texto}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Selecione um mentorado</p>
          )}
        </div>

        {/* Coluna 2 — Próxima Meta / Ação Urgente */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-fade-in-up flex flex-col" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <Target className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Próxima Meta</h3>
          </div>
          <div className="flex-1 flex items-center">
            {foco?.meta ? (
              <p className="text-lg font-semibold text-slate-800 leading-snug">{foco.meta}</p>
            ) : (
              <p className="text-sm text-slate-400">Defina a meta/ação urgente da semana no perfil do mentorado.</p>
            )}
          </div>
          {foco && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">Foco atual de <span className="font-semibold text-slate-700">{foco.nome}</span></p>
            </div>
          )}
        </div>

        {/* Coluna 3 — Insights da IA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-fade-in-up flex flex-col" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Insights da IA</h3>
          </div>
          {foco && foco.insights.length > 0 ? (
            <ul className="space-y-3">
              {foco.insights.slice(0, 4).map((ins, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                  <span className="text-xs text-slate-600 leading-relaxed">{ins}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Sparkles className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-xs text-slate-400">Insights aparecem após o primeiro check-in com briefing da IA.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── TABELA MENTORADOS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: "180ms" }}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Mentorados</h3>
          <span className="text-xs text-slate-400">{mentorados.length} ativos</span>
        </div>
        <div className="divide-y divide-slate-100">
          {mentorados.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-400 text-center">Nenhum mentorado ativo</p>
          ) : mentorados.map(m => {
            const st = STATUS_CFG[m.statusTag]
            return (
              <button key={m.id} onClick={() => onAbrirMentorado(m.id)}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left group">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-slate-100">
                  {m.foto_url
                    ? <img src={m.foto_url} alt={m.nome} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">{iniciais(m.nome)}</div>}
                </div>
                {/* Nome + nicho */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{m.nome}</p>
                  <p className="text-xs text-slate-500 truncate">{m.nicho}</p>
                </div>
                {/* Dias restantes */}
                {m.diasRestantes !== null && (
                  <div className="hidden sm:block text-right">
                    <p className={`text-sm font-semibold ${m.diasRestantes <= 30 ? "text-red-600" : m.diasRestantes <= 90 ? "text-amber-600" : "text-slate-700"}`}>
                      {m.diasRestantes >= 0 ? `${m.diasRestantes} dias` : "Encerrada"}
                    </p>
                    <p className="text-[10px] text-slate-400">restantes</p>
                  </div>
                )}
                {/* Progresso mini */}
                <div className="hidden md:flex items-center gap-2 w-24">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${m.progresso}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-8">{m.progresso}%</span>
                </div>
                {/* Status tag */}
                <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${st.cls}`}>
                  {m.statusTag === "atencao" && <AlertTriangle className="w-3 h-3" />}
                  {st.label}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
