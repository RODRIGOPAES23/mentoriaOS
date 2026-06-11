import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

// POST /api/stripe/webhook
// Recebe eventos do Stripe e atualiza o Supabase

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error("[webhook] assinatura inválida:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  console.log("[webhook] evento:", event.type)

  switch (event.type) {
    // ─── Checkout concluído (trial iniciado) ───────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object
      const email = session.customer_email || session.customer_details?.email
      const mentorados = Number(session.metadata?.mentorados || 10)
      const plano = session.metadata?.plano || "starter"
      const customerId = session.customer

      if (email) {
        const dadosStripe = {
          stripe_customer_id: customerId,
          stripe_subscription_id: session.subscription,
          plano,
          mentorados_contratados: mentorados,
          status: "trial",
          trial_start: new Date().toISOString(),
        }

        const { data: existente } = await supabase
          .from("empresas")
          .select("id")
          .eq("email_owner", email)
          .maybeSingle()

        if (existente) {
          // Empresa já existe: atualiza só os campos Stripe (preserva nome/slug)
          const { error } = await supabase
            .from("empresas")
            .update(dadosStripe)
            .eq("id", existente.id)
          if (error) console.error("[webhook] update empresa falhou:", error.message)
        } else {
          // nome/slug são NOT NULL — deriva do e-mail (mentor renomeia depois no painel)
          const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "empresa"
          const { data: slugTomado } = await supabase
            .from("empresas")
            .select("id")
            .eq("slug", base)
            .maybeSingle()
          const slug = slugTomado ? `${base}-${Math.random().toString(36).slice(2, 6)}` : base

          const { error } = await supabase
            .from("empresas")
            .insert({ email_owner: email, nome: base, slug, ...dadosStripe })
          if (error) console.error("[webhook] insert empresa falhou:", error.message)
        }
      }
      break
    }

    // ─── Assinatura ativa (trial → pago) ───────────────────────────────
    case "customer.subscription.updated": {
      const sub = event.data.object
      const status = sub.status // active | trialing | past_due | canceled
      const customerId = sub.customer

      await supabase
        .from("empresas")
        .update({
          status,
          plano_ativo: status === "active" || status === "trialing",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", customerId)
      break
    }

    // ─── Assinatura cancelada ───────────────────────────────────────────
    case "customer.subscription.deleted": {
      const sub = event.data.object
      await supabase
        .from("empresas")
        .update({ status: "canceled", plano_ativo: false })
        .eq("stripe_customer_id", sub.customer)
      break
    }

    // ─── Pagamento bem-sucedido ─────────────────────────────────────────
    case "invoice.payment_succeeded": {
      const inv = event.data.object
      await supabase.from("pagamentos_stripe").insert({
        stripe_customer_id: inv.customer,
        stripe_invoice_id: inv.id,
        amount_paid: inv.amount_paid,
        currency: inv.currency,
        periodo_inicio: new Date(inv.period_start * 1000).toISOString(),
        periodo_fim: new Date(inv.period_end * 1000).toISOString(),
        status: "paid",
      })
      break
    }

    // ─── Pagamento falhou ───────────────────────────────────────────────
    case "invoice.payment_failed": {
      const inv = event.data.object
      await supabase
        .from("empresas")
        .update({ status: "past_due" })
        .eq("stripe_customer_id", inv.customer)
      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}
