"use client"

import { RefObject } from "react"
import { AlertCircle, ChevronDown, Settings, LogOut, Sparkles } from "lucide-react"
import { C } from "@/utils/theme"

interface Props {
  moduleLabel: string
  realtimeConnected: boolean
  mentorNome: string
  mentorFotoUrl?: string | null
  tarefasVencidas: number
  showMenu: boolean
  setShowMenu: (v: boolean) => void
  menuRef: RefObject<HTMLDivElement>
  onVencidas: () => void
  onConfiguracoes: () => void
  onSair: () => void
}

/** Barra superior do dashboard do mentor (presenter puro). */
export default function DashboardHeader({
  moduleLabel, realtimeConnected, mentorNome, mentorFotoUrl, tarefasVencidas,
  showMenu, setShowMenu, menuRef, onVencidas,
  onConfiguracoes, onSair,
}: Props) {
  const itensMenu = [
    { label: "Configurações", icon: Settings, onClick: onConfiguracoes },
  ]

  return (
    <header className="relative px-6 py-3.5 flex items-center justify-between shrink-0" style={{ background: C.card, borderBottom: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-white">{moduleLabel}</h2>
        {realtimeConnected && (
          <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: C.green }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} /> Ao vivo
          </span>
        )}
      </div>

      {/* Assinatura CKlareza centralizada */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none">
        <Sparkles className="w-4 h-4" style={{ color: C.gold }} />
        <span className="text-lg font-bold tracking-tight" style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          background: "linear-gradient(180deg, #f0d97d 0%, #d4af37 55%, #9c7d2e 100%)",
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        }}>
          CKlareza
        </span>
      </div>

      <div className="flex items-center gap-3">
        {tarefasVencidas > 0 && (
          <button onClick={onVencidas}
            title="Ver atividades atrasadas"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all"
            style={{ background: `${C.red}18`, border: `1px solid ${C.red}44` }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${C.red}28`}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${C.red}18`}>
            <AlertCircle className="w-3.5 h-3.5" style={{ color: C.red }} />
            <span className="text-xs font-bold" style={{ color: C.red }}>{tarefasVencidas} vencida{tarefasVencidas > 1 ? "s" : ""}</span>
          </button>
        )}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full transition-all"
            style={{ border: `1px solid ${C.border}` }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = C.green}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = C.border}>
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {mentorFotoUrl
                ? <img src={mentorFotoUrl} alt={mentorNome} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ background: C.input }}>{mentorNome.slice(0, 2).toUpperCase()}</div>}
            </div>
            <span className="text-sm font-semibold text-white hidden sm:block">{mentorNome}</span>
            <ChevronDown className="w-3.5 h-3.5" style={{ color: C.muted }} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl py-1.5 z-50" style={{ background: C.card2, border: `1px solid ${C.border}` }}>
              {itensMenu.map(item => (
                <button key={item.label} onClick={item.onClick}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-white transition-colors"
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.border}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                  <item.icon className="w-4 h-4" style={{ color: C.muted }} /> {item.label}
                </button>
              ))}
              <div className="my-1" style={{ borderTop: `1px solid ${C.border}` }} />
              <button onClick={onSair}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors"
                style={{ color: C.red }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${C.red}15`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
