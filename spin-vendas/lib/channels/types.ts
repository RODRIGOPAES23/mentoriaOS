// Contrato de um CANAL de disparo. Qualquer canal futuro (SMS, Telegram, etc.)
// é só implementar isto e registrar.
export type DestinoProspect = {
  nome?: string | null
  telefone?: string | null
  email?: string | null
  instagram?: string | null
}

export type EnvioResult = {
  status: "enviado" | "dry-run" | "sem-chave" | "erro"
  erro?: string
}

export type ChannelAdapter = {
  id: string // 'email' | 'whatsapp' | 'instagram' | 'mock'
  label: string
  descricao: string
  // campo do prospect que esse canal exige (pra filtrar quem dá pra enviar)
  campoDestino: "telefone" | "email" | "instagram" | "qualquer"
  configurado(): boolean
  // observação sobre regras/limites do canal (mostrada na UI)
  aviso?: string
  enviar(destino: DestinoProspect, mensagem: string): Promise<EnvioResult>
}
