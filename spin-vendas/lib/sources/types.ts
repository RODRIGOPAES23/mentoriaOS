// Contrato de uma FONTE de leads. Qualquer fonte futura (Apollo, LinkedIn,
// diretórios, etc.) é só implementar isto e registrar no registry.
export type Prospect = {
  nome?: string | null
  empresa?: string | null
  telefone?: string | null
  email?: string | null
  instagram?: string | null
  site?: string | null
  regiao?: string | null
  nicho?: string | null
  dados?: Record<string, any> // payload bruto da fonte
}

export type FiltroBusca = {
  nicho?: string
  regiao?: string
  limite?: number
  // campo livre: cada adaptador interpreta o que faz sentido pra ele
  extra?: Record<string, any>
}

export type SourceAdapter = {
  id: string // 'google_places' | 'csv' | 'youtube' | ...
  label: string // nome amigável na UI
  descricao: string // o que essa fonte traz
  // a fonte está pronta pra uso? (tem chave/credencial). Se false, a UI mostra "configurar".
  configurado(): boolean
  // campos de filtro que essa fonte aceita (pra UI montar o form dinamicamente)
  filtros: { campo: string; label: string; tipo: "text" | "number" | "textarea" }[]
  // executa a busca e devolve prospects normalizados (NÃO grava — quem grava é o serviço)
  buscar(filtro: FiltroBusca): Promise<Prospect[]>
}
