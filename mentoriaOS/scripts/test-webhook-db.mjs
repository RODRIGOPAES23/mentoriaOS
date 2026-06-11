// Valida o caminho de escrita do webhook Stripe → Supabase (mesmas operações da rota)
// Uso: node scripts/test-webhook-db.mjs  (roda de mentoriaOS/)
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const EMAIL = "validacao-webhook@cklareza-teste.interno"
let falhas = 0
const check = (passo, error) => {
  console.log(`${passo}:`, error ? `FALHOU — ${error.message}` : "OK")
  if (error) falhas++
}

const dadosStripe = {
  stripe_customer_id: "cus_validacao_interna",
  stripe_subscription_id: "sub_validacao_interna",
  plano: "starter",
  mentorados_contratados: 10,
  status: "trial",
  trial_start: new Date().toISOString(),
}

// 1a. checkout.session.completed — cliente NOVO (insert com nome/slug derivados)
const base = EMAIL.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
const { data: slugTomado } = await supabase.from("empresas").select("id").eq("slug", base).maybeSingle()
const slug = slugTomado ? `${base}-${Math.random().toString(36).slice(2, 6)}` : base
const ins = await supabase.from("empresas").insert({ email_owner: EMAIL, nome: base, slug, ...dadosStripe })
check("1a. insert empresa nova (checkout.session.completed)", ins.error)

// 1b. checkout.session.completed — cliente EXISTENTE (update só campos Stripe)
const { data: existente } = await supabase.from("empresas").select("id").eq("email_owner", EMAIL).maybeSingle()
const upd1 = existente
  ? await supabase.from("empresas").update(dadosStripe).eq("id", existente.id)
  : { error: { message: "registro não encontrado após insert" } }
check("1b. update empresa existente (recompra)", upd1.error)

// 2. customer.subscription.updated → update com updated_at
const upd2 = await supabase.from("empresas")
  .update({ status: "active", plano_ativo: true, updated_at: new Date().toISOString() })
  .eq("stripe_customer_id", "cus_validacao_interna")
check("2. update status (customer.subscription.updated)", upd2.error)

// 3. invoice.payment_succeeded → insert pagamento
const pag = await supabase.from("pagamentos_stripe").insert({
  stripe_customer_id: "cus_validacao_interna",
  stripe_invoice_id: "in_validacao_interna",
  amount_paid: 98500,
  currency: "brl",
  periodo_inicio: new Date().toISOString(),
  periodo_fim: new Date(Date.now() + 30 * 864e5).toISOString(),
  status: "paid",
})
check("3. insert pagamento (invoice.payment_succeeded)", pag.error)

// Limpeza
await supabase.from("pagamentos_stripe").delete().eq("stripe_invoice_id", "in_validacao_interna")
await supabase.from("empresas").delete().eq("email_owner", EMAIL)
console.log("Limpeza: registros de teste removidos")

console.log(falhas === 0 ? "\nRESULTADO: pipeline webhook → Supabase 100% funcional" : `\nRESULTADO: ${falhas} operação(ões) falharam`)
process.exit(falhas === 0 ? 0 : 1)
