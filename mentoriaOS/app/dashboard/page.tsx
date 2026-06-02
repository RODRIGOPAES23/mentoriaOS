"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import type { CheckinRow } from "@/lib/supabase"
import { getRealtimeClient } from "@/lib/supabase-realtime"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useEmpresa } from "@/hooks/useEmpresa"
import { C } from "@/utils/theme"
import type { Mentorado, BriefingIA } from "@/components/ck/types"

import Sidebar, { CkView } from "@/components/ck/Sidebar"
import DashboardHeader from "@/components/ck/DashboardHeader"
import { DashboardMentor } from "@/components/mentor/DashboardMentor"
import MentoradosView from "@/components/ck/views/MentoradosView"
import FinanceiroView from "@/components/ck/views/FinanceiroView"
import CalendarioOperacao from "@/components/ck/views/CalendarioOperacao"
import ConfiguracoesView from "@/components/ck/views/ConfiguracoesView"
import KanbanAtividades from "@/components/ck/KanbanAtividades"

import SessaoModal from "@/components/ck/SessaoModal"
import CallRoom from "@/components/ck/CallRoom"
import AnalisarCallModal from "@/components/ck/AnalisarCallModal"
import CadastroMentoradoModalFull from "@/components/ck/modals/CadastroMentoradoModalFull"
import EditarCadastroModal from "@/components/ck/modals/EditarCadastroModal"
import EditarMentoradoModal from "@/components/ck/modals/EditarMentoradoModal"
import HistoricoModal from "@/components/ck/modals/HistoricoModal"

// ── Helpers de domínio ────────────────────────────────────────────────────────
function gerarBriefing(m: Mentorado, c: CheckinRow): BriefingIA {
  const conv = c.vendas_reais / (c.leads_gerados || 1)
  const roi = ((c.vendas_reais - c.investimento_trafego) / (c.investimento_trafego || 1)) * 100
  return {
    diagnostico: `Volume de leads ${c.leads_gerados > 300 ? "positivo" : "abaixo do esperado"} (${c.leads_gerados} leads), conversão em R$${conv.toFixed(0)}/lead. ROI de ${roi.toFixed(0)}%. Foco: ${m.foco_macro}.`,
    pauta: [
      `Revisar as ${c.leads_gerados} captações e identificar os 20% com maior potencial de conversão`,
      `Analisar os R$${c.investimento_trafego.toLocaleString()} de investimento — ROAS atual de ${(c.vendas_reais / (c.investimento_trafego || 1)).toFixed(1)}x`,
      `${c.videos_postados} vídeos postados — estratégia de conteúdo que está gerando mais leads`,
    ],
  }
}

const MODULE_LABELS: Record<CkView, string> = {
  "visao-geral": "Visão Geral",
  "financeiro": "Financeiro",
  "mentorados": "Mentorados",
  "atividades": "Atividades",
  "calendario": "Calendário",
  "configuracoes": "Configurações",
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTAINER — gerencia dados, realtime, navegação e o Score de Urgência.
// Toda a UI vive em presenters (components/ck/*, components/ck/views/*).
// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  // Dados
  const [mentorados, setMentorados] = useState<Mentorado[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [checkin, setCheckin] = useState<CheckinRow | null>(null)
  const [historico, setHistorico] = useState<CheckinRow[]>([])
  const [briefing, setBriefing] = useState<BriefingIA | null>(null)
  const [mentorNome, setMentorNome] = useState<string>("CKlareza")
  const [mentorId, setMentorId] = useState<string | null>(null)
  const [mentorDados, setMentorDados] = useState<{ id?: string; nome: string; metodo_trabalho?: string; filosofia?: string; nicho_foco?: string; foto_url?: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Score de urgência por mentorado + badge de vencidas
  const [scoreMap, setScoreMap] = useState<Record<string, number>>({})
  const [tarefasVencidas, setTarefasVencidas] = useState(0)

  // UI / navegação
  const [ckView, setCkView] = useState<CkView>("visao-geral")
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage("ck:sidebar-collapsed", false)
  const [activeTab, setActiveTab] = useState<"pendencias" | "financeiro" | "calls" | "chat" | "materiais">("pendencias")
  const [filtroSidebar, setFiltroSidebar] = useState("")
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "error">("connecting")

  // Flags assíncronas
  const [atualizando, setAtualizando] = useState(false)
  const [briefingLoading, setBriefingLoading] = useState(false)
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [editando, setEditando] = useState(false)
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)

  // Formulários / modais
  const [editData, setEditData] = useState({ nome: "", nicho: "", foco_macro: "", status: "Ativo", cidade: "", data_fim: "", faturamento_atual: "", meta_faturamento: "", meta_atual: "" })
  const [perfilEdit, setPerfilEdit] = useState({ nome: "", nicho_foco: "", metodo_trabalho: "", filosofia: "" })
  const [configTab, setConfigTab] = useState<"geral" | "tema" | "empresa">("geral")
  const [showCadastro, setShowCadastro] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showEditarCadastro, setShowEditarCadastro] = useState(false)
  const [showHistoricoModal, setShowHistoricoModal] = useState(false)
  const [showMenuPerfil, setShowMenuPerfil] = useState(false)
  const [showSessaoModal, setShowSessaoModal] = useState(false)
  const [showCallRoom, setShowCallRoom] = useState(false)
  const [showAnalisarCall, setShowAnalisarCall] = useState(false)

  const { empresa } = useEmpresa()
  const accent = empresa.cor_primaria
  const menuPerfilRef = useRef<HTMLDivElement>(null)

  // ── INIT ────────────────────────────────────────────────────────────────────
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

  // ── UPLOAD FOTO ───────────────────────────────────────────────────────────────
  const uploadFoto = useCallback(async (file: File, type: "mentor" | "mentorado", id: string) => {
    const form = new FormData()
    form.append("file", file); form.append("type", type); form.append("id", id)
    const res = await fetch("/api/upload/avatar", { method: "POST", body: form })
    const json = await res.json()
    if (json.url) {
      if (type === "mentor") setMentorDados(prev => prev ? { ...prev, foto_url: json.url } : prev)
      else setMentorados(prev => prev.map(m => m.id === id ? { ...m, foto_url: json.url } : m))
    }
  }, [])

  // ── SCORE DE URGÊNCIA ─────────────────────────────────────────────────────────
  // Fórmula: vencidas*10 + pagaLogo*8 + (progresso<40)*5 + ultimoMes*6
  const calcularScores = useCallback(async () => {
    if (!mentorId || mentorados.length === 0) { setScoreMap({}); setTarefasVencidas(0); return }
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
    const venceuAntes = (d?: string | null) => {
      if (!d) return false
      const [y, mo, dd] = d.split("T")[0].split("-").map(Number)
      return new Date(y, mo - 1, dd) < hoje
    }
    const diasAte = (d?: string | null) => {
      if (!d) return null
      const [y, mo, dd] = d.split("T")[0].split("-").map(Number)
      return Math.ceil((new Date(y, mo - 1, dd).getTime() - hoje.getTime()) / 86400000)
    }

    const resultados = await Promise.all(mentorados.map(async m => {
      const [tRes, pRes] = await Promise.all([
        fetch(`/api/dashboard/tarefas?mentoradoId=${m.id}&status=all&t=${Date.now()}`).then(r => r.json()).catch(() => ({ tarefas: [] })),
        fetch(`/api/dashboard/pagamentos?mentoradoId=${m.id}&t=${Date.now()}`).then(r => r.json()).catch(() => ({ pagamentos: [] })),
      ])
      const tarefas: any[] = tRes.tarefas || []
      const pendentes = tarefas.filter(t => t.status === "pending")
      const vencidas = pendentes.filter(t => venceuAntes(t.data_vencimento)).length
      const total = tarefas.length
      const concluidas = total - pendentes.length
      const progresso = total > 0 ? (concluidas / total) * 100 : 100
      const pagaLogo = (pRes.pagamentos || []).some((p: any) =>
        p.status !== "pago" && (diasAte(p.data_vencimento) ?? 99) <= 3) ? 1 : 0
      const ultimoMes = (() => { const d = diasAte(m.data_fim); return d !== null && d <= 30 && d > 0 ? 1 : 0 })()
      const score = vencidas * 10 + pagaLogo * 8 + (progresso < 40 ? 1 : 0) * 5 + ultimoMes * 6
      return { id: m.id, score, vencidas }
    }))

    const map: Record<string, number> = {}
    let totalVencidas = 0
    for (const r of resultados) { map[r.id] = r.score; totalVencidas += r.vencidas }
    setScoreMap(map)
    setTarefasVencidas(totalVencidas)
  }, [mentorId, mentorados])

  useEffect(() => { calcularScores() }, [calcularScores])

  // ── SALVAR PERFIL MENTOR ───────────────────────────────────────────────────────
  const salvarPerfil = useCallback(async () => {
    if (!mentorId) return
    setSalvandoPerfil(true)
    try {
      const res = await fetch(`/api/mentor/info?mentorId=${mentorId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(perfilEdit),
      })
      if (res.ok) { recarregarMentorados() }
    } finally { setSalvandoPerfil(false) }
  }, [mentorId, perfilEdit])

  // ── RELOAD MENTORADOS ───────────────────────────────────────────────────────────
  const recarregarMentorados = useCallback(async () => {
    if (!mentorId) return
    const [resM, resMentor] = await Promise.all([
      fetch(`/api/dashboard/mentorados?mentorId=${mentorId}&t=${Date.now()}`),
      fetch(`/api/mentor/info?mentorId=${mentorId}&t=${Date.now()}`),
    ])
    const [dataM, dataMentorResp] = await Promise.all([resM.json(), resMentor.json()])
    const lista: Mentorado[] = dataM.mentorados || []
    const dataMentor = dataMentorResp.mentor || dataMentorResp
    setMentorados(lista)
    setMentorNome(dataMentor.nome || "CKlareza")
    setMentorDados(dataMentor)
    setIsAdmin(dataMentor.role === "admin")
    if (lista.length > 0 && !selectedId) setSelectedId(lista[0].id)
  }, [mentorId, selectedId])

  useEffect(() => { if (mentorId) recarregarMentorados() }, [mentorId])

  // ── CHECKIN + BRIEFING ────────────────────────────────────────────────────────
  const carregarCheckin = useCallback(async () => {
    if (!selectedId) return
    setAtualizando(true)
    try {
      const res = await fetch(`/api/dashboard/checkin?mentoradoId=${selectedId}&t=${Date.now()}`)
      const json = await res.json()
      if (json.checkin) {
        setCheckin(json.checkin)
        setHistorico(json.historico || [])
        const sel = mentorados.find(m => m.id === selectedId)
        if (sel) setBriefing(json.checkin.briefing_ia ?? gerarBriefing(sel, json.checkin))
      } else { setCheckin(null); setBriefing(null) }
    } finally { setAtualizando(false) }
  }, [selectedId, mentorados])

  useEffect(() => {
    if (!selectedId) return
    setCheckin(null); setBriefing(null); setHistorico([])
    carregarCheckin()
  }, [selectedId])

  // ── REALTIME (checkins + sessoes + tarefas) ────────────────────────────────────
  useEffect(() => {
    if (!mentorId) return
    const supabase = getRealtimeClient()
    const ch = supabase.channel(`ck-dashboard-${mentorId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "checkins" }, () => { carregarCheckin() })
      .on("postgres_changes", { event: "*", schema: "public", table: "sessoes" }, () => {})
      .on("postgres_changes", { event: "*", schema: "public", table: "tarefas" }, () => { calcularScores() })
      .subscribe((s: string) => setRealtimeStatus(s === "SUBSCRIBED" ? "connected" : s === "CHANNEL_ERROR" ? "error" : "connecting"))
    return () => { supabase.removeChannel(ch) }
  }, [mentorId, carregarCheckin, calcularScores])

  // ── GERAR BRIEFING IA ──────────────────────────────────────────────────────────
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

  // Seed do perfil do mentor (uma vez) para a aba Config › Meu Perfil
  useEffect(() => {
    if (!mentorDados) return
    setPerfilEdit(p => (p.nome || p.nicho_foco || p.metodo_trabalho || p.filosofia) ? p : {
      nome: mentorDados.nome || "",
      nicho_foco: mentorDados.nicho_foco || "",
      metodo_trabalho: mentorDados.metodo_trabalho || "",
      filosofia: mentorDados.filosofia || "",
    })
  }, [mentorDados])

  // ── CRUD MENTORADO ───────────────────────────────────────────────────────────
  const editarMentorado = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    setEditando(true)
    try {
      const res = await fetch(`/api/dashboard/mentorados/${selectedId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editData),
      })
      if (res.ok) { setShowEditModal(false); recarregarMentorados() }
    } finally { setEditando(false) }
  }, [editData, selectedId, recarregarMentorados])

  const deletarMentorado = useCallback(async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este mentorado? Todos os dados serão perdidos.")) return
    const res = await fetch(`/api/dashboard/mentorados/${id}`, { method: "DELETE" })
    if (res.ok) { setSelectedId(""); recarregarMentorados() }
  }, [recarregarMentorados])

  const copiarLinkCheckin = useCallback(async () => {
    const codigo = mentorados.find(m => m.id === selectedId)?.codigo_acesso
    if (!codigo) return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/m/${codigo}`)
      setLinkCopiado(true)
      setTimeout(() => setLinkCopiado(false), 2000)
    } catch {}
  }, [selectedId, mentorados])

  const abrirEditarMentorado = useCallback(() => {
    const sel = mentorados.find(m => m.id === selectedId)
    if (!sel) return
    setEditData({
      nome: sel.nome, nicho: sel.nicho, foco_macro: sel.foco_macro, status: "Ativo",
      cidade: sel.cidade || "", data_fim: sel.data_fim || "",
      faturamento_atual: sel.faturamento_atual?.toString() || "", meta_faturamento: sel.meta_faturamento?.toString() || "",
      meta_atual: sel.meta_atual || "",
    })
    setShowEditModal(true)
  }, [mentorados, selectedId])

  // ── DERIVADOS ──────────────────────────────────────────────────────────────────
  const termoBusca = filtroSidebar.trim().toLowerCase()
  const base = !termoBusca
    ? mentorados
    : mentorados.filter(m => [m.nome, m.nicho, m.cidade || ""].join(" ").toLowerCase().includes(termoBusca))
  // Ordena por Score de Urgência (desc); empates preservam a ordem manual (dnd)
  const filtered = [...base].sort((a, b) => (scoreMap[b.id] || 0) - (scoreMap[a.id] || 0))
  const selected = mentorados.find(m => m.id === selectedId)

  const logout = () => { localStorage.removeItem("mentorSelecionado"); window.location.href = "/" }

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden"
      style={{ background: C.bg, ["--ck-accent" as any]: accent, ["--ck-accent-2" as any]: empresa.cor_secundaria }}>
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
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          moduleLabel={MODULE_LABELS[ckView]}
          realtimeConnected={realtimeStatus === "connected"}
          mentorNome={mentorNome}
          mentorFotoUrl={mentorDados?.foto_url}
          tarefasVencidas={tarefasVencidas}
          showMenu={showMenuPerfil}
          setShowMenu={setShowMenuPerfil}
          menuRef={menuPerfilRef}
          onVencidas={() => setCkView("atividades")}
          onConfiguracoes={() => { setConfigTab("geral"); setCkView("configuracoes"); setShowMenuPerfil(false) }}
          onSair={logout}
        />

        <main className="flex-1 overflow-y-auto">
          {ckView === "visao-geral" && mentorId && (
            <div className="p-6">
              <DashboardMentor mentorId={mentorId} accent={accent}
                onAbrirMentorado={(id) => { setSelectedId(id); setCkView("mentorados") }}
                onIrFinanceiro={() => setCkView("financeiro")}
                onIrMentorados={() => setCkView("mentorados")} />
            </div>
          )}

          {ckView === "financeiro" && mentorId && (
            <FinanceiroView mentorId={mentorId} accent={accent} mentorados={mentorados}
              onAbrirMentorado={(id) => { setSelectedId(id); setActiveTab("financeiro"); setCkView("mentorados") }} />
          )}

          {ckView === "atividades" && mentorId && (
            <KanbanAtividades mentorados={mentorados}
              onAbrirMentorado={(id) => { setSelectedId(id); setCkView("mentorados") }} />
          )}

          {ckView === "mentorados" && (
            <MentoradosView
              filtered={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
              filtroSidebar={filtroSidebar}
              setFiltroSidebar={setFiltroSidebar}
              onNovoMentorado={() => setShowCadastro(true)}
              selected={selected}
              checkin={checkin}
              historico={historico}
              briefing={briefing}
              mentorId={mentorId}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tarefasVencidas={tarefasVencidas}
              atualizando={atualizando}
              linkCopiado={linkCopiado}
              briefingLoading={briefingLoading}
              accent={accent}
              onUploadFoto={uploadFoto}
              onCopiarLink={copiarLinkCheckin}
              onAtualizarCheckin={carregarCheckin}
              onAgendarSessao={() => setShowSessaoModal(true)}
              onIniciarChamada={() => setShowCallRoom(true)}
              onGerarBriefing={gerarBriefingIA}
              onAnalisarCall={() => setShowAnalisarCall(true)}
              onEditarCadastro={() => setShowEditarCadastro(true)}
              onHistorico={() => setShowHistoricoModal(true)}
              onEditarRapido={abrirEditarMentorado}
            />
          )}

          {ckView === "calendario" && mentorId && (
            <CalendarioOperacao mentorId={mentorId} mentorados={mentorados} accent={accent}
              onAgendar={() => setShowSessaoModal(true)} />
          )}

          {ckView === "configuracoes" && mentorId && (
            <ConfiguracoesView
              key={`config-${configTab}`}
              mentorId={mentorId}
              accent={accent}
              isAdmin={isAdmin}
              mentorNome={mentorNome}
              mentorDados={mentorDados}
              perfilEdit={perfilEdit}
              setPerfilEdit={setPerfilEdit}
              salvandoPerfil={salvandoPerfil}
              onSalvarPerfil={salvarPerfil}
              onUploadFoto={uploadFoto}
              onAbrirMentorado={(id) => { setSelectedId(id); setCkView("mentorados") }}
              initialTab={configTab}
            />
          )}
        </main>
      </div>

      {/* ── MODAIS ─────────────────────────────────────────────────────────────── */}
      {showSessaoModal && mentorId && (
        <SessaoModal
          mentorId={mentorId}
          mentorados={mentorados.map(m => ({ id: m.id, nome: m.nome }))}
          mentoradoIdInicial={selectedId}
          onClose={() => setShowSessaoModal(false)}
          onCriado={() => { setShowSessaoModal(false) }}
        />
      )}

      {showCallRoom && selected && mentorId && (
        <CallRoom mentoradoId={selected.id} mentorId={mentorId} nomeMentorado={selected.nome}
          nomeMentor={mentorNome} briefing={briefing} onClose={() => setShowCallRoom(false)} />
      )}

      {showAnalisarCall && selected && mentorId && (
        <AnalisarCallModal mentoradoId={selected.id} mentorId={mentorId} nomeMentorado={selected.nome}
          onClose={() => setShowAnalisarCall(false)} onTarefasCriadas={() => setActiveTab("pendencias")} />
      )}

      {showCadastro && mentorId && (
        <CadastroMentoradoModalFull
          mentorId={mentorId}
          onClose={() => setShowCadastro(false)}
          onCriado={(id) => { setShowCadastro(false); if (id) setSelectedId(id); recarregarMentorados() }}
        />
      )}

      {showEditarCadastro && selected && (
        <EditarCadastroModal
          mentoradoId={selectedId}
          nome={selected.nome}
          onClose={() => setShowEditarCadastro(false)}
          onSalvo={() => { setShowEditarCadastro(false); recarregarMentorados() }}
        />
      )}

      {showEditModal && selected && (
        <EditarMentoradoModal selected={selected} selectedId={selectedId}
          editData={editData} setEditData={setEditData} editando={editando}
          onSubmit={editarMentorado} onDelete={deletarMentorado}
          onUploadFoto={uploadFoto} onClose={() => setShowEditModal(false)} />
      )}

      {showHistoricoModal && selected && (
        <HistoricoModal selected={selected} historico={historico} onClose={() => setShowHistoricoModal(false)} />
      )}
    </div>
  )
}
