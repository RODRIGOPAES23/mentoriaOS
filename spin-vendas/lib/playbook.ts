// Loop de aprendizado (F8): aprende com vendas fechadas e propõe lições.
// Só lições APROVADAS entram no prompt do bot (humano no controle — Regra 5).
import { supabaseAdmin } from "./supabase"
import { conversasVencedoras } from "./store"
import { getCampanha } from "./campanhas"

const OPENROUTER_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY
const TABELA = "fv_playbook"

export type Licao = {
  id: string
  campanhaId: string
  titulo: string
  licao: string
  baseadoEm: number
  status: "pendente" | "aprovado" | "rejeitado"
  criadoEm: string
  decididoEm: string | null
}

function deRow(r: any): Licao {
  return {
    id: r.id,
    campanhaId: r.campanha_id,
    titulo: r.titulo,
    licao: r.licao,
    baseadoEm: r.baseado_em,
    status: r.status,
    criadoEm: r.criado_em,
    decididoEm: r.decidido_em,
  }
}

export async function listarLicoes(campanhaId?: string): Promise<Licao[]> {
  const sb = supabaseAdmin()
  if (!sb) return []
  let q = sb.from(TABELA).select("*").order("criado_em", { ascending: false })
  if (campanhaId) q = q.eq("campanha_id", campanhaId)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []).map(deRow)
}

// Lições aprovadas — injetadas no prompt do vendedor
export async function licoesAprovadas(campanhaId: string): Promise<string[]> {
  const sb = supabaseAdmin()
  if (!sb) return []
  const { data } = await sb
    .from(TABELA)
    .select("licao")
    .eq("campanha_id", campanhaId)
    .eq("status", "aprovado")
  return (data ?? []).map((r: any) => r.licao)
}

export async function decidirLicao(id: string, status: "aprovado" | "rejeitado") {
  const sb = supabaseAdmin()
  if (!sb) return null
  const { data, error } = await sb
    .from(TABELA)
    .update({ status, decidido_em: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return deRow(data)
}

// Analisa as conversas que PAGARAM e propõe lições novas (status pendente).
export async function aprenderComVendas(campanhaId: string): Promise<{ proposta: number; baseadoEm: number }> {
  const sb = supabaseAdmin()
  if (!sb || !OPENROUTER_API_KEY) return { proposta: 0, baseadoEm: 0 }

  const vencedoras = await conversasVencedoras(campanhaId)
  if (vencedoras.length === 0) return { proposta: 0, baseadoEm: 0 }

  const campanha = getCampanha(campanhaId)
  const transcricoes = vencedoras
    .slice(0, 20)
    .map((c, i) => {
      const conv = c.messages.map((m) => `${m.role === "user" ? "LEAD" : "VENDEDOR"}: ${m.content}`).join("\n")
      return `### VENDA ${i + 1} (fechou${c.valorPago ? ` R$${c.valorPago}` : ""})\n${conv}`
    })
    .join("\n\n")

  const prompt = `Você é um treinador de vendas. Abaixo estão ${vencedoras.length} conversa(s) que FECHARAM venda do produto "${campanha.produto.nome}" usando SPIN Selling.

Extraia de 1 a 3 LIÇÕES práticas e replicáveis do que funcionou (perguntas certas, ordem, como contornou objeção, gatilho que destravou o "sim"). Cada lição deve ser uma instrução curta e acionável para o vendedor repetir nas próximas conversas.

Responda APENAS JSON puro: {"licoes":[{"titulo":"<curto>","licao":"<instrução acionável em 1-2 frases>"}]}

CONVERSAS VENCEDORAS:
${transcricoes}`

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENROUTER_API_KEY}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 600,
    }),
  })
  if (!res.ok) return { proposta: 0, baseadoEm: vencedoras.length }

  const data = await res.json()
  let c: string = data.choices?.[0]?.message?.content?.trim() ?? "{}"
  c = c.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()

  let parsed: { licoes?: { titulo: string; licao: string }[] }
  try {
    parsed = JSON.parse(c)
  } catch {
    return { proposta: 0, baseadoEm: vencedoras.length }
  }
  const licoes = parsed.licoes ?? []
  if (licoes.length === 0) return { proposta: 0, baseadoEm: vencedoras.length }

  const rows = licoes.map((l) => ({
    campanha_id: campanhaId,
    titulo: l.titulo,
    licao: l.licao,
    baseado_em: vencedoras.length,
    status: "pendente",
  }))
  await sb.from(TABELA).insert(rows)

  return { proposta: rows.length, baseadoEm: vencedoras.length }
}
