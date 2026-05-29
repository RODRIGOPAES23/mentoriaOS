"use client"

interface Mentorado {
  id: string
  nome: string
  nicho: string
  status: string
  data_inicio: string
  foco_macro: string
}

interface SidebarProps {
  mentorados: Mentorado[]
  selectedMentorado: Mentorado | null
  onSelectMentorado: (mentorado: Mentorado) => void
}

export default function Sidebar({ mentorados, selectedMentorado, onSelectMentorado }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900/30 backdrop-blur-sm border-r border-slate-700/30 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-700/20">
        <h2 className="text-sm font-semibold text-slate-300">Mentorados</h2>
        <p className="text-xs text-slate-500 mt-1">{mentorados.length} ativos</p>
      </div>

      {/* Mentorados List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          {mentorados.map((mentorado) => (
            <button
              key={mentorado.id}
              onClick={() => onSelectMentorado(mentorado)}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                selectedMentorado?.id === mentorado.id
                  ? "bg-slate-800/60 border-blue-500/40 shadow-lg shadow-blue-500/10"
                  : "bg-slate-800/20 border-slate-700/30 hover:bg-slate-800/40 hover:border-slate-600/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{mentorado.nome}</h3>
                  <p className="text-xs text-slate-400 truncate mt-1">{mentorado.nicho}</p>
                </div>
                {mentorado.status === "Ativo" && (
                  <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
              {selectedMentorado?.id === mentorado.id && (
                <div className="mt-2 text-xs text-blue-400 font-medium">
                  {mentorado.foco_macro.substring(0, 30)}...
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-3 border-t border-slate-700/20 bg-slate-900/20 text-xs text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>Últimas 24h:</span>
          <span className="text-emerald-400 font-semibold">↑ 12%</span>
        </div>
        <div className="flex justify-between">
          <span>Conversão Média:</span>
          <span className="text-blue-400 font-semibold">8.2%</span>
        </div>
      </div>
    </aside>
  )
}
