// Vendas reais (o "1" da Lei da Fábrica lastreado em Stripe).
// Lê empresas + pagamentos_stripe do MESMO Supabase do CKlareza.
// Se não houver credencial, devolve zeros (modo local/JSON) — nunca quebra.
import { supabaseAdmin } from "./supabase"

export type Vendas = {
  trials: number // empresas em trial
  ativos: number // empresas com assinatura ativa
  pagosReais: number // nº de pagamentos status=paid no Stripe
  receitaReais: number // R$ (soma de amount_paid em reais)
  porStatus: Record<string, number> // distribuição de status das empresas
  emailsPagos: Set<string> // email_owner (lowercase) das empresas ativas/trial — p/ casar com leads
}

export function vendasVazias(): Vendas {
  return { trials: 0, ativos: 0, pagosReais: 0, receitaReais: 0, porStatus: {}, emailsPagos: new Set() }
}

export async function calcularVendas(): Promise<Vendas> {
  const sb = supabaseAdmin()
  if (!sb) return vendasVazias()

  const [empresasRes, pagosRes] = await Promise.all([
    sb.from("empresas").select("email_owner, status, stripe_customer_id"),
    sb.from("pagamentos_stripe").select("amount_paid, status"),
  ])

  const empresas = empresasRes.data || []
  const pagamentos = pagosRes.data || []

  const porStatus: Record<string, number> = {}
  const emailsPagos = new Set<string>()
  let trials = 0
  let ativos = 0

  for (const e of empresas) {
    const status = (e.status as string) || "desconhecido"
    porStatus[status] = (porStatus[status] || 0) + 1
    if (status === "trial" || status === "trialing") trials++
    if (status === "active") ativos++
    // qualquer empresa "viva" (trial ou ativa) conta como conversão do lead
    if (e.email_owner && (status === "trial" || status === "trialing" || status === "active")) {
      emailsPagos.add(String(e.email_owner).toLowerCase().trim())
    }
  }

  const pagosPaid = pagamentos.filter((p) => p.status === "paid")
  const receitaCentavos = pagosPaid.reduce((s, p) => s + (Number(p.amount_paid) || 0), 0)

  return {
    trials,
    ativos,
    pagosReais: pagosPaid.length,
    receitaReais: Math.round(receitaCentavos / 100),
    porStatus,
    emailsPagos,
  }
}
