// Loop 0→1 completo: funil de leads (fv_conversas) + vendas reais (Stripe).
// Casa o email do lead com empresas.email_owner para fechar lead → trial → pago.
import { calcularFunil, type Funil } from "./analytics"
import { calcularVendas, type Vendas } from "./vendas"
import { listarConversas } from "./store"

export type Loop = {
  funil: Funil
  vendas: Vendas
  // cruzamento lead ↔ venda (por email)
  leadsComEmail: number
  leadsViraramCliente: number // leads cujo email aparece em empresas (trial/ativo)
  taxaLeadParaCliente: number // % leadsViraramCliente / leadsComEmail
  // etapas do funil unificado (visitas → pago), para as barras do dashboard
  etapas: { nome: string; valor: number }[]
}

export async function calcularLoop(): Promise<Loop> {
  const [funil, vendas, convs] = await Promise.all([
    calcularFunil(),
    calcularVendas(),
    listarConversas(),
  ])

  // leads que têm email extraído
  const emailsLead = convs
    .map((c) => c.lead?.email?.toLowerCase().trim())
    .filter((e): e is string => !!e)
  const leadsComEmail = new Set(emailsLead).size

  // quantos viraram cliente (email do lead consta em empresas trial/ativo)
  let leadsViraramCliente = 0
  for (const email of new Set(emailsLead)) {
    if (vendas.emailsPagos.has(email)) leadsViraramCliente++
  }

  const ac = (estagio: string) =>
    funil.funilAcumulado.find((f) => f.estagio === estagio)?.alcancaram || 0

  const etapas = [
    { nome: "Leads", valor: funil.total },
    { nome: "Qualificados", valor: ac("qualificado") },
    { nome: "Quentes", valor: ac("quente") },
    { nome: "Trials", valor: vendas.trials },
    { nome: "Pagantes", valor: vendas.ativos },
  ]

  return {
    funil,
    vendas,
    leadsComEmail,
    leadsViraramCliente,
    taxaLeadParaCliente: leadsComEmail
      ? +((leadsViraramCliente / leadsComEmail) * 100).toFixed(1)
      : 0,
    etapas,
  }
}
