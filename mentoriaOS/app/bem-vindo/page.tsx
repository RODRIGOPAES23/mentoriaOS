"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Sparkles, Check, ArrowRight, Loader2, Mail, AlertCircle } from "lucide-react"

type Estado = "carregando" | "redirecionando" | "email_enviado" | "erro"

function BemVindoContent() {
  const params = useSearchParams()
  const sessionId = params.get("session_id")
  const mentorados = params.get("mentorados") || "10"

  const [estado, setEstado] = useState<Estado>("carregando")
  const [email, setEmail] = useState("")
  const [nome, setNome] = useState("")
  const [erro, setErro] = useState("")

  useEffect(() => {
    if (!sessionId) {
      // Sem session_id — veio do /login normal, só mostra boas-vindas
      setEstado("email_enviado")
      return
    }

    async function ativar() {
      try {
        const res = await fetch(`/api/stripe/activate?session_id=${sessionId}`)
        const data = await res.json()

        if (!res.ok || !data.ok) {
          setErro(data.error || "Erro ao ativar conta.")
          setEstado("erro")
          return
        }

        setEmail(data.email || "")
        setNome(data.nome || "")

        if (data.magicLink) {
          // Tem link mágico — redireciona automaticamente em 2s
          setEstado("redirecionando")
          setTimeout(() => {
            window.location.href = data.magicLink
          }, 2000)
        } else {
          // Sem link — pede para checar email
          setEstado("email_enviado")
        }
      } catch (e: any) {
        setErro("Erro de conexão. Tente acessar pelo link enviado ao seu e-mail.")
        setEstado("erro")
      }
    }

    ativar()
  }, [sessionId])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center"
      style={{ background: "#060913", color: "#e8f1ff" }}>

      {/* ── CARREGANDO ── */}
      {estado === "carregando" && (
        <>
          <Loader2 className="w-14 h-14 animate-spin mb-6" style={{ color: "#22d3ee" }} />
          <h1 className="text-2xl font-bold mb-2">Ativando sua conta…</h1>
          <p style={{ color: "#93a8c9" }}>Confirmando pagamento e criando seu acesso.</p>
        </>
      )}

      {/* ── REDIRECIONANDO ── */}
      {estado === "redirecionando" && (
        <>
          <div className="mb-6 w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "#22d3ee18", border: "2px solid #22d3ee" }}>
            <Check className="w-10 h-10" style={{ color: "#22d3ee" }} />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" style={{ color: "#22d3ee" }} />
            <span className="text-sm font-bold tracking-widest" style={{ color: "#22d3ee" }}>CKLAREZA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Pagamento confirmado! 🎉</h1>
          <p className="text-xl mb-1" style={{ color: "#93a8c9" }}>
            Olá, <strong style={{ color: "#e8f1ff" }}>{nome || email}</strong>!
          </p>
          <p className="text-lg mb-6" style={{ color: "#93a8c9" }}>
            Trial de <strong style={{ color: "#e8f1ff" }}>14 dias</strong> ativo para{" "}
            <strong style={{ color: "#22d3ee" }}>{mentorados} mentorados</strong>.
          </p>
          <div className="flex items-center gap-2 text-sm mb-8" style={{ color: "#93a8c9" }}>
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#22d3ee" }} />
            Abrindo o dashboard automaticamente…
          </div>
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold"
            style={{ background: "#22d3ee", color: "#04121a", boxShadow: "0 15px 40px #22d3ee40" }}>
            Ir para o Dashboard agora <ArrowRight className="w-5 h-5" />
          </Link>
        </>
      )}

      {/* ── EMAIL ENVIADO / SEM SESSION_ID ── */}
      {estado === "email_enviado" && (
        <>
          <div className="mb-6 w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "#22d3ee18", border: "2px solid #22d3ee" }}>
            {email ? <Mail className="w-10 h-10" style={{ color: "#22d3ee" }} />
                   : <Check className="w-10 h-10" style={{ color: "#22d3ee" }} />}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" style={{ color: "#22d3ee" }} />
            <span className="text-sm font-bold tracking-widest" style={{ color: "#22d3ee" }}>CKLAREZA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            {email ? "Conta criada! 🎉" : "Bem-vindo! 🎉"}
          </h1>
          {email ? (
            <>
              <p className="text-xl mb-2" style={{ color: "#93a8c9" }}>
                Enviamos o link de acesso para{" "}
                <strong style={{ color: "#e8f1ff" }}>{email}</strong>
              </p>
              <p className="text-base mb-8" style={{ color: "#93a8c9" }}>
                Verifique sua caixa de entrada e clique no link para acessar o dashboard.
              </p>
            </>
          ) : (
            <p className="text-xl mb-8" style={{ color: "#93a8c9" }}>
              Seu trial de <strong style={{ color: "#e8f1ff" }}>14 dias</strong> está ativo.
            </p>
          )}

          {/* 3 passos */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10 w-full max-w-xl">
            {[
              ["1", "Adicione seus mentorados", "Dashboard → Novo Mentorado"],
              ["2", "Configure o check-in", "Configurações → Perguntas"],
              ["3", "Compartilhe o portal", "Mentorado faz check-in, IA age"],
            ].map(([num, titulo, desc]) => (
              <div key={num} className="p-4 rounded-xl text-left"
                style={{ background: "#0c1322", border: "1px solid #1e3a5f" }}>
                <span className="text-2xl font-extrabold block mb-1" style={{ color: "#22d3ee" }}>{num}</span>
                <p className="font-bold text-sm mb-1">{titulo}</p>
                <p className="text-xs" style={{ color: "#93a8c9" }}>{desc}</p>
              </div>
            ))}
          </div>

          <Link href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition-all hover:-translate-y-1"
            style={{ background: "#22d3ee", color: "#04121a", boxShadow: "0 15px 40px #22d3ee40" }}>
            Acessar Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        </>
      )}

      {/* ── ERRO ── */}
      {estado === "erro" && (
        <>
          <div className="mb-6 w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.5)" }}>
            <AlertCircle className="w-10 h-10" style={{ color: "#ef4444" }} />
          </div>
          <h1 className="text-3xl font-extrabold mb-3">Algo deu errado</h1>
          <p className="text-base mb-2" style={{ color: "#93a8c9" }}>{erro}</p>
          <p className="text-sm mb-8" style={{ color: "#93a8c9" }}>
            Seu pagamento foi processado. Entre em contato:{" "}
            <a href="mailto:rodrigo.paes.rj@gmail.com" style={{ color: "#22d3ee" }}>
              rodrigo.paes.rj@gmail.com
            </a>
          </p>
          <Link href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
            style={{ background: "#22d3ee", color: "#04121a" }}>
            Tentar fazer login <ArrowRight className="w-4 h-4" />
          </Link>
        </>
      )}
    </div>
  )
}

export default function BemVindo() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#060913" }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#22d3ee" }} />
      </div>
    }>
      <BemVindoContent />
    </Suspense>
  )
}
