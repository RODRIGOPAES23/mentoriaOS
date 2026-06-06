import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseAdmin = createClient(
  SUPA_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(SUPA_URL, ANON, {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    })

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user?.email) {
      const email = data.user.email
      const nome = data.user.user_metadata?.full_name
        || data.user.user_metadata?.nome
        || email.split("@")[0]

      // ── Auto-provisioning: cria mentor se não existe ──────────────────────
      // Isso garante que Google OAuth e magic link novos entrem no dashboard
      const { data: mentorExist } = await supabaseAdmin
        .from("mentors")
        .select("id")
        .eq("email", email)
        .maybeSingle()

      const { data: saExist } = await supabaseAdmin
        .from("super_admins")
        .select("email")
        .eq("email", email)
        .maybeSingle()

      // Só cria mentor se não é super_admin e não tem mentor ainda
      if (!saExist && !mentorExist) {
        // Cria empresa trial
        const { data: empresa } = await supabaseAdmin
          .from("empresas")
          .upsert({
            email_owner: email,
            nome,
            plano: "trial",
            mentorados_contratados: 10,
            status: "trial",
            plano_ativo: true,
            trial_start: new Date().toISOString(),
          }, { onConflict: "email_owner" })
          .select("id")
          .single()

        // Cria mentor
        await supabaseAdmin.from("mentors").insert({
          id: data.user.id,
          email,
          nome,
          empresa_id: empresa?.id,
          status: "ativo",
          role: "mentor",
          created_at: new Date().toISOString(),
        }).select()
      }
      // ─────────────────────────────────────────────────────────────────────

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Falha → volta para login com erro
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
