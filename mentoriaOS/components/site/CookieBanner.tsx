"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Não mostrar em páginas que já têm consentimento próprio (portal, dashboard, admin)
const EXCLUIDAS = ["/m/", "/dashboard", "/admin"]

export function CookieBanner() {
  const [show, setShow] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (EXCLUIDAS.some(p => pathname.startsWith(p))) return
    try {
      if (!localStorage.getItem("ck:cookies-aceite")) setShow(true)
    } catch {}
  }, [pathname])

  if (!show) return null

  const aceitar = (tipo: "todos" | "essenciais") => {
    try {
      localStorage.setItem("ck:cookies-aceite", JSON.stringify({ tipo, data: new Date().toISOString() }))
    } catch {}
    setShow(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4">
      <div
        className="max-w-4xl mx-auto rounded-2xl px-5 py-4 flex flex-col md:flex-row items-start md:items-center gap-4"
        style={{ background: "#0f2030", border: "1px solid #1e3450", boxShadow: "0 -4px 40px rgba(0,0,0,0.6)" }}
      >
        <div className="flex-1 text-sm leading-relaxed" style={{ color: "#7fa0bd" }}>
          <span className="font-semibold" style={{ color: "#fff" }}>Cookies </span>
          Usamos cookies de sessão para autenticação e armazenamento local de preferências. Sem rastreamento ou anúncios.{" "}
          <Link href="/privacidade" className="underline transition-colors" style={{ color: "#d4af37" }}>
            Política de privacidade
          </Link>
        </div>
        <div className="flex gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={() => aceitar("essenciais")}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "#112a4a", border: "1px solid #1e3a5f", color: "#7fa0bd" }}
          >
            Só essenciais
          </button>
          <button
            onClick={() => aceitar("todos")}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: "#d4af37", color: "#1a1407" }}
          >
            Aceitar tudo
          </button>
        </div>
      </div>
    </div>
  )
}
