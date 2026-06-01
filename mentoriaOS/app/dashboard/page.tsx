"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import {
  Search, Bell, TrendingUp, TrendingDown, Minus, Target, BarChart3, Zap, CheckCircle2,
  AlertCircle, Clock, Link2, Copy, Check, UserPlus, X, RefreshCw, Edit2, Trash2,
  LogOut, User, History, ChevronRight, Calendar, Briefcase, BookOpen,
  DollarSign, Phone, MapPin, Filter, ChevronDown, Sparkles, Settings, MessageCircle
} from "lucide-react"
import type { CheckinRow } from "@/lib/supabase"
import PendenciasSection from "@/components/PendenciasSection"
import FinanceiroSection from "@/components/FinanceiroSection"
import AnalisarCallModal from "@/components/AnalisarCallModal"
import { getRealtimeClient } from "@/lib/supabase-realtime"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"
import Sidebar, { CkView } from "@/components/ck/Sidebar"
import VisaoGeral from "@/components/ck/VisaoGeral"
import SessaoModal from "@/components/ck/SessaoModal"
import CallRoom from "@/components/ck/CallRoom"
import ChatMentor from "@/components/ck/ChatMentor"
import AdminView from "@/components/ck/AdminView"
import { DashboardMentor } from "@/components/mentor/DashboardMentor"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useEmpresa } from "@/hooks/useEmpresa"
import { C } from "@/utils/theme"
import type { Mentorado, BriefingIA } from "@/components/ck/types"
import BadgeVariacao from "@/components/ck/BadgeVariacao"
import CountdownDias from "@/components/ck/CountdownDias"
import SortableMentoradoItem from "@/components/ck/SortableMentoradoItem"
import CalendarioView from "@/components/ck/CalendarioView"

function variacao(historico: CheckinRow[], campo: keyof CheckinRow): number | null {
  if (!historico || historico.length < 2) return null
  const atual = Number(historico[0][campo]) || 0
  const anterior = Number(historico[1][campo]) || 0
  if (anterior === 0) return atual > 0 ? 100 : null
  return ((atual - anterior) / anterior) * 100
}
function gerarBriefing(m: Mentorado, c: CheckinRow): BriefingIA {
  const conv = c.vendas_reais / (c.leads_gerados || 1)
  const roi = ((c.vendas_reais - c.investimento_trafego) / (c.investimento_trafego || 1)) * 100
  return {
    diagnostico: `Volume de leads ${c.leads_gerados > 300 ? "positivo" : "abaixo do esperado"} (${c.leads_gerados} leads), conversão em R$${conv.toFixed(0)}/lead. ROI de ${roi.toFixed(0)}%. Foco: ${m.foco_macro}.`,
    pauta: [
      `Revisar as ${c.leads_gerados} captações e identificar os 20% com maior potencial de conversão`,
      `Analisar os R$${c.investimento_trafego.toLocaleString()} de investimento — ROAS atual de ${(c.vendas_reais / (c.investimento_trafego || 1)).toFixed(1)}x`,
      `${c.videos_postados} vídeos postados — estratégia de conteúdo que está gerando mais leads`,
    ]
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── PAGE PRINCIPAL ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  // ── STATE PRINCIPAL ─────────────────────────────────────────────────────────
  const [mentorados, setMentorados] = useState<Mentorado[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [checkin, setCheckin] = useState<CheckinRow | null>(null)
  const [historico, setHistorico] = useState<CheckinRow[]>([])
  const [briefing, setBriefing] = useState<BriefingIA | null>(null)
  const [loading, setLoading] = useState(true)
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [mentorNome, setMentorNome] = useState<string>("CKlareza")
  const [showCadastro, setShowCadastro] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [novo, setNovo] = useState({ nome: "", nicho: "", foco_macro: "", data_inicio: "" })
  const [atualizando, setAtualizando] = useState(false)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null)
  const [briefingLoading, setBriefingLoading] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "error">("connecting")
  const [selectedMetric, setSelectedMetric] = useState<"leads" | "vendas" | "investimento" | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState({ nome: "", nicho: "", foco_macro: "", status: "Ativo", cidade: "", data_fim: "", faturamento_atual: "", meta_faturamento: "", meta_atual: "" })
  const [editando, setEditando] = useState(false)
  const [mentorId, setMentorId] = useState<string | null>(null)
  const [mentorDados, setMentorDados] = useState<{id?: string, nome: string, metodo_trabalho?: string, filosofia?: string, nicho_foco?: string, foto_url?: string} | null>(null)
  const [showMenuPerfil, setShowMenuPerfil] = useState(false)
  const [showPerfilModal, setShowPerfilModal] = useState(false)
  const [showHistoricoModal, setShowHistoricoModal] = useState(false)
  const [editandoPerfil, setEditandoPerfil] = useState(false)
  const [perfilEdit, setPerfilEdit] = useState({ nome: "", nicho_foco: "", metodo_trabalho: "", filosofia: "" })
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [uploadingFoto, setUploadingFoto] = useState<string | null>(null)
  const [showAnalisarCall, setShowAnalisarCall] = useState(false)
  const [activeTab, setActiveTab] = useState<"pendencias" | "financeiro" | "calls" | "chat">("pendencias")
  const [filtroSidebar, setFiltroSidebar] = useState("")
  const [tarefasVencidas, setTarefasVencidas] = useState(0)
  // CKlareza v5 — estado de navegação
  const [ckView, setCkView] = useState<CkView>("visao-geral")
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage("ck:sidebar-collapsed", false)
  const { empresa } = useEmpresa()
  const accent = empresa.cor_primaria
  const [isAdmin, setIsAdmin] = useState(false)
  const [overviewData, setOverviewData] = useState<any>(null)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [showSessaoModal, setShowSessaoModal] = useState(false)
  const [showCallRoom, setShowCallRoom] = useState(false)

  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const menuPerfilRef = useRef<HTMLDivElement>(null)

  // ── INIT ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const mentorSel = localStorage.getItem("mentorSelecionado")
    if (!mentorSel) { if (typeof window !== "undefined") window.location.href = "/"; return }
    setMentorId(mentorSel)
  }, [])

  useEffect(() => {
    if (!showMenuPerfil) return
    const handler = (e: MouseEvent) => {
      if (menuPerfilRef.current && menuPerfilRef.current.contains(e.target as Node)) return
      setShowMenuPerfil(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showMenuPerfil])

  // ── OVERVIEW DATA ─────────────────────────────────────────────────────────────
  const carregarOverview = useCallback(async () => {
    if (!mentorId) return
    setOverviewLoading(true)
    try {
      const r = await fetch(`/api/dashboard/overview?mentorId=${mentorId}&mentoradoId=${selectedId}&t=${Date.now()}`)
      const j = await r.json()
      setOverviewData(j)
    } finally {
      setOverviewLoading(false)
    }
  }, [mentorId, selectedId])

  useEffect(() => {
    if (mentorId && ckView === "visao-geral") carregarOverview()
  }, [mentorId, ckView, selectedId, carregarOverview])

  // ── FOTO UPLOAD ─────────────────────────────────────────────────────────────
  const uploadFoto = useCallback(async (file: File, type: "mentor" | "mentorado", id: string) => {
    setUploadingFoto(id)
    try {
      const form = new FormData()
      form.append("file", file); form.append("type", type); form.append("id", id)
      const res = await fetch("/api/upload/avatar", { method: "POST", body: form })
      const json = await res.json()
      if (json.url) {
        if (type === "mentor") setMentorDados(prev => prev ? { ...prev, foto_url: json.url } : prev)
        else setMentorados(prev => prev.map(m => m.id === id ? { ...m, foto_url: json.url } : m))
      }
    } finally { setUploadingFoto(null) }
  }, [])

  // ── DRAG & DROP ─────────────────────────────────────────────────────────────
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setMentorados(prev => {
      const oldIdx = prev.findIndex(m => m.id === active.id)
      const newIdx = prev.findIndex(m => m.id === over.id)
      const reordenado = arrayMove(prev, oldIdx, newIdx)
      fetch("/api/dashboard/mentorados/reorder", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reordenado.map((m, i) => ({ id: m.id, ordem: i })) }),
      }).catch(() => {})
      return reordenado
    })
  }, [])

  // ── TAREFAS VENCIDAS (badge) ─────────────────────────────────────────────────
  const contarVencidas = useCallback(async () => {
    if (!mentorId || mentorados.length === 0) { setTarefasVencidas(0); return }
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
    const cs = await Promise.all(mentorados.map(m =>
      fetch(`/api/dashboard/tarefas?mentoradoId=${m.id}&status=pending&t=${Date.now()}`)
        .then(r => r.json()).then(j =>
          (j.tarefas || []).filter((t: any) => {
            if (!t.data_vencimento) return false
            const [y, mo, d] = t.data_vencimento.split("T")[0].split("-").map(Number)
            return new Date(y, mo - 1, d) < hoje
          }).length
        ).catch(() => 0)
    ))
    setTarefasVencidas(cs.reduce((a, b) => a + b, 0))
  }, [mentorados, mentorId])

  useEffect(() => { contarVencidas() }, [contarVencidas])

  // ── SALVAR PERFIL MENTOR ─────────────────────────────────────────────────────
  const salvarPerfil = useCallback(async () => {
    if (!mentorId) return
    setSalvandoPerfil(true)
    try {
      const res = await fetch(`/api/mentor/info?mentorId=${mentorId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(perfilEdit),
      })
      if (res.ok) { setEditandoPerfil(false); recarregarMentorados() }
    } finally { setSalvandoPerfil(false) }
  }, [mentorId, perfilEdit])

  // ── RELOAD MENTORADOS ─────────────────────────────────────────────────────────
  const recarregarMentorados = useCallback(async () => {
    if (!mentorId) return
    setLoading(true)
    try {
      const [resM, resMentor] = await Promise.all([
        fetch(`/api/dashboard/mentorados?mentorId=${mentorId}&t=${Date.now()}`),
        fetch(`/api/mentor/info?mentorId=${mentorId}&t=${Date.now()}`),
      ])
      const [dataM, dataMentorResp] = await Promise.all([resM.json(), resMentor.json()])
      const lista: Mentorado[] = dataM.mentorados || []
      // /api/mentor/info retorna { mentor: {...} }
      const dataMentor = dataMentorResp.mentor || dataMentorResp
      setMentorados(lista)
      setMentorNome(dataMentor.nome || "CKlareza")
      setMentorDados(dataMentor)
      setIsAdmin(dataMentor.role === "admin")
      if (lista.length > 0 && !selectedId) setSelectedId(lista[0].id)
      setUltimaAtualizacao(new Date())
    } finally { setLoading(false) }
  }, [mentorId, selectedId])

  useEffect(() => { if (mentorId) recarregarMentorados() }, [mentorId])

  // ── CHECKIN + BRIEFING ─────────────────────────────────────────────────────
  const carregarCheckin = useCallback(async () => {
    if (!selectedId) return
    setAtualizando(true)
    try {
      const res = await fetch(`/api/dashboard/checkin?mentoradoId=${selectedId}&t=${Date.now()}`)
      const json = await res.json()
      if (json.checkin) {
        setCheckin(json.checkin)
        setHistorico(json.historico || [])
        const selected = mentorados.find(m => m.id === selectedId)
        if (selected) setBriefing(json.checkin.briefing_ia ?? gerarBriefing(selected, json.checkin))
      } else { setCheckin(null); setBriefing(null) }
    } finally { setAtualizando(false) }
  }, [selectedId, mentorados])

  // Limpa dados do mentorado anterior IMEDIATAMENTE (zero delay visual) e recarrega
  useEffect(() => {
    if (!selectedId) return
    setCheckin(null); setBriefing(null); setHistorico([])
    carregarCheckin()
  }, [selectedId])

  // ── REALTIME ONIPRESENTE (checkins + sessoes + tarefas) ──────────────────────
  useEffect(() => {
    if (!mentorId) return
    const supabase = getRealtimeClient()
    const ch = supabase.channel(`ck-dashboard-${mentorId}`)
      // Check-in novo/atualizado → recarrega métricas + overview
      .on("postgres_changes", { event: "*", schema: "public", table: "checkins" }, () => {
        carregarCheckin(); carregarOverview()
      })
      // Sessão agendada/cancelada → atualiza próxima sessão na Visão Geral
      .on("postgres_changes", { event: "*", schema: "public", table: "sessoes" }, () => {
        carregarOverview()
      })
      // Tarefa criada/concluída/vencida → atualiza badge do header + overview
      .on("postgres_changes", { event: "*", schema: "public", table: "tarefas" }, () => {
        contarVencidas(); carregarOverview()
      })
      .subscribe((s: string) => setRealtimeStatus(s === "SUBSCRIBED" ? "connected" : s === "CHANNEL_ERROR" ? "error" : "connecting"))
    return () => { supabase.removeChannel(ch) }
  }, [mentorId, carregarCheckin, carregarOverview, contarVencidas])

  // ── GERAR BRIEFING IA ─────────────────────────────────────────────────────
  const gerarBriefingIA = useCallback(async () => {
    if (!checkin || !selectedId || !mentorId) return
    setBriefingLoading(true)
    try {
      const res = await fetch("/api/dashboard/briefing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentoradoId: selectedId, mentorId, checkinId: checkin.id }),
      })
      const json = await res.json()
      if (json.briefing) setBriefing(json.briefing)
    } finally { setBriefingLoading(false) }
  }, [checkin, selectedId, mentorId])

  // ── CADASTRAR MENTORADO ────────────────────────────────────────────────────
  const cadastrarMentorado = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mentorId || !novo.nome.trim()) return
    setSalvando(true)
    try {
      const res = await fetch("/api/dashboard/mentorados", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...novo, mentorId }),
      })
      const json = await res.json()
      if (res.ok) {
        setShowCadastro(false)
        setNovo({ nome: "", nicho: "", foco_macro: "", data_inicio: "" })
        if (json.mentorado?.id) setSelectedId(json.mentorado.id)
        recarregarMentorados()
      }
    } finally { setSalvando(false) }
  }, [novo, mentorId, recarregarMentorados])

  // ── EDITAR MENTORADO ──────────────────────────────────────────────────────
  const editarMentorado = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    setEditando(true)
    try {
      const res = await fetch(`/api/dashboard/mentorados/${selectedId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      })
      if (res.ok) { setShowEditModal(false); recarregarMentorados() }
    } finally { setEditando(false) }
  }, [editData, selectedId, recarregarMentorados])

  // ── DELETAR MENTORADO ─────────────────────────────────────────────────────
  const deletarMentorado = useCallback(async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este mentorado? Todos os dados serão perdidos.")) return
    const res = await fetch(`/api/dashboard/mentorados/${id}`, { method: "DELETE" })
    if (res.ok) { setSelectedId(""); recarregarMentorados() }
  }, [recarregarMentorados])

  // ── COPIAR LINK ──────────────────────────────────────────────────────────
  const copiarLinkCheckin = useCallback(async () => {
    const codigo = mentorados.find(m => m.id === selectedId)?.codigo_acesso
    if (!codigo) return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/m/${codigo}`)
      setLinkCopiado(true)
      setTimeout(() => setLinkCopiado(false), 2000)
    } catch {}
  }, [selectedId, mentorados])

  // ── DERIVADOS ─────────────────────────────────────────────────────────────
  const termoBusca = filtroSidebar.trim().toLowerCase()
  const filtered = !termoBusca
    ? mentorados
    : mentorados.filter(m => [m.nome, m.nicho, m.cidade || ""].join(" ").toLowerCase().includes(termoBusca))
  const selected = mentorados.find(m => m.id === selectedId)

  // ── HEADER DO MÓDULO ─────────────────────────────────────────────────────
  const MODULE_LABELS: Record<CkView, string> = {
    "visao-geral": "Visão Geral",
    "empresa": "Empresa",
    "mentorados": "Mentorados",
    "calendario": "Calendário",
    "historico": "Histórico",
    "config": "Configurações",
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: C.bg }}>
      {/* Música ambiente da empresa (white label) */}
      {/* ── SIDEBAR CKlareza ─────────────────────────────────────────── */}
      <Sidebar
        active={ckView}
        onChange={setCkView}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        marca={empresa.slug ? empresa.nome : "CKlareza"}
        accent={accent}
        logoUrl={empresa.logo_url}
        esconderMarca={empresa.esconder_marca}
        isAdmin={isAdmin}
        onLogout={() => { localStorage.removeItem("mentorSelecionado"); window.location.href = "/" }}
      />

      {/* ── MAIN AREA ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── HEADER BAR ─────────────────────────────────────────────── */}
        <header className="relative px-6 py-3.5 flex items-center justify-between shrink-0" style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">{MODULE_LABELS[ckView]}</h2>
            {realtimeStatus === "connected" && (
              <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: C.green }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} /> Ao vivo
              </span>
            )}
          </div>

          {/* Logo CKlareza — centralizada no topo (assinatura da plataforma) */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
            <Sparkles className="w-4 h-4" style={{ color: "#d4af37" }} />
            <span
              className="text-lg font-bold tracking-tight"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                background: "linear-gradient(180deg, #f0d97d 0%, #d4af37 55%, #9c7d2e 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              CKlareza
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Badge notificações */}
            {tarefasVencidas > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: `${C.red}18`, border: `1px solid ${C.red}44` }}>
                <AlertCircle className="w-3.5 h-3.5" style={{ color: C.red }} />
                <span className="text-xs font-bold" style={{ color: C.red }}>{tarefasVencidas} vencida{tarefasVencidas > 1 ? "s" : ""}</span>
              </div>
            )}
            {/* Avatar do mentor */}
            <div className="relative" ref={menuPerfilRef}>
              <button onClick={() => setShowMenuPerfil(!showMenuPerfil)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full transition-all"
                style={{ border: `1px solid ${C.border}` }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.green}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}>
                <div className="w-8 h-8 rounded-full overflow-hidden ring-1" style={{ ringColor: C.border }}>
                  {mentorDados?.foto_url
                    ? <img src={mentorDados.foto_url} alt={mentorNome} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#0a1628" }}>
                        {mentorNome.slice(0, 2).toUpperCase()}
                      </div>}
                </div>
                <span className="text-sm font-semibold text-white hidden sm:block">{mentorNome}</span>
                <ChevronDown className="w-3.5 h-3.5" style={{ color: C.muted }} />
              </button>

              {showMenuPerfil && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl py-1.5 z-50" style={{ background: C.card2, border: `1px solid ${C.border}` }}>
                  {[
                    { label: "Meu Perfil", icon: User, onClick: () => { setShowPerfilModal(true); setShowMenuPerfil(false) } },
                    { label: "Editar Mentorado", icon: Edit2, onClick: () => { if (selected) { setEditData({ nome: selected.nome, nicho: selected.nicho, foco_macro: selected.foco_macro, status: "Ativo", cidade: selected.cidade || "", data_fim: selected.data_fim || "", faturamento_atual: selected.faturamento_atual?.toString() || "", meta_faturamento: selected.meta_faturamento?.toString() || "", meta_atual: selected.meta_atual || "" }); setShowEditModal(true) }; setShowMenuPerfil(false) } },
                    { label: "Histórico", icon: History, onClick: () => { setShowHistoricoModal(true); setShowMenuPerfil(false) } },
                  ].map(item => (
                    <button key={item.label} onClick={item.onClick}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-white transition-colors"
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#1e3a5f"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                      <item.icon className="w-4 h-4" style={{ color: C.muted }} /> {item.label}
                    </button>
                  ))}
                  <div className="my-1" style={{ borderTop: `1px solid ${C.border}` }} />
                  <button onClick={() => { localStorage.removeItem("mentorSelecionado"); window.location.href = "/" }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors"
                    style={{ color: C.red }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${C.red}15`}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── CONTENT AREA ───────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">

          {/* ══ VISÃO GERAL ══════════════════════════════════════════════ */}
          {ckView === "visao-geral" && (
            <div className="p-6 space-y-6">
              {/* BLOCOS v7: financeiro / mentorados / progresso / calls */}
              {mentorId && <DashboardMentor mentorId={mentorId} accent={accent} />}
              <VisaoGeral
                data={overviewData}
                loading={overviewLoading}
                onAbrirMentorado={(id) => { setSelectedId(id); setCkView("mentorados") }}
                onAgendar={() => setShowSessaoModal(true)}
              />
            </div>
          )}

          {/* ══ EMPRESA (ADMIN) ══════════════════════════════════════════ */}
          {ckView === "empresa" && mentorId && (
            <div className="p-6">
              <AdminView mentorId={mentorId} accent={accent} />
            </div>
          )}

          {/* ══ MENTORADOS ════════════════════════════════════════════════ */}
          {ckView === "mentorados" && (
            <div className="flex h-full">
              {/* Lista lateral dark */}
              <div className="w-72 shrink-0 flex flex-col h-full" style={{ background: C.card, borderRight: `1px solid ${C.border}` }}>
                <div className="p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.muted }} />
                    <input value={filtroSidebar} onChange={e => setFiltroSidebar(e.target.value)}
                      placeholder="Buscar mentorado..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none transition-all"
                      style={{ background: "#0a1628", border: `1px solid ${C.border}` }}
                      onFocus={e => e.target.style.borderColor = C.green}
                      onBlur={e => e.target.style.borderColor = C.border} />
                  </div>
                  <button onClick={() => setShowCadastro(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-xl transition-all"
                    style={{ background: `${C.green}18`, border: `1px solid ${C.green}44`, color: C.green }}>
                    <UserPlus className="w-4 h-4" /> Novo Mentorado
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filtered.map(m => m.id)} strategy={verticalListSortingStrategy}>
                      {filtered.map(m => (
                        <SortableMentoradoItem key={m.id} m={m} selectedId={selectedId}
                          onClick={() => setSelectedId(m.id)} />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>

              {/* Detail panel */}
              <div className="flex-1 overflow-y-auto p-6" style={{ background: C.bg }}>
                {!selected ? (
                  <div className="h-full flex items-center justify-center" style={{ color: C.muted }}>
                    <div className="text-center">
                      <Users className="w-12 h-12 mx-auto mb-3" style={{ color: C.border }} />
                      <p className="text-sm">Selecione um mentorado</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* ── Info Card ──────────────────────────────────────── */}
                    <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                      <div className="flex items-start gap-5">
                        <label className="cursor-pointer">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-slate-200 hover:ring-teal-500 transition-all">
                            {selected.foto_url
                              ? <img src={selected.foto_url} alt={selected.nome} className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-slate-900 flex items-center justify-center text-xl font-bold text-white">
                                  {selected.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                </div>}
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) uploadFoto(file, "mentorado", selected.id)
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
                            <span>📅 Início: <span className="text-white font-medium">{selected.data_inicio}</span></span>
                            {selected.data_fim && (
                              <span>🏁 Término: <span className="text-white font-medium">{selected.data_fim}</span> · <CountdownDias dataFim={selected.data_fim} /></span>
                            )}
                            {selected.cidade && <span>📍 <span className="text-white font-medium">{selected.cidade}</span></span>}
                            <span>🎯 <span className="text-white font-medium">{selected.foco_macro}</span></span>
                          </div>
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

                      {/* Ações rápidas */}
                      <div className="flex gap-2 mt-5 pt-5" style={{ borderTop: `1px solid ${C.border}` }}>
                        <button onClick={() => setShowCallRoom(true)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all"
                          style={{ background: C.green, color: "#0a1628" }}>
                          <Phone className="w-3.5 h-3.5" /> Iniciar Chamada
                        </button>
                        {[
                          { icon: linkCopiado ? Check : Link2, label: linkCopiado ? "Copiado!" : "Copiar Convite", onClick: copiarLinkCheckin, color: C.muted },
                          { icon: RefreshCw, label: "Atualizar", onClick: () => carregarCheckin(), color: C.muted },
                          { icon: Calendar, label: "Agendar Sessão", onClick: () => setShowSessaoModal(true), color: C.blue },
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

                    {/* ── MÉTRICAS ────────────────────────────────────────── */}
                    {checkin && (
                      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        {([
                          { key: "leads_gerados",       label: "Leads Gerados",   valor: checkin.leads_gerados,          prefixo: "",   icon: Target,   cor: C.green  },
                          { key: "vendas_reais",        label: "Vendas Reais",    valor: checkin.vendas_reais,           prefixo: "R$", icon: BarChart3, cor: C.blue   },
                          { key: "investimento_trafego",label: "Investimento",    valor: checkin.investimento_trafego,   prefixo: "R$", icon: TrendingUp,cor: C.amber  },
                          { key: "videos_postados",     label: "Vídeos Postados", valor: checkin.videos_postados,        prefixo: "",   icon: BookOpen,  cor: C.violet },
                        ] as any[]).map(card => {
                          const pct = variacao(historico, card.key)
                          const Icon = card.icon
                          return (
                            <div key={card.key} className="rounded-2xl p-5 transition-all hover:-translate-y-0.5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${card.cor}18`, border: `1px solid ${card.cor}30` }}>
                                <Icon className="w-4 h-4" style={{ color: card.cor }} />
                              </div>
                              <p className="text-2xl font-bold text-white">{card.prefixo}{card.valor?.toLocaleString("pt-BR")}</p>
                              <p className="text-xs mt-0.5 mb-2" style={{ color: C.muted }}>{card.label}</p>
                              <BadgeVariacao pct={pct} />
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* ── BRIEFING IA ─────────────────────────────────────── */}
                    {checkin && (
                      <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.violet}18`, border: `1px solid ${C.violet}30` }}>
                              <Sparkles className="w-4 h-4" style={{ color: C.violet }} />
                            </div>
                            <h3 className="text-sm font-semibold text-white">Briefing da IA</h3>
                          </div>
                          <button onClick={gerarBriefingIA} disabled={briefingLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg disabled:opacity-50 transition-all"
                            style={{ background: `${C.violet}18`, border: `1px solid ${C.violet}33`, color: C.violet }}>
                            <Zap className={`w-3.5 h-3.5 ${briefingLoading ? "animate-pulse" : ""}`} />
                            {briefingLoading ? "Gerando..." : "Gerar com IA"}
                          </button>
                        </div>

                        {briefing ? (
                          <div className="space-y-5">
                            <div className="rounded-xl p-4" style={{ background: "#0a1628" }}>
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

                    {/* ── TABS: Pendências / Financeiro / Calls ─────────── */}
                    <div>
                      <div className="flex gap-1 rounded-xl p-1 mb-4" style={{ background: C.card }}>
                        {([
                          { id: "pendencias", label: "Pendências", icon: CheckCircle2 },
                          { id: "financeiro", label: "Financeiro", icon: DollarSign },
                          { id: "chat", label: "Chat", icon: MessageCircle },
                          { id: "calls", label: "Análise de Call", icon: Phone },
                        ] as const).map(tab => (
                          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all"
                            style={activeTab === tab.id
                              ? { background: C.green, color: "#0a1628", border: `1px solid ${C.green}` }
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
                      {activeTab === "financeiro" && <FinanceiroSection key={selectedId} mentoradoId={selectedId} mentorId={mentorId} />}
                      {activeTab === "chat" && selected && <ChatMentor key={selectedId} mentoradoId={selectedId} mentorId={mentorId} nomeMentorado={selected.nome} />}
                      {activeTab === "calls" && (
                        <div className="rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.violet}18`, border: `1px solid ${C.violet}30` }}>
                                <Sparkles className="w-4 h-4" style={{ color: C.violet }} />
                              </div>
                              <h3 className="text-sm font-semibold text-white">Análise de Call com IA</h3>
                            </div>
                            <button onClick={() => setShowAnalisarCall(true)}
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
                        <button onClick={copiarLinkCheckin}
                          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all"
                          style={{ background: `${C.green}18`, border: `1px solid ${C.green}44`, color: C.green }}>
                          <Link2 className="w-4 h-4" /> Copiar Link de Check-in
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ CALENDÁRIO ════════════════════════════════════════════════ */}
          {ckView === "calendario" && mentorId && (
            <div className="p-6">
              <CalendarioView mentorId={mentorId} mentorados={mentorados} onAgendar={() => setShowSessaoModal(true)} />
            </div>
          )}

          {/* ══ HISTÓRICO ═════════════════════════════════════════════════ */}
          {ckView === "historico" && (
            <div className="p-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                <History className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Selecione um mentorado na aba Mentorados e clique em "Histórico" no menu do perfil.</p>
              </div>
            </div>
          )}

          {/* ══ CONFIGURAÇÕES ═════════════════════════════════════════════ */}
          {ckView === "config" && (
            <div className="p-6 max-w-lg">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-semibold text-slate-900">Perfil do Mentor</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nome</label>
                  <input value={perfilEdit.nome || mentorNome} onChange={e => setPerfilEdit(p => ({ ...p, nome: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nicho Foco</label>
                  <input value={perfilEdit.nicho_foco} onChange={e => setPerfilEdit(p => ({ ...p, nicho_foco: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500" />
                </div>
                <button onClick={salvarPerfil} disabled={salvandoPerfil}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors">
                  {salvandoPerfil ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══ MODAIS ════════════════════════════════════════════════════════ */}

      {/* Modal: Sessão */}
      {showSessaoModal && mentorId && (
        <SessaoModal
          mentorId={mentorId}
          mentorados={mentorados.map(m => ({ id: m.id, nome: m.nome }))}
          mentoradoIdInicial={selectedId}
          onClose={() => setShowSessaoModal(false)}
          onCriado={() => { setShowSessaoModal(false); carregarOverview() }}
        />
      )}

      {/* Sala de Chamada — Split Screen + Copiloto */}
      {showCallRoom && selected && mentorId && (
        <CallRoom
          mentoradoId={selected.id}
          mentorId={mentorId}
          nomeMentorado={selected.nome}
          nomeMentor={mentorNome}
          briefing={briefing}
          onClose={() => setShowCallRoom(false)}
        />
      )}

      {/* Modal: Analisar Call */}
      {showAnalisarCall && selected && mentorId && (
        <AnalisarCallModal
          mentoradoId={selected.id}
          mentorId={mentorId}
          nomeMentorado={selected.nome}
          onClose={() => setShowAnalisarCall(false)}
          onTarefasCriadas={() => setActiveTab("pendencias")}
        />
      )}

      {/* Modal: Cadastrar Mentorado */}
      {showCadastro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4" style={{ background: "#00000070" }} onClick={() => setShowCadastro(false)}>
          <div className="rounded-2xl shadow-2xl w-full max-w-lg" style={{ background: C.card2, border: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${C.green}18`, border: `1px solid ${C.green}33` }}>
                  <UserPlus className="w-5 h-5" style={{ color: C.green }} />
                </div>
                <h2 className="text-base font-semibold text-white">Novo Mentorado</h2>
              </div>
              <button onClick={() => setShowCadastro(false)} className="p-2 rounded-lg transition-colors" style={{ color: C.muted }}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={cadastrarMentorado} className="p-6 space-y-4">
              {[
                { label: "Nome Completo", key: "nome", placeholder: "Ex: Ana Silva" },
                { label: "Nicho de Atuação", key: "nicho", placeholder: "Ex: Marketing Digital" },
                { label: "Foco Macro", key: "foco_macro", placeholder: "Ex: Estruturação Comercial" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{f.label}</label>
                  <input required value={(novo as any)[f.key]} onChange={e => setNovo(n => ({ ...n, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none transition-all"
                    style={{ background: C.bg, border: `1px solid ${C.border}` }}
                    onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>Data de Início</label>
                <input type="date" required value={novo.data_inicio} onChange={e => setNovo(n => ({ ...n, data_inicio: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white focus:outline-none transition-all"
                  style={{ background: C.bg, border: `1px solid ${C.border}` }} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCadastro(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors" style={{ background: C.card, color: C.muted, border: `1px solid ${C.border}` }}>Cancelar</button>
                <button type="submit" disabled={salvando}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all"
                  style={{ background: `${C.green}22`, border: `1px solid ${C.green}55`, color: C.green }}>
                  {salvando ? "Salvando..." : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Mentorado */}
      {showEditModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-200 hover:ring-teal-500 transition-all">
                    {selected.foto_url
                      ? <img src={selected.foto_url} alt={selected.nome} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">{selected.nome.slice(0, 2).toUpperCase()}</div>}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0]
                    if (file && selectedId) uploadFoto(file, "mentorado", selectedId)
                  }} />
                </label>
                <h2 className="text-base font-semibold text-slate-900">Editar Mentorado</h2>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={editarMentorado} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {[
                { label: "Nome", key: "nome" }, { label: "Nicho", key: "nicho" },
                { label: "Foco Macro", key: "foco_macro" }, { label: "Cidade", key: "cidade" },
                { label: "Meta/Ação da Semana", key: "meta_atual" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                  <input value={(editData as any)[f.key]} onChange={e => setEditData(d => ({ ...d, [f.key]: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Término da Mentoria</label>
                <input type="date" value={editData.data_fim} onChange={e => setEditData(d => ({ ...d, data_fim: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Faturamento Atual (R$)", key: "faturamento_atual", ph: "8000" },
                  { label: "Meta 12 Meses (R$)", key: "meta_faturamento", ph: "50000" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                    <input type="number" value={(editData as any)[f.key]} placeholder={f.ph}
                      onChange={e => setEditData(d => ({ ...d, [f.key]: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" disabled={editando}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors">
                  {editando ? "Salvando..." : "Salvar Mudanças"}
                </button>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Zona de Perigo</p>
                <button type="button" onClick={() => { if (selectedId) deletarMentorado(selectedId) }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors">
                  <Trash2 className="w-4 h-4" /> Deletar Mentorado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Histórico */}
      {showHistoricoModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setShowHistoricoModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Histórico — {selected.nome}</h2>
              <button onClick={() => setShowHistoricoModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-6">
              {historico.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">Nenhum histórico disponível.</p>
              ) : (
                <div className="space-y-4">
                  {historico.map((h, i) => (
                    <div key={h.id} className={`p-4 rounded-xl border ${i === 0 ? "border-teal-200 bg-teal-50" : "border-slate-200 bg-slate-50"}`}>
                      <p className="text-xs font-bold text-slate-500 mb-2">{i === 0 ? "✓ Atual" : `Semana -${i}`} · {h.data_envio?.slice(0, 10)}</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <span className="text-slate-500">Leads: <span className="font-bold text-slate-800">{h.leads_gerados}</span></span>
                        <span className="text-slate-500">Vendas: <span className="font-bold text-teal-700">R${h.vendas_reais?.toLocaleString("pt-BR")}</span></span>
                        <span className="text-slate-500">Investimento: <span className="font-bold text-slate-800">R${h.investimento_trafego?.toLocaleString("pt-BR")}</span></span>
                        <span className="text-slate-500">Vídeos: <span className="font-bold text-slate-800">{h.videos_postados}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Perfil do Mentor */}
      {showPerfilModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setShowPerfilModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Meu Perfil</h2>
              <button onClick={() => setShowPerfilModal(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-center mb-2">
                <label className="cursor-pointer">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-slate-100 hover:ring-teal-300 transition-all">
                    {mentorDados?.foto_url
                      ? <img src={mentorDados.foto_url} alt={mentorNome} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-slate-900 flex items-center justify-center text-2xl font-bold text-white">{mentorNome.slice(0, 2).toUpperCase()}</div>}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0]
                    if (file && mentorId) uploadFoto(file, "mentor", mentorId)
                  }} />
                </label>
              </div>
              {!editandoPerfil ? (
                <>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{mentorDados?.nome || mentorNome}</p>
                    <p className="text-sm text-teal-600 font-medium mt-0.5">{mentorDados?.nicho_foco || "—"}</p>
                  </div>
                  <button onClick={() => { setPerfilEdit({ nome: mentorDados?.nome || "", nicho_foco: mentorDados?.nicho_foco || "", metodo_trabalho: mentorDados?.metodo_trabalho || "", filosofia: mentorDados?.filosofia || "" }); setEditandoPerfil(true) }}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors">
                    Editar Perfil
                  </button>
                </>
              ) : (
                <>
                  {[
                    { label: "Nome", key: "nome" }, { label: "Nicho Foco", key: "nicho_foco" },
                    { label: "Método de Trabalho", key: "metodo_trabalho" }, { label: "Filosofia", key: "filosofia" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                      <input value={(perfilEdit as any)[f.key]} onChange={e => setPerfilEdit(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500" />
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <button onClick={() => setEditandoPerfil(false)}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
                    <button onClick={salvarPerfil} disabled={salvandoPerfil}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors">
                      {salvandoPerfil ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente auxiliar Users (não importado do lucide por conflito)
function Users({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  )
}
