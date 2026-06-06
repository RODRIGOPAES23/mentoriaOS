"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import {
  Sparkles, ArrowRight, Loader2, Mail, User,
  Check, Clock, Shield, Zap
} from "lucide-react"

type Etapa = "form" | "enviando" | "sucesso" | "erro"

// ── Cores fixas (página pública, sem tema dinâmico) ──────────────────────────
const BG = "#060913"
const CARD = "#0c1322"
const BORDER = "#1e3a5f"
const GOLD = "#22d3ee"
const TEAL = "#34d399"
const MUTED = "#93a8c9"
const INK = "#e8f1ff"

const BENEFICIOS = [
  { icon: Zap,    texto: "Briefing de call gerado por IA em 30 segundos" },
  { icon: Shield, texto: "Radar de churn avisa quem vai cancelar com 30 dias de antecedência" },
  { icon: Clock,  texto: "Setup completo em menos de 5 minutos — 100% web, sem instalar nada" },
]

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function ComecarPage() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [etapa, setEtapa] = useState<Etapa>("form")
  const [erro, setErro] = useState("")
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [isSetup, setIsSetup] = useState(false) // veio do dashboard como norole

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("setup") === "1") setIsSetup(true)
  }, [])

  // ── Google OAuth ─────────────────────────────────────────────────────────────
  async function entrarGoogle() {
    setLoadingGoogle(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        queryParams: { prompt: "select_account" },
      },
    })
    if (error) { setErro(error.message); setLoadingGoogle(false) }
  }

  // ── Signup por email ─────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !email.trim()) return

    setEtapa("enviando")
    setErro("")

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim() }),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        setErro(data.error || "Algo deu errado. Tente novamente.")
        setEtapa("erro")
        return
      }

      if (data.magicLink) {
        // Redireciona direto — login automático
        window.location.href = data.magicLink
        return
      }

      setEtapa("sucesso")
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.")
      setEtapa("erro")
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG, color: INK }}>

      {/* ── HERO — nova copy ── */}
      <div
        className="w-full px-5 pt-10 pb-8 text-center"
        style={{ background: `radial-gradient(60% 40% at 50% 0%, ${GOLD}18 0%, transparent 70%)` }}
      >
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
          <Sparkles className="w-5 h-5" style={{ color: GOLD }} />
          <span className="font-bold text-lg tracking-tight" style={{ color: GOLD }}>CKlareza</span>
          <span className="text-xs tracking-widest ml-1" style={{ color: TEAL }}>LIFETIME VALUE</span>
        </Link>

        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
          {isSetup ? "Complete seu cadastro para continuar" : "Trial gratuito — 14 dias · sem cartão"}
        </p>

        {/* NOVO HERO COPY */}
        <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.08] tracking-tight max-w-3xl mx-auto mb-4">
          <span style={{ color: "#ef4444" }}>Quanto você pagaria</span>{" "}
          <span style={{ color: INK }}>para não errar?</span>
        </h1>
        <p className="text-base md:text-lg max-w-2xl mx-auto mb-2" style={{ color: MUTED }}>
          Pare de perder <strong style={{ color: INK }}>7h30 por semana</strong> preparando calls
          que você poderia simplesmente <em>não preparar</em>.
        </p>
        <p className="text-sm md:text-base max-w-2xl mx-auto mb-6" style={{ color: MUTED }}>
          A CKlareza automatiza o seu briefing com{" "}
          <strong style={{ color: INK }}>Inteligência Artificial</strong>, centraliza a gestão
          financeira e prevê quem vai cancelar com{" "}
          <strong style={{ color: INK }}>30 dias de antecedência</strong>.
          Opere mais, trabalhe menos —{" "}
          <strong style={{ color: GOLD }}>tudo com a sua marca</strong>.
        </p>
      </div>

      {/* ── FORMULÁRIO + BENEFÍCIOS ── */}
      <div className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-10 px-5 pb-16 max-w-5xl mx-auto w-full">

        {/* Benefícios — esquerda */}
        <div className="flex-1 lg:pt-4 hidden lg:block">
          <div className="space-y-5 mb-8">
            {BENEFICIOS.map(({ icon: Icon, texto }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}>
                  <Icon className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <p className="text-sm pt-2 leading-snug" style={{ color: MUTED }}>{texto}</p>
              </div>
            ))}
          </div>

          {/* Mini case */}
          <div className="p-5 rounded-2xl" style={{ background: `${GOLD}0a`, border: `1px solid ${GOLD}30` }}>
            <p className="text-sm font-bold mb-1 italic" style={{ color: INK }}>
              "De 45 min para 2 min por call. O churn caiu pela metade."
            </p>
            <p className="text-xs" style={{ color: MUTED }}>— Termo Laser · MRR +40% após CKlareza</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {["14 dias grátis", "Sem cartão de crédito", "Cancele quando quiser"].map((txt, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
                <Check className="w-3 h-3" style={{ color: TEAL }} /> {txt}
              </span>
            ))}
          </div>
        </div>

        {/* Formulário — direita */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="rounded-2xl p-7" style={{ background: CARD, border: `1px solid ${BORDER}` }}>

            {/* ── ESTADO: FORM ── */}
            {(etapa === "form" || etapa === "enviando") && (
              <>
                <h2 className="text-xl font-bold mb-1" style={{ color: INK }}>
                  {isSetup ? "Complete seu acesso" : "Criar conta gratuita"}
                </h2>
                <p className="text-sm mb-5" style={{ color: MUTED }}>
                  {isSetup
                    ? "Você está autenticado mas ainda sem perfil de mentor. Preencha abaixo."
                    : "Preencha abaixo e acesse o dashboard em segundos."}
                </p>

                {/* Google OAuth */}
                <button
                  onClick={entrarGoogle}
                  disabled={!!loadingGoogle || etapa === "enviando"}
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold mb-4 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "#fff", color: "#1f1f1f" }}
                >
                  {loadingGoogle
                    ? <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                    : <GoogleIcon />}
                  Continuar com Google
                </button>

                {/* Divisor */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ background: BORDER }} />
                  <span className="text-[11px] uppercase tracking-widest" style={{ color: MUTED }}>ou e-mail</span>
                  <div className="flex-1 h-px" style={{ background: BORDER }} />
                </div>

                {/* Form email */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: MUTED }}>
                      Seu nome completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: MUTED }} />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        placeholder="João Silva"
                        disabled={etapa === "enviando"}
                        className="w-full pl-9 pr-4 py-3 rounded-xl text-sm focus:outline-none disabled:opacity-60"
                        style={{ background: BG, border: `1px solid ${BORDER}`, color: INK }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: MUTED }}>
                      Seu melhor e-mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: MUTED }} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="joao@empresa.com"
                        disabled={etapa === "enviando"}
                        className="w-full pl-9 pr-4 py-3 rounded-xl text-sm focus:outline-none disabled:opacity-60"
                        style={{ background: BG, border: `1px solid ${BORDER}`, color: INK }}
                      />
                    </div>
                  </div>

                  {erro && (
                    <p className="text-xs px-1" style={{ color: "#ef4444" }}>{erro}</p>
                  )}

                  <button
                    type="submit"
                    disabled={etapa === "enviando" || !nome.trim() || !email.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                    style={{
                      background: GOLD,
                      color: "#04121a",
                      boxShadow: etapa !== "enviando" ? `0 8px 24px ${GOLD}40` : undefined,
                    }}
                  >
                    {etapa === "enviando" ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Criando sua conta…</>
                    ) : (
                      <>Entrar no dashboard agora <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                <p className="text-center text-xs mt-5" style={{ color: MUTED }}>
                  Já tem conta?{" "}
                  <Link href="/login" className="font-semibold" style={{ color: GOLD }}>
                    Fazer login →
                  </Link>
                </p>

                <p className="text-center text-[11px] mt-3" style={{ color: `${MUTED}88` }}>
                  Ao criar sua conta você concorda com nossa{" "}
                  <Link href="/privacidade" className="underline" style={{ color: MUTED }}>
                    Política de Privacidade
                  </Link>
                </p>
              </>
            )}

            {/* ── ESTADO: SUCESSO ── */}
            {etapa === "sucesso" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${GOLD}18`, border: `2px solid ${GOLD}` }}>
                  <Mail className="w-8 h-8" style={{ color: GOLD }} />
                </div>
                <h2 className="text-xl font-bold mb-2" style={{ color: INK }}>
                  Conta criada! 🎉
                </h2>
                <p className="text-sm mb-2" style={{ color: MUTED }}>
                  Enviamos o link de acesso para
                </p>
                <p className="font-bold text-base mb-5" style={{ color: INK }}>{email}</p>
                <p className="text-xs mb-6" style={{ color: MUTED }}>
                  Clique no link para entrar direto no dashboard.{" "}
                  Não achou? Verifique o spam.
                </p>
                <div className="space-y-2 text-left">
                  {[
                    "Adicione seus mentorados",
                    "Configure as perguntas de check-in",
                    "Compartilhe o portal com seus alunos",
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ background: BG, border: `1px solid ${BORDER}` }}>
                      <span className="text-xs font-extrabold w-5 h-5 flex items-center justify-center rounded-full shrink-0"
                        style={{ background: `${GOLD}20`, color: GOLD }}>
                        {i + 1}
                      </span>
                      <p className="text-xs" style={{ color: MUTED }}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ESTADO: ERRO ── */}
            {etapa === "erro" && (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.4)" }}>
                  <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="text-lg font-bold mb-2" style={{ color: INK }}>Algo deu errado</h2>
                <p className="text-sm mb-6" style={{ color: MUTED }}>{erro}</p>
                <button
                  onClick={() => { setEtapa("form"); setErro("") }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
                  style={{ background: GOLD, color: "#04121a" }}
                >
                  Tentar novamente <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-xs mt-4" style={{ color: MUTED }}>
                  Problema persistente?{" "}
                  <a href="mailto:rodrigo.paes.rj@gmail.com" style={{ color: GOLD }}>
                    rodrigo.paes.rj@gmail.com
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
