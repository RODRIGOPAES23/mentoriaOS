/**
 * Autorização "nível mentor" para rotas de API exclusivas do mentor.
 * Permite se: sessão é super_admin, OU é o mentor dono do mentorId pedido.
 * NÃO usar em rotas compartilhadas com o portal do mentorado (entra por código, sem sessão).
 */
import { createServerClient, adminClient } from "@/lib/supabase-server"

export async function mentorAutorizado(mentorId: string | null | undefined): Promise<boolean> {
  if (!mentorId) return false
  try {
    const sb = createServerClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user?.email) return false
    const admin = adminClient()
    const { data: sa } = await admin.from("super_admins").select("email").eq("email", user.email).maybeSingle()
    if (sa) return true
    const { data: m } = await admin.from("mentors").select("id").eq("email", user.email).maybeSingle()
    return !!m && m.id === mentorId
  } catch {
    return false
  }
}

export function naoAutorizado() {
  return Response.json({ error: "Não autorizado" }, { status: 401, headers: { "Cache-Control": "no-store" } })
}
