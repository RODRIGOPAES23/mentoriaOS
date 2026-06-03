import { adminClient } from "@/lib/supabase-server"
import { checkAdminKey, adminUnauthorized } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

// GET /api/admin/overview → KPIs globais + empresas com contagens (super-admin)
export async function GET(req: Request) {
  if (!checkAdminKey(req)) return adminUnauthorized()
  const sb = adminClient()

  const [{ data: empresas }, { data: mentors }, { data: mentorados }] = await Promise.all([
    sb.from("empresas").select("*").order("created_at"),
    sb.from("mentors").select("id, empresa_id, status"),
    sb.from("mentorados").select("id, mentor_id, status"),
  ])

  const mentoresArr = mentors || []
  const mentoradosArr = mentorados || []

  // mentor_id -> empresa_id
  const mentorEmpresa: Record<string, string> = {}
  for (const m of mentoresArr) mentorEmpresa[m.id] = m.empresa_id

  const lista = (empresas || []).map(e => {
    const mentoresEmpresa = mentoresArr.filter(m => m.empresa_id === e.id)
    const idsMentores = new Set(mentoresEmpresa.map(m => m.id))
    const mentoradosEmpresa = mentoradosArr.filter(md => idsMentores.has(md.mentor_id))
    return {
      ...e,
      qtd_mentores: mentoresEmpresa.length,
      qtd_mentorados: mentoradosEmpresa.length,
    }
  })

  const kpis = {
    empresas: lista.length,
    empresas_ativas: lista.filter(e => e.ativo).length,
    mentores: mentoresArr.length,
    mentorados: mentoradosArr.length,
  }

  return Response.json({ kpis, empresas: lista }, { headers: NO_CACHE })
}
