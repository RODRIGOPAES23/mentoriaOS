import { adminClient } from "@/lib/supabase-server"
import { sessaoMentorValida, mentorAutorizado, naoAutorizado } from "@/lib/auth-guards"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function GET(request: Request) {
  if (!await sessaoMentorValida()) return naoAutorizado()

  const supabase = adminClient()
  const url = new URL(request.url)
  const mentorId = url.searchParams.get("mentorId")
  const mentoradoId = url.searchParams.get("mentoradoId")
  const proximas = url.searchParams.get("proximas")

  let query = supabase
    .from("sessoes")
    .select("id, titulo, data_hora, duracao_min, status, link_call, notas, mentorado_id, mentor_id")
    .order("data_hora", { ascending: true })

  if (mentoradoId) query = query.eq("mentorado_id", mentoradoId)
  else if (mentorId) query = query.eq("mentor_id", mentorId)

  if (proximas === "1") query = query.gte("data_hora", new Date().toISOString()).eq("status", "agendada")

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })

  const ids = Array.from(new Set((data || []).map(s => s.mentorado_id)))
  let nomes: Record<string, { nome: string; foto_url: string | null }> = {}
  if (ids.length > 0) {
    const { data: ms } = await supabase.from("mentorados").select("id, nome, foto_url").in("id", ids)
    for (const m of ms || []) nomes[m.id] = { nome: m.nome, foto_url: m.foto_url }
  }

  const sessoes = (data || []).map(s => ({
    ...s,
    mentorado_nome: nomes[s.mentorado_id]?.nome || "—",
    mentorado_foto: nomes[s.mentorado_id]?.foto_url || null,
  }))

  return Response.json({ sessoes }, { headers: NO_CACHE })
}

export async function POST(request: Request) {
  let body: any
  try { body = await request.json() }
  catch { return Response.json({ error: "Body inválido" }, { status: 400 }) }

  const { mentoradoId, mentorId, titulo, data_hora, duracao_min, link_call } = body
  if (!mentoradoId || !mentorId || !data_hora)
    return Response.json({ error: "mentoradoId, mentorId e data_hora obrigatórios" }, { status: 400 })

  if (!await mentorAutorizado(mentorId)) return naoAutorizado()

  const supabase = adminClient()
  const { data, error } = await supabase
    .from("sessoes")
    .insert({
      mentorado_id: mentoradoId,
      mentor_id: mentorId,
      titulo: titulo || "Sessão de Mentoria",
      data_hora,
      duracao_min: duracao_min || 60,
      link_call: link_call || null,
      status: "agendada",
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true, sessao: data }, { headers: NO_CACHE })
}
