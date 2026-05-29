"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { Search, Bell, TrendingUp, TrendingDown, Minus, Target, BarChart3, Zap, CheckCircle2, AlertCircle, Clock, Link2, Copy, Check, UserPlus, X, RefreshCw, Edit2, Trash2, LogOut, User, History, ChevronRight, Calendar, Briefcase, BookOpen } from "lucide-react"
import type { CheckinRow } from "@/lib/supabase"
import PendenciasSection from "@/components/PendenciasSection"

interface Mentorado {
  id: string
  nome: string
  nicho: string
  status: string
  foco_macro: string
  data_inicio: string
  foto_url?: string
}

interface BriefingIA {
  diagnostico: string
  evolucao?: string
  pauta: string[]
}

// Calcula variação % entre a semana atual e a anterior (do histórico real).
function variacao(historicoDesc: CheckinRow[], campo: keyof CheckinRow): number | null {
  if (!historicoDesc || historicoDesc.length < 2) return null
  const atual = Number(historicoDesc[0][campo]) || 0
  const anterior = Number(historicoDesc[1][campo]) || 0
  if (anterior === 0) return atual > 0 ? 100 : null
  return ((atual - anterior) / anterior) * 100
}

function gerarBriefing(m: Mentorado, c: CheckinRow): BriefingIA {
  const conversao = c.vendas_reais / (c.leads_gerados || 1)
  const roi = ((c.vendas_reais - c.investimento_trafego) / (c.investimento_trafego || 1)) * 100

  return {
    diagnostico: `Volume de leads ${c.leads_gerados > 300 ? "positivo" : "abaixo do esperado"} (${c.leads_gerados} leads), mas a conversão comercial está em R$${conversao.toFixed(0)}/lead. ROI de ${roi.toFixed(0)}%. Foco em: ${m.foco_macro}.`,
    pauta: [
      `Auditar os últimos 5 atendimentos comerciais (0-10m)`,
      `Revisar script e alinhar criativos com o nicho "${m.nicho}" (10-25m)`,
      `Definir meta de conversão e próximos KPIs para destravar crescimento (25-30m)`,
    ],
  }
}

// Sparkline real: desenha a série histórica (cronológica) escalada ao card.
function Sparkline({ valores }: { valores: number[] }) {
  if (!valores || valores.length === 0) {
    return <svg width="60" height="30" viewBox="0 0 60 30" className="w-full h-auto" />
  }
  // Uma só semana: linha plana neutra.
  if (valores.length === 1) {
    return (
      <svg width="60" height="30" viewBox="0 0 60 30" className="w-full h-auto">
        <polyline points="0,15 60,15" fill="none" stroke="#9ca3af" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    )
  }
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const span = max - min || 1
  const W = 60
  const H = 30
  const pad = 3
  const pts = valores.map((v, i) => {
    const x = (i / (valores.length - 1)) * W
    const y = H - pad - ((v - min) / span) * (H - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const subindo = valores[valores.length - 1] >= valores[0]
  const cor = subindo ? "#10b981" : "#ef4444"
  return (
    <svg width="60" height="30" viewBox="0 0 60 30" className="w-full h-auto">
      <polyline points={pts.join(" ")} fill="none" stroke={cor} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

// Badge de tendência (% vs semana anterior) com cor e seta.
function Trend({ pct }: { pct: number | null }) {
  if (pct === null) return <p className="text-xs text-slate-500 mt-1">1ª semana</p>
  const up = pct > 0.5
  const down = pct < -0.5
  const cor = up ? "text-emerald-400" : down ? "text-red-400" : "text-slate-400"
  const seta = up ? "↑" : down ? "↓" : "—"
  return (
    <p className={`text-xs font-semibold mt-1 ${cor}`}>
      {seta} {pct > 0 ? "+" : ""}{pct.toFixed(0)}% vs sem.ant
    </p>
  )
}

export default function DashboardPage() {
  const [mentorados, setMentorados] = useState<Mentorado[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [checkin, setCheckin] = useState<CheckinRow | null>(null)
  const [historico, setHistorico] = useState<CheckinRow[]>([])
  const [briefing, setBriefing] = useState<BriefingIA | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [mentorNome, setMentorNome] = useState<string>("S.O. MENTORIA")
  const [showCadastro, setShowCadastro] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [novo, setNovo] = useState({ nome: "", nicho: "", foco_macro: "", data_inicio: "" })
  const [atualizando, setAtualizando] = useState(false)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null)

  const [briefingLoading, setBriefingLoading] = useState(false)
  const briefingCache = useRef<Map<string, BriefingIA>>(new Map())

  const [selectedMetric, setSelectedMetric] = useState<"leads" | "vendas" | "investimento" | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState({ nome: "", nicho: "", foco_macro: "", status: "Ativo" })
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
  const menuPerfilRef = useRef<HTMLDivElement>(null)

  // Proteger dashboard: se não tiver mentor selecionado, redirecionar para home
  useEffect(() => {
    const mentorSelecionado = localStorage.getItem("mentorSelecionado")
    if (!mentorSelecionado) {
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
    } else {
      setMentorId(mentorSelecionado)
    }
  }, [])

  // Fechar menu ao clicar fora (checa tanto o botão quanto o dropdown)
  useEffect(() => {
    if (!showMenuPerfil) return
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      // Se clicou no botão do avatar (dentro do menuPerfilRef), ignora
      if (menuPerfilRef.current && menuPerfilRef.current.contains(target)) return
      // Qualquer outro clique fecha o menu
      setShowMenuPerfil(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showMenuPerfil])

  // Upload de foto (mentor ou mentorado)
  const uploadFoto = useCallback(async (file: File, type: "mentor" | "mentorado", id: string) => {
    setUploadingFoto(id)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("type", type)
      form.append("id", id)
      const res = await fetch("/api/upload/avatar", { method: "POST", body: form })
      const json = await res.json()
      if (json.url) {
        if (type === "mentor") {
          setMentorDados(prev => prev ? { ...prev, foto_url: json.url } : prev)
        } else {
          setMentorados(prev => prev.map(m => m.id === id ? { ...m, foto_url: json.url } : m))
        }
      }
    } catch (e) {
      console.error("Erro ao fazer upload:", e)
    } finally {
      setUploadingFoto(null)
    }
  }, [])

  // Salvar perfil do mentor
  const salvarPerfil = useCallback(async () => {
    if (!mentorId) return
    setSalvandoPerfil(true)
    try {
      const res = await fetch(`/api/mentor/info?mentorId=${mentorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(perfilEdit),
      })
      const json = await res.json()
      if (json.mentor) {
        setMentorDados(json.mentor)
        setMentorNome(json.mentor.nome)
        setEditandoPerfil(false)
      }
    } catch (e) {
      console.error("Erro ao salvar perfil:", e)
    } finally {
      setSalvandoPerfil(false)
    }
  }, [mentorId, perfilEdit])

  // Buscar checkin mais recente (via API server-side: ignora RLS).
  // cache:"no-store" + cache-buster garantem dado sempre fresco (sem cache do browser/edge).
  // Define só o checkin; o briefing IA é gerado por um effect separado (1x por check-in).
  const buscarCheckin = useCallback(async (mentoradoId: string) => {
    try {
      const res = await fetch(`/api/dashboard/checkin?mentoradoId=${mentoradoId}&t=${Date.now()}`, {
        cache: "no-store",
      })
      const json = await res.json()
      setCheckin((json.checkin as CheckinRow | null) ?? null)
      setHistorico((json.historico as CheckinRow[]) ?? [])
      setUltimaAtualizacao(new Date())
    } catch {
      setCheckin(null)
      setHistorico([])
    }
  }, [])

  // Atualização manual / sob demanda do mentorado selecionado
  const refreshAgora = useCallback(async () => {
    if (!selectedId) return
    setAtualizando(true)
    await buscarCheckin(selectedId)
    setAtualizando(false)
  }, [selectedId, buscarCheckin])

  // Carrega lista de mentorados (reutilizável após cadastro)
  const recarregarMentorados = useCallback(async (selecionarId?: string) => {
    try {
      // Pegar mentor selecionado do localStorage
      const mentorId = localStorage.getItem("mentorSelecionado")
      const params = new URLSearchParams({ t: Date.now().toString() })
      if (mentorId) {
        params.append("mentorId", mentorId)
      }

      const res = await fetch(`/api/dashboard/mentorados?${params}`, { cache: "no-store" })
      const json = await res.json()
      const lista = (json.mentorados || []) as Mentorado[]
      setMentorados(lista)
      if (lista.length > 0) {
        setSelectedId(selecionarId && lista.some((m) => m.id === selecionarId) ? selecionarId : lista[0].id)
      }
    } catch {
      // mantém vazio
    }
    setLoading(false)
  }, [])

  // Carregar nome do mentor selecionado
  useEffect(() => {
    const carregarMentor = async () => {
      try {
        const mentorId = localStorage.getItem("mentorSelecionado")
        if (!mentorId) return

        const res = await fetch(`/api/mentor/info?mentorId=${mentorId}`, {
          cache: "no-store",
        })
        const json = await res.json()
        if (json.mentor?.nome) {
          setMentorNome(json.mentor.nome)
          setMentorDados(json.mentor)
        }
      } catch {
        // fallback: manter "S.O. MENTORIA"
      }
    }
    carregarMentor()
  }, [])

  useEffect(() => {
    recarregarMentorados()
  }, [recarregarMentorados])

  // Selecionar automaticamente o primeiro mentorado quando a lista carrega
  useEffect(() => {
    if (mentorados.length > 0 && !selectedId) {
      setSelectedId(mentorados[0].id)
    }
  }, [mentorados, selectedId])

  // Gerar / copiar link do formulário do mentorado selecionado
  const copiarLink = useCallback(async () => {
    if (!selectedId) return
    const link = `${window.location.origin}/form/${selectedId}`
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      // fallback silencioso
    }
    setLinkCopiado(true)
    setTimeout(() => setLinkCopiado(false), 2500)
  }, [selectedId])

  // Cadastrar novo mentorado
  const cadastrarMentorado = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🎯 Cadastrar mentorado clicado", { novo })

    if (!novo.nome.trim()) {
      console.warn("⚠️ Nome vazio")
      return
    }

    setSalvando(true)
    try {
      // Incluir mentor_id ao cadastrar
      const mentorId = localStorage.getItem("mentorSelecionado")
      console.log("📝 Mentor ID:", mentorId)

      const dadosMentorado = {
        ...novo,
        mentor_id: mentorId,
      }

      console.log("📤 Enviando dados:", dadosMentorado)

      const res = await fetch("/api/dashboard/mentorados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosMentorado),
      })

      console.log("📥 Response status:", res.status)

      const json = await res.json()
      console.log("📥 Response JSON:", json)

      if (res.ok && json.mentorado) {
        console.log("✅ Sucesso! Mentorado criado:", json.mentorado)
        setShowCadastro(false)
        setNovo({ nome: "", nicho: "", foco_macro: "", data_inicio: "" })
        await recarregarMentorados(json.mentorado.id)
      } else {
        console.error("❌ Erro na resposta:", json)
      }
    } catch (err) {
      console.error("❌ Erro ao cadastrar:", err)
    } finally {
      setSalvando(false)
    }
  }, [novo, recarregarMentorados])

  // Editar mentorado
  const editarMentorado = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    setEditando(true)
    try {
      const res = await fetch(`/api/dashboard/mentorados/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      })
      if (res.ok) {
        setShowEditModal(false)
        await recarregarMentorados(selectedId)
      }
    } finally {
      setEditando(false)
    }
  }, [selectedId, editData, recarregarMentorados])

  // Deletar mentorado
  const deletarMentorado = useCallback(async () => {
    if (!selectedId || !window.confirm("Tem certeza que deseja deletar este mentorado? Todos os check-ins também serão deletados.")) return
    setEditando(true)
    try {
      const res = await fetch(`/api/dashboard/mentorados/${selectedId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setSelectedId(null) // Reset selection
        await recarregarMentorados()
      }
    } finally {
      setEditando(false)
    }
  }, [selectedId, recarregarMentorados])

  // Buscar checkin quando mentorado muda
  useEffect(() => {
    if (!selectedId || mentorados.length === 0) return
    buscarCheckin(selectedId)
  }, [selectedId, mentorados, buscarCheckin])

  // Gera o Briefing IA (Gemini Flash via OpenRouter) 1x por check-in.
  // Cache por id evita chamar a IA a cada polling. Template entra como
  // fallback instantâneo enquanto a IA responde (ou se ela falhar).
  useEffect(() => {
    if (!checkin || !selected) {
      setBriefing(null)
      return
    }
    const cid = checkin.id
    const cached = briefingCache.current.get(cid)
    if (cached) {
      setBriefing(cached)
      return
    }
    setBriefing(gerarBriefing(selected, checkin)) // fallback instantâneo
    setBriefingLoading(true)
    let cancelado = false
    fetch("/api/dashboard/briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentoradoId: selected.id, checkinId: cid }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (cancelado) return
        if (j?.briefing && Array.isArray(j.briefing.pauta)) {
          briefingCache.current.set(cid, j.briefing)
          setBriefing(j.briefing)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setBriefingLoading(false)
      })
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkin?.id, selectedId])

  // Auto-refresh (polling): novos check-ins enviados pelo mentorado aparecem
  // sem reload. Realtime via anon é bloqueado pelo RLS, então usamos polling.
  useEffect(() => {
    if (!selectedId || mentorados.length === 0) return
    const id = setInterval(() => buscarCheckin(selectedId), 8000)
    return () => clearInterval(id)
  }, [selectedId, mentorados, buscarCheckin])

  // Atualiza na hora quando o mentor volta para a aba do dashboard
  // (ex.: enviou o form no celular/outra aba e voltou aqui).
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "visible" && selectedId) {
        buscarCheckin(selectedId)
      }
    }
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onFocus)
    return () => {
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onFocus)
    }
  }, [selectedId, mentorados, buscarCheckin])

  const selected = mentorados.find((m) => m.id === selectedId)
  const filtered = mentorados.filter((m) =>
    m.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Séries cronológicas (mais antiga → mais recente) para os mini-gráficos reais.
  const cronologico = [...historico].reverse()
  const serieLeads = cronologico.map((c) => Number(c.leads_gerados) || 0)
  const serieVendas = cronologico.map((c) => Number(c.vendas_reais) || 0)
  const serieInvest = cronologico.map((c) => Number(c.investimento_trafego) || 0)
  // Variações % vs semana anterior (histórico real).
  const varLeads = variacao(historico, "leads_gerados")
  const varVendas = variacao(historico, "vendas_reais")
  const varInvest = variacao(historico, "investimento_trafego")

  // Componente: Modal com histórico de uma métrica específica.
  const HistoryModal = ({ metric }: { metric: "leads" | "vendas" | "investimento" }) => {
    const metricLabels = {
      leads: { label: "Leads Gerados", key: "leads_gerados" as keyof CheckinRow },
      vendas: { label: "Vendas Reais (R$)", key: "vendas_reais" as keyof CheckinRow },
      investimento: { label: "Investimento (R$)", key: "investimento_trafego" as keyof CheckinRow },
    }
    const config = metricLabels[metric]
    // Prepara dados para o gráfico (cronológico: antiga → recente)
    const chartData = cronologico.map((c, i) => ({
      semana: `S${i + 1}`,
      valor: Number(c[config.key]) || 0,
      data: new Date(c.data_envio).toLocaleDateString("pt-BR"),
    }))

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900/95 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
            <div>
              <h2 className="text-xl font-bold text-white">{config.label}</h2>
              <p className="text-xs text-slate-400 mt-1">Histórico de {cronologico.length} semana(s)</p>
            </div>
            <button
              onClick={() => setSelectedMetric(null)}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Gráfico usando recharts */}
          <div className="p-6">
            {chartData.length > 0 ? (
              <>
                <div className="mb-6">
                  {/* Renderizar com recharts se disponível, senão SVG manual */}
                  <svg viewBox="0 0 500 200" className="w-full h-64 bg-slate-950/30 rounded-lg p-4">
                    {/* Eixos */}
                    <line x1="40" y1="160" x2="480" y2="160" stroke="#475569" strokeWidth="1" />
                    <line x1="40" y1="20" x2="40" y2="160" stroke="#475569" strokeWidth="1" />

                    {/* Grid e valores */}
                    {chartData.map((d, i) => {
                      const x = 40 + (i / (chartData.length - 1 || 1)) * 440
                      const maxVal = Math.max(...chartData.map((c) => c.valor), 1)
                      const y = 160 - (d.valor / maxVal) * 120

                      return (
                        <g key={i}>
                          {/* Ponto */}
                          <circle
                            cx={x}
                            cy={y}
                            r="4"
                            fill={metric === "leads" ? "#10b981" : metric === "vendas" ? "#a855f7" : "#94a3b8"}
                          />
                          {/* Label (semana) */}
                          <text
                            x={x}
                            y="175"
                            textAnchor="middle"
                            fontSize="12"
                            fill="#94a3b8"
                          >
                            {d.semana}
                          </text>
                          {/* Valor acima do ponto */}
                          <text
                            x={x}
                            y={y - 8}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#e2e8f0"
                            fontWeight="600"
                          >
                            {d.valor.toLocaleString("pt-BR")}
                          </text>
                        </g>
                      )
                    })}

                    {/* Linhas conectando os pontos */}
                    {chartData.map((_, i) => {
                      if (i === 0) return null
                      const x1 = 40 + ((i - 1) / (chartData.length - 1 || 1)) * 440
                      const x2 = 40 + (i / (chartData.length - 1 || 1)) * 440
                      const maxVal = Math.max(...chartData.map((c) => c.valor), 1)
                      const y1 = 160 - (chartData[i - 1].valor / maxVal) * 120
                      const y2 = 160 - (chartData[i].valor / maxVal) * 120
                      const color =
                        metric === "leads" ? "#10b981" : metric === "vendas" ? "#a855f7" : "#94a3b8"
                      return <line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" />
                    })}
                  </svg>
                </div>

                {/* Tabela detalhada */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Detalhes por Semana</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {chartData.map((d, i) => {
                      const anterior = i > 0 ? chartData[i - 1].valor : null
                      const var_pct = anterior ? (((d.valor - anterior) / anterior) * 100).toFixed(0) : null
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-slate-950/30 rounded-lg border border-slate-700/20 hover:border-slate-600/30 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-semibold text-white">{d.semana}</p>
                            <p className="text-xs text-slate-400">{d.data}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-200">
                              {d.valor.toLocaleString("pt-BR")}
                            </p>
                            {var_pct && (
                              <p
                                className={`text-xs font-semibold ${
                                  parseFloat(var_pct) > 0
                                    ? "text-green-400"
                                    : parseFloat(var_pct) < 0
                                      ? "text-red-400"
                                      : "text-slate-400"
                                }`}
                              >
                                {parseFloat(var_pct) > 0 ? "↑" : "↓"} {var_pct}%
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-center py-8">Sem dados disponíveis</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          <p className="text-slate-400 text-sm">Conectando ao banco de dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex overflow-hidden">
      {/* ── SIDEBAR ESQUERDA ── */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} flex-shrink-0 bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-xl border-r border-slate-700/20 flex flex-col overflow-y-auto transition-all duration-300`} data-test="premium-sidebar-v2">
        {/* Logo Section + Toggle */}
        <div className="p-4 border-b border-slate-700/20">
          <div className="flex items-center justify-between gap-2">
            <div className={`flex items-center gap-3 ${sidebarOpen ? "opacity-100" : "opacity-0 hidden"} transition-opacity duration-300`}>
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                {mentorDados?.foto_url ? (
                  <img src={mentorDados.foto_url} alt={mentorNome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white">
                    {mentorNome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">{mentorNome}</h1>
                <p className="text-[10px] text-slate-400">S.O. MENTORIA</p>
              </div>
            </div>
            {/* Logo Compacto (quando recolhido) */}
            {!sidebarOpen && (
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                {mentorDados?.foto_url ? (
                  <img src={mentorDados.foto_url} alt={mentorNome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white">
                    {mentorNome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            )}
            {/* Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-800/50 rounded-lg transition-colors"
              title={sidebarOpen ? "Recolher" : "Expandir"}
            >
              {sidebarOpen ? (
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        {sidebarOpen && (
          <div className="px-4 pt-4 pb-3 transition-all duration-300">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar mentorado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Botão Cadastrar Mentorado */}
        <div className={`px-4 pb-2 transition-all duration-300 ${!sidebarOpen && "flex justify-center"}`}>
          <button
            onClick={() => setShowCadastro(true)}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition-all duration-200 ${sidebarOpen ? "w-full" : "p-2"}`}
            title={!sidebarOpen ? "Cadastrar Mentorado" : undefined}
          >
            <UserPlus className="w-4 h-4" />
            {sidebarOpen && "Cadastrar Mentorado"}
          </button>
        </div>

        {/* Mentorados List */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? "px-3 space-y-1.5" : "px-2 space-y-2 flex flex-col items-center"}`}>
          {sidebarOpen && (
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mt-4 mb-3">Mentorados Ativos</p>
          )}
          {filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className={`group relative rounded-lg transition-all duration-200 flex items-center gap-3 ${
                sidebarOpen ? "w-full p-3" : "p-2"
              } ${
                selectedId === m.id
                  ? "bg-gradient-to-r from-blue-600/30 to-blue-500/20 border border-blue-500/40 shadow-lg shadow-blue-500/10"
                  : "bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600/50"
              }`}
              title={!sidebarOpen ? m.nome : undefined}
            >
              <div className={`rounded-full overflow-hidden flex-shrink-0 ${sidebarOpen ? "w-10 h-10" : "w-8 h-8"}`}>
                {m.foto_url ? (
                  <img src={m.foto_url} alt={m.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold">
                    {m.nome.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-white truncate">{m.nome}</p>
                    <p className="text-[10px] text-slate-400 truncate">{m.nicho}</p>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    m.status === "Ativo" ? "bg-emerald-400 shadow-lg shadow-emerald-400/50" : "bg-slate-500"
                  }`} />
                </>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-700/20 transition-all duration-300">
            <div className="text-[10px] text-slate-500 text-center">
              <p>Dashboard v2.0</p>
              <p className="mt-1">Powered by Supabase + Claude</p>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* NAVBAR TOPO */}
        <nav className="flex-shrink-0 bg-gradient-to-r from-slate-900/40 via-slate-900/20 to-transparent backdrop-blur-xl border-b border-slate-700/20 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {selected?.nome || "Dashboard"}
            </h2>
            <div className="hidden md:block text-sm text-slate-500">
              {selected?.nicho && `• ${selected.nicho}`}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Menu Perfil */}
            <div className="relative" ref={menuPerfilRef}>
              <button
                onClick={() => setShowMenuPerfil(!showMenuPerfil)}
                className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg hover:scale-105 hover:shadow-blue-500/30 transition-all cursor-pointer"
                title="Menu do mentor"
              >
                {mentorNome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </button>

              {/* Dropdown renderizado via Portal no body — evita z-index/stacking context */}
            </div>
          </div>
        </nav>

        {/* CONTENT SCROLL */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {selected ? (
              <>
                {/* ── HEADER INFO CARD ── */}
                <div className="group bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 shadow-2xl hover:border-slate-700/50 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">
                        {selected.nome}
                        <span className="text-slate-400 text-sm font-normal ml-2">({selected.nicho})</span>
                      </h1>
                      <div className="flex gap-4 text-sm text-slate-400">
                        <span>📅 Início: <span className="text-slate-300">{selected.data_inicio}</span></span>
                        <span>🎯 Foco: <span className="text-slate-300">{selected.foco_macro}</span></span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full shadow-lg shadow-emerald-500/10">
                        ATIVO
                      </span>
                      <button
                        onClick={copiarLink}
                        title="Copiar link do formulário para enviar ao mentorado"
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                          linkCopiado
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                            : "bg-blue-500/15 border-blue-500/30 text-blue-300 hover:bg-blue-500/25 hover:border-blue-500/50"
                        }`}
                      >
                        {linkCopiado ? (
                          <><Check className="w-3.5 h-3.5" /> Link copiado!</>
                        ) : (
                          <><Link2 className="w-3.5 h-3.5" /> Gerar Link do Formulário</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── PENDÊNCIAS DO MENTORADO ── */}
                <PendenciasSection mentoradoId={selectedId} mentorId={mentorId} />

                {/* ── MÉTRICAS GRID 3 COLUNAS ── */}
                <div>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">📊 Métricas da Semana</p>
                    <div className="flex items-center gap-3">
                      {ultimaAtualizacao && (
                        <span className="text-[10px] text-slate-500">
                          Atualizado {ultimaAtualizacao.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      )}
                      <button
                        onClick={refreshAgora}
                        disabled={atualizando}
                        title="Atualizar agora"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all disabled:opacity-60"
                      >
                        <RefreshCw className={`w-3 h-3 ${atualizando ? "animate-spin" : ""}`} />
                        {atualizando ? "Atualizando" : "Atualizar"}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {/* LEADS */}
                    <div
                      onClick={() => historico.length > 0 && setSelectedMetric("leads")}
                      className="group bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-xl p-5 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Leads Gerados</p>
                        <Target className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="mb-3">
                        <p className="text-3xl font-bold text-white">{checkin?.leads_gerados ?? "—"}</p>
                        {checkin ? <Trend pct={varLeads} /> : <p className="text-xs text-slate-500 mt-1">Sem dados</p>}
                      </div>
                      {checkin && <Sparkline valores={serieLeads} />}
                    </div>

                    {/* VENDAS */}
                    <div
                      onClick={() => historico.length > 0 && setSelectedMetric("vendas")}
                      className="group bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/30 rounded-xl p-5 shadow-xl hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Vendas Reais</p>
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="mb-3">
                        <p className="text-3xl font-bold text-white">
                          {checkin ? `R$ ${checkin.vendas_reais.toLocaleString("pt-BR")}` : "—"}
                        </p>
                        {checkin ? <Trend pct={varVendas} /> : <p className="text-xs text-slate-500 mt-1">Sem dados</p>}
                      </div>
                      {checkin && <Sparkline valores={serieVendas} />}
                    </div>

                    {/* INVESTIDO */}
                    <div
                      onClick={() => historico.length > 0 && setSelectedMetric("investimento")}
                      className="group bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent border border-slate-600/30 rounded-xl p-5 shadow-xl hover:shadow-2xl hover:border-slate-600/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Investido</p>
                        <Zap className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="mb-3">
                        <p className="text-3xl font-bold text-white">
                          {checkin ? `R$ ${checkin.investimento_trafego.toLocaleString("pt-BR")}` : "—"}
                        </p>
                        {checkin ? <Trend pct={varInvest} /> : <p className="text-xs text-slate-500 mt-1">Sem dados</p>}
                      </div>
                      {checkin && <Sparkline valores={serieInvest} />}
                    </div>
                  </div>
                </div>

                {/* ── BRIEFING IA ── */}
                <div className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">🤖 Briefing da IA (Gemini Flash)</p>
                      {briefingLoading && (
                        <span className="flex items-center gap-1.5 text-[10px] text-blue-300">
                          <Zap className="w-3 h-3 animate-pulse" /> Gerando análise inteligente…
                        </span>
                      )}
                    </div>

                    {briefing ? (
                      <div className="space-y-5">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Diagnóstico do Gargalo</p>
                            <p className="text-sm text-slate-300 leading-relaxed">{briefing.diagnostico}</p>
                          </div>
                        </div>

                        {briefing.evolucao && (
                          <>
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
                            <div className="flex gap-4">
                              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Evolução vs Semanas Anteriores</p>
                                <p className="text-sm text-slate-300 leading-relaxed">{briefing.evolucao}</p>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-blue-400" />
                            </div>
                            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Pauta da Call (30-60 min)</p>
                          </div>
                          <ol className="space-y-2 ml-14">
                            {briefing.pauta.map((item, i) => (
                              <li key={i} className="text-sm text-slate-300 flex gap-2">
                                <span className="font-semibold text-slate-500 flex-shrink-0">{i + 1}.</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm italic">
                        Aguardando dados do formulário semanal para gerar briefing...
                      </div>
                    )}
                  </div>
                </div>

                {/* ── BLOCOS INFERIORES GRID 2 ── */}
                <div className="grid grid-cols-2 gap-6">
                  {/* DIFICULDADES */}
                  <div className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-slate-700/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-5 h-5 text-orange-400" />
                      <p className="text-sm font-bold text-white">Entrada Bruta - Aluno</p>
                    </div>
                    {checkin?.dificuldades_texto ? (
                      <p className="text-sm text-slate-300 leading-relaxed">
                        <span className="text-slate-500 text-xs uppercase tracking-widest block mb-2 font-semibold">Dificuldades</span>
                        "{checkin.dificuldades_texto}"
                      </p>
                    ) : (
                      <p className="text-slate-500 text-sm italic">Sem dificuldades registradas.</p>
                    )}
                  </div>

                  {/* TAREFAS */}
                  <div className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-slate-700/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <p className="text-sm font-bold text-white">Tarefas Executadas</p>
                    </div>
                    {checkin?.tarefas_executadas?.length ? (
                      <ul className="space-y-2.5">
                        {(checkin.tarefas_executadas as string[]).map((task, i) => (
                          <li key={i} className="flex gap-3 text-sm">
                            <span className="text-emerald-400 font-bold flex-shrink-0 mt-0.5">✓</span>
                            <span className="text-slate-300">{task}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 text-sm italic">Nenhuma tarefa registrada.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-96">
                <p className="text-slate-500">Selecione um mentorado na sidebar.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── DROPDOWN MENU PERFIL (Portal — fora do stacking context) ── */}
      {showMenuPerfil && typeof document !== "undefined" && createPortal(
        <div
          className="fixed right-4 top-16 w-72 bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/80 overflow-hidden"
          style={{ zIndex: 99999 }}
          ref={menuPerfilRef}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700/30 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
            <p className="text-sm font-bold text-white">{mentorNome}</p>
            <p className="text-xs text-slate-400 mt-0.5">Mentor ativo</p>
          </div>
          {/* Mentorado atual */}
          {selected && (
            <div className="px-4 py-3 border-b border-slate-700/30 bg-slate-800/40">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Mentorado Atual</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {selected.nome.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{selected.nome}</p>
                  <p className="text-[10px] text-slate-400">{selected.nicho} · desde {selected.data_inicio}</p>
                </div>
              </div>
            </div>
          )}
          {/* Ações */}
          <div className="p-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">Mentorado</p>
            <button onClick={() => { setShowHistoricoModal(true); setShowMenuPerfil(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-left group">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <History className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">Histórico Completo</p>
                <p className="text-[10px] text-slate-400">{historico.length} semanas de dados</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button onClick={() => {
                if (selected) { setEditData({ nome: selected.nome, nicho: selected.nicho, foco_macro: selected.foco_macro, status: "Ativo" }); setShowEditModal(true) }
                setShowMenuPerfil(false)
              }}
              disabled={!selected}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-left group disabled:opacity-40">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">Editar Mentorado</p>
                <p className="text-[10px] text-slate-400">Alterar dados e foco</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <div className="border-t border-slate-700/30 my-2" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">Conta</p>
            <button onClick={() => { setShowPerfilModal(true); setShowMenuPerfil(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-left group">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">Meu Perfil</p>
                <p className="text-[10px] text-slate-400">Método, filosofia e nicho</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button onClick={() => { localStorage.removeItem("mentorSelecionado"); window.location.href = "/" }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors text-left">
              <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center">
                <LogOut className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-300 font-medium">Trocar Mentor</p>
                <p className="text-[10px] text-slate-400">Voltar para seleção</p>
              </div>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ── MODAL: PERFIL DO MENTOR ── */}
      {showPerfilModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setShowPerfilModal(false); setEditandoPerfil(false) }}>
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
              <div className="flex items-center gap-4">
                {/* Avatar com upload */}
                <label className="relative cursor-pointer group">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-600 group-hover:border-blue-500 transition-colors">
                    {mentorDados?.foto_url ? (
                      <img src={mentorDados.foto_url} alt={mentorNome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                        {mentorNome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploadingFoto === mentorId ? (
                        <RefreshCw className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <span className="text-white text-xs font-bold">FOTO</span>
                      )}
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0]
                    if (file && mentorId) uploadFoto(file, "mentor", mentorId)
                  }} />
                </label>
                <div>
                  <h2 className="text-xl font-bold text-white">{mentorNome}</h2>
                  <p className="text-xs text-slate-400">Clique na foto para alterar</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!editandoPerfil ? (
                  <button onClick={() => { setEditandoPerfil(true); setPerfilEdit({ nome: mentorDados?.nome || mentorNome, nicho_foco: mentorDados?.nicho_foco || "", metodo_trabalho: mentorDados?.metodo_trabalho || "", filosofia: mentorDados?.filosofia || "" }) }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-all">
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>
                ) : (
                  <button onClick={() => { setEditandoPerfil(false) }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                    Cancelar
                  </button>
                )}
                <button onClick={() => { setShowPerfilModal(false); setEditandoPerfil(false) }} className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {!editandoPerfil ? (
                /* VIEW MODE */
                <>
                  <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4 text-blue-400" />
                      <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Método de Trabalho</p>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{mentorDados?.metodo_trabalho || "—"}</p>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">Filosofia</p>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{mentorDados?.filosofia || "—"}</p>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Nicho Foco</p>
                    </div>
                    <p className="text-sm text-slate-300">{mentorDados?.nicho_foco || "—"}</p>
                  </div>
                </>
              ) : (
                /* EDIT MODE */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nome</label>
                    <input value={perfilEdit.nome} onChange={e => setPerfilEdit(p => ({ ...p, nome: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nicho Foco</label>
                    <input value={perfilEdit.nicho_foco} onChange={e => setPerfilEdit(p => ({ ...p, nicho_foco: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-1.5">Método de Trabalho</label>
                    <textarea value={perfilEdit.metodo_trabalho} onChange={e => setPerfilEdit(p => ({ ...p, metodo_trabalho: e.target.value }))} rows={6}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors text-sm resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-400 uppercase tracking-widest mb-1.5">Filosofia</label>
                    <textarea value={perfilEdit.filosofia} onChange={e => setPerfilEdit(p => ({ ...p, filosofia: e.target.value }))} rows={5}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors text-sm resize-none" />
                  </div>
                  <button onClick={salvarPerfil} disabled={salvandoPerfil}
                    className="w-full py-2.5 rounded-lg text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white disabled:opacity-50 transition-all">
                    {salvandoPerfil ? "Salvando..." : "Salvar Perfil"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: HISTÓRICO DO MENTORADO ── */}
      {showHistoricoModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowHistoricoModal(false)}>
          <div className="bg-slate-900/98 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
              <div>
                <h2 className="text-xl font-bold text-white">Histórico — {selected.nome}</h2>
                <p className="text-xs text-slate-400 mt-1">{historico.length} semanas de dados · {selected.nicho}</p>
              </div>
              <button onClick={() => setShowHistoricoModal(false)} className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              {historico.length === 0 ? (
                <p className="text-slate-400 text-center py-8">Nenhum check-in registrado ainda.</p>
              ) : (
                <div className="space-y-3">
                  {/* Resumo do mentorado */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-400">{historico[0]?.leads_gerados ?? "—"}</p>
                      <p className="text-[10px] text-emerald-400/70 uppercase tracking-widest mt-1">Leads (última sem.)</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-purple-400">R$ {historico[0]?.vendas_reais?.toLocaleString("pt-BR") ?? "—"}</p>
                      <p className="text-[10px] text-purple-400/70 uppercase tracking-widest mt-1">Vendas (última sem.)</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-blue-400">{historico.length}</p>
                      <p className="text-[10px] text-blue-400/70 uppercase tracking-widest mt-1">Semanas de dados</p>
                    </div>
                  </div>

                  {/* Tabela histórico */}
                  <div className="overflow-x-auto rounded-xl border border-slate-700/30">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-800/50">
                          <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                          <th className="text-right px-4 py-3 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Leads</th>
                          <th className="text-right px-4 py-3 text-[10px] font-bold text-purple-500 uppercase tracking-widest">Vendas</th>
                          <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Invest.</th>
                          <th className="text-right px-4 py-3 text-[10px] font-bold text-amber-500 uppercase tracking-widest">ROI%</th>
                          <th className="text-right px-4 py-3 text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Vídeos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...historico].reverse().map((c, i) => {
                          const roi = c.investimento_trafego > 0
                            ? (((c.vendas_reais - c.investimento_trafego) / c.investimento_trafego) * 100).toFixed(0)
                            : "—"
                          const isLast = i === historico.length - 1
                          return (
                            <tr key={c.id} className={`border-t border-slate-700/20 ${isLast ? "bg-blue-500/5" : "hover:bg-slate-800/30"} transition-colors`}>
                              <td className="px-4 py-3 text-slate-300">
                                <div className="flex items-center gap-2">
                                  {isLast && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />}
                                  {new Date(c.data_envio).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" })}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-semibold text-emerald-400">{c.leads_gerados}</td>
                              <td className="px-4 py-3 text-right font-semibold text-purple-400">R$ {c.vendas_reais?.toLocaleString("pt-BR")}</td>
                              <td className="px-4 py-3 text-right text-slate-400">R$ {c.investimento_trafego?.toLocaleString("pt-BR")}</td>
                              <td className={`px-4 py-3 text-right font-bold ${Number(roi) > 0 ? "text-emerald-400" : "text-red-400"}`}>{roi}%</td>
                              <td className="px-4 py-3 text-right text-cyan-400">{c.videos_postados ?? "—"}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Dificuldades do último checkin */}
                  {historico[0]?.dificuldades_texto && (
                    <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                      <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">Última dificuldade relatada</p>
                      <p className="text-sm text-slate-300">{historico[0].dificuldades_texto}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CADASTRAR MENTORADO ── */}
      {showCadastro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowCadastro(false)}
        >
          <div
            className="w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Cadastrar Mentorado</h2>
              </div>
              <button onClick={() => setShowCadastro(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={cadastrarMentorado} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nome *</label>
                <input
                  autoFocus required
                  value={novo.nome}
                  onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nicho</label>
                <input
                  value={novo.nicho}
                  onChange={(e) => setNovo({ ...novo, nicho: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                  placeholder="Ex: Tráfego Local"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Foco Macro</label>
                <input
                  value={novo.foco_macro}
                  onChange={(e) => setNovo({ ...novo, foco_macro: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                  placeholder="Ex: Estruturação Comercial"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Data de Início</label>
                <input
                  type="date"
                  value={novo.data_inicio}
                  onChange={(e) => setNovo({ ...novo, data_inicio: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500/60 transition-colors [color-scheme:dark]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCadastro(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando || !novo.nome.trim()}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {salvando ? "Salvando..." : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDITAR MENTORADO ── */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                {/* Avatar mentorado com upload */}
                <label className="relative cursor-pointer group">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-600 group-hover:border-amber-500 transition-colors">
                    {selected?.foto_url ? (
                      <img src={selected.foto_url} alt={selected?.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm font-bold">
                        {selected?.nome.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploadingFoto === selectedId ? (
                        <RefreshCw className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <span className="text-white text-[10px] font-bold">FOTO</span>
                      )}
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0]
                    if (file && selectedId) uploadFoto(file, "mentorado", selectedId)
                  }} />
                </label>
                <h2 className="text-lg font-bold text-white">Editar Mentorado</h2>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editarMentorado} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nome *</label>
                <input
                  autoFocus required
                  value={editData.nome}
                  onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                  placeholder="Nome do mentorado"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nicho</label>
                <input
                  value={editData.nicho}
                  onChange={(e) => setEditData({ ...editData, nicho: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                  placeholder="Nicho de atuação"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Foco Macro</label>
                <input
                  value={editData.foco_macro}
                  onChange={(e) => setEditData({ ...editData, foco_macro: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
                  placeholder="Foco principal"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editando || !editData.nome.trim()}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {editando ? "Salvando..." : "Salvar Mudanças"}
                </button>
              </div>

              {/* Zona de perigo */}
              <div className="border-t border-slate-700/40 pt-4 mt-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Zona de Perigo</p>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); deletarMentorado() }}
                  disabled={editando}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Deletar Mentorado permanentemente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Histórico */}
      {selectedMetric && <HistoryModal metric={selectedMetric} />}
    </div>
  )
}
// Force rebuild sex, 29 de mai de 2026 14:54:36
