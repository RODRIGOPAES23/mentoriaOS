import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { marcarPago } from "@/lib/store"

export const dynamic = "force-dynamic"

// Webhook do Stripe (F5). Eventos checkout.session.completed marcam o lead como pago.
// O Payment Link deve ser gerado com ?client_reference_id=<leadId> para atribuição.
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text()
    let event: any

    if (WEBHOOK_SECRET && STRIPE_KEY) {
      // PRODUÇÃO: verifica a assinatura — rejeita eventos forjados
      const stripe = new Stripe(STRIPE_KEY)
      const sig = req.headers.get("stripe-signature")
      if (!sig) return NextResponse.json({ error: "sem assinatura" }, { status: 400 })
      try {
        event = stripe.webhooks.constructEvent(raw, sig, WEBHOOK_SECRET)
      } catch (err) {
        return NextResponse.json({ error: `assinatura inválida: ${String(err)}` }, { status: 400 })
      }
    } else {
      // DEV/local sem secret: aceita o JSON cru (NÃO usar em produção)
      event = JSON.parse(raw)
    }

    if (event?.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true, ignored: event?.type })
    }

    const session = event.data?.object ?? {}
    const leadId: string | undefined = session.client_reference_id || undefined
    const email: string | undefined = session.customer_details?.email || session.customer_email
    const valor =
      typeof session.amount_total === "number" ? session.amount_total / 100 : undefined

    const conv = await marcarPago({ id: leadId, email }, valor)
    return NextResponse.json({ received: true, matched: !!conv, leadId: conv?.id })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 })
  }
}
