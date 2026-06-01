// Tipos compartilhados do dashboard CKlareza
export interface Mentorado {
  id: string
  nome: string
  nicho: string
  status: string
  foco_macro: string
  data_inicio: string
  data_fim?: string
  cidade?: string
  faturamento_atual?: number
  meta_faturamento?: number
  meta_atual?: string
  foto_url?: string
  ordem?: number
  codigo_acesso?: string
  instagram_handle?: string
  expectativa_30_dias?: string
  expectativa_90_dias?: string
  data_ultima_call?: string | null
  data_proxima_call?: string | null
}

export interface BriefingIA {
  diagnostico: string
  evolucao?: string
  pauta: string[]
}
