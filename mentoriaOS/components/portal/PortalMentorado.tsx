"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import {
  Send, CheckCircle2, Circle, MessageCircle, ClipboardList, BarChart3, Video,
  Sparkles, Loader2, Phone, AlertCircle, Clock, History, UserCog, ShieldCheck, Download, Trash2,
  Sun, Moon, Globe, Check
} from "lucide-react"
import { getRealtimeClient } from "@/lib/supabase-realtime"
import { C, setGlobalTheme, type Theme } from "@/utils/theme"
import { HistoricoCallsMentorado } from "@/components/mentorado/HistoricoCallsMentorado"
import { TarefasPontuaisMentorado } from "@/components/mentorado/TarefasPontuaisMentorado"
import { FormCadastroMentorado } from "@/components/forms/FormCadastroMentorado"
import { LangCtx, LANGS, useT, useLang, localeOf, type Lang } from "@/components/portal/i18n"

const JitsiMeeting = dynamic(() => import("@jitsi/react-sdk").then(m => m.JitsiMeeting), { ssr: false })

interface Mentorado {
  id: string; nome: string; nicho: string; foco_macro: string; meta_atual?: string
  data_inicio: string; data_fim?: string; foto_url?: string; mentor_id: string
}
interface Mentor { id: string; nome: string; foto_url?: string; nicho_foco?: string }
interface Tarefa { id: string; texto: string; status: string; data_vencimento: string | null }
interface Mensagem { id: string; autor: string; texto: string; created_at: string }

type Aba = "checkin" | "tarefas" | "jornada" | "chat" | "call" | "cadastro"

function parseDateLocal(s: string) { const [y,m,d] = s.split("T")[0].split("-").map(Number); return new Date(y, m-1, d) }

// Envia o código do portal como header de autenticação em todas as chamadas às APIs protegidas.
function portalFetch(url: string, init?: RequestInit): Promise<Response> {
  let codigo = ""
  try { codigo = (typeof localStorage !== "undefined" ? localStorage.getItem("ck:mentorado-codigo") : "") || "" } catch {}
  return fetch(url, { ...init, headers: { ...(init?.headers as Record<string,string> ?? {}), "x-portal-codigo": codigo } })
}

// ─────────────────────────────────────────────────────────────────────────────
// BANNER DE CONSENTIMENTO LGPD (mostrado uma vez no primeiro acesso)
// ─────────────────────────────────────────────────────────────────────────────
function ConsentoBanner({ onAceitar }: { onAceitar: () => void }) {
  const t = useT()
  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 px-4 pb-2">
      <div className="max-w-2xl mx-auto rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
        style={{ background: "#0f2540", border: "1px solid #1e3a5f", boxShadow: "0 -4px 30px #00000060" }}>
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0" style={{ color: C.green }} />
        <p className="text-xs flex-1 leading-relaxed" style={{ color: "#94b4cc" }}>
          {t("Seus dados são usados exclusivamente para gestão da sua mentoria e compartilhados apenas com seu mentor.",
             "Your data is used exclusively to manage your mentorship and shared only with your mentor.",
             "Tus datos se usan exclusivamente para la gestión de tu mentoría y se comparten solo con tu mentor.")}{" "}
          <a href="/privacidade" target="_blank" rel="noopener" className="underline" style={{ color: C.green }}>{t("Ver política de privacidade", "View privacy policy", "Ver política de privacidad")}</a>
        </p>
        <button onClick={onAceitar}
          className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: C.green, color: "#0c1c2c" }}>
          {t("Entendido", "Got it", "Entendido")}
        </button>
      </div>
    </div>
  )
}

export default function PortalMentorado({ mentorado, mentor }: { mentorado: Mentorado; mentor: Mentor | null }) {
  const [aba, setAba] = useState<Aba>("checkin")
  const [showConsento, setShowConsento] = useState(false)
  // Tema (claro/escuro) e idioma — controles GLOBAIS no header, como no resto do site.
  const [theme, setTheme] = useState<Theme>("dark")   // mesma convenção do app (abre dark)
  const [lang, setLang] = useState<Lang>("pt")
  const [openLang, setOpenLang] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem("ck:lgpd-aceite")) setShowConsento(true)
      const tSaved = localStorage.getItem("ck_theme")
      if (tSaved === "light" || tSaved === "dark") setTheme(tSaved)
      const lSaved = localStorage.getItem("ck_lang") as Lang | null
      if (lSaved === "pt" || lSaved === "en" || lSaved === "es") setLang(lSaved)
    } catch {}
  }, [])

  const aceitarConsento = () => {
    try { localStorage.setItem("ck:lgpd-aceite", new Date().toISOString()) } catch {}
    setShowConsento(false)
  }

  const toggleTheme = () => setTheme(prev => {
    const next: Theme = prev === "dark" ? "light" : "dark"
    try { localStorage.setItem("ck_theme", next); document.documentElement.classList.toggle("dark", next === "dark") } catch {}
    return next
  })
  const escolherLang = (l: Lang) => { setLang(l); setOpenLang(false); try { localStorage.setItem("ck_lang", l) } catch {} }

  // Tradutor local (o provider abaixo é que alimenta os filhos via useT)
  const tr = (pt: string, en: string, es: string) => (lang === "en" ? en : lang === "es" ? es : pt)

  setGlobalTheme(theme)  // C.* resolve o tema atual neste render e nos filhos

  return (
    <LangCtx.Provider value={lang}>
    <div key={theme} className="min-h-screen flex flex-col" style={{ background: C.bg }}>
      {/* Header */}
      <header className="px-4 sm:px-5 py-3 flex items-center justify-between shrink-0" style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${C.green}20`, border: `1px solid ${C.green}44` }}>
            <Sparkles className="w-4 h-4" style={{ color: C.green }} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold leading-none" style={{ color: C.text }}>CKlareza</h1>
            <p className="text-[10px] truncate" style={{ color: C.muted }}>{tr("Olá", "Hi", "Hola")}, {mentorado.nome.split(" ")[0]}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Toggle de tema */}
          <button onClick={toggleTheme} aria-label={tr("Alternar tema", "Toggle theme", "Cambiar tema")}
            title={theme === "dark" ? tr("Tema claro", "Light theme", "Tema claro") : tr("Tema escuro", "Dark theme", "Tema oscuro")}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            style={{ color: C.gold, border: `1px solid ${C.border}`, background: `${C.gold}12` }}>
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Seletor de idioma */}
          <div className="relative">
            <button onClick={() => setOpenLang(o => !o)} aria-label={tr("Idioma", "Language", "Idioma")}
              className="h-9 px-2.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all"
              style={{ color: C.text, border: `1px solid ${C.border}`, background: C.input }}>
              <Globe className="w-4 h-4" style={{ color: C.muted }} /> {lang.toUpperCase()}
            </button>
            {openLang && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenLang(false)} />
                <div className="absolute right-0 mt-1.5 z-50 rounded-xl overflow-hidden min-w-[140px]"
                  style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 10px 30px #00000040" }}>
                  {LANGS.map(l => (
                    <button key={l.code} onClick={() => escolherLang(l.code)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-all"
                      style={{ color: l.code === lang ? C.green : C.text, background: l.code === lang ? `${C.green}12` : "transparent" }}>
                      {l.code === "pt" ? "Português" : l.code === "en" ? "English" : "Español"}
                      {l.code === lang && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {mentor && (
            <div className="flex items-center gap-2 pl-1">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold" style={{ color: C.text }}>{mentor.nome}</p>
                <p className="text-[10px]" style={{ color: C.muted }}>{tr("Seu mentor", "Your mentor", "Tu mentor")}</p>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0" style={{ border: `1px solid ${C.border}` }}>
                {mentor.foto_url
                  ? <img src={mentor.foto_url} alt={mentor.nome} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ background: C.input }}>{mentor.nome.slice(0,2).toUpperCase()}</div>}
              </div>
            </div>
          )}
        </div>
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
          {aba === "cadastro" && <AbaMeuCadastro mentorado={mentorado} />}
        </div>
      </main>

      {showConsento && <ConsentoBanner onAceitar={aceitarConsento} />}

      {/* Bottom Nav (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 flex shrink-0" style={{ background: C.card, borderTop: `1px solid ${C.border}` }}>
        {([
          { id: "checkin", label: tr("Check-in", "Check-in", "Check-in"), icon: BarChart3 },
          { id: "tarefas", label: tr("Tarefas", "Tasks", "Tareas"),  icon: ClipboardList },
          { id: "jornada", label: tr("Jornada", "Journey", "Progreso"),  icon: History },
          { id: "chat",    label: tr("Chat", "Chat", "Chat"),     icon: MessageCircle },
          { id: "call",    label: tr("Call", "Call", "Llamada"),     icon: Video },
          { id: "cadastro", label: tr("Cadastro", "Profile", "Perfil"), icon: UserCog },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setAba(t.id as Aba)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-all"
            style={{ color: aba === t.id ? C.green : C.muted }}>
            <t.icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
    </LangCtx.Provider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA MEU CADASTRO — mentorado completa/edita o cadastro (19 campos). Mentor vê.
// ─────────────────────────────────────────────────────────────────────────────
function AbaMeuCadastro({ mentorado }: { mentorado: Mentorado }) {
  const t = useT()
  const [initial, setInitial] = useState<any | null>(null)
  const [erro, setErro] = useState("")

  useEffect(() => {
    portalFetch(`/api/dashboard/mentorados/${mentorado.id}?t=${Date.now()}`)
      .then(r => r.json())
      .then(j => setInitial(j.mentorado || {}))
      .catch(() => setErro(t("Não foi possível carregar seu cadastro.", "Could not load your profile.", "No se pudo cargar tu perfil.")))
  }, [mentorado.id, t])

  const salvar = async (data: any) => {
    const res = await portalFetch(`/api/dashboard/mentorados/${mentorado.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || "Erro ao salvar")
  }

  if (erro) return <p className="text-sm text-center py-10" style={{ color: C.red }}>{erro}</p>
  if (!initial) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: C.green }} />
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="rounded-xl px-4 py-3" style={{ background: `${C.blue}12`, border: `1px solid ${C.blue}33` }}>
        <p className="text-sm font-semibold" style={{ color: C.text }}>{t("Complete seu cadastro", "Complete your profile", "Completa tu perfil")}</p>
        <p className="text-[11px]" style={{ color: C.muted }}>{t("Esses dados ajudam seu mentor a personalizar a mentoria. Você pode editar quando quiser.", "This information helps your mentor personalize the mentorship. You can edit it anytime.", "Estos datos ayudan a tu mentor a personalizar la mentoría. Puedes editarlos cuando quieras.")}</p>
      </div>
      <FormCadastroMentorado mentoradoId={mentorado.id} initialData={initial} onSave={salvar} />
      <DadosLgpdMentorado mentoradoId={mentorado.id} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCO LGPD — exportar / apagar dados (aparece no final da aba Cadastro)
// ─────────────────────────────────────────────────────────────────────────────
function DadosLgpdMentorado({ mentoradoId }: { mentoradoId: string }) {
  const t = useT()
  const [exportando, setExportando] = useState(false)
  const [apagando, setApagando] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const [msg, setMsg] = useState("")

  const exportar = async () => {
    setExportando(true)
    try {
      const res = await portalFetch(`/api/lgpd/exportar?mentoradoId=${mentoradoId}`)
      if (!res.ok) { setMsg(t("Erro ao exportar dados.", "Error exporting data.", "Error al exportar datos.")); return }
      const blob = await res.blob()
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `meus-dados-${new Date().toISOString().slice(0,10)}.json`
      a.click()
    } catch { setMsg(t("Erro ao exportar dados.", "Error exporting data.", "Error al exportar datos.")) }
    finally { setExportando(false) }
  }

  const anonimizar = async () => {
    setApagando(true)
    try {
      const res = await portalFetch("/api/lgpd/apagar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentoradoId, tipo: "anonimizar" }),
      })
      const j = await res.json()
      if (res.ok) setMsg(j.mensagem || t("Dados anonimizados.", "Data anonymized.", "Datos anonimizados."))
      else setMsg(j.error || t("Erro ao anonimizar.", "Error anonymizing.", "Error al anonimizar."))
    } catch { setMsg(t("Erro ao anonimizar.", "Error anonymizing.", "Error al anonimizar.")) }
    finally { setApagando(false); setConfirmar(false) }
  }

  return (
    <div className="rounded-2xl p-5 space-y-4 mt-2" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4" style={{ color: C.green }} />
        <p className="text-sm font-semibold" style={{ color: C.text }}>{t("Meus dados (LGPD)", "My data (GDPR)", "Mis datos (RGPD)")}</p>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
        {t("Você tem direito de exportar ou apagar seus dados pessoais a qualquer momento.", "You have the right to export or delete your personal data at any time.", "Tienes derecho a exportar o eliminar tus datos personales en cualquier momento.")}{" "}
        <a href="/privacidade" target="_blank" rel="noopener" className="underline" style={{ color: C.green }}>{t("Política de privacidade", "Privacy policy", "Política de privacidad")}</a>
      </p>

      {msg && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: `${C.green}12`, border: `1px solid ${C.green}33`, color: C.green }}>{msg}</p>}

      <div className="flex flex-col gap-2">
        <button onClick={exportar} disabled={exportando}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50"
          style={{ background: `${C.blue}18`, border: `1px solid ${C.blue}44`, color: C.blue }}>
          {exportando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {t("Exportar meus dados (JSON)", "Export my data (JSON)", "Exportar mis datos (JSON)")}
        </button>

        {!confirmar ? (
          <button onClick={() => setConfirmar(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
            style={{ background: `${C.red}10`, border: `1px solid ${C.red}33`, color: C.red }}>
            <Trash2 className="w-4 h-4" /> {t("Anonimizar meus dados pessoais", "Anonymize my personal data", "Anonimizar mis datos personales")}
          </button>
        ) : (
          <div className="rounded-xl p-3 space-y-2" style={{ background: `${C.red}10`, border: `1px solid ${C.red}33` }}>
            <p className="text-xs" style={{ color: C.red }}>{t("Isso substituirá nome, e-mail, telefone e foto por placeholders. Dados financeiros são mantidos por 5 anos por exigência legal.", "This will replace name, email, phone and photo with placeholders. Financial data is kept for 5 years as legally required.", "Esto reemplazará nombre, email, teléfono y foto por marcadores. Los datos financieros se conservan 5 años por exigencia legal.")}</p>
            <div className="flex gap-2">
              <button onClick={anonimizar} disabled={apagando}
                className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                style={{ background: C.red, color: "#fff" }}>
                {apagando ? t("Apagando...", "Deleting...", "Borrando...") : t("Confirmar", "Confirm", "Confirmar")}
              </button>
              <button onClick={() => setConfirmar(false)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: C.muted }}>
                {t("Cancelar", "Cancel", "Cancelar")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA CHECK-IN
// ─────────────────────────────────────────────────────────────────────────────
function AbaCheckin({ mentorado }: { mentorado: Mentorado }) {
  const t = useT()
  const [form, setForm] = useState({ vendas_reais: "", leads_gerados: "", investimento_trafego: "", videos_postados: "", dificuldades_texto: "", tarefas_executadas: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  // Perguntas personalizadas que o mentor cadastrou (vêm da mesma API do formulário público)
  const [perguntas, setPerguntas] = useState<{ id: string; label: string; tipo: string; obrigatoria: boolean }[]>([])
  const [respostas, setRespostas] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch(`/api/form/${mentorado.id}`)
      .then(r => r.json())
      .then(j => { if (Array.isArray(j.perguntas)) setPerguntas(j.perguntas) })
      .catch(() => {})
  }, [mentorado.id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError("")
    try {
      // respostas guardadas com o RÓTULO da pergunta (autoexplicativo p/ o mentor)
      const respostasComLabel: Record<string, string> = {}
      for (const q of perguntas) {
        const v = (respostas[q.id] || "").trim()
        if (v) respostasComLabel[q.label] = v
      }
      const res = await fetch(`/api/form/${mentorado.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, respostas_customizadas: respostasComLabel }),
      })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error || "Erro") }
      setSuccess(true)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (success) return (
    <div className="rounded-2xl p-10 text-center mt-6" style={{ background: C.card, border: `1px solid ${C.green}44` }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl" style={{ background: `${C.green}20` }}>✅</div>
      <h2 className="text-xl font-bold mb-2" style={{ color: C.text }}>{t("Check-in enviado!", "Check-in sent!", "¡Check-in enviado!")}</h2>
      <p style={{ color: C.muted }}>{t("Seus dados já estão no painel do seu mentor.", "Your data is already on your mentor's dashboard.", "Tus datos ya están en el panel de tu mentor.")}</p>
      <button onClick={() => { setSuccess(false); setRespostas({}); setForm({ vendas_reais: "", leads_gerados: "", investimento_trafego: "", videos_postados: "", dificuldades_texto: "", tarefas_executadas: "" }) }}
        className="mt-5 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: `${C.green}18`, border: `1px solid ${C.green}44`, color: C.green }}>
        {t("Novo check-in", "New check-in", "Nuevo check-in")}
      </button>
    </div>
  )

  const inputStyle = { background: C.input, border: `1px solid ${C.border}`, color: C.text }
  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-1" style={{ color: C.text }}>{t("Check-in Semanal", "Weekly Check-in", "Check-in Semanal")}</h2>
        <p className="text-sm" style={{ color: C.muted }}>{t("Atualize suas métricas da semana", "Update your metrics for the week", "Actualiza tus métricas de la semana")}</p>
      </div>
      <div className="rounded-2xl p-6 space-y-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-sm font-semibold" style={{ color: C.green }}>{t("📊 Métricas", "📊 Metrics", "📊 Métricas")}</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { k: "vendas_reais", l: t("💰 Vendas (R$)", "💰 Sales ($)", "💰 Ventas ($)"), ph: "0.00", req: true },
            { k: "leads_gerados", l: t("📊 Leads", "📊 Leads", "📊 Leads"), ph: "0", req: true },
            { k: "investimento_trafego", l: t("💵 Investimento (R$)", "💵 Ad spend ($)", "💵 Inversión ($)"), ph: "0.00", req: true },
            { k: "videos_postados", l: t("🎬 Vídeos", "🎬 Videos", "🎬 Vídeos"), ph: "0", req: false },
          ].map(f => (
            <div key={f.k}>
              <label className="block text-xs mb-1.5" style={{ color: C.muted }}>{f.l}</label>
              <input type="number" step="0.01" required={f.req} placeholder={f.ph}
                value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-slate-500 focus:outline-none"
                style={inputStyle} onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-6 space-y-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <h3 className="text-sm font-semibold" style={{ color: C.blue }}>{t("📝 Contexto", "📝 Context", "📝 Contexto")}</h3>
        <div>
          <label className="block text-xs mb-1.5" style={{ color: C.muted }}>{t("❌ Maiores dificuldades?", "❌ Biggest challenges?", "❌ ¿Mayores dificultades?")}</label>
          <textarea value={form.dificuldades_texto} onChange={e => setForm(p => ({ ...p, dificuldades_texto: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-slate-500 focus:outline-none resize-none" rows={3}
            style={inputStyle} placeholder={t("Descreva os desafios...", "Describe the challenges...", "Describe los desafíos...")} onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
        </div>
        <div>
          <label className="block text-xs mb-1.5" style={{ color: C.muted }}>{t("✅ Tarefas executadas (uma por linha)", "✅ Completed tasks (one per line)", "✅ Tareas realizadas (una por línea)")}</label>
          <textarea value={form.tarefas_executadas} onChange={e => setForm(p => ({ ...p, tarefas_executadas: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-slate-500 focus:outline-none resize-none" rows={3}
            style={inputStyle} placeholder={t("Liste o que completou...", "List what you completed...", "Lista lo que completaste...")} onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
        </div>
      </div>
      {perguntas.length > 0 && (
        <div className="rounded-2xl p-6 space-y-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="text-sm font-semibold" style={{ color: C.violet }}>{t("✨ Perguntas do seu mentor", "✨ Questions from your mentor", "✨ Preguntas de tu mentor")}</h3>
          {perguntas.map(q => (
            <div key={q.id}>
              <label className="block text-xs mb-1.5" style={{ color: C.muted }}>{q.label}{q.obrigatoria ? " *" : ""}</label>
              {q.tipo === "textarea" ? (
                <textarea required={q.obrigatoria} value={respostas[q.id] || ""}
                  onChange={e => setRespostas(r => ({ ...r, [q.id]: e.target.value }))} rows={3}
                  className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-slate-500 focus:outline-none resize-none"
                  style={inputStyle} onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
              ) : (
                <input type={q.tipo === "number" ? "number" : "text"} required={q.obrigatoria} value={respostas[q.id] || ""}
                  onChange={e => setRespostas(r => ({ ...r, [q.id]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-slate-500 focus:outline-none"
                  style={inputStyle} onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
              )}
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-sm rounded-lg px-4 py-3" style={{ background: `${C.red}18`, border: `1px solid ${C.red}44`, color: C.red }}>{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl font-bold disabled:opacity-50 transition-all"
        style={{ background: C.green, color: C.input }}>
        {loading ? t("Enviando...", "Sending...", "Enviando...") : t("🚀 Enviar Check-in", "🚀 Send Check-in", "🚀 Enviar Check-in")}
      </button>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ABA TAREFAS
// ─────────────────────────────────────────────────────────────────────────────
function AbaTarefas({ mentorado }: { mentorado: Mentorado }) {
  const t = useT()
  const loc = localeOf(useLang())
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(true)

  const buscar = useCallback(async () => {
    const [p, c] = await Promise.all([
      portalFetch(`/api/dashboard/tarefas?mentoradoId=${mentorado.id}&status=pending&t=${Date.now()}`).then(r => r.json()),
      portalFetch(`/api/dashboard/tarefas?mentoradoId=${mentorado.id}&status=completed&t=${Date.now()}`).then(r => r.json()),
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
    await portalFetch(`/api/dashboard/tarefas/${id}`, {
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
        <h2 className="text-lg font-bold mb-1" style={{ color: C.text }}>{t("Minhas Tarefas", "My Tasks", "Mis Tareas")}</h2>
        <p className="text-sm" style={{ color: C.muted }}>{t("Definidas pelo seu mentor", "Set by your mentor", "Definidas por tu mentor")}</p>
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
          <p className="text-sm font-semibold" style={{ color: C.text }}>{t(`${concluidas.length} de ${total} concluídas`, `${concluidas.length} of ${total} completed`, `${concluidas.length} de ${total} completadas`)}</p>
          <p className="text-xs" style={{ color: C.muted }}>{t("Continue assim! 💪", "Keep it up! 💪", "¡Sigue así! 💪")}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8 text-sm" style={{ color: C.muted }}>{t("Carregando...", "Loading...", "Cargando...")}</p>
      ) : total === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <ClipboardList className="w-10 h-10 mx-auto mb-3" style={{ color: C.border }} />
          <p className="text-sm" style={{ color: C.muted }}>{t("Nenhuma tarefa ainda. Seu mentor vai adicionar em breve.", "No tasks yet. Your mentor will add some soon.", "Aún no hay tareas. Tu mentor agregará pronto.")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pendentes.map(tarefa => {
            const vencida = tarefa.data_vencimento && parseDateLocal(tarefa.data_vencimento) < hoje
            return (
              <button key={tarefa.id} onClick={() => toggle(tarefa.id, tarefa.status)}
                className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all"
                style={{ background: vencida ? `${C.red}10` : C.card, border: `1px solid ${vencida ? `${C.red}33` : C.border}` }}>
                <Circle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: C.muted }} />
                <div className="flex-1">
                  <p className="text-sm" style={{ color: C.text }}>{tarefa.texto}</p>
                  {tarefa.data_vencimento && (
                    <span className="text-[11px] flex items-center gap-1 mt-1" style={{ color: vencida ? C.red : C.muted }}>
                      {vencida ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {vencida ? t("Vencida", "Overdue", "Vencida") : t("Vence", "Due", "Vence")} {parseDateLocal(tarefa.data_vencimento).toLocaleDateString(loc)}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
          {concluidas.length > 0 && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest pt-3 pb-1" style={{ color: C.muted }}>{t("Concluídas", "Completed", "Completadas")}</p>
              {concluidas.map(tarefa => (
                <button key={tarefa.id} onClick={() => toggle(tarefa.id, tarefa.status)}
                  className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all opacity-60"
                  style={{ background: C.card, border: `1px solid ${C.border}` }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: C.green }} />
                  <p className="text-sm line-through" style={{ color: C.muted }}>{tarefa.texto}</p>
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
  const t = useT()
  const loc = localeOf(useLang())
  const [msgs, setMsgs] = useState<Mensagem[]>([])
  const [texto, setTexto] = useState("")
  const [enviando, setEnviando] = useState(false)
  const fimRef = useRef<HTMLDivElement>(null)

  const buscar = useCallback(async () => {
    const j = await portalFetch(`/api/dashboard/mensagens?mentoradoId=${mentorado.id}&t=${Date.now()}`).then(r => r.json())
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
    const txt = texto.trim()
    setTexto("")
    await portalFetch("/api/dashboard/mensagens", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentoradoId: mentorado.id, mentorId: mentorado.mentor_id, autor: "mentorado", texto: txt }),
    })
    setEnviando(false)
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 145px)" }}>
      <div className="mb-3">
        <h2 className="text-lg font-bold" style={{ color: C.text }}>{t("Chat com", "Chat with", "Chat con")} {mentor?.nome.split(" ")[0] || t("seu mentor", "your mentor", "tu mentor")}</h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {msgs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <MessageCircle className="w-10 h-10 mb-3" style={{ color: C.border }} />
            <p className="text-sm" style={{ color: C.muted }}>{t("Comece a conversa com seu mentor", "Start the conversation with your mentor", "Empieza la conversación con tu mentor")}</p>
          </div>
        ) : msgs.map(m => {
          const meu = m.autor === "mentorado"
          return (
            <div key={m.id} className={`flex ${meu ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%] px-4 py-2.5 rounded-2xl" style={{
                background: meu ? C.green : C.card,
                color: meu ? C.input : "#fff",
                border: meu ? "none" : `1px solid ${C.border}`,
                borderBottomRightRadius: meu ? 4 : 16,
                borderBottomLeftRadius: meu ? 16 : 4,
              }}>
                <p className="text-sm whitespace-pre-wrap break-words">{m.texto}</p>
                <p className="text-[9px] mt-1 text-right" style={{ color: meu ? "#0a162888" : C.muted }}>
                  {new Date(m.created_at).toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={fimRef} />
      </div>
      <form onSubmit={enviar} className="flex gap-2 pt-3">
        <input value={texto} onChange={e => setTexto(e.target.value)} placeholder={t("Mensagem...", "Message...", "Mensaje...")}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm placeholder-slate-500 focus:outline-none"
          style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}
          onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
        <button type="submit" disabled={enviando || !texto.trim()}
          className="w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-40 shrink-0"
          style={{ background: C.green, color: C.input }}>
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
  const t = useT()
  const [entrou, setEntrou] = useState(false)
  const roomName = `CKlareza-${mentorado.id.slice(0, 8)}-${mentorado.mentor_id.slice(0, 8)}`

  if (!entrou) return (
    <div className="rounded-2xl p-10 text-center mt-6" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${C.green}18`, border: `1px solid ${C.green}33` }}>
        <Video className="w-7 h-7" style={{ color: C.green }} />
      </div>
      <h2 className="text-lg font-bold mb-2" style={{ color: C.text }}>{t("Sala de Mentoria", "Mentorship Room", "Sala de Mentoría")}</h2>
      <p className="text-sm mb-6" style={{ color: C.muted }}>
        {t("Entre na chamada com", "Join the call with", "Únete a la llamada con")} {mentor?.nome.split(" ")[0] || t("seu mentor", "your mentor", "tu mentor")}. {t("Vocês se encontram na mesma sala.", "You meet in the same room.", "Se encuentran en la misma sala.")}
      </p>
      <button onClick={() => setEntrou(true)}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all"
        style={{ background: C.green, color: C.input }}>
        <Phone className="w-4 h-4" /> {t("Entrar na Chamada", "Join Call", "Entrar a la Llamada")}
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50" style={{ background: "#040d16" }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.red }} />
          <span className="text-sm font-semibold" style={{ color: C.text }}>{t("Em chamada", "In call", "En llamada")}</span>
        </div>
        <button onClick={() => setEntrou(false)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: `${C.red}18`, border: `1px solid ${C.red}44`, color: C.red }}>
          {t("Sair", "Leave", "Salir")}
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
