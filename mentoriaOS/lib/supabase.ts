import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type CheckinRow = {
  id: string
  mentorado_id: string
  data_envio: string
  vendas_reais: number
  leads_gerados: number
  investimento_trafego: number
  videos_postados: number
  dificuldades_texto: string | null
  tarefas_executadas: string[]
}

export type Mentorado = {
  id: string
  nome: string
  nicho: string
  data_inicio: string
  status: "Ativo" | "Inativo" | "Pausado"
  link_instagram?: string
  foco_macro?: string
  historico_acumulado: any[]
  created_at: string
  updated_at: string
  mentor_id: string
}

export type Checkin = {
  id: string
  mentorado_id: string
  data_envio: string
  vendas_reais: number
  leads_gerados: number
  investimento_trafego: number
  videos_postados: number
  dificuldades_texto?: string
  tarefas_executadas: any[]
}

export type AnaliseIA = {
  id: string
  checkin_id: string
  mentorado_id: string
  data_analise: string
  resumo_historico?: string
  gargalo_identificado?: string
  evolucao_metricas?: string
  sugestao_estrategica?: string
  pauta_call_pronta?: string
  tokens_usados: number
  modelo_ia: string
}
