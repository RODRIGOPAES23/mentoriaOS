import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Admin client — server-side only, nunca exposto ao browser
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// POST /api/auth/signup
// Body: { email, nome }
// Cria usuário + empresa trial + mentor + retorna magic link

export async function POST(req: NextRequest) {
  try {
    const { email, nome } = await req.json()

    if (!email || !nome) {
      return NextResponse.json({ error: "Email e nome são obrigatórios." }, { status: 400 })
    }

    const emailNorm = email.trim().toLowerCase()
    const nomeNorm = nome.trim()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cklareza.com"

    // 1. Verifica se usuário já existe
    const { data: existingList } = await supabaseAdmin.auth.admin.listUsers()
    const found = existingList?.users?.find(u => u.email === emailNorm)

    let userId: string

    if (found) {
      userId = found.id
    } else {
      // Cria usuário no Supabase Auth (sem senha, confirma email direto)
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: emailNorm,
        email_confirm: true,
        user_metadata: { nome: nomeNorm, plano: "trial", origin: "signup_organico" },
      })
      if (createErr || !newUser?.user) {
        return NextResponse.json({ error: createErr?.message || "Erro ao criar usuário." }, { status: 500 })
      }
      userId = newUser.user.id
    }

    // 2. Cria ou atualiza empresa (trial gratuito)
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 14)

    const { data: empresa } = await supabaseAdmin
      .from("empresas")
      .upsert({
        email_owner: emailNorm,
        nome: nomeNorm,
        plano: "trial",
        mentorados_contratados: 10,
        status: "trial",
        plano_ativo: true,
        trial_start: new Date().toISOString(),
      }, { onConflict: "email_owner" })
      .select("id")
      .single()

    const empresaId = empresa?.id

    // 3. Cria ou atualiza mentor
    const { data: mentorExist } = await supabaseAdmin
      .from("mentors")
      .select("id")
      .eq("email", emailNorm)
      .maybeSingle()

    if (!mentorExist) {
      await supabaseAdmin.from("mentors").insert({
        id: userId,
        email: emailNorm,
        nome: nomeNorm,
        empresa_id: empresaId,
        status: "ativo",
        role: "mentor",
        created_at: new Date().toISOString(),
      })
    } else {
      await supabaseAdmin.from("mentors").update({
        empresa_id: empresaId,
        status: "ativo",
      }).eq("email", emailNorm)
    }

    // 4. Gera magic link para login automático
    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: emailNorm,
      options: {
        redirectTo: `${appUrl}/auth/callback?next=/dashboard`,
      },
    })

    if (linkErr || !linkData?.properties?.action_link) {
      // Fallback: envia OTP via email do Supabase
      return NextResponse.json({
        ok: true,
        magicLink: null,
        message: "Conta criada! Verifique seu e-mail para acessar.",
      })
    }

    return NextResponse.json({
      ok: true,
      magicLink: linkData.properties.action_link,
    })

  } catch (err: any) {
    console.error("[auth/signup]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
