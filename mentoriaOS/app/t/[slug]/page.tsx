"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

/**
 * Rota de entrada por empresa (fallback enquanto DNS wildcard não está ativo).
 * /t/termolaser → fixa a empresa no localStorage e manda pra home (seletor de mentor).
 */
export default function EntradaEmpresa() {
  const params = useParams()
  const router = useRouter()
  const slug = String(params.slug || "").toLowerCase()

  useEffect(() => {
    if (slug) {
      try { localStorage.setItem("ck:empresa-slug", slug) } catch {}
    }
    router.replace("/")
  }, [slug, router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0c1c2c" }}>
      <p style={{ color: "#4d7fa8" }}>Carregando empresa...</p>
    </div>
  )
}
