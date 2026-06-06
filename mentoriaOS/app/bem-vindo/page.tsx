"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Sparkles, Check, ArrowRight } from "lucide-react"

function BemVindoContent() {
  const params = useSearchParams()
  const mentorados = params.get("mentorados") || "10"
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center"
      style={{ background: "#060913", color: "#e8f1ff" }}>

      <div className="mb-8 w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: "#22d3ee18", border: "2px solid #22d3ee" }}>
        <Check className="w-10 h-10" style={{ color: "#22d3ee" }} />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5" style={{ color: "#22d3ee" }} />
        <span className="text-sm font-bold tracking-widest" style={{ color: "#22d3ee" }}>
          CKLAREZA
        </span>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
        Bem-vindo ao CKlareza! 🎉
      </h1>

      <p className="text-xl mb-2" style={{ color: "#93a8c9" }}>
        Seu trial de <strong style={{ color: "#e8f1ff" }}>14 dias</strong> está ativo.
      </p>
      <p className="text-lg mb-8" style={{ color: "#93a8c9" }}>
        Configurado para <strong style={{ color: "#22d3ee" }}>{mentorados} mentorados</strong>.
      </p>

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

      <Link href="/dashboard"
        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition-all hover:-translate-y-1"
        style={{ background: "#22d3ee", color: "#04121a", boxShadow: "0 15px 40px #22d3ee40" }}>
        Ir para o Dashboard <ArrowRight className="w-5 h-5" />
      </Link>

      <p className="text-sm mt-6" style={{ color: "#93a8c9" }}>
        Dúvidas?{" "}
        <a href="mailto:rodrigo.paes.rj@gmail.com" style={{ color: "#22d3ee" }}>
          Fale direto com a gente
        </a>
      </p>
    </div>
  )
}

export default function BemVindo() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#060913" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#22d3ee" }} />
      </div>
    }>
      <BemVindoContent />
    </Suspense>
  )
}
