"use client"

import DonutProgress from "./DonutProgress"
import { Calendar, Clock, Target, Sparkles, CheckCircle2, Circle, ArrowRight, Video, AlertTriangle, ChevronRight, TrendingUp } from "lucide-react"
import { C } from "@/utils/theme"

interface Mentorado {
  id: string; nome: string; nicho: string; foto_url?: string | null
  progresso: number; pendentes: number; vencidas: number
  statusTag: "pronto" | "pendencias" | "atencao" | "sem_dados"
  diasRestantes: number | null
  proximaSessao?: { data_hora: string; titulo: string } | null
}
interface Overview {
  proximaSessao: { titulo: string; data_hora: string; mentorado_nome: string; mentorado_foto?: string | null; link_call?: string | null } | null
  foco: { nome: string; progresso: number; meta: string; insights: string[]; checklist: { texto: string; done: boolean }[] } | null
  mentorados: Mentorado[]
}
interface Props { data: Overview | null; loading: boolean; onAbrirMentorado: (id: string) => void; onAgendar: () => void }

const STATUS_CFG: Record<Mentorado["statusTag"], { label: string; color: string; bg: string }> = {
  pronto:    { label: "Pronto para Sessão", color: C.green,  bg: `${C.green}18` },
  pendencias:{ label: "Metas Pendentes",    color: C.amber,  bg: `${C.amber}18` },
  atencao:   { label: "Atenção",            color: C.red,    bg: `${C.red}18`   },
  sem_dados: { label: "Sem dados",          color: C.muted,  bg: "#1e3a5f44"    },
}

function fmtDataHora(iso: string) {
  const d = new Date(iso)
  const dia = d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  return `${dia.charAt(0).toUpperCase() + dia.slice(1)} | ${hora} (GMT-3)`
}
function iniciais(nome: string) { return nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() }

export default function VisaoGeral({ data, loading, onAbrirMentorado, onAgendar }: Props) {
  if (loading) return (
    <div className="space-y-5">
      <div className="h-28 rounded-2xl animate-pulse-soft" style={{ background: C.card, border: `1px solid ${C.border}` }} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[0,1,2].map(i => <div key={i} className="h-56 rounded-2xl animate-pulse-soft" style={{ background: C.card, border: `1px solid ${C.border}` }} />)}
      </div>
    </div>
  )

  const foco = data?.foco
  const proxima = data?.proximaSessao
  const mentorados = data?.mentorados || []

  return (
    <div className="space-y-5">
      {/* ── PRÓXIMA SESSÃO ── */}
      <div className="relative overflow-hidden rounded-2xl p-6 animate-fade-in-up"
        style={{ background: "linear-gradient(135deg, #0f2540 0%, #0a3060 100%)", border: `1px solid ${C.border}` }}>
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full" style={{ background: `${C.green}08`, filter: "blur(40px)" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${C.green}20`, border: `1px solid ${C.green}40` }}>
              <Calendar className="w-6 h-6" style={{ color: C.green }} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.green }}>Próxima Sessão</p>
              {proxima ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{proxima.mentorado_nome}</h2>
                  <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: C.muted }}>
                    <Clock className="w-3.5 h-3.5" /> {fmtDataHora(proxima.data_hora)}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white">Nenhuma sessão agendada</h2>
                  <p className="text-sm mt-1" style={{ color: C.muted }}>Agende a próxima call de mentoria.</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {proxima?.link_call && (
              <a href={proxima.link_call} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: "#ffffff15", border: "1px solid #ffffff25" }}>
                <Video className="w-4 h-4" /> Entrar
              </a>
            )}
            <button onClick={onAgendar}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: `${C.green}20`, border: `1px solid ${C.green}40`, color: C.green }}>
              Agendar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── GRID 3 COLUNAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Progresso */}
        <div className="rounded-2xl p-6 animate-fade-in-up" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${C.blue}20`, border: `1px solid ${C.blue}30` }}>
              <TrendingUp className="w-4 h-4" style={{ color: C.blue }} />
            </div>
            <h3 className="text-sm font-semibold text-white">Progresso da Jornada</h3>
          </div>
          {foco ? (
            <>
              <div className="flex justify-center mb-5">
                <DonutProgress value={foco.progresso} label="das metas" />
              </div>
              <div className="space-y-2">
                {foco.checklist.length === 0
                  ? <p className="text-xs text-center" style={{ color: C.muted }}>Nenhuma tarefa registrada</p>
                  : foco.checklist.slice(0, 5).map((c, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {c.done
                        ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.green }} />
                        : <Circle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.border }} />}
                      <span className={`text-xs ${c.done ? "line-through" : ""}`} style={{ color: c.done ? C.muted : "#94b4cc" }}>{c.texto}</span>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: C.muted }}>Selecione um mentorado</p>
          )}
        </div>

        {/* Próxima Meta */}
        <div className="rounded-2xl p-6 animate-fade-in-up flex flex-col" style={{ background: C.card, border: `1px solid ${C.border}`, animationDelay: "60ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${C.amber}20`, border: `1px solid ${C.amber}30` }}>
              <Target className="w-4 h-4" style={{ color: C.amber }} />
            </div>
            <h3 className="text-sm font-semibold text-white">Próxima Meta</h3>
          </div>
          <div className="flex-1 flex items-center">
            {foco?.meta
              ? <p className="text-lg font-semibold text-white leading-snug">{foco.meta}</p>
              : <p className="text-sm" style={{ color: C.muted }}>Defina a meta/ação urgente da semana no perfil do mentorado.</p>}
          </div>
          {foco && (
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
              <p className="text-xs" style={{ color: C.muted }}>Foco atual de <span className="font-semibold text-white">{foco.nome}</span></p>
            </div>
          )}
        </div>

        {/* Insights IA */}
        <div className="rounded-2xl p-6 animate-fade-in-up flex flex-col" style={{ background: C.card, border: `1px solid ${C.border}`, animationDelay: "120ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#a78bfa18", border: "1px solid #a78bfa30" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#a78bfa" }} />
            </div>
            <h3 className="text-sm font-semibold text-white">Insights da IA</h3>
          </div>
          {foco && foco.insights.length > 0 ? (
            <ul className="space-y-3">
              {foco.insights.slice(0, 4).map((ins, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#a78bfa" }} />
                  <span className="text-xs leading-relaxed" style={{ color: "#94b4cc" }}>{ins}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Sparkles className="w-8 h-8 mb-2" style={{ color: C.border }} />
              <p className="text-xs" style={{ color: C.muted }}>Insights aparecem após o primeiro briefing IA do mentorado em foco.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── TABELA MENTORADOS estilo Agent Performance ── */}
      <div className="rounded-2xl overflow-hidden animate-fade-in-up" style={{ background: C.card, border: `1px solid ${C.border}`, animationDelay: "180ms" }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-semibold text-white">Mentorados</h3>
          <span className="text-xs" style={{ color: C.muted }}>{mentorados.length} ativos</span>
        </div>

        {/* Colunas header */}
        {mentorados.length > 0 && (
          <div className="px-6 py-2.5 grid grid-cols-12 gap-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: C.muted, borderBottom: `1px solid ${C.border}40` }}>
            <div className="col-span-1">#</div>
            <div className="col-span-4">Mentorado</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 hidden md:block">Progresso</div>
            <div className="col-span-2 hidden lg:block">Prazo</div>
            <div className="col-span-1"></div>
          </div>
        )}

        {/* Linhas */}
        <div>
          {mentorados.length === 0 ? (
            <p className="px-6 py-10 text-sm text-center" style={{ color: C.muted }}>Nenhum mentorado ativo</p>
          ) : mentorados.map((m, idx) => {
            const st = STATUS_CFG[m.statusTag]
            return (
              <button key={m.id} onClick={() => onAbrirMentorado(m.id)}
                className="w-full px-6 py-3.5 grid grid-cols-12 gap-3 items-center text-left group transition-all"
                style={{ borderBottom: `1px solid ${C.border}30` }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.card2}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                {/* # */}
                <div className="col-span-1 text-sm font-bold" style={{ color: C.muted }}>{idx + 1}</div>

                {/* Avatar + Nome */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1" style={{ ringColor: C.border }}>
                    {m.foto_url
                      ? <img src={m.foto_url} alt={m.nome} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: "#0a1628", color: C.green }}>{iniciais(m.nome)}</div>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{m.nome}</p>
                    <p className="text-[10px] truncate" style={{ color: C.muted }}>{m.nicho}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="col-span-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}33` }}>
                    {m.statusTag === "atencao" && <AlertTriangle className="w-2.5 h-2.5" />}
                    {st.label}
                  </span>
                </div>

                {/* Progresso */}
                <div className="col-span-2 hidden md:flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${m.progresso}%`, background: m.progresso >= 70 ? C.green : m.progresso >= 40 ? C.amber : C.red }} />
                  </div>
                  <span className="text-xs font-bold w-8" style={{ color: m.progresso >= 70 ? C.green : m.progresso >= 40 ? C.amber : C.red }}>{m.progresso}%</span>
                </div>

                {/* Prazo */}
                <div className="col-span-2 hidden lg:block">
                  {m.diasRestantes !== null ? (
                    <span className="text-sm font-semibold" style={{ color: m.diasRestantes <= 30 ? C.red : m.diasRestantes <= 90 ? C.amber : C.green }}>
                      {m.diasRestantes >= 0 ? `${m.diasRestantes}d` : "Enc."}
                    </span>
                  ) : <span style={{ color: C.muted }}>—</span>}
                </div>

                {/* Seta */}
                <div className="col-span-1 flex justify-end">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: C.muted }} />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
