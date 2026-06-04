"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Sparkles, BarChart3, Brain, CheckCircle2, Zap, Calendar, Users, Target } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEmpresa, resolverSlug } from "@/hooks/useEmpresa"
import SplashEmpresa from "@/components/ck/SplashEmpresa"
import PoweredBy from "@/components/ck/PoweredBy"
import { C } from "@/utils/theme"

interface Mentor { id: string; nome: string; nicho_foco?: string; foto_url?: string }

function iniciais(nome: string) {
  return nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

export default function SelecionarPage() {
  const router = useRouter()
  const { empresa, loading: empresaLoading } = useEmpresa()
  const accent = empresa.cor_primaria   // cor white label da empresa
  const marca = empresa.slug ? empresa.nome : "CKlareza"
  const [showSplash, setShowSplash] = useState(false)

  // Splash de abertura — SEMPRE que carregar o site da empresa (toda vez)
  useEffect(() => {
    if (empresaLoading) return
    if (!empresa.slug) return
    setShowSplash(true)
  }, [empresaLoading, empresa.slug])
  const [mentores, setMentores] = useState<Mentor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [podeEscolher, setPodeEscolher] = useState(false)  // só super-admin vê o seletor
  const [showSetup, setShowSetup] = useState(false)
  const [form, setForm] = useState({ nome: "", email: "", nicho: "", metodo: "", filosofia: "" })
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const slug = resolverSlug()
    const qs = slug ? `?empresa=${slug}` : ""
    fetch(`/api/mentors/list${qs}`, { cache: "no-store" })
      .then(r => r.json()).then(j => setMentores(j.mentores || []))
      .catch(() => {}).finally(() => setCarregando(false))
  }, [])

  // Gate de auth: só super-admin escolhe mentor; mentor vai direto; sem login → /login
  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(me => {
      if (!me.authenticated) { window.location.href = "/login"; return }
      if (me.role === "mentor") { window.location.href = "/dashboard"; return }
      if (me.role === "super_admin") { setPodeEscolher(true); return }
      window.location.href = "/login?error=sem_acesso"
    }).catch(() => { window.location.href = "/login" })
  }, [])

  const selecionarMentor = (id: string) => {
    localStorage.setItem("mentorSelecionado", id)
    router.push("/dashboard")
  }

  const cadastrarMentor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome.trim() || !form.email.trim()) return
    setSalvando(true)
    try {
      const slug = resolverSlug()
      const res = await fetch("/api/mentor/setup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: form.nome, email: form.email, metodo_trabalho: form.metodo, filosofia: form.filosofia, nicho_foco: form.nicho, empresa_slug: slug }),
      })
      if (res.ok) {
        const json = await res.json()
        localStorage.setItem("mentorSelecionado", json.mentor.id)
        router.push("/dashboard")
      } else {
        const err = await res.json()
        alert(`Erro: ${err.error}`)
      }
    } finally { setSalvando(false) }
  }

  // Splash sobreposto (cobre toda a tela enquanto ativo)
  const splash = showSplash ? (
    <SplashEmpresa nome={marca} logoUrl={empresa.logo_url} accent={accent} onFinish={() => setShowSplash(false)} />
  ) : null

  if (carregando || !podeEscolher) return (
    <>
      {splash}
      <div style={{ background: C.bg }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: accent+"22", border: `1px solid ${accent}44` }}>
            <Sparkles className="w-6 h-6 animate-pulse" style={{ color: accent }} />
          </div>
          <p style={{ color: C.muted }} className="text-sm">Carregando {marca}...</p>
        </div>
      </div>
    </>
  )

  // ── SELETOR ──────────────────────────────────────────────────────────────
  if (mentores.length > 0 && !showSetup) return (
    <>
    {splash}
    <div style={{ background: C.bg }} className="min-h-screen flex flex-col">
      {/* Header */}
      <nav style={{ background: C.card, borderBottom: `1px solid ${C.border}` }} className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accent+"22", border: `1px solid ${accent}44` }}>
            <Sparkles className="w-5 h-5" style={{ color: accent }} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white leading-none tracking-tight">{marca}</h1>
            <p className="text-[9px] tracking-widest mt-0.5" style={{ color: C.muted }}>MENTORIA INTELIGENTE</p>
          </div>
        </div>
      </nav>

      {/* Seletor */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: accent+"15", border: `1px solid ${accent}33` }}>
              <Sparkles className="w-8 h-8" style={{ color: accent }} />
            </div>
            <h2 className="text-2xl font-bold text-white">Bem-vindo de volta!</h2>
            <p className="mt-1.5 text-sm" style={{ color: C.muted }}>Selecione seu perfil de mentor</p>
          </div>

          <div className="space-y-2.5">
            {mentores.map(m => (
              <button key={m.id} onClick={() => selecionarMentor(m.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left group transition-all duration-200"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = accent; (e.currentTarget as HTMLElement).style.background = C.card2 }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.background = C.card }}
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0" style={{ border: `2px solid ${C.border}` }}>
                  {m.foto_url
                    ? <img src={m.foto_url} alt={m.nome} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ background: "#0a1628", color: accent }}>{iniciais(m.nome)}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{m.nome}</p>
                  {m.nicho_foco && <p className="text-xs truncate mt-0.5" style={{ color: C.muted }}>{m.nicho_foco}</p>}
                </div>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" style={{ color: C.muted }} />
              </button>
            ))}
          </div>

          <button onClick={() => setShowSetup(true)}
            className="w-full mt-4 py-3 text-sm font-semibold rounded-xl transition-colors"
            style={{ color: C.muted, border: `1px dashed ${C.border}` }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = accent; (e.currentTarget as HTMLElement).style.borderColor = accent }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.muted; (e.currentTarget as HTMLElement).style.borderColor = C.border }}
          >
            + Adicionar novo mentor
          </button>

          {empresa.slug && <div className="mt-8"><PoweredBy /></div>}
        </div>
      </div>
    </div>
    </>
  )

  // ── SETUP / LANDING ────────────────────────────────────────────────────────
  return (
    <>
    {splash}
    <div style={{ background: C.bg }} className="min-h-screen">
      {/* Header */}
      <nav style={{ background: C.card, borderBottom: `1px solid ${C.border}` }} className="px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accent+"22", border: `1px solid ${accent}44` }}>
            <Sparkles className="w-5 h-5" style={{ color: accent }} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white leading-none tracking-tight">{marca}</h1>
            <p className="text-[9px] tracking-widest mt-0.5" style={{ color: C.muted }}>MENTORIA INTELIGENTE</p>
          </div>
        </div>
        {!showSetup && (
          <button onClick={() => setShowSetup(true)}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-white transition-all"
            style={{ background: accent+"22", border: `1px solid ${accent}44`, color: accent }}>
            Começar agora →
          </button>
        )}
      </nav>

      {showSetup ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-65px)] p-6">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Configure sua conta</h2>
              <p className="mt-1.5 text-sm" style={{ color: C.muted }}>Perfil do mentor</p>
            </div>
            <div className="rounded-2xl p-8 space-y-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <form onSubmit={cadastrarMentor} className="space-y-4">
                {[
                  { label: "Nome completo *", key: "nome", ph: "Victor Sidoni" },
                  { label: "Email *", key: "email", ph: "victor@exemplo.com" },
                  { label: "Nicho de atuação", key: "nicho", ph: "Marketing Digital e Tráfego Pago" },
                  { label: "Método de trabalho", key: "metodo", ph: "Ex: 4 pilares de conversão" },
                  { label: "Filosofia de mentoria", key: "filosofia", ph: "Ex: Resultado antes de escala" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>{f.label}</label>
                    <input required={f.key === "nome" || f.key === "email"}
                      value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.ph}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none transition-all"
                      style={{ background: "#0a1628", border: `1px solid ${C.border}` }}
                      onFocus={e => e.target.style.borderColor = accent}
                      onBlur={e => e.target.style.borderColor = C.border}
                    />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowSetup(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    style={{ background: "#0a1628", color: C.muted, border: `1px solid ${C.border}` }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={salvando}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                    style={{ background: accent+"22", border: `1px solid ${accent}66`, color: accent }}>
                    {salvando ? "Criando..." : "Criar conta →"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <>
          <section className="px-8 py-24 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
                style={{ background: accent+"15", border: `1px solid ${accent}33`, color: accent }}>
                <Sparkles className="w-4 h-4" /> Plataforma de Mentoria com IA
              </div>
              <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                Clareza total em<br />
                <span style={{ color: accent }}>cada jornada de mentoria</span>
              </h2>
              <p className="text-lg mb-10 leading-relaxed max-w-2xl mx-auto" style={{ color: C.muted }}>
                Acompanhe sessões, metas e resultados dos seus mentorados com análise de IA em tempo real. Tudo num só lugar.
              </p>
              <button onClick={() => setShowSetup(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white transition-all hover:-translate-y-0.5"
                style={{ background: accent+"22", border: `1px solid ${accent}66`, color: accent, boxShadow: `0 0 30px ${accent}22` }}>
                Começar gratuitamente <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>

          <section className="px-8 pb-24 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Brain,        cor: accent, titulo: "Briefing IA",         desc: "Análise do gargalo + pauta de call gerada pelo Gemini automaticamente." },
                { icon: BarChart3,    cor: C.blue,  titulo: "Histórico & Evolução", desc: "8 semanas de dados em visualização interativa com variação %." },
                { icon: CheckCircle2, cor: "#a78bfa",titulo: "Check-in Semanal",    desc: "Mentorados preenchem formulário simples. Dados fluem direto para o dashboard." },
                { icon: Calendar,     cor: "#f59e0b",titulo: "Calendário de Sessões",desc: "Agende calls com link Meet/Zoom e veja próximas sessões na Visão Geral." },
                { icon: Target,       cor: "#f05252",titulo: "Análise de Call IA",   desc: "Cola transcrição e a IA extrai tarefas do mentorado + compromissos da equipe." },
                { icon: Users,        cor: C.muted,  titulo: "Multi-Mentor",         desc: "Larissa, Victor, Silas — cada mentor com seus mentorados e dados isolados." },
              ].map(f => {
                const Icon = f.icon
                return (
                  <div key={f.titulo} className="rounded-2xl p-6 transition-all hover:-translate-y-0.5"
                    style={{ background: C.card, border: `1px solid ${C.border}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${f.cor}18`, border: `1px solid ${f.cor}33` }}>
                      <Icon className="w-5 h-5" style={{ color: f.cor }} />
                    </div>
                    <h4 className="font-bold text-white mb-2">{f.titulo}</h4>
                    <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{f.desc}</p>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
    </>
  )
}
