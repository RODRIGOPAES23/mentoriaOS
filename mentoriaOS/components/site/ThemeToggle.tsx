"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

/**
 * Toggle sol/lua do site (marketing). Alterna a classe `html.dark` (que controla
 * as CSS vars --sc-*) e persiste em localStorage `ck_theme` — a mesma chave usada
 * pela landing e pelo dashboard, mantendo a preferência coesa em todo o site.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    try { localStorage.setItem("ck_theme", next ? "dark" : "light") } catch {}
  }

  return (
    <button onClick={toggle} aria-label="Alternar tema claro/escuro" title={dark ? "Tema claro" : "Tema escuro"}
      className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${className}`}
      style={{ color: "var(--sc-gold)", border: "1px solid var(--sc-border)", background: "rgb(var(--sc-gold-rgb) / 0.07)" }}>
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
