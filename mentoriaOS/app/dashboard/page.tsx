"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import {
  Search, Bell, TrendingUp, TrendingDown, Minus, Target, BarChart3, Zap, CheckCircle2,
  AlertCircle, Clock, Link2, Copy, Check, UserPlus, X, RefreshCw, Edit2, Trash2,
  LogOut, User, History, ChevronRight, Calendar, Briefcase, BookOpen, GripVertical,
  DollarSign, Phone, MapPin, Filter, ChevronDown, Sparkles, Settings
} from "lucide-react"
import type { CheckinRow } from "@/lib/supabase"
import PendenciasSection from "@/components/PendenciasSection"
import FinanceiroSection from "@/components/FinanceiroSection"
import AnalisarCallModal from "@/components/AnalisarCallModal"
import { getRealtimeClient } from "@/lib/supabase-realtime"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Sidebar, { CkView } from "@/components/ck/Sidebar"
import VisaoGeral from "@/components/ck/VisaoGeral"
import SessaoModal from "@/components/ck/SessaoModal"

// ── INTERFACES ────────────────────────────────────────────────────────────────
interface Mentorado {
  id: string; nome: string; nicho: string; status: string; foco_macro: string
  data_inicio: string; data_fim?: string; cidade?: string
  faturamento_atual?: number; meta_faturamento?: number; meta_atual?: string
  foto_url?: string; ordem?: number
}
interface BriefingIA { diagnostico: string; evolucao?: string; pauta: string[] }

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

// ── BADGE VARIAÇÃO ────────────────────────────────────────────────────────────
function BadgeVariacao({ pct }: { pct: number | null }) {
  if (pct === null) return null
  const seta = pct > 0 ? "↑" : pct < 0 ? "↓" : "→"
  const cor = pct > 0 ? "text-teal-600 bg-teal-50" : pct < 0 ? "text-red-500 bg-red-50" : "text-slate-400 bg-slate-100"
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${cor}`}>
      {seta} {pct > 0 ? "+" : ""}{pct.toFixed(0)}%
    </span>
  )
}

// ── SORTABLE MENTORADO ────────────────────────────────────────────────────────
function SortableMentoradoItem({ m, selectedId, onClick }: {
  m: Mentorado; selectedId: string; onClick: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  const isSelected = selectedId === m.id
  const ini = m.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div ref={setNodeRef} style={style}
      className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
        isSelected ? "bg-teal-600 text-white shadow-md shadow-teal-600/20" : "hover:bg-slate-100 text-slate-700"
      }`}
      onClick={onClick}
    >
      <div {...attributes} {...listeners} className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <GripVertical className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ${isSelected ? "ring-white/30" : "ring-slate-200"}`}>
        {m.foto_url
          ? <img src={m.foto_url} alt={m.nome} className="w-full h-full object-cover" />
          : <div className={`w-full h-full flex items-center justify-center text-xs font-bold ${isSelected ? "bg-white/20 text-white" : "bg-slate-900 text-white"}`}>{ini}</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isSelected ? "text-white" : "text-slate-800"}`}>{m.nome}</p>
        <p className={`text-[10px] truncate ${isSelected ? "text-teal-100" : "text-slate-400"}`}>{m.nicho}</p>
      </div>
      <div className={`w-2 h-2 rounded-full shrink-0 ${m.status === "Ativo" ? "bg-teal-400" : "bg-slate-300"}`} />
    </div>
  )
}

// ── COUNTDOWN DIAS ────────────────────────────────────────────────────────────
function CountdownDias({ dataFim }: { dataFim: string }) {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const [y, mo, d] = dataFim.split("T")[0].split("-").map(Number)
  const diff = Math.ceil((new Date(y, mo - 1, d).getTime() - hoje.getTime()) / 86400000)
  if (diff < 0) return <span className="text-xs text-red-500 font-semibold">Encerrada há {Math.abs(diff)} dias</span>
  const cor = diff <= 30 ? "text-red-500" : diff <= 90 ? "text-amber-500" : "text-teal-600"
  return <span className={`text-xs font-semibold ${cor}`}>{diff} dias restantes</span>
}

// ── CALENDARIO VIEW ────────────────────────────────────────────────────────────
function CalendarioView({ mentorId, mentorados, onAgendar }: {
  mentorId: string; mentorados: Mentorado[]; onAgendar: () => void
}) {
  const [sessoes, setSessoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/dashboard/sessoes?mentorId=${mentorId}&proximas=1`)
      .then(r => r.json()).then(j => { setSessoes(j.sessoes || []); setLoading(false) })
  }, [mentorId])

  const fmtDH = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) + " · " +
      d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Calendário de Sessões</h2>
        <button onClick={onAgendar}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors">
          <Calendar className="w-4 h-4" /> Nova Sessão
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Próximas sessões agendadas</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Carregando...</div>
        ) : sessoes.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Nenhuma sessão agendada</p>
            <button onClick={onAgendar} className="mt-4 text-teal-600 text-sm font-semibold hover:underline">
              Agendar primeira sessão →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sessoes.map(s => (
              <div key={s.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{s.mentorado_nome}</p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">{fmtDH(s.data_hora)}</p>
                </div>
                {s.titulo && s.titulo !== "Sessão de Mentoria" && (
                  <span className="hidden sm:block text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">{s.titulo}</span>
                )}
                {s.link_call && (
                  <a href={s.link_call} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors">
                    <Phone className="w-3.5 h-3.5" /> Entrar
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
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
  const [searchTerm, setSearchTerm] = useState("")
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
  const [activeTab, setActiveTab] = useState<"pendencias" | "financeiro" | "calls">("pendencias")
  const [filtroSidebar, setFiltroSidebar] = useState("")
  const [tarefasVencidas, setTarefasVencidas] = useState(0)
  // CKlareza v5 — estado de navegação
  const [ckView, setCkView] = useState<CkView>("visao-geral")
  const [overviewData, setOverviewData] = useState<any>(null)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [showSessaoModal, setShowSessaoModal] = useState(false)

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
  }, [mentorId, ckView, carregarOverview])

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
  useEffect(() => {
    if (!mentorId || mentorados.length === 0) return
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
    Promise.all(mentorados.map(m =>
      fetch(`/api/dashboard/tarefas?mentoradoId=${m.id}&status=pending`)
        .then(r => r.json()).then(j =>
          (j.tarefas || []).filter((t: any) => {
            if (!t.data_vencimento) return false
            const [y, mo, d] = t.data_vencimento.split("T")[0].split("-").map(Number)
            return new Date(y, mo - 1, d) < hoje
          }).length
        ).catch(() => 0)
    )).then(cs => setTarefasVencidas(cs.reduce((a, b) => a + b, 0)))
  }, [mentorados, mentorId])

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
      const [dataM, dataMentor] = await Promise.all([resM.json(), resMentor.json()])
      const lista: Mentorado[] = dataM.mentorados || []
      setMentorados(lista)
      setMentorNome(dataMentor.nome || "CKlareza")
      setMentorDados(dataMentor)
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

  useEffect(() => { if (selectedId) carregarCheckin() }, [selectedId])

  // ── REALTIME ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mentorId) return
    const supabase = getRealtimeClient()
    const ch = supabase.channel(`checkins-mentor-${mentorId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "checkins" }, () => carregarCheckin())
      .subscribe((s: string) => setRealtimeStatus(s === "SUBSCRIBED" ? "connected" : s === "CHANNEL_ERROR" ? "error" : "connecting"))
    return () => { supabase.removeChannel(ch) }
  }, [mentorId, carregarCheckin])

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
    if (!selectedId) return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/checkin/${selectedId}`)
      setLinkCopiado(true)
      setTimeout(() => setLinkCopiado(false), 2000)
    } catch {}
  }, [selectedId])

  // ── DERIVADOS ─────────────────────────────────────────────────────────────
  const filtered = mentorados.filter(m =>
    !searchTerm && !filtroSidebar
      ? true
      : [m.nome, m.nicho, m.cidade || ""].join(" ").toLowerCase().includes((searchTerm + filtroSidebar).toLowerCase())
  )
  const selected = mentorados.find(m => m.id === selectedId)

  // ── HEADER DO MÓDULO ─────────────────────────────────────────────────────
  const MODULE_LABELS: Record<CkView, string> = {
    "visao-geral": "Visão Geral",
    "mentorados": "Mentorados",
    "calendario": "Calendário",
    "historico": "Histórico",
    "config": "Configurações",
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── SIDEBAR CKlareza ─────────────────────────────────────────── */}
      <Sidebar
        active={ckView}
        onChange={setCkView}
        onLogout={() => { localStorage.removeItem("mentorSelecionado"); window.location.href = "/" }}
      />

      {/* ── MAIN AREA ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── HEADER BAR ─────────────────────────────────────────────── */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-900">{MODULE_LABELS[ckView]}</h2>
            {realtimeStatus === "connected" && (
              <span className="flex items-center gap-1 text-[10px] text-teal-600 font-medium">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" /> Ao vivo
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Badge notificações */}
            {tarefasVencidas > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded-full">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-bold text-red-600">{tarefasVencidas} vencida{tarefasVencidas > 1 ? "s" : ""}</span>
              </div>
            )}
            {/* Avatar do mentor */}
            <div className="relative" ref={menuPerfilRef}>
              <button onClick={() => setShowMenuPerfil(!showMenuPerfil)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-slate-200">
                  {mentorDados?.foto_url
                    ? <img src={mentorDados.foto_url} alt={mentorNome} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
                        {mentorNome.slice(0, 2).toUpperCase()}
                      </div>}
                </div>
                <span className="text-sm font-semibold text-slate-700 hidden sm:block">{mentorNome}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showMenuPerfil && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                  <button onClick={() => { setShowPerfilModal(true); setShowMenuPerfil(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <User className="w-4 h-4" /> Meu Perfil
                  </button>
                  <button onClick={() => { if (selected) { setEditData({ nome: selected.nome, nicho: selected.nicho, foco_macro: selected.foco_macro, status: "Ativo", cidade: selected.cidade || "", data_fim: selected.data_fim || "", faturamento_atual: selected.faturamento_atual?.toString() || "", meta_faturamento: selected.meta_faturamento?.toString() || "", meta_atual: selected.meta_atual || "" }); setShowEditModal(true) }; setShowMenuPerfil(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Edit2 className="w-4 h-4" /> Editar Mentorado
                  </button>
                  <button onClick={() => { setShowHistoricoModal(true); setShowMenuPerfil(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <History className="w-4 h-4" /> Histórico
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button onClick={() => { localStorage.removeItem("mentorSelecionado"); window.location.href = "/" }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
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
            <div className="p-6">
              <VisaoGeral
                data={overviewData}
                loading={overviewLoading}
                onAbrirMentorado={(id) => { setSelectedId(id); setCkView("mentorados") }}
                onAgendar={() => setShowSessaoModal(true)}
              />
            </div>
          )}

          {/* ══ MENTORADOS ════════════════════════════════════════════════ */}
          {ckView === "mentorados" && (
            <div className="flex h-full">
              {/* Lista lateral (light) */}
              <div className="w-72 shrink-0 border-r border-slate-200 bg-white flex flex-col h-full">
                <div className="p-4 border-b border-slate-100">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={filtroSidebar} onChange={e => setFiltroSidebar(e.target.value)}
                      placeholder="Buscar mentorado..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-teal-500" />
                  </div>
                  <button onClick={() => setShowCadastro(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors">
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
              <div className="flex-1 overflow-y-auto p-6">
                {!selected ? (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm">Selecione um mentorado</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* ── Info Card ──────────────────────────────────────── */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
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
                              <h1 className="text-xl font-bold text-slate-900">{selected.nome}</h1>
                              <p className="text-sm text-slate-500 mt-0.5">{selected.nicho}</p>
                            </div>
                            <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full border border-teal-200 shrink-0">
                              {selected.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-slate-500">
                            <span>📅 Início: <span className="text-slate-700 font-medium">{selected.data_inicio}</span></span>
                            {selected.data_fim && (
                              <span>🏁 Término: <span className="text-slate-700 font-medium">{selected.data_fim}</span> · <CountdownDias dataFim={selected.data_fim} /></span>
                            )}
                            {selected.cidade && <span>📍 <span className="text-slate-700 font-medium">{selected.cidade}</span></span>}
                            <span>🎯 <span className="text-slate-700 font-medium">{selected.foco_macro}</span></span>
                          </div>
                          {(selected.faturamento_atual || selected.meta_faturamento) && (
                            <div className="flex gap-4 mt-2">
                              {selected.faturamento_atual && (
                                <span className="text-xs text-slate-500">💰 Atual: <span className="text-teal-700 font-bold">R$ {Number(selected.faturamento_atual).toLocaleString("pt-BR")}</span></span>
                              )}
                              {selected.meta_faturamento && (
                                <span className="text-xs text-slate-500">🚀 Meta: <span className="text-blue-700 font-bold">R$ {Number(selected.meta_faturamento).toLocaleString("pt-BR")}</span></span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ações rápidas */}
                      <div className="flex gap-2 mt-5 pt-5 border-t border-slate-100">
                        <button onClick={copiarLinkCheckin}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-all">
                          {linkCopiado ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Link2 className="w-3.5 h-3.5" />}
                          {linkCopiado ? "Copiado!" : "Link Check-in"}
                        </button>
                        <button onClick={() => carregarCheckin()}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-all">
                          <RefreshCw className={`w-3.5 h-3.5 ${atualizando ? "animate-spin" : ""}`} />
                          Atualizar
                        </button>
                        <button onClick={() => setShowSessaoModal(true)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-all">
                          <Calendar className="w-3.5 h-3.5" /> Agendar Sessão
                        </button>
                      </div>
                    </div>

                    {/* ── MÉTRICAS ────────────────────────────────────────── */}
                    {checkin && (
                      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        {([
                          { key: "leads", label: "Leads Gerados", valor: checkin.leads_gerados, prefixo: "", icon: Target, cor: "teal" },
                          { key: "vendas", label: "Vendas Reais", valor: checkin.vendas_reais, prefixo: "R$", icon: BarChart3, cor: "blue" },
                          { key: "investimento", label: "Investimento", valor: checkin.investimento_trafego, prefixo: "R$", icon: TrendingUp, cor: "amber" },
                          { key: "videos", label: "Vídeos Postados", valor: checkin.videos_postados, prefixo: "", icon: BookOpen, cor: "violet" },
                        ] as any[]).map(card => {
                          const pct = variacao(historico, card.key === "videos" ? "videos_postados" : card.key === "leads" ? "leads_gerados" : card.key === "vendas" ? "vendas_reais" : "investimento_trafego")
                          const Icon = card.icon
                          const bg: Record<string, string> = { teal: "bg-teal-50 text-teal-600", blue: "bg-blue-50 text-blue-600", amber: "bg-amber-50 text-amber-600", violet: "bg-violet-50 text-violet-600" }
                          return (
                            <div key={card.key} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg[card.cor]}`}>
                                <Icon className="w-4.5 h-4.5" />
                              </div>
                              <p className="text-2xl font-bold text-slate-900">{card.prefixo}{card.valor?.toLocaleString("pt-BR")}</p>
                              <p className="text-xs text-slate-500 mt-0.5 mb-2">{card.label}</p>
                              <BadgeVariacao pct={pct} />
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* ── BRIEFING IA ─────────────────────────────────────── */}
                    {checkin && (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-violet-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900">Briefing da IA</h3>
                          </div>
                          <button onClick={gerarBriefingIA} disabled={briefingLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 disabled:opacity-50 transition-colors">
                            <Zap className={`w-3.5 h-3.5 ${briefingLoading ? "animate-pulse" : ""}`} />
                            {briefingLoading ? "Gerando..." : "Gerar com IA"}
                          </button>
                        </div>

                        {briefing ? (
                          <div className="space-y-5">
                            <div className="bg-slate-50 rounded-xl p-4">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">📊 Diagnóstico</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{briefing.diagnostico}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">🎯 Pauta da Call</p>
                              <ol className="space-y-2">
                                {briefing.pauta.map((item, i) => (
                                  <li key={i} className="flex items-start gap-3">
                                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                    <p className="text-sm text-slate-700">{item}</p>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 text-center py-6">
                            {checkin ? "Clique em 'Gerar com IA' para criar o briefing desta sessão." : "Aguardando check-in do mentorado."}
                          </p>
                        )}
                      </div>
                    )}

                    {/* ── TABS: Pendências / Financeiro / Calls ─────────── */}
                    <div>
                      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4">
                        {([
                          { id: "pendencias", label: "Pendências", icon: CheckCircle2 },
                          { id: "financeiro", label: "Financeiro", icon: DollarSign },
                          { id: "calls", label: "Análise de Call", icon: Phone },
                        ] as const).map(tab => (
                          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                              activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            }`}>
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                            {tab.id === "pendencias" && tarefasVencidas > 0 && (
                              <span className="w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center">{tarefasVencidas}</span>
                            )}
                          </button>
                        ))}
                      </div>

                      {activeTab === "pendencias" && <PendenciasSection key={selectedId} mentoradoId={selectedId} mentorId={mentorId} />}
                      {activeTab === "financeiro" && <FinanceiroSection key={selectedId} mentoradoId={selectedId} mentorId={mentorId} />}
                      {activeTab === "calls" && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                              </div>
                              <h3 className="text-sm font-semibold text-slate-900">Análise de Call com IA</h3>
                            </div>
                            <button onClick={() => setShowAnalisarCall(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors">
                              <Zap className="w-3.5 h-3.5" /> Analisar Call
                            </button>
                          </div>
                          <p className="text-sm text-slate-400">Cole a transcrição de uma call e a IA extrai automaticamente as tarefas da mentorada e os compromissos da equipe.</p>
                        </div>
                      )}
                    </div>

                    {!checkin && (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                        <BarChart3 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 mb-4">Nenhum check-in recebido ainda.</p>
                        <button onClick={copiarLinkCheckin}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setShowCadastro(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-teal-600" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">Novo Mentorado</h2>
              </div>
              <button onClick={() => setShowCadastro(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={cadastrarMentorado} className="p-6 space-y-4">
              {[
                { label: "Nome Completo", key: "nome", placeholder: "Ex: Ana Silva" },
                { label: "Nicho de Atuação", key: "nicho", placeholder: "Ex: Marketing Digital" },
                { label: "Foco Macro", key: "foco_macro", placeholder: "Ex: Estruturação Comercial" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{f.label}</label>
                  <input required value={(novo as any)[f.key]} onChange={e => setNovo(n => ({ ...n, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Data de Início</label>
                <input type="date" required value={novo.data_inicio} onChange={e => setNovo(n => ({ ...n, data_inicio: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCadastro(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" disabled={salvando}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors">
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
