// Armazenamento simples em arquivo JSON (MVP local).
// Trocar por Supabase quando o bot for ao ar nos canais.
import { promises as fs } from "fs"
import path from "path"
import type { SpinMessage } from "./spin-prompt"
import { extrairLead, type Lead } from "./extract"
import { scoreLead } from "./score"
import { getCampanha } from "./campanhas"
import { supabaseAdmin } from "./supabase"

const DATA_DIR = path.join(process.cwd(), "data")
const FILE = path.join(DATA_DIR, "conversations.json")
const TABELA = "fv_conversas"

export const ESTAGIOS = [
  "novo",
  "contatado",
  "qualificado",
  "quente",
  "demo",
  "fechado",
  "perdido",
] as const
export type Estagio = (typeof ESTAGIOS)[number]

export type Conversa = {
  id: string
  campanhaId: string
  canal: "web" | "whatsapp" | "instagram"
  criadaEm: string
  atualizadaEm: string
  sinalCompra: boolean // lead demonstrou intenção de compra
  estagio: Estagio // posição no pipeline (kanban)
  estagioManual: boolean // true = movido à mão; o bot não sobrescreve mais
  motivoPerda: string | null
  fonte: string // 'bot' | 'inbound' | 'google_places' | 'csv' | 'manual'
  notas: string | null // contexto extra (ex: resultado da calculadora)
  scoreIcp: number // 0..100 — fit com o Perfil de Cliente Ideal (F4)
  scoreJustificativa: string | null
  valorPago: number | null // R$ (F5)
  pagoEm: string | null
  lead: Lead | null // dados estruturados extraídos (preenchido quando há sinal de compra)
  messages: SpinMessage[]
}

// Estágio automático derivado dos sinais da conversa (só quando não foi movido à mão)
function estagioAuto(messages: SpinMessage[], sinalCompra: boolean): Estagio {
  if (sinalCompra) return "quente"
  const respostasUsuario = messages.filter((m) => m.role === "user").length
  if (respostasUsuario >= 2) return "qualificado"
  if (respostasUsuario >= 1) return "contatado"
  return "novo"
}

// ---- mapeamento Conversa <-> linha do Supabase ----
function paraRow(c: Conversa) {
  return {
    id: c.id,
    campanha_id: c.campanhaId,
    canal: c.canal,
    fonte: c.fonte,
    estagio: c.estagio,
    estagio_manual: c.estagioManual,
    motivo_perda: c.motivoPerda,
    sinal_compra: c.sinalCompra,
    score_icp: c.scoreIcp,
    score_justificativa: c.scoreJustificativa,
    valor_pago: c.valorPago,
    pago_em: c.pagoEm,
    notas: c.notas,
    lead: c.lead,
    messages: c.messages,
    criada_em: c.criadaEm,
    atualizada_em: c.atualizadaEm,
  }
}
function deRow(r: any): Conversa {
  return {
    id: r.id,
    campanhaId: r.campanha_id,
    canal: r.canal,
    fonte: r.fonte,
    estagio: r.estagio,
    estagioManual: r.estagio_manual,
    motivoPerda: r.motivo_perda,
    sinalCompra: r.sinal_compra,
    scoreIcp: r.score_icp ?? 0,
    scoreJustificativa: r.score_justificativa,
    valorPago: r.valor_pago != null ? Number(r.valor_pago) : null,
    pagoEm: r.pago_em,
    notas: r.notas,
    lead: r.lead,
    messages: r.messages ?? [],
    criadaEm: r.criada_em,
    atualizadaEm: r.atualizada_em,
  }
}

async function lerTodas(): Promise<Conversa[]> {
  const sb = supabaseAdmin()
  if (sb) {
    const { data, error } = await sb.from(TABELA).select("*").order("atualizada_em", { ascending: false })
    if (error) throw new Error(`Supabase select: ${error.message}`)
    return (data ?? []).map(deRow)
  }
  // fallback JSON local
  try {
    const raw = await fs.readFile(FILE, "utf-8")
    return JSON.parse(raw) as Conversa[]
  } catch {
    return []
  }
}

async function salvarTodas(convs: Conversa[]) {
  const sb = supabaseAdmin()
  if (sb) {
    const { error } = await sb.from(TABELA).upsert(convs.map(paraRow), { onConflict: "id" })
    if (error) throw new Error(`Supabase upsert: ${error.message}`)
    return
  }
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(convs, null, 2), "utf-8")
}

const REGEX_COMPRA =
  /\b(quero comprar|como assino|como assinar|quanto custa|qual o pre[çc]o|contratar|fechado|fechar neg|bora fechar|vou querer|me passa o link|como fa[çc]o pra (comprar|contratar|assinar))\b/i

export function detectarSinalCompra(messages: SpinMessage[]): boolean {
  return messages.some((m) => m.role === "user" && REGEX_COMPRA.test(m.content))
}

export async function salvarConversa(
  id: string,
  messages: SpinMessage[],
  canal: Conversa["canal"] = "web",
  campanhaId = "cklareza"
): Promise<void> {
  const convs = await lerTodas()
  const agora = new Date().toISOString()
  const sinalCompra = detectarSinalCompra(messages)
  const i = convs.findIndex((c) => c.id === id)
  const leadAnterior = i >= 0 ? convs[i].lead : null
  // só extrai (custa 1 chamada LLM) quando há sinal de compra
  const lead = sinalCompra ? await extrairLead(messages) : leadAnterior
  if (i >= 0) {
    // respeita movimentação manual; senão atualiza o estágio automático
    const estagio = convs[i].estagioManual ? convs[i].estagio : estagioAuto(messages, sinalCompra)
    // recalcula score ICP quando vira lead quente (e ainda não tinha score)
    let { scoreIcp, scoreJustificativa } = convs[i]
    if (sinalCompra && (!scoreIcp || scoreIcp === 0)) {
      const s = await scoreLead(getCampanha(convs[i].campanhaId), { lead, notas: convs[i].notas, messages })
      scoreIcp = s.score
      scoreJustificativa = s.justificativa
    }
    convs[i] = { ...convs[i], messages, atualizadaEm: agora, sinalCompra, lead, estagio, scoreIcp, scoreJustificativa }
  } else {
    convs.push({
      id,
      campanhaId,
      canal,
      criadaEm: agora,
      atualizadaEm: agora,
      sinalCompra,
      estagio: estagioAuto(messages, sinalCompra),
      estagioManual: false,
      motivoPerda: null,
      fonte: "bot",
      notas: null,
      scoreIcp: 0,
      scoreJustificativa: null,
      valorPago: null,
      pagoEm: null,
      lead,
      messages,
    })
  }
  await salvarTodas(convs)
}

// Cria um lead vindo de captação inbound (isca/landing) — sem conversa ainda.
export async function criarLeadInbound(params: {
  campanhaId?: string
  lead: Lead
  notas?: string
  fonte?: string
}): Promise<Conversa> {
  const convs = await lerTodas()
  const agora = new Date().toISOString()
  const campanhaId = params.campanhaId ?? "cklareza"
  // pontua o lead na entrada (F4) — prioriza quem chega
  const s = await scoreLead(getCampanha(campanhaId), {
    lead: params.lead,
    notas: params.notas,
  })
  const conv: Conversa = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()),
    campanhaId,
    canal: "web",
    criadaEm: agora,
    atualizadaEm: agora,
    sinalCompra: false,
    estagio: "novo",
    estagioManual: false,
    motivoPerda: null,
    fonte: params.fonte ?? "inbound",
    notas: params.notas ?? null,
    scoreIcp: s.score,
    scoreJustificativa: s.justificativa,
    valorPago: null,
    pagoEm: null,
    lead: params.lead,
    messages: [],
  }
  convs.push(conv)
  await salvarTodas(convs)
  return conv
}

// F5 — marca um lead como pago/fechado (chamado pelo webhook Stripe ou manualmente)
export async function marcarPago(
  match: { id?: string; email?: string },
  valor?: number
): Promise<Conversa | null> {
  const convs = await lerTodas()
  const i = convs.findIndex(
    (c) =>
      (match.id && c.id === match.id) ||
      (match.email && c.lead?.email?.toLowerCase() === match.email.toLowerCase())
  )
  if (i < 0) return null
  const agora = new Date().toISOString()
  convs[i] = {
    ...convs[i],
    estagio: "fechado",
    estagioManual: true,
    valorPago: typeof valor === "number" ? valor : convs[i].valorPago,
    pagoEm: agora,
    atualizadaEm: agora,
  }
  await salvarTodas(convs)
  return convs[i]
}

export async function atualizarEstagio(
  id: string,
  estagio: Estagio,
  motivoPerda: string | null = null
): Promise<Conversa | null> {
  const convs = await lerTodas()
  const i = convs.findIndex((c) => c.id === id)
  if (i < 0) return null
  convs[i] = {
    ...convs[i],
    estagio,
    estagioManual: true, // a partir daqui o bot não sobrescreve
    motivoPerda: estagio === "perdido" ? motivoPerda : null,
    atualizadaEm: new Date().toISOString(),
  }
  await salvarTodas(convs)
  return convs[i]
}

export async function getConversa(id: string): Promise<Conversa | null> {
  const convs = await lerTodas()
  return convs.find((c) => c.id === id) ?? null
}

// Conversas que efetivamente PAGARAM (o "1") — base do aprendizado (F8)
export async function conversasVencedoras(campanhaId?: string): Promise<Conversa[]> {
  const convs = await lerTodas()
  return convs.filter(
    (c) => c.pagoEm && c.messages.length > 0 && (!campanhaId || c.campanhaId === campanhaId)
  )
}

export async function listarConversas(): Promise<Conversa[]> {
  const convs = await lerTodas()
  return convs.sort((a, b) => b.atualizadaEm.localeCompare(a.atualizadaEm))
}
