"use client"

// Shell visual estilo mLabs: sidebar clara + área de conteúdo lavanda + roxo vibrante.
// Usado pelas telas do centro de comando (dashboard, distribuição).
import { api } from "@/lib/basePath"
import type { ReactNode } from "react"

export const UI = {
  roxo: "#7c3aed",
  roxoEscuro: "#5b21b6",
  magenta: "#d946ef",
  bg: "#f5f3fb",
  card: "#ffffff",
  borda: "#ece9f5",
  tinta: "#1e1b2e",
  muted: "#7c7896",
  verde: "#10b981",
  laranja: "#f59e0b",
  vermelho: "#ef4444",
  azul: "#3b82f6",
}

type NavItem = { href: string; label: string; icon: string }
const NAV: NavItem[] = [
  { href: "/admin/analytics", label: "Dashboard", icon: "📊" },
  { href: "/admin/prospeccao", label: "Buscar leads", icon: "🔎" },
  { href: "/admin", label: "Leads (CRM)", icon: "🗂️" },
  { href: "/admin/distribuicao", label: "Distribuição", icon: "📣" },
  { href: "/admin/video", label: "Anúncios em vídeo", icon: "🎬" },
  { href: "/admin/aprendizado", label: "Aprendizado IA", icon: "🧠" },
]

export function Shell({ children, ativo, titulo, subtitulo }: {
  children: ReactNode
  ativo: string
  titulo: string
  subtitulo?: string
}) {
  return (
    <div style={{ display: "flex", minHeight: "100dvh", background: UI.bg, color: UI.tinta, fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: UI.card, borderRight: `1px solid ${UI.borda}`, padding: "22px 16px", position: "sticky", top: 0, height: "100dvh", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 22px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${UI.roxo}, ${UI.magenta})`, display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>C</div>
          <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.3 }}>CKlareza</div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map((n) => {
            const on = n.href === ativo
            return (
              <a key={n.href} href={api(n.href)}
                style={{
                  display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 10,
                  textDecoration: "none", fontSize: 14, fontWeight: on ? 700 : 500,
                  color: on ? "#fff" : UI.muted,
                  background: on ? `linear-gradient(135deg, ${UI.roxo}, ${UI.roxoEscuro})` : "transparent",
                }}>
                <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
              </a>
            )
          })}
        </nav>
        <div style={{ marginTop: 24, padding: "12px 14px", borderRadius: 12, background: "#faf8ff", border: `1px solid ${UI.borda}`, fontSize: 11.5, color: UI.muted, lineHeight: 1.5 }}>
          Centro de comando — do lead à venda. Powered by <b style={{ color: UI.roxo }}>GRATIDÃO</b>.
        </div>
      </aside>

      {/* Conteúdo */}
      <main style={{ flex: 1, padding: "28px 32px", maxWidth: 1160 }}>
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>{titulo}</h1>
          {subtitulo && <p style={{ color: UI.muted, fontSize: 14, margin: "4px 0 0" }}>{subtitulo}</p>}
        </header>
        {children}
      </main>
    </div>
  )
}

// Card de KPI no estilo mLabs (branco, sombra suave, número grande, faixa de cor).
export function Card({ titulo, valor, cor = UI.roxo, sub, icone }: {
  titulo: string; valor: string; cor?: string; sub?: string; icone?: string
}) {
  return (
    <div style={{ background: UI.card, border: `1px solid ${UI.borda}`, borderRadius: 16, padding: 18, flex: 1, minWidth: 170, boxShadow: "0 1px 3px rgba(30,27,46,0.04)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: cor }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12.5, color: UI.muted, fontWeight: 500 }}>{titulo}</span>
        {icone && <span style={{ fontSize: 16, opacity: 0.8 }}>{icone}</span>}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: UI.tinta, lineHeight: 1.15, marginTop: 6, letterSpacing: -1 }}>{valor}</div>
      {sub && <div style={{ fontSize: 11.5, color: UI.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

export function Painel({ titulo, children, acao }: { titulo: string; children: ReactNode; acao?: ReactNode }) {
  return (
    <section style={{ background: UI.card, border: `1px solid ${UI.borda}`, borderRadius: 16, padding: 20, boxShadow: "0 1px 3px rgba(30,27,46,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  )
}
