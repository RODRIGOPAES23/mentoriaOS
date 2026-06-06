import { NextRequest, NextResponse } from "next/server"
import { stripe, PLANOS_CKLAREZA, planoParaN } from "@/lib/stripe"

// POST /api/stripe/checkout
// Body: { mentorados: number, email?: string }
// Retorna: { url: string } — redireciona para Stripe Checkout

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const mentorados = Number(body.mentorados) || 10
    const email = body.email as string | undefined

    const plano = planoParaN(mentorados)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cklareza.com"

    // Busca ou cria o Price no Stripe pelo lookup_key
    let priceId: string

    const prices = await stripe.prices.list({
      lookup_keys: [plano.lookup_key],
      expand: ["data.product"],
    })

    if (prices.data.length > 0) {
      priceId = prices.data[0].id
    } else {
      // Cria produto + price pela primeira vez
      const product = await stripe.products.create({
        name: plano.descricao,
        metadata: { mentorados: String(plano.mentorados), plano: plano.id },
      })

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plano.preco_centavos,
        currency: "brl",
        recurring: { interval: "month" },
        lookup_key: plano.lookup_key,
        transfer_lookup_key: true,
        nickname: plano.descricao,
      })

      priceId = price.id
    }

    // Cria sessão de checkout
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(email ? { customer_email: email } : {}),
      success_url: `${appUrl}/bem-vindo?session_id={CHECKOUT_SESSION_ID}&mentorados=${mentorados}`,
      cancel_url: `${appUrl}/precos?cancelado=1`,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 14,
        metadata: { mentorados: String(mentorados), plano: plano.id },
      },
      metadata: { mentorados: String(mentorados), plano: plano.id },
      locale: "pt-BR",
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("[stripe/checkout] type:", err.type, "msg:", err.message, "code:", err.code)
    return NextResponse.json({
      error: err.message,
      type: err.type,
      code: err.code,
    }, { status: 500 })
  }
}
