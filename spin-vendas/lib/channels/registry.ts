// Registro central de CANAIS. Adicionar canal futuro = 1 linha aqui.
import type { ChannelAdapter } from "./types"
import { mock, email, whatsapp, instagram } from "./adapters"

export const CHANNELS: ChannelAdapter[] = [mock, email, whatsapp, instagram]

export function getChannel(id: string): ChannelAdapter | undefined {
  return CHANNELS.find((c) => c.id === id)
}

export function listarChannels() {
  return CHANNELS.map((c) => ({
    id: c.id,
    label: c.label,
    descricao: c.descricao,
    campoDestino: c.campoDestino,
    configurado: c.configurado(),
    aviso: c.aviso || null,
  }))
}
