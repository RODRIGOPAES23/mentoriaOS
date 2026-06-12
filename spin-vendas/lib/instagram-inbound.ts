// Instagram INBOUND: gatilho de palavra-chave em comentários dos NOSSOS posts
// (→ DM automática + lead) e captura de menções. Funções puras, testáveis
// sem credencial — o envio real é no-op se faltar INSTAGRAM_TOKEN (meta.ts).
import { criarLeadInbound } from "./store"
import { enviarInstagram, responderComentarioIG } from "./meta"

// Palavras-chave que disparam a DM. Configurável por env (CSV) ou default.
const KEYWORDS = (process.env.INSTAGRAM_KEYWORDS || "site,link,quero,info,começar,comecar,preço,preco,demo")
  .split(",")
  .map((k) => k.trim().toLowerCase())
  .filter(Boolean)

const DM_PADRAO =
  process.env.INSTAGRAM_DM_LINK ||
  "Oi! Que bom seu interesse 🙌 Aqui é o link pra você começar: https://cklareza.com — qualquer dúvida é só me chamar por aqui."

export function casaPalavraChave(texto: string): boolean {
  const t = (texto || "").toLowerCase()
  return KEYWORDS.some((k) => t.includes(k))
}

// Normaliza o payload de COMENTÁRIO (entry[].changes[] field='comments')
export type ComentarioIG = {
  commentId: string
  text: string
  username: string | null
  fromId: string | null
}

export function parseComentarios(body: any): ComentarioIG[] {
  const out: ComentarioIG[] = []
  for (const e of body?.entry ?? []) {
    for (const ch of e?.changes ?? []) {
      if (ch.field !== "comments") continue
      const v = ch.value || {}
      out.push({
        commentId: v.id,
        text: v.text ?? "",
        username: v.from?.username ?? null,
        fromId: v.from?.id ?? null,
      })
    }
  }
  return out
}

// Normaliza o payload de MENÇÃO (entry[].changes[] field='mentions')
export type MencaoIG = { mediaId: string | null; commentId: string | null }

export function parseMencoes(body: any): MencaoIG[] {
  const out: MencaoIG[] = []
  for (const e of body?.entry ?? []) {
    for (const ch of e?.changes ?? []) {
      if (ch.field !== "mentions") continue
      const v = ch.value || {}
      out.push({ mediaId: v.media_id ?? null, commentId: v.comment_id ?? null })
    }
  }
  return out
}

// Processa um comentário: se casar a palavra-chave, manda DM privada + cria lead.
// Retorna o que foi feito (útil pro teste mock).
export async function processarComentario(c: ComentarioIG): Promise<{
  disparou: boolean
  leadId?: string
}> {
  if (!c.text || !casaPalavraChave(c.text)) return { disparou: false }

  // resposta privada ao comentário (vira DM) + fallback DM direto se tiver fromId
  if (c.commentId) await responderComentarioIG(c.commentId, DM_PADRAO)
  else if (c.fromId) await enviarInstagram(c.fromId, DM_PADRAO)

  // cria lead no mesmo funil (fonte instagram-dm)
  const conv = await criarLeadInbound({
    campanhaId: process.env.INSTAGRAM_CAMPANHA || "cklareza",
    lead: {
      nome: c.username || "Instagram",
      whatsapp: null,
      email: null,
      mentorados: null,
    },
    notas: `IG comment ${c.commentId} de @${c.username || "?"} (fromId ${c.fromId || "?"}): "${c.text}"`,
    fonte: "instagram-dm",
  })
  return { disparou: true, leadId: conv.id }
}

// Processa uma menção: cria lead leve para acompanhamento humano.
export async function processarMencao(m: MencaoIG): Promise<{ leadId: string }> {
  const conv = await criarLeadInbound({
    campanhaId: process.env.INSTAGRAM_CAMPANHA || "cklareza",
    lead: { nome: "Menção Instagram", whatsapp: null, email: null, mentorados: null },
    notas: `IG menção · media ${m.mediaId || "?"} · comment ${m.commentId || "?"}`,
    fonte: "instagram-mention",
  })
  return { leadId: conv.id }
}
