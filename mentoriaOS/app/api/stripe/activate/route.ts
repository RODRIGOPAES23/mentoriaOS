import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

// Cliente admin (service role) — nunca exposto ao browser
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// GET /api/stripe/activate?session_id=cs_xxx
// Chamado pela página /bem-vindo após checkout
// Cria usuário Supabase + mentor + empresa e retorna magic link

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id")
  if (!sessionId) {
    return NextResponse.json({ error: "session_id obrigatório" }, { status: 400 })
  }

  try {
    // 1. Busca a sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "subscription"],
    })

    if (session.payment_status === "unpaid" && session.status !== "complete") {
      return NextResponse.json({ error: "Pagamento não confirmado" }, { status: 402 })
    }

    const email = session.customer_email || session.customer_details?.email
    const nome = session.customer_details?.name || email?.split("@")[0] || "Mentor"
    const mentorados = Number(session.metadata?.mentorados || 10)
    const plano = session.metadata?.plano || "starter"
    const customerId = typeof session.customer === "string"
      ? session.customer
      : session.customer?.id
    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id

    if (!email) {
      return NextResponse.json({ error: "E-mail não encontrado na sessão" }, { status: 400 })
    }

    // 2. Cria ou busca usuário no Supabase Auth
    let userId: string

    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const found = existingUser?.users?.find(u => u.email === email)

    if (found) {
      userId = found.id
    } else {
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { nome, plano, mentorados },
      })
      if (createErr || !newUser?.user) {
        return NextResponse.json({ error: createErr?.message || "Erro ao criar usuário" }, { status: 500 })
      }
      userId = newUser.user.id
    }

    // 3. Cria ou atualiza empresa
    const { data: empresa } = await supabaseAdmin
      .from("empresas")
      .upsert({
        email_owner: email,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        plano,
        mentorados_contratados: mentorados,
        status: "trial",
        plano_ativo: true,
        trial_start: new Date().toISOString(),
        nome: nome + " — Empresa",
      }, { onConflict: "email_owner" })
      .select("id")
      .single()

    const empresaId = empresa?.id

    // 4. Cria ou atualiza mentor
    const { data: mentorExist } = await supabaseAdmin
      .from("mentors")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (!mentorExist) {
      await supabaseAdmin.from("mentors").insert({
        id: userId,
        email,
        nome,
        empresa_id: empresaId,
        status: "ativo",
        role: "mentor",
        created_at: new Date().toISOString(),
      })
    } else {
      await supabaseAdmin.from("mentors").update({
        empresa_id: empresaId,
        status: "ativo",
      }).eq("email", email)
    }

    // 5. Gera magic link para login automático
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://cklareza.com"}/auth/callback?next=/dashboard`,
      },
    })

    if (linkErr || !linkData?.properties?.action_link) {
      // Fallback: retorna sucesso sem link (usuário faz login manual)
      return NextResponse.json({
        ok: true,
        email,
        nome,
        magicLink: null,
        message: "Conta criada. Faça login com o e-mail cadastrado.",
      })
    }

    return NextResponse.json({
      ok: true,
      email,
      nome,
      magicLink: linkData.properties.action_link,
    })

  } catch (err: any) {
    console.error("[stripe/activate]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
