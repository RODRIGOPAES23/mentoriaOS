"use client"

import { useState, useEffect } from "react"

export interface Empresa {
  id: string
  slug: string
  nome: string
  logo_url: string | null
  cor_primaria: string
  cor_secundaria: string
  esconder_marca: boolean
  ativo: boolean
  musica_url?: string | null
}

/**
 * Resolve o slug da empresa a partir do ambiente:
 *  1. Subdomínio: termolaser.cklareza.com → "termolaser"
 *  2. Path fallback: /t/termolaser (enquanto DNS wildcard não está ativo)
 *  3. localStorage (empresa fixada na sessão do mentor)
 */
export function resolverSlug(): string | null {
  if (typeof window === "undefined") return null

  const host = window.location.hostname // ex: termolaser.cklareza.com
  const parts = host.split(".")

  // Subdomínio real (3+ partes, não www, não localhost, não vercel preview)
  if (parts.length >= 3 && !["www", "app"].includes(parts[0])) {
    // ignora dominios vercel tipo mentoriaos.vercel.app (2 partes úteis)
    if (!host.endsWith("vercel.app")) return parts[0].toLowerCase()
  }

  // Path /t/<slug>
  const m = window.location.pathname.match(/^\/t\/([^/]+)/)
  if (m) return m[1].toLowerCase()

  // Sessão fixada
  try {
    const saved = localStorage.getItem("ck:empresa-slug")
    if (saved) return saved
  } catch {}

  return null
}

const DEFAULT: Empresa = {
  id: "", slug: "", nome: "CKlareza",
  logo_url: null, cor_primaria: "#00d68f", cor_secundaria: "#4c9aff",
  esconder_marca: false, ativo: true,
}

export function useEmpresa() {
  const [empresa, setEmpresa] = useState<Empresa>(DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const slug = resolverSlug()
    if (!slug) { setLoading(false); return }

    fetch(`/api/empresa?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(j => {
        if (j.empresa) {
          setEmpresa(j.empresa)
          try { localStorage.setItem("ck:empresa-slug", j.empresa.slug) } catch {}
          // injeta cor primária como CSS var global
          document.documentElement.style.setProperty("--ck-accent", j.empresa.cor_primaria)
          document.documentElement.style.setProperty("--ck-accent-2", j.empresa.cor_secundaria)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { empresa, loading }
}
