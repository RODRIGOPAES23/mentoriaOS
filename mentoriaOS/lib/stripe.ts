import Stripe from "stripe"

// Instância server-side (nunca exposta ao browser)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
})

// ─── Planos CKlareza ─────────────────────────────────────────────────────────
// Preço base: R$197/mentorado. Desconto por volume aplicado via lookup_key.
// Criamos um price por número de mentorados com lookup_key único.

export const PLANOS_CKLAREZA = [
  {
    id: "starter",
    nome: "Starter",
    mentorados: 10,
    preco_centavos: 98500,         // R$985 (10 × R$98,50)
    lookup_key: "ck_starter_10",
    descricao: "CKlareza Starter — até 10 mentorados",
  },
  {
    id: "starter_20",
    nome: "Starter",
    mentorados: 20,
    preco_centavos: 197000,        // R$1.970 (20 × R$98,50)
    lookup_key: "ck_starter_20",
    descricao: "CKlareza Starter — até 20 mentorados",
  },
  {
    id: "pro_30",
    nome: "Professional",
    mentorados: 30,
    preco_centavos: 236400,        // R$2.364 (30 × R$78,80)
    lookup_key: "ck_pro_30",
    descricao: "CKlareza Professional — até 30 mentorados",
  },
  {
    id: "pro_50",
    nome: "Professional",
    mentorados: 50,
    preco_centavos: 350000,        // R$3.500 (50 × R$70,00)
    lookup_key: "ck_pro_50",
    descricao: "CKlareza Professional — até 50 mentorados",
  },
  {
    id: "pro_100",
    nome: "Professional",
    mentorados: 100,
    preco_centavos: 591000,        // R$5.910 (100 × R$59,10)
    lookup_key: "ck_pro_100",
    descricao: "CKlareza Professional — até 100 mentorados",
  },
]

export type PlanoCK = typeof PLANOS_CKLAREZA[number]

// Encontra o plano mais próximo para N mentorados
export function planoParaN(n: number): PlanoCK {
  const sorted = [...PLANOS_CKLAREZA].sort((a, b) => a.mentorados - b.mentorados)
  return sorted.find(p => p.mentorados >= n) ?? sorted[sorted.length - 1]
}
