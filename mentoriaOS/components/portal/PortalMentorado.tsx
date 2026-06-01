"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import {
  Send, CheckCircle2, Circle, MessageCircle, ClipboardList, BarChart3, Video,
  Sparkles, Loader2, Phone, AlertCircle, Clock, History
} from "lucide-react"
import { getRealtimeClient } from "@/lib/supabase-realtime"
import { C } from "@/utils/theme"
import { HistoricoCallsMentorado } from "@/components/mentorado/HistoricoCallsMentorado"
import { TarefasPontuaisMentorado } from "@/components/mentorado/TarefasPontuaisMentorado"

const JitsiMeeting = dynamic(() => import("@jitsi/react-sdk").then(m => m.JitsiMeeting), { ssr: false })

interface Mentorado {
  id: string; nome: string; nicho: string; foco_macro: string; meta_atual?: string
  data_inicio: string; data_fim?: string; foto_url?: string; mentor_id: string
}
interface Mentor { id: string; nome: string; foto_url?: string; nicho_foco?: string }
interface Tarefa { id: string; texto: string; status: string; data_vencimento: string | null }
interface Mensagem { id: string; autor: string; texto: string; created_at: string }

type Aba = "checkin" | "tarefas" | "jornada" | "chat" | "call"

function parseDateLocal(s: string) { const [y,m,d] = s.split("T")[0].split("-").map(Number); return new Date(y, m-1, d) }

export default function PortalMentorado({ mentorado, mentor }: { mentorado: Mentorado; mentor: Mentor | null }) {
  const [aba, setAba] = useState<Aba>("checkin")

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg }}>
      {/* Header */}
      <header className="px-5 py-3.5 flex items-center justify-between shrink-0" style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.green}20`, border: `1px solid ${C.green}44` }}>
            <Sparkles className="w-4 h-4" style={{ color: C.green }} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">CKlareza</h1>
            <p className="text-[10px]" style={{ color: C.muted }}>Olá, {mentorado.nome.split(" ")[0]}</p>
          </div>
        </div>
        {mentor && (
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white">{mentor.nome}</p>
              <p className="text-[10px]" style={{ color: C.muted }}>Seu mentor</p>
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
              {mentor.foto_url
                ? <img src={mentor.foto_url} alt={mentor.nome} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#0a1628" }}>{mentor.nome.slice(0,2).toUpperCase()}</div>}
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto p-4">
          {aba === "checkin" && <AbaCheckin mentorado={mentorado} />}
          {aba === "tarefas" && <AbaTarefas mentorado={mentorado} />}
          {aba === "jornada" && (
            <div className="space-y-6">
              <TarefasPontuaisMentorado mentoradoId={mentorado.id} />
              <HistoricoCallsMentorado mentoradoId={mentorado.id} />
            </div>
          )}
          {aba === "chat"    && <AbaChat mentorado={mentorado} mentor={mentor} />}
          {aba === "call"    && <AbaCall mentorado={mentorado} mentor={mentor} />}
        </div>
      </main>

      {/* Bottom Nav (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 flex shrink-0" style={{ background: C.card, borderTop: `1px solid ${C.border}` }}>
        {([
          { id: "checkin", label: "Check-in", icon: BarChart3 },
          { id: "tarefas", label: "Tarefas",  icon: ClipboardList },
          { id: "jornada", label: "Jornada",  icon: History },
          { id: "chat",    label: "Chat",     icon: MessageCircle },
          { id: "call",    label: "Call",     icon: Video },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setAba(t.id)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-all"
            style={{ color: aba === t.id ? C.green : C.muted }}>
            <t.icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA CHECK-IN
// ─────────────────────────────────────────────────────────────────────────────
function AbaCheckin({ mentorado }: { mentorado: Mentorado }) {
  const [form, setForm] = useState({ vendas_reais: "", leads_gerados: "", investimento_trafego: "", videos_postados: "", dificuldades_texto: "", tarefas_executadas: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/form/${mentorado.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Erro") }
      setSuccess(true)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (success) return (
    <div className="rounded-2xl p-10 text-center mt-6" style={{ background: C.card, border: `1px solid ${C.green}44` }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl" style={{ background: `${C.green}20` }}>✅</div>
      <h2 className="text-xl font-bold text-white mb-2">Check-in enviado!</h2>
      <p style={{ color: C.muted }}>Seus dados já estão no painel do seu mentor.</p>
      <button onClick={() => { setSuccess(false); setForm({ vendas_reais: "", leads_gerados: "", investimento_trafego: "", videos_postados: "", dificuldades_texto: "", tarefas_executadas: "" }) }}
        className="mt-5 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: `${C.green}18`, border: `1px solid ${C.green}44`, color: C.green }}>
        Novo check-in
      </button>
    </div>
  )

  const inputStyle = { background: "#0a1628", border: `1px solid ${C.border}` }
  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Check-in Semanal</h2>
        <p className="text-sm" style={{ color: C.muted }}>Atualize suas métricas da semana</p>
      </div>
      <div className="rounded-2xl p-6 space-y-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-sm font-semibold" style={{ color: C.green }}>📊 Métricas</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { k: "vendas_reais", l: "💰 Vendas (R$)", ph: "0.00", req: true },
            { k: "leads_gerados", l: "📊 Leads", ph: "0", req: true },
            { k: "investimento_trafego", l: "💵 Investimento (R$)", ph: "0.00", req: true },
            { k: "videos_postados", l: "🎬 Vídeos", ph: "0", req: false },
          ].map(f => (
            <div key={f.k}>
              <label className="block text-xs mb-1.5" style={{ color: C.muted }}>{f.l}</label>
              <input type="number" step="0.01" required={f.req} placeholder={f.ph}
                value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none"
                style={inputStyle} onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-6 space-y-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-sm font-semibold" style={{ color: C.blue }}>📝 Contexto</h3>
        <div>
          <label className="block text-xs mb-1.5" style={{ color: C.muted }}>❌ Maiores dificuldades?</label>
          <textarea value={form.dificuldades_texto} onChange={e => setForm(p => ({ ...p, dificuldades_texto: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none resize-none" rows={3}
            style={inputStyle} placeholder="Descreva os desafios..." onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
        </div>
        <div>
          <label className="block text-xs mb-1.5" style={{ color: C.muted }}>✅ Tarefas executadas (uma por linha)</label>
          <textarea value={form.tarefas_executadas} onChange={e => setForm(p => ({ ...p, tarefas_executadas: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none resize-none" rows={3}
            style={inputStyle} placeholder="Liste o que completou..." onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
        </div>
      </div>
      {error && <p className="text-sm rounded-lg px-4 py-3" style={{ background: `${C.red}18`, border: `1px solid ${C.red}44`, color: C.red }}>{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl font-bold disabled:opacity-50 transition-all"
        style={{ background: C.green, color: "#0a1628" }}>
        {loading ? "Enviando..." : "🚀 Enviar Check-in"}
      </button>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA TAREFAS
// ─────────────────────────────────────────────────────────────────────────────
function AbaTarefas({ mentorado }: { mentorado: Mentorado }) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(true)

  const buscar = useCallback(async () => {
    const [p, c] = await Promise.all([
      fetch(`/api/dashboard/tarefas?mentoradoId=${mentorado.id}&status=pending&t=${Date.now()}`).then(r => r.json()),
      fetch(`/api/dashboard/tarefas?mentoradoId=${mentorado.id}&status=completed&t=${Date.now()}`).then(r => r.json()),
    ])
    setTarefas([...(p.tarefas || []), ...(c.tarefas || [])])
    setLoading(false)
  }, [mentorado.id])

  useEffect(() => { buscar() }, [buscar])

  // Realtime
  useEffect(() => {
    const sb = getRealtimeClient()
    const ch = sb.channel(`portal-tarefas-${mentorado.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tarefas", filter: `mentorado_id=eq.${mentorado.id}` }, () => buscar())
      .subscribe()
    return () => { sb.removeChannel(ch) }
  }, [mentorado.id, buscar])

  const toggle = async (id: string, status: string) => {
    await fetch(`/api/dashboard/tarefas/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status === "completed" ? "pending" : "completed" }),
    })
    buscar()
  }

  const pendentes = tarefas.filter(t => t.status === "pending")
  const concluidas = tarefas.filter(t => t.status === "completed")
  const total = tarefas.length
  const progresso = total > 0 ? Math.round((concluidas.length / total) * 100) : 0
  const hoje = new Date(); hoje.setHours(0,0,0,0)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Minhas Tarefas</h2>
        <p className="text-sm" style={{ color: C.muted }}>Definidas pelo seu mentor</p>
      </div>

      {/* Progresso */}
      <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90"><circle cx="32" cy="32" r="26" fill="none" stroke={C.border} strokeWidth="6" />
            <circle cx="32" cy="32" r="26" fill="none" stroke={progresso >= 70 ? C.green : progresso >= 40 ? C.amber : C.red} strokeWidth="6"
              strokeLinecap="round" strokeDasharray={2*Math.PI*26} strokeDashoffset={2*Math.PI*26*(1-progresso/100)} style={{ transition: "stroke-dashoffset 0.6s" }} /></svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{progresso}%</div>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{concluidas.length} de {total} concluídas</p>
          <p className="text-xs" style={{ color: C.muted }}>Continue assim! 💪</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8 text-sm" style={{ color: C.muted }}>Carregando...</p>
      ) : total === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <ClipboardList className="w-10 h-10 mx-auto mb-3" style={{ color: C.border }} />
          <p className="text-sm" style={{ color: C.muted }}>Nenhuma tarefa ainda. Seu mentor vai adicionar em breve.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pendentes.map(t => {
            const vencida = t.data_vencimento && parseDateLocal(t.data_vencimento) < hoje
            return (
              <button key={t.id} onClick={() => toggle(t.id, t.status)}
                className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all"
                style={{ background: vencida ? `${C.red}10` : C.card, border: `1px solid ${vencida ? `${C.red}33` : C.border}` }}>
                <Circle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: C.muted }} />
                <div className="flex-1">
                  <p className="text-sm text-white">{t.texto}</p>
                  {t.data_vencimento && (
                    <span className="text-[11px] flex items-center gap-1 mt-1" style={{ color: vencida ? C.red : C.muted }}>
                      {vencida ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {vencida ? "Vencida" : "Vence"} {parseDateLocal(t.data_vencimento).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
          {concluidas.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest pt-3 pb-1" style={{ color: C.muted }}>Concluídas</p>
              {concluidas.map(t => (
                <button key={t.id} onClick={() => toggle(t.id, t.status)}
                  className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all opacity-60"
                  style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: C.green }} />
                  <p className="text-sm line-through" style={{ color: C.muted }}>{t.texto}</p>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA CHAT (tempo real)
// ─────────────────────────────────────────────────────────────────────────────
function AbaChat({ mentorado, mentor }: { mentorado: Mentorado; mentor: Mentor | null }) {
  const [msgs, setMsgs] = useState<Mensagem[]>([])
  const [texto, setTexto] = useState("")
  const [enviando, setEnviando] = useState(false)
  const fimRef = useRef<HTMLDivElement>(null)

  const buscar = useCallback(async () => {
    const j = await fetch(`/api/dashboard/mensagens?mentoradoId=${mentorado.id}&t=${Date.now()}`).then(r => r.json())
    setMsgs(j.mensagens || [])
  }, [mentorado.id])

  useEffect(() => { buscar() }, [buscar])
  useEffect(() => { fimRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs])

  // Realtime
  useEffect(() => {
    const sb = getRealtimeClient()
    const ch = sb.channel(`portal-chat-${mentorado.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mensagens", filter: `mentorado_id=eq.${mentorado.id}` },
        (payload: any) => setMsgs(prev => [...prev, payload.new]))
      .subscribe()
    return () => { sb.removeChannel(ch) }
  }, [mentorado.id])

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!texto.trim() || !mentor) return
    setEnviando(true)
    const t = texto.trim()
    setTexto("")
    await fetch("/api/dashboard/mensagens", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentoradoId: mentorado.id, mentorId: mentorado.mentor_id, autor: "mentorado", texto: t }),
    })
    setEnviando(false)
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 145px)" }}>
      <div className="mb-3">
        <h2 className="text-lg font-bold text-white">Chat com {mentor?.nome.split(" ")[0] || "seu mentor"}</h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {msgs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <MessageCircle className="w-10 h-10 mb-3" style={{ color: C.border }} />
            <p className="text-sm" style={{ color: C.muted }}>Comece a conversa com seu mentor</p>
          </div>
        ) : msgs.map(m => {
          const meu = m.autor === "mentorado"
          return (
            <div key={m.id} className={`flex ${meu ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%] px-4 py-2.5 rounded-2xl" style={{
                background: meu ? C.green : C.card,
                color: meu ? "#0a1628" : "#fff",
                border: meu ? "none" : `1px solid ${C.border}`,
                borderBottomRightRadius: meu ? 4 : 16,
                borderBottomLeftRadius: meu ? 16 : 4,
              }}>
                <p className="text-sm whitespace-pre-wrap break-words">{m.texto}</p>
                <p className="text-[9px] mt-1 text-right" style={{ color: meu ? "#0a162888" : C.muted }}>
                  {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={fimRef} />
      </div>
      <form onSubmit={enviar} className="flex gap-2 pt-3">
        <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Mensagem..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
          onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
        <button type="submit" disabled={enviando || !texto.trim()}
          className="w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-40 shrink-0"
          style={{ background: C.green, color: "#0a1628" }}>
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA CALL
// ─────────────────────────────────────────────────────────────────────────────
function AbaCall({ mentorado, mentor }: { mentorado: Mentorado; mentor: Mentor | null }) {
  const [entrou, setEntrou] = useState(false)
  const roomName = `CKlareza-${mentorado.id.slice(0, 8)}-${mentorado.mentor_id.slice(0, 8)}`

  if (!entrou) return (
    <div className="rounded-2xl p-10 text-center mt-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${C.green}18`, border: `1px solid ${C.green}33` }}>
        <Video className="w-7 h-7" style={{ color: C.green }} />
      </div>
      <h2 className="text-lg font-bold text-white mb-2">Sala de Mentoria</h2>
      <p className="text-sm mb-6" style={{ color: C.muted }}>
        Entre na chamada com {mentor?.nome.split(" ")[0] || "seu mentor"}. Vocês se encontram na mesma sala.
      </p>
      <button onClick={() => setEntrou(true)}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all"
        style={{ background: C.green, color: "#0a1628" }}>
        <Phone className="w-4 h-4" /> Entrar na Chamada
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50" style={{ background: "#040d16" }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.red }} />
          <span className="text-sm font-semibold text-white">Em chamada</span>
        </div>
        <button onClick={() => setEntrou(false)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: `${C.red}18`, border: `1px solid ${C.red}44`, color: C.red }}>
          Sair
        </button>
      </div>
      <div style={{ height: "calc(100vh - 49px)" }}>
        <JitsiMeeting
          roomName={roomName}
          configOverwrite={{ startWithAudioMuted: false, prejoinPageEnabled: false, disableModeratorIndicator: true }}
          interfaceConfigOverwrite={{ SHOW_JITSI_WATERMARK: false, DEFAULT_BACKGROUND: "#040d16" }}
          userInfo={{ displayName: mentorado.nome, email: "" }}
          getIFrameRef={(node: HTMLElement) => { node.style.height = "100%"; node.style.width = "100%" }}
          onApiReady={(api: any) => api.addEventListener("readyToClose", () => setEntrou(false))}
        />
      </div>
    </div>
  )
}
