"use client"

import { LayoutDashboard, Users, Calendar, FolderArchive, Settings, Sparkles, LogOut } from "lucide-react"

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
}

export default function Sidebar({ active, onChange, onLogout }: Props) {
  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-7 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight leading-none">CKlareza</h1>
          <p className="text-[10px] text-slate-500 mt-0.5 tracking-wide">MENTORIA INTELIGENTE</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 mt-2 space-y-1">
        {ITENS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`group relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-400 rounded-r-full -ml-3.5" />}
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Rodapé */}
      <div className="px-3 pb-5 pt-3 border-t border-slate-800/80">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Trocar mentor
        </button>
        <p className="text-[10px] text-slate-600 text-center mt-3">CKlareza · v5.0</p>
      </div>
    </aside>
  )
}
