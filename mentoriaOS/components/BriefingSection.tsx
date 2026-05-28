"use client"

import { useEffect, useState } from "react"
import { Brain, AlertCircle, CheckCircle, Lightbulb, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { containerVariants, itemVariants } from "@/components/Animations/transitions"
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
      <div className="glass border border-slate-600/30 rounded-2xl p-8 backdrop-blur-md">
        <div className="flex items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full"
          />
          <span className="text-slate-400">Carregando análise da IA...</span>
        </div>
      </div>
    )
  }

  if (!analise) {
    return (
      <div className="glass border border-slate-600/30 rounded-2xl p-8 backdrop-blur-md">
        <div className="flex items-center gap-3 text-slate-400">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <div>
            <p className="font-medium">Nenhuma análise disponível</p>
            <p className="text-sm text-slate-500">Envie um checkin primeiro para gerar a análise IA</p>
          </div>
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
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header Card */}
      <motion.div
        variants={itemVariants}
        className="glass border border-slate-600/30 rounded-2xl p-6 backdrop-blur-md"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center"
          >
            <Brain className="w-6 h-6 text-accent" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold gradient-text">Briefing da IA para a Call</h2>
            <p className="text-sm text-slate-400">
              Gerado em {formatarData(analise.data_analise)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Resumo */}
      {analise.resumo_historico && (
        <motion.section
          variants={itemVariants}
          className="group glass border border-slate-600/30 rounded-2xl p-6 backdrop-blur-md hover:border-slate-600/50 transition-all card-3d"
        >
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              animate={{ rotate: [0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0"
            >
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </motion.div>
            <h3 className="font-bold text-lg gradient-text">📊 Resumo do Momento Atual</h3>
          </div>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
            {analise.resumo_historico}
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0 group-hover:via-blue-500/50 transition-all duration-300" />
        </motion.section>
      )}

      {/* Gargalo */}
      {analise.gargalo_identificado && (
        <motion.section
          variants={itemVariants}
          className="group glass border border-red-600/30 rounded-2xl p-6 backdrop-blur-md hover:border-red-600/50 transition-all card-3d"
        >
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
            </motion.div>
            <h3 className="font-bold text-lg text-red-400">🎯 Diagnóstico do Maior Gargalo</h3>
          </div>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
            {analise.gargalo_identificado}
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-red-500/0 via-red-500/30 to-red-500/0 group-hover:via-red-500/50 transition-all duration-300" />
        </motion.section>
      )}

      {/* Sugestão Estratégica */}
      {analise.sugestao_estrategica && (
        <motion.section
          variants={itemVariants}
          className="group glass border border-purple-600/30 rounded-2xl p-6 backdrop-blur-md hover:border-purple-600/50 transition-all card-3d"
        >
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              animate={{ rotate: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0"
            >
              <Lightbulb className="w-5 h-5 text-purple-400" />
            </motion.div>
            <h3 className="font-bold text-lg text-purple-400">💡 Direcionamento Estratégico</h3>
          </div>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
            {analise.sugestao_estrategica}
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0 group-hover:via-purple-500/50 transition-all duration-300" />
        </motion.section>
      )}

      {/* Pauta Call */}
      {analise.pauta_call_pronta && (
        <motion.section
          variants={itemVariants}
          className="group glass border border-green-600/30 rounded-2xl p-6 backdrop-blur-md hover:border-green-600/50 transition-all card-3d"
        >
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0"
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
            </motion.div>
            <h3 className="font-bold text-lg text-green-400">✅ Pauta Pronta para a Call</h3>
          </div>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-mono text-xs bg-primary/50 p-4 rounded-lg border border-slate-700/50">
            {analise.pauta_call_pronta}
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-green-500/0 via-green-500/30 to-green-500/0 group-hover:via-green-500/50 transition-all duration-300" />
        </motion.section>
      )}

      {/* Footer Meta */}
      <motion.div
        variants={itemVariants}
        className="text-xs text-slate-500 text-right pt-4 flex justify-between items-center"
      >
        <span>Tokens: {analise.tokens_usados}</span>
        <span>Modelo: {analise.modelo_ia}</span>
      </motion.div>
    </motion.div>
  )
}
