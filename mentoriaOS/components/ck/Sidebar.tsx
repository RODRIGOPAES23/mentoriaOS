"use client"

import { LayoutDashboard, Users, Calendar, FolderArchive, Settings, Sparkles, LogOut, ChevronLeft, ChevronRight } from "lucide-react"

export type CkView = "visao-geral" | "mentorados" | "calendario" | "historico" | "config"

const ITENS: { id: CkView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "visao-geral", label: "Dashboard", icon: LayoutDashboard },
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
}

export default function Sidebar({ active, onChange, onLogout, collapsed = false, onToggle }: Props) {
  return (
    <aside
      className={`shrink-0 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-64"
      }`}
    >
      {/* Logo + Toggle */}
      <div className={`flex items-center h-[65px] border-b border-slate-800/60 ${collapsed ? "justify-center px-0" : "px-5 gap-2.5"}`}>
        <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/30 shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-none">CKlareza</h1>
            <p className="text-[9px] text-slate-500 mt-0.5 tracking-widest">MENTORIA INTELIGENTE</p>
          </div>
        )}
        {/* Botão toggle */}
        <button
          onClick={onToggle}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          className={`flex items-center justify-center w-6 h-6 rounded-md text-slate-500 hover:text-white hover:bg-slate-700 transition-all ${
            collapsed ? "absolute right-0 translate-x-1/2 top-[22px] bg-slate-800 border border-slate-700 z-10 shadow-md" : ""
          }`}
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navegação */}
      <nav className={`flex-1 py-3 space-y-1 ${collapsed ? "px-2" : "px-3"}`}>
        {ITENS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              title={collapsed ? label : undefined}
              className={`group relative w-full flex items-center transition-all duration-200 rounded-xl ${
                collapsed ? "justify-center p-2.5" : "gap-3 px-3.5 py-2.5"
              } ${
                isActive
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {!collapsed && isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-400 rounded-r-full -ml-3" />
              )}
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Rodapé */}
      <div className={`pb-4 pt-3 border-t border-slate-800/60 ${collapsed ? "px-2" : "px-3"}`}>
        <button
          onClick={onLogout}
          title={collapsed ? "Trocar mentor" : undefined}
          className={`w-full flex items-center transition-all rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 ${
            collapsed ? "justify-center p-2.5" : "gap-3 px-3.5 py-2.5"
          }`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Trocar mentor</span>}
        </button>
        {!collapsed && <p className="text-[9px] text-slate-600 text-center mt-3">CKlareza · v5.0</p>}
      </div>
    </aside>
  )
}
