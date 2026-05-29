"use client"

import { TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface Mentorado {
  id: string
  nome: string
  nicho: string
  status: string
  data_inicio: string
  foco_macro: string
}

interface CheckinData {
  leads_gerados: number
  vendas_reais: number
  investimento_trafego: number
  videos_postados: number
  dificuldades_texto: string
  tarefas_executadas: string[]
}

interface AnaliseData {
  gargalo_identificado: string
  sugestao_estrategica: string
  pauta_call_pronta: string
}

interface MainContentProps {
  mentorado: Mentorado
  checkin: CheckinData
  analise: AnaliseData
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  unit?: string
  trend?: number
  color: "emerald" | "rose" | "blue" | "purple"
}

function MetricCard({ icon, label, value, unit = "", trend, color }: MetricCardProps) {
  const colorClasses = {
    emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
    rose: "border-rose-500/30 bg-rose-500/5 text-rose-400",
    blue: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    purple: "border-purple-500/30 bg-purple-500/5 text-purple-400",
  }

  return (
    <div className={`border rounded-lg p-4 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-${color}-500/10 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-current/10 rounded-lg text-lg">{icon}</div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{typeof value === "number" ? value.toLocaleString("pt-BR") : value}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
    </div>
  )
}

export default function MainContent({ mentorado, checkin, analise }: MainContentProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const monthsSinceStart = Math.floor((new Date().getTime() - new Date(mentorado.data_inicio).getTime()) / (1000 * 60 * 60 * 24 * 30))

  return (
    <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{mentorado.nome}</h1>
              <p className="text-sm text-slate-400">{mentorado.nicho}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${mentorado.status === "Ativo" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-slate-600/30 bg-slate-600/10 text-slate-400"}`}>
                {mentorado.status}
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-semibold border border-blue-500/30 bg-blue-500/10 text-blue-400">
                {monthsSinceStart}m ativos
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-400 mb-1">Foco Macro</p>
              <p className="text-white font-semibold">{mentorado.foco_macro}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Data Início</p>
              <p className="text-white font-semibold">{formatDate(mentorado.data_inicio)}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Status Total</p>
              <p className="text-white font-semibold">Em andamento</p>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard icon={<Target className="w-5 h-5" />} label="Leads Gerados" value={checkin.leads_gerados} color="emerald" trend={15} />
          <MetricCard icon={<TrendingUp className="w-5 h-5" />} label="Vendas Reais" value={`R$ ${checkin.vendas_reais.toLocaleString("pt-BR")}`} color="purple" trend={-30} />
          <MetricCard icon={<AlertCircle className="w-5 h-5" />} label="Investimento" value={`R$ ${checkin.investimento_trafego.toLocaleString("pt-BR")}`} color="rose" />
          <MetricCard icon={<CheckCircle className="w-5 h-5" />} label="Vídeos Postados" value={checkin.videos_postados} color="blue" trend={8} />
        </div>

        {/* AI Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Gargalo */}
          <div className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/30 rounded-lg p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold text-rose-400">GARGALO IDENTIFICADO</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{analise.gargalo_identificado}</p>
          </div>

          {/* Sugestão */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-lg p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-emerald-400">SUGESTÃO ESTRATÉGICA</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{analise.sugestao_estrategica}</p>
          </div>

          {/* Pauta */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-lg p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-blue-400">PAUTA DA CALL</h3>
            </div>
            <div className="text-xs text-slate-300 space-y-2 whitespace-pre-wrap leading-relaxed">{analise.pauta_call_pronta}</div>
          </div>
        </div>

        {/* Lower Section - Dificuldades & Tarefas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Dificuldades */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Principais Dificuldades
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">{checkin.dificuldades_texto}</p>
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-xs text-slate-500">Última atualização: hoje às 14:32</p>
            </div>
          </div>

          {/* Tarefas */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-lg p-5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Tarefas Executadas
            </h3>
            <div className="space-y-2">
              {checkin.tarefas_executadas.map((tarefa, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 bg-slate-700/20 rounded hover:bg-slate-700/40 transition-colors">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/30 border border-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">{tarefa}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-xs text-slate-500">{checkin.tarefas_executadas.length} tarefas concluídas</p>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/30 rounded-lg p-4">
          <div className="grid grid-cols-4 gap-4 text-center text-xs">
            <div>
              <p className="text-slate-400 mb-1">Taxa de Conversão</p>
              <p className="text-lg font-bold text-blue-400">{((checkin.vendas_reais / checkin.leads_gerados) * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">ROI Médio</p>
              <p className="text-lg font-bold text-emerald-400">{((checkin.vendas_reais / checkin.investimento_trafego) * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Ticket Médio</p>
              <p className="text-lg font-bold text-purple-400">R$ {(checkin.vendas_reais / (checkin.leads_gerados * 0.1)).toFixed(0)}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Eficiência</p>
              <p className="text-lg font-bold text-rose-400">{((checkin.videos_postados / (checkin.leads_gerados / 50)) * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
