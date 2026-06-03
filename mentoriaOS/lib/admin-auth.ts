/**
 * Guarda TEMPORÁRIA do super-admin (dono do CKlareza).
 * Substituir por verificação de role no Supabase Auth (Fase 0) — ver CKLAREZA_V81.
 * A chave vem de process.env.SUPERADMIN_KEY (Vercel env + .env.local).
 */
export function checkAdminKey(req: Request): boolean {
  const expected = process.env.SUPERADMIN_KEY
  if (!expected) return false
  const key = req.headers.get("x-admin-key")
  return key === expected
}

export function adminUnauthorized() {
  return Response.json({ error: "Não autorizado" }, {
    status: 401,
    headers: { "Cache-Control": "no-store" },
  })
}
