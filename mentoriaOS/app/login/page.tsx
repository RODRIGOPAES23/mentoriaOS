"use client"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from "lucide-react"

const C = { bg: "#0c1c2c", card: "#0f2540", card2: "#112a4a", border: "#1e3a5f", muted: "#4d7fa8", green: "#00d68f", red: "#ff5470" }

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState<"google" | "email" | "magic" | null>(null)
  const [erro, setErro] = useState("")
  const [magicSent, setMagicSent] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const nextParam = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("next") || "/dashboard"
    : "/dashboard"

  async function entrarGoogle() {
    setLoading("google"); setErro("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextParam)}` },
    })
    if (error) { setErro(error.message); setLoading(null) }
  }

  async function entrarEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading("email"); setErro("")
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
    if (error) { setErro(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message); setLoading(null); return }
    window.location.href = nextParam
  }

  async function linkMagico() {
    if (!email.trim()) { setErro("Digite seu e-mail primeiro."); return }
    setLoading("magic"); setErro("")
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextParam)}` },
    })
    if (error) { setErro(error.message); setLoading(null); return }
    setMagicSent(true); setLoading(null)
  }

  const inputStyle = { background: C.bg, border: `1px solid ${C.border}` }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: C.bg }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${C.green}18`, border: `1px solid ${C.green}44` }}>
            <Sparkles className="w-7 h-7" style={{ color: C.green }} />
          </div>
          <h1 className="text-2xl font-bold text-white">CKlareza</h1>
          <p className="text-sm mt-1" style={{ color: C.muted }}>Acesse sua conta</p>
        </div>

        <div className="rounded-2xl p-7" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          {magicSent ? (
            <div className="text-center py-4">
              <Mail className="w-10 h-10 mx-auto mb-3" style={{ color: C.green }} />
              <p className="text-white font-semibold">Link enviado!</p>
              <p className="text-sm mt-1" style={{ color: C.muted }}>Verifique <b className="text-white">{email}</b> e clique no link.</p>
              <button onClick={() => setMagicSent(false)} className="mt-5 text-xs" style={{ color: C.muted }}>Voltar</button>
            </div>
          ) : (
            <>
              {/* Google */}
              <button onClick={entrarGoogle} disabled={!!loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: "#fff", color: "#1f1f1f" }}>
                {loading === "google" ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                Entrar com Google
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: C.border }} />
                <span className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>ou e-mail</span>
                <div className="flex-1 h-px" style={{ background: C.border }} />
              </div>

              <form onSubmit={entrarEmail} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.muted }} />
                  <input type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none" style={inputStyle} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.muted }} />
                  <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none" style={inputStyle} />
                </div>
                {erro && <p className="text-xs px-1" style={{ color: C.red }}>{erro}</p>}
                <button type="submit" disabled={!!loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-all"
                  style={{ background: C.green, color: C.bg }}>
                  {loading === "email" ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Entrar <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <button onClick={linkMagico} disabled={!!loading} className="w-full text-center text-xs mt-4 disabled:opacity-50" style={{ color: C.muted }}>
                {loading === "magic" ? "Enviando..." : "Entrar sem senha (link mágico no e-mail)"}
              </button>
            </>
          )}
        </div>
        <p className="text-center text-[11px] mt-6" style={{ color: C.muted }}>Acesso restrito · mentores e administradores</p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
