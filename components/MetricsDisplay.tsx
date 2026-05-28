"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Users, DollarSign, Video } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Checkin } from "@/lib/supabase"

interface MetricsDisplayProps {
  menteeId: string
}

interface MetricCard {
  label: string
  value: string | number
  change: string
  icon: React.ReactNode
  color: string
}

export function MetricsDisplay({ menteeId }: MetricsDisplayProps) {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCheckins()
  }, [menteeId])

  async function fetchCheckins() {
    setLoading(true)
    const { data, error } = await supabase
      .from("checkins")
      .select("*")
      .eq("mentorado_id", menteeId)
      .order("data_envio", { ascending: false })
      .limit(4)

    if (!error && data) {
      setCheckins(data as Checkin[])
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="text-slate-400">Carregando métricas...</div>
  }

  if (checkins.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        Nenhum checkin disponível ainda
      </div>
    )
  }

  const current = checkins[0]
  const previous = checkins[1]

  const vendChange =
    previous && current.vendas_reais - previous.vendas_reais
  const leadsChange =
    previous && current.leads_gerados - previous.leads_gerados
  const investChange =
    previous && current.investimento_trafego - previous.investimento_trafego
  const videoChange =
    previous && current.videos_postados - previous.videos_postados

  const metrics: MetricCard[] = [
    {
      label: "Vendas (últimas 7 dias)",
      value: `R$ ${current.vendas_reais.toFixed(2)}`,
      change: vendChange ? `${vendChange > 0 ? "+" : ""}${vendChange.toFixed(2)}` : "—",
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-green-400",
    },
    {
      label: "Leads Gerados",
      value: current.leads_gerados,
      change: leadsChange ? `${leadsChange > 0 ? "+" : ""}${leadsChange}` : "—",
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-400",
    },
    {
      label: "Investimento em Tráfego",
      value: `R$ ${current.investimento_trafego.toFixed(2)}`,
      change: investChange ? `${investChange > 0 ? "+" : ""}R$ ${investChange.toFixed(2)}` : "—",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-orange-400",
    },
    {
      label: "Vídeos Postados",
      value: current.videos_postados,
      change: videoChange ? `${videoChange > 0 ? "+" : ""}${videoChange}` : "—",
      icon: <Video className="w-5 h-5" />,
      color: "text-purple-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className="bg-secondary border border-slate-700 rounded-lg p-6 hover:border-accent transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`${metric.color}`}>{metric.icon}</div>
            <span className="text-sm text-slate-400">{metric.change}</span>
          </div>
          <div className="text-sm text-slate-400 mb-2">{metric.label}</div>
          <div className="text-2xl font-bold">{metric.value}</div>
        </div>
      ))}
    </div>
  )
}
