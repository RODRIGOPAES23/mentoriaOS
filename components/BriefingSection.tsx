"use client"

import { useEffect, useState } from "react"
import { Brain, AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { AnaliseIA } from "@/lib/supabase"

interface BriefingSectionProps {
  menteeId: string
}

export function BriefingSection({ menteeId }: BriefingSectionProps) {
  const [analise, setAnalise] = useState<AnaliseIA | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestAnalise()
  }, [menteeId])

  async function fetchLatestAnalise() {
    setLoading(true)
    const { data, error } = await supabase
      .from("analises_ia")
      .select("*")
      .eq("mentorado_id", menteeId)
      .order("data_analise", { ascending: false })
      .limit(1)
      .single()

    if (!error && data) {
      setAnalise(data as AnaliseIA)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="bg-secondary border border-slate-700 rounded-lg p-8">
        <div className="flex items-center gap-2 text-slate-400">
          <Brain className="w-5 h-5 animate-pulse" />
          Carregando análise da IA...
        </div>
      </div>
    )
  }

  if (!analise) {
    return (
      <div className="bg-secondary border border-slate-700 rounded-lg p-8">
        <div className="flex items-center gap-2 text-slate-400">
          <AlertCircle className="w-5 h-5" />
          Nenhuma análise disponível. Envie um checkin primeiro.
        </div>
      </div>
    )
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
        <Brain className="w-6 h-6 text-accent" />
        <div>
          <h2 className="text-xl font-bold">Briefing da IA para a Call</h2>
          <p className="text-sm text-slate-400">
            Gerado em {formatarData(analise.data_analise)}
          </p>
        </div>
      </div>

      {/* Resumo */}
      {analise.resumo_historico && (
        <section className="bg-primary border border-slate-700 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-accent">
            📊 Resumo do Momento Atual
          </h3>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {analise.resumo_historico}
          </div>
        </section>
      )}

      {/* Gargalo */}
      {analise.gargalo_identificado && (
        <section className="bg-red-950 bg-opacity-30 border border-red-800 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Diagnóstico do Maior Gargalo
          </h3>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {analise.gargalo_identificado}
          </div>
        </section>
      )}

      {/* Sugestão Estratégica */}
      {analise.sugestao_estrategica && (
        <section className="bg-blue-950 bg-opacity-30 border border-blue-800 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-blue-400">
            💡 Sugestão de Direcionamento Estratégico
          </h3>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
            {analise.sugestao_estrategica}
          </div>
        </section>
      )}

      {/* Pauta Call */}
      {analise.pauta_call_pronta && (
        <section className="bg-green-950 bg-opacity-30 border border-green-800 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-green-400 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Pauta Pronta para a Call
          </h3>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-mono text-sm">
            {analise.pauta_call_pronta}
          </div>
        </section>
      )}

      {/* Footer Meta */}
      <div className="text-xs text-slate-500 text-right pt-4">
        Tokens usados: {analise.tokens_usados} | Modelo: {analise.modelo_ia}
      </div>
    </div>
  )
}
