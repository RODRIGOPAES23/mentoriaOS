"use client"

import { LayoutDashboard, Users, Calendar, FolderArchive, Settings, Sparkles, LogOut, ChevronLeft, ChevronRight, Building2 } from "lucide-react"
import { C } from "@/utils/theme"

export type CkView = "visao-geral" | "mentorados" | "calendario" | "historico" | "config" | "empresa"

const ITENS: { id: CkView; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }[] = [
  { id: "visao-geral", label: "Dashboard", icon: LayoutDashboard },
  { id: "empresa", label: "Empresa", icon: Building2, adminOnly: true },
  { id: "mentorados", label: "Mentorados", icon: Users },
  { id: "calendario", label: "Calendário", icon: Calendar },
  { id: "historico", label: "Histórico", icon: FolderArchive },
  { id: "config", label: "Configurações", icon: Settings },
]

interface Props {
  active: CkView
  onChange: (v: CkView) => void
  onLogout?: () => void
  collapsed?: boolean
  onToggle?: () => void
  marca?: string          // nome da empresa (white label)
  accent?: string         // cor primária da empresa
  logoUrl?: string | null // logo da empresa
  esconderMarca?: boolean // esconde "MENTORIA INTELIGENTE / CKlareza"
  isAdmin?: boolean       // mostra aba Empresa só para admin
}

export default function Sidebar({ active, onChange, onLogout, collapsed = false, onToggle, marca = "CKlareza", accent = C.green, logoUrl = null, esconderMarca = false, isAdmin = false }: Props) {
  const itens = ITENS.filter(i => !i.adminOnly || isAdmin)
  return (
    <aside
      className={`shrink-0 flex flex-col h-screen sticky top-0 transition-all duration-300 ${collapsed ? "w-[68px]" : "w-64"}`}
      style={{ background: C.card, borderRight: `1px solid ${C.border}` }}
    >
      {/* Logo + Toggle */}
      <div className={`relative flex items-center h-[65px] ${collapsed ? "justify-center px-0" : "px-5 gap-2.5"}`} style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ background: `${accent}20`, border: `1px solid ${accent}44` }}>
          {logoUrl
            ? <img src={logoUrl} alt={marca} className="w-full h-full object-cover" />
            : <Sparkles className="w-5 h-5" style={{ color: accent }} />}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-none truncate">{marca}</h1>
            <p className="text-[9px] mt-0.5 tracking-widest" style={{ color: C.muted }}>
              {esconderMarca ? "MENTORIA" : "POWERED BY CKLAREZA"}
            </p>
          </div>
        )}
        <button
          onClick={onToggle}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className="flex items-center justify-center w-6 h-6 rounded-md transition-all"
          style={collapsed
            ? { position: "absolute", right: 0, transform: "translateX(50%)", top: 22, background: C.card2, border: `1px solid ${C.border}`, zIndex: 10, color: C.muted }
            : { color: C.muted }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = C.muted}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navegação */}
      <nav className={`flex-1 py-3 space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
        {itens.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              title={collapsed ? label : undefined}
              className={`group relative w-full flex items-center transition-all duration-200 rounded-xl ${collapsed ? "justify-center p-2.5" : "gap-3 px-3.5 py-2.5"}`}
              style={isActive
                ? { background: accent, color: "#0a1628" }
                : { color: C.muted }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = C.card2; (e.currentTarget as HTMLElement).style.color = "#fff" } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.muted } }}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="text-sm font-semibold">{label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Rodapé */}
      <div className={`pb-4 pt-3 ${collapsed ? "px-2" : "px-3"}`} style={{ borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={onLogout}
          title={collapsed ? "Trocar mentor" : undefined}
          className={`w-full flex items-center transition-all rounded-xl ${collapsed ? "justify-center p-2.5" : "gap-3 px-3.5 py-2.5"}`}
          style={{ color: C.muted }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.card2; (e.currentTarget as HTMLElement).style.color = "#fff" }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.muted }}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="text-sm font-semibold">Trocar mentor</span>}
        </button>
        {!collapsed && <p className="text-[9px] text-center mt-3" style={{ color: C.border }}>CKlareza · v5.1</p>}
      </div>
    </aside>
  )
}
