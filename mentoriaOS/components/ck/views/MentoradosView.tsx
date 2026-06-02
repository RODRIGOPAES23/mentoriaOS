"use client"

import { useState } from "react"
import {
  Search, UserPlus, Target, BarChart3, TrendingUp, BookOpen, CheckCircle2, Briefcase,
  DollarSign, MessageCircle, Phone, Sparkles, Zap, Link2, Check, RefreshCw, Calendar, History,
  ChevronDown, Users, Pencil, Trash2,
} from "lucide-react"
import type { CheckinRow } from "@/lib/supabase"
import { C } from "@/utils/theme"
import type { Mentorado, BriefingIA } from "../types"
import AvisoPagamento from "../AvisoPagamento"
import BadgeVariacao from "../BadgeVariacao"
import CountdownDias from "../CountdownDias"
import PendenciasSection from "../PendenciasSection"
import FinanceiroSection from "../FinanceiroSection"
import ChatMentor from "../ChatMentor"
import MaterialEntregas from "@/components/mentor/MaterialEntregas"
import TarefasPontuaisMentor from "@/components/mentor/TarefasPontuaisMentor"

function variacao(historico: CheckinRow[], campo: keyof CheckinRow): number | null {
  if (!historico || historico.length < 2) return null
  const atual = Number(historico[0][campo]) || 0
  const anterior = Number(historico[1][campo]) || 0
  if (anterior === 0) return atual > 0 ? 100 : null
  return ((atual - anterior) / anterior) * 100
}

type ActiveTab = "pendencias" | "financeiro" | "calls" | "chat" | "materiais"

interface Props {
  filtered: Mentorado[]
  selectedId: string
  onSelect: (id: string) => void
  filtroSidebar: string
  setFiltroSidebar: (v: string) => void
  onNovoMentorado: () => void
  selected?: Mentorado
  checkin: CheckinRow | null
  historico: CheckinRow[]
  briefing: BriefingIA | null
  mentorId: string | null
  activeTab: ActiveTab
  setActiveTab: (t: ActiveTab) => void
  tarefasVencidas: number
  atualizando: boolean
  linkCopiado: boolean
  briefingLoading: boolean
  accent: string
  onUploadFoto: (file: File, type: "mentor" | "mentorado", id: string) => void
  onCopiarLink: () => void
  onAtualizarCheckin: () => void
  onAgendarSessao: () => void
  onIniciarChamada: () => void
  onGerarBriefing: () => void
  onAnalisarCall: () => void
  onEditarCadastro: () => void
  onHistorico: () => void
  onExcluir: () => void
}

function iniciais(nome: string) {
  return nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

/** View Mentorados: SELETOR (dropdown) no topo + prontuário do aluno em largura total. */
export default function MentoradosView({
  filtered, selectedId, onSelect, filtroSidebar, setFiltroSidebar, onNovoMentorado,
  selected, checkin, historico, briefing, mentorId,
  activeTab, setActiveTab, tarefasVencidas, atualizando, linkCopiado, briefingLoading, accent,
  onUploadFoto, onCopiarLink, onAtualizarCheckin, onAgendarSessao, onIniciarChamada, onGerarBriefing, onAnalisarCall,
  onEditarCadastro, onHistorico, onExcluir,
}: Props) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* ── SELETOR (dropdown) ── */}
      <div className="shrink-0 px-6 py-3 flex items-center gap-3" style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div className="relative flex-1 max-w-md">
          <button onClick={() => setAberto(o => !o)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
            style={{ background: C.input, border: `1px solid ${aberto ? accent : C.border}` }}>
            {selected ? (
              <>
                <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0" style={{ border: `1px solid ${C.border}` }}>
                  {selected.foto_url
                    ? <img src={selected.foto_url} alt={selected.nome} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: C.card2 }}>{iniciais(selected.nome)}</div>}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-white truncate">{selected.nome}</p>
                  <p className="text-[10px] truncate" style={{ color: C.muted }}>{selected.nicho}</p>
                </div>
              </>
            ) : (
              <span className="flex-1 text-left text-sm" style={{ color: C.muted }}>Selecionar mentorado…</span>
            )}
            <ChevronDown className="w-4 h-4 shrink-0 transition-transform" style={{ color: C.muted, transform: aberto ? "rotate(180deg)" : "none" }} />
          </button>

          {aberto && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
              <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl shadow-2xl overflow-hidden" style={{ background: C.card2, border: `1px solid ${C.border}` }}>
                <div className="p-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.muted }} />
                    <input autoFocus value={filtroSidebar} onChange={e => setFiltroSidebar(e.target.value)}
                      placeholder="Buscar mentorado..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none"
                      style={{ background: C.input, border: `1px solid ${C.border}` }}
                      onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = C.border} />
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto p-1.5">
                  {filtered.length === 0 ? (
                    <p className="text-xs text-center py-4" style={{ color: C.muted }}>Nenhum mentorado</p>
                  ) : filtered.map(m => {
                    const sel = m.id === selectedId
                    return (
                      <button key={m.id} onClick={() => { onSelect(m.id); setAberto(false) }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors"
                        style={{ background: sel ? accent : "transparent" }}
                        onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = C.input }}
                        onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = "transparent" }}>
                        <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0" style={{ border: `1px solid ${C.border}` }}>
                          {m.foto_url
                            ? <img src={m.foto_url} alt={m.nome} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: C.input }}>{iniciais(m.nome)}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: sel ? C.input : "#fff" }}>{m.nome}</p>
                          <p className="text-[10px] truncate" style={{ color: sel ? "#0a162899" : C.muted }}>{m.nicho}</p>
                        </div>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.status === "Ativo" ? (sel ? C.input : C.green) : C.border }} />
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <button onClick={onNovoMentorado}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all shrink-0"
          style={{ background: `${accent}18`, border: `1px solid ${accent}44`, color: accent }}>
          <UserPlus className="w-4 h-4" /> Novo Mentorado
        </button>
      </div>

      {/* ── DETALHE (largura total) ── */}
      <div className="flex-1 overflow-y-auto p-6" style={{ background: C.bg }}>
        {!selected ? (
          <div className="h-full flex items-center justify-center" style={{ color: C.muted }}>
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-3" style={{ color: C.border }} />
              <p className="text-sm">Selecione um mentorado no topo</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5 max-w-6xl mx-auto">
            <AvisoPagamento key={`aviso-${selectedId}`} mentoradoId={selectedId} onIrFinanceiro={() => setActiveTab("financeiro")} />

            {/* Info Card */}
            <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex items-start gap-5">
                <label className="cursor-pointer">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-slate-200 hover:ring-teal-500 transition-all">
                    {selected.foto_url
                      ? <img src={selected.foto_url} alt={selected.nome} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-slate-900 flex items-center justify-center text-xl font-bold text-white">
                          {iniciais(selected.nome)}
                        </div>}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) onUploadFoto(file, "mentorado", selected.id)
                  }} />
                </label>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-xl font-bold text-white">{selected.nome}</h1>
                      <p className="text-sm mt-0.5" style={{ color: C.muted }}>{selected.nicho}</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-bold rounded-full shrink-0" style={{ background: `${C.green}18`, border: `1px solid ${C.green}44`, color: C.green }}>
                      {selected.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs" style={{ color: C.muted }}>
                    {selected.instagram_handle && (
                      <a href={`https://instagram.com/${selected.instagram_handle.replace("@", "")}`} target="_blank" rel="noreferrer"
                        className="hover:underline" style={{ color: C.blue }}>
                        @{selected.instagram_handle.replace("@", "")}
                      </a>
                    )}
                    <span>📅 Início: <span className="text-white font-medium">{selected.data_inicio}</span></span>
                    {selected.data_fim && (
                      <span>🏁 Término: <span className="text-white font-medium">{selected.data_fim}</span> · <CountdownDias dataFim={selected.data_fim} /></span>
                    )}
                    {selected.cidade && <span>📍 <span className="text-white font-medium">{selected.cidade}</span></span>}
                    <span>🎯 <span className="text-white font-medium">{selected.foco_macro}</span></span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1 text-xs" style={{ color: C.muted }}>
                    <span>📞 Última call: <span className="text-white font-medium">{selected.data_ultima_call ? new Date(selected.data_ultima_call).toLocaleDateString("pt-BR") : "—"}</span></span>
                    <span>⏭️ Próxima call: <span className="font-medium" style={{ color: selected.data_proxima_call ? C.green : C.muted }}>{selected.data_proxima_call ? new Date(selected.data_proxima_call).toLocaleDateString("pt-BR") + " " + new Date(selected.data_proxima_call).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "não agendada"}</span></span>
                  </div>
                  {(selected.expectativa_30_dias || selected.expectativa_90_dias) && (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {selected.expectativa_30_dias && (
                        <div className="flex-1 min-w-[180px] rounded-lg px-3 py-2" style={{ background: C.input, border: `1px solid ${C.border}` }}>
                          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: C.amber }}>Meta 30 dias</p>
                          <p className="text-xs text-white mt-0.5">{selected.expectativa_30_dias}</p>
                        </div>
                      )}
                      {selected.expectativa_90_dias && (
                        <div className="flex-1 min-w-[180px] rounded-lg px-3 py-2" style={{ background: C.input, border: `1px solid ${C.border}` }}>
                          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: C.green }}>Meta 90 dias</p>
                          <p className="text-xs text-white mt-0.5">{selected.expectativa_90_dias}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {(selected.faturamento_atual || selected.meta_faturamento) && (
                    <div className="flex gap-4 mt-2">
                      {selected.faturamento_atual && (
                        <span className="text-xs" style={{ color: C.muted }}>💰 Atual: <span className="font-bold" style={{ color: C.green }}>R$ {Number(selected.faturamento_atual).toLocaleString("pt-BR")}</span></span>
                      )}
                      {selected.meta_faturamento && (
                        <span className="text-xs" style={{ color: C.muted }}>🚀 Meta: <span className="font-bold" style={{ color: C.blue }}>R$ {Number(selected.meta_faturamento).toLocaleString("pt-BR")}</span></span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-5 pt-5" style={{ borderTop: `1px solid ${C.border}` }}>
                <button onClick={onIniciarChamada}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all"
                  style={{ background: accent, color: C.input }}>
                  <Phone className="w-3.5 h-3.5" /> Iniciar Chamada
                </button>
                {[
                  { icon: Pencil, label: "Editar cadastro", onClick: onEditarCadastro, color: C.violet },
                  { icon: History, label: "Histórico", onClick: onHistorico, color: C.muted },
                  { icon: linkCopiado ? Check : Link2, label: linkCopiado ? "Copiado!" : "Copiar Convite", onClick: onCopiarLink, color: C.muted },
                  { icon: RefreshCw, label: "Atualizar", onClick: onAtualizarCheckin, color: C.muted },
                  { icon: Calendar, label: "Agendar Sessão", onClick: onAgendarSessao, color: C.blue },
                  { icon: Trash2, label: "Excluir", onClick: onExcluir, color: C.red },
                ].map(btn => (
                  <button key={btn.label} onClick={btn.onClick}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all"
                    style={{ background: `${btn.color}15`, border: `1px solid ${btn.color}33`, color: btn.color }}>
                    <btn.icon className={`w-3.5 h-3.5 ${btn.label === "Atualizar" && atualizando ? "animate-spin" : ""}`} />
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Métricas */}
            {checkin && (
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {([
                  { key: "leads_gerados",        label: "Leads Gerados",   valor: checkin.leads_gerados,        prefixo: "",   icon: Target,    cor: C.green  },
                  { key: "vendas_reais",         label: "Vendas Reais",    valor: checkin.vendas_reais,         prefixo: "R$", icon: BarChart3, cor: C.blue   },
                  { key: "investimento_trafego", label: "Investimento",    valor: checkin.investimento_trafego, prefixo: "R$", icon: TrendingUp, cor: C.amber  },
                  { key: "videos_postados",      label: "Vídeos Postados", valor: checkin.videos_postados,      prefixo: "",   icon: BookOpen,  cor: C.violet },
                ] as any[]).map(card => {
                  const pct = variacao(historico, card.key)
                  const Icon = card.icon
                  return (
                    <button key={card.key} onClick={onAtualizarCheckin}
                      title={`Ver histórico de ${card.label}`}
                      className="text-left rounded-2xl p-5 transition-all hover:-translate-y-0.5"
                      style={{ background: C.card, border: `1px solid ${C.border}` }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = `${card.cor}66`}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.cor}18`, border: `1px solid ${card.cor}30` }}>
                          <Icon className="w-4 h-4" style={{ color: card.cor }} />
                        </div>
                        <History className="w-3.5 h-3.5" style={{ color: C.muted }} />
                      </div>
                      <p className="text-2xl font-bold text-white">{card.prefixo}{card.valor?.toLocaleString("pt-BR")}</p>
                      <p className="text-xs mt-0.5 mb-2" style={{ color: C.muted }}>{card.label}</p>
                      <BadgeVariacao pct={pct} />
                    </button>
                  )
                })}
              </div>
            )}

            {/* Briefing IA */}
            {checkin && (
              <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.violet}18`, border: `1px solid ${C.violet}30` }}>
                      <Sparkles className="w-4 h-4" style={{ color: C.violet }} />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Briefing da IA</h3>
                  </div>
                  <button onClick={onGerarBriefing} disabled={briefingLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg disabled:opacity-50 transition-all"
                    style={{ background: `${C.violet}18`, border: `1px solid ${C.violet}33`, color: C.violet }}>
                    <Zap className={`w-3.5 h-3.5 ${briefingLoading ? "animate-pulse" : ""}`} />
                    {briefingLoading ? "Gerando..." : "Gerar com IA"}
                  </button>
                </div>

                {briefing ? (
                  <div className="space-y-5">
                    <div className="rounded-xl p-4" style={{ background: C.input }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: C.muted }}>📊 Diagnóstico</p>
                      <p className="text-sm leading-relaxed" style={{ color: "#94b4cc" }}>{briefing.diagnostico}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.muted }}>🎯 Pauta da Call</p>
                      <ol className="space-y-2">
                        {briefing.pauta.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5" style={{ background: C.green }}>{i + 1}</span>
                            <p className="text-sm" style={{ color: "#94b4cc" }}>{item}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-center py-6" style={{ color: C.muted }}>
                    Clique em &apos;Gerar com IA&apos; para criar o briefing desta sessão.
                  </p>
                )}
              </div>
            )}

            {/* Tabs */}
            <div>
              <div className="flex gap-1 rounded-xl p-1 mb-4" style={{ background: C.card }}>
                {([
                  { id: "pendencias", label: "Pendências", icon: CheckCircle2 },
                  { id: "materiais", label: "Tarefas & Materiais", icon: Briefcase },
                  { id: "financeiro", label: "Financeiro", icon: DollarSign },
                  { id: "chat", label: "Chat", icon: MessageCircle },
                  { id: "calls", label: "Análise de Call", icon: Phone },
                ] as const).map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
                    style={activeTab === tab.id
                      ? { background: accent, color: C.input, border: `1px solid ${accent}` }
                      : { color: C.muted }}>
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.id === "pendencias" && tarefasVencidas > 0 && (
                      <span className="w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center" style={{ background: C.red }}>{tarefasVencidas}</span>
                    )}
                  </button>
                ))}
              </div>

              {activeTab === "pendencias" && <PendenciasSection key={selectedId} mentoradoId={selectedId} mentorId={mentorId} />}
              {activeTab === "materiais" && (
                <div className="space-y-6">
                  <TarefasPontuaisMentor key={`tp-${selectedId}`} mentoradoId={selectedId} mentorId={mentorId} />
                  <MaterialEntregas key={`me-${selectedId}`} mentoradoId={selectedId} mentorId={mentorId} />
                </div>
              )}
              {activeTab === "financeiro" && <FinanceiroSection key={selectedId} mentoradoId={selectedId} mentorId={mentorId} />}
              {activeTab === "chat" && <ChatMentor key={selectedId} mentoradoId={selectedId} mentorId={mentorId} nomeMentorado={selected.nome} />}
              {activeTab === "calls" && (
                <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.violet}18`, border: `1px solid ${C.violet}30` }}>
                        <Sparkles className="w-4 h-4" style={{ color: C.violet }} />
                      </div>
                      <h3 className="text-sm font-semibold text-white">Análise de Call com IA</h3>
                    </div>
                    <button onClick={onAnalisarCall}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all"
                      style={{ background: `${C.violet}20`, border: `1px solid ${C.violet}44`, color: C.violet }}>
                      <Zap className="w-3.5 h-3.5" /> Analisar Call
                    </button>
                  </div>
                  <p className="text-sm" style={{ color: C.muted }}>Cole a transcrição de uma call e a IA extrai automaticamente as tarefas da mentorada e os compromissos da equipe.</p>
                </div>
              )}
            </div>

            {!checkin && (
              <div className="rounded-2xl p-8 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <BarChart3 className="w-10 h-10 mx-auto mb-3" style={{ color: C.border }} />
                <p className="text-sm mb-4" style={{ color: C.muted }}>Nenhum check-in recebido ainda.</p>
                <button onClick={onCopiarLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all"
                  style={{ background: `${accent}18`, border: `1px solid ${accent}44`, color: accent }}>
                  <Link2 className="w-4 h-4" /> Copiar Link de Check-in
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
