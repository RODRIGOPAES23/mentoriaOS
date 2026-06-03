/**
 * Autorização do super-admin (dono do CKlareza).
 * Aceita: (1) sessão Supabase Auth cujo e-mail está em super_admins, OU
 *         (2) chave SUPERADMIN_KEY (fallback temporário p/ scripts/CLI).
 */
import { createServerClient, adminClient } from "@/lib/supabase-server"

export function checkAdminKey(req: Request): boolean {
  const expected = process.env.SUPERADMIN_KEY
  if (!expected) return false
  return req.headers.get("x-admin-key") === expected
}

export async function isSuperAdminSession(): Promise<boolean> {
  try {
    const sb = createServerClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user?.email) return false
    const admin = adminClient()
    const { data } = await admin.from("super_admins").select("email").eq("email", user.email).maybeSingle()
    return !!data
  } catch {
    return false
  }
}

export async function isAdminAuthorized(req: Request): Promise<boolean> {
  if (checkAdminKey(req)) return true
  return await isSuperAdminSession()
}

export function adminUnauthorized() {
  return Response.json({ error: "Não autorizado" }, {
    status: 401,
    headers: { "Cache-Control": "no-store" },
  })
}
