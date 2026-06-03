import { adminClient } from "@/lib/supabase-server"
import { checkAdminKey, adminUnauthorized } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

// GET → empresa + seus mentores (com contagem de mentorados)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!checkAdminKey(req)) return adminUnauthorized()
  const sb = adminClient()
  const { data: empresa, error } = await sb.from("empresas").select("*").eq("id", params.id).single()
  if (error || !empresa) return Response.json({ error: "Empresa não encontrada" }, { status: 404, headers: NO_CACHE })

  const { data: mentors } = await sb.from("mentors").select("id, nome, email, role, status").eq("empresa_id", params.id)
  const ids = (mentors || []).map(m => m.id)
  let porMentor: Record<string, number> = {}
  if (ids.length) {
    const { data: mds } = await sb.from("mentorados").select("mentor_id").in("mentor_id", ids)
    for (const md of mds || []) porMentor[md.mentor_id] = (porMentor[md.mentor_id] || 0) + 1
  }
  const mentores = (mentors || []).map(m => ({ ...m, qtd_mentorados: porMentor[m.id] || 0 }))

  return Response.json({ empresa, mentores }, { headers: NO_CACHE })
}

// PATCH → edita campos da empresa (marca, cor, domínio, ativo)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!checkAdminKey(req)) return adminUnauthorized()
  let body: any
  try { body = await req.json() } catch { return Response.json({ error: "Body inválido" }, { status: 400 }) }
  const sb = adminClient()

  const update: any = {}
  for (const k of ["nome", "cor_primaria", "cor_secundaria", "logo_url", "dominio_proprio", "nicho_foco"]) {
    if (body[k] !== undefined) update[k] = body[k] || null
  }
  if (body.esconder_marca !== undefined) update.esconder_marca = !!body.esconder_marca
  if (body.ativo !== undefined) update.ativo = !!body.ativo

  const { data, error } = await sb.from("empresas").update(update).eq("id", params.id).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  return Response.json({ success: true, empresa: data }, { headers: NO_CACHE })
}
