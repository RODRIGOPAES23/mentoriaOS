// =============================================================
// PONTE SPIN VENDAS  ->  MoneyPrinterTurbo (MPT)
// Transforma uma campanha (produto + ICP + dores/ganhos) num
// vídeo curto de venda (isca de topo de funil) gerado pelo MPT.
//
// Fluxo:
//   briefDaCampanha()  -> monta subject + roteiro-guia + system prompt
//   criarVideo()       -> POST /api/v1/videos no MPT (assíncrono)
//   statusVideo()      -> GET  /api/v1/tasks/{id} (polling de progresso)
//
// O MPT roda em Python na porta 8080 (ver pasta ../moneyprinter).
// O cérebro do roteiro é o próprio MPT, já configurado p/ OpenRouter.
// =============================================================

import { getCampanha, type Campanha } from "@/lib/campanhas"

const MPT_API_URL = process.env.MPT_API_URL || "http://localhost:8080"

// -------------------------------------------------------------
// 1. Brief: campanha -> instruções de vídeo p/ o MPT
// -------------------------------------------------------------
export type VideoBrief = {
  video_subject: string
  video_script_prompt: string
  custom_system_prompt: string
}

export function briefDaCampanha(campanha: Campanha): VideoBrief {
  const p = campanha.produto

  const video_subject =
    `${p.nome}: ${p.oneLiner} — anúncio curto para ${p.paraQuem}`

  // Guia de conteúdo do roteiro (o MPT usa isto pra escrever a narração).
  const video_script_prompt = [
    `Escreva o roteiro de um anúncio vertical de 30 a 40 segundos para ${p.nome}.`,
    `Público-alvo: ${p.paraQuem}.`,
    `Comece com um GANCHO que bata numa dor real: ${p.dores.slice(0, 3).join("; ")}.`,
    `Mostre a virada com os ganhos: ${p.ganhos.slice(0, 3).join("; ")}.`,
    `Use a prova social/credibilidade: ${p.prova}.`,
    `Feche com a chamada para ação: ${p.proximoPasso} (${p.precoLabel}).`,
  ].join(" ")

  // Regras de estilo (tom de venda direto, sem enrolação).
  const custom_system_prompt = [
    "Você é um copywriter de performance especialista em anúncios curtos (Reels/TikTok/Shorts).",
    "Escreva em português do Brasil, falado, na 2ª pessoa, frases curtas e ritmo de narração.",
    "Nada de hashtags, emojis, marcações de cena ou nome do locutor — só o texto que será narrado.",
    "Estrutura: gancho (dor) -> agitação -> solução -> prova -> CTA. Sem clichês vazios.",
  ].join(" ")

  return { video_subject, video_script_prompt, custom_system_prompt }
}

// -------------------------------------------------------------
// 2. Cliente do MPT
// -------------------------------------------------------------
export type MptTaskRef = { task_id: string }

export async function criarVideo(campanhaId?: string): Promise<MptTaskRef> {
  const campanha = getCampanha(campanhaId)
  const brief = briefDaCampanha(campanha)

  const body = {
    ...brief,
    video_aspect: "9:16",        // vertical p/ Reels/Shorts/TikTok
    video_language: "pt",
    voice_name: "pt-BR-AntonioNeural-Male", // edge-tts, grátis
    paragraph_number: 3,
    video_clip_duration: 4,
    video_count: 1,
    subtitle_enabled: true,
    bgm_type: "random",
  }

  const res = await fetch(`${MPT_API_URL}/api/v1/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => "")
    throw new Error(`MPT recusou a criação (${res.status}): ${txt}`)
  }

  const json = await res.json()
  const task_id = json?.data?.task_id
  if (!task_id) throw new Error("MPT não retornou task_id")
  return { task_id }
}

// Convenção de estado do MPT (app/models/const.py):
//   -1 = falhou | 1 = concluído | 4 = processando
export const MPT_STATE = { FAILED: -1, COMPLETE: 1, PROCESSING: 4 } as const

export type MptStatus = {
  state: number
  progress?: number
  videos?: string[]          // URLs prontas p/ assistir/baixar
  combined_videos?: string[]
}

export async function statusVideo(taskId: string): Promise<MptStatus> {
  const res = await fetch(`${MPT_API_URL}/api/v1/tasks/${taskId}`, {
    method: "GET",
    cache: "no-store",
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => "")
    throw new Error(`MPT status falhou (${res.status}): ${txt}`)
  }
  const json = await res.json()
  return (json?.data ?? {}) as MptStatus
}
