import { createServerClient, adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

// GET /api/me → papel do usuário logado (super_admin | mentor | norole | none)
export async function GET() {
  const sb = createServerClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user?.email) return Response.json({ authenticated: false, role: "none" }, { headers: NO_CACHE })

  const email = user.email
  const admin = adminClient()

  const { data: sa } = await admin.from("super_admins").select("email").eq("email", email).maybeSingle()
  if (sa) return Response.json({ authenticated: true, role: "super_admin", email }, { headers: NO_CACHE })

  const { data: m } = await admin.from("mentors").select("id, nome, empresa_id").eq("email", email).maybeSingle()
  if (m) return Response.json({ authenticated: true, role: "mentor", email, mentorId: m.id, mentorNome: m.nome, empresaId: m.empresa_id }, { headers: NO_CACHE })

  return Response.json({ authenticated: true, role: "norole", email }, { headers: NO_CACHE })
}
