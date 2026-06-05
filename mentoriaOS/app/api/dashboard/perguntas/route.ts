import { adminClient } from "@/lib/supabase-server"
import { mentorAutorizado, naoAutorizado } from "@/lib/auth-guards"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

// GET /api/dashboard/perguntas?mentorId= → perguntas personalizadas do check-in
export async function GET(request: Request) {
  const url = new URL(request.url)
  const mentorId = url.searchParams.get("mentorId")
  if (!mentorId) return Response.json({ error: "mentorId obrigatório" }, { status: 400, headers: NO_CACHE })
  if (!await mentorAutorizado(mentorId)) return naoAutorizado()

  const sb = adminClient()
  const { data, error } = await sb
    .from("custom_questions")
    .select("id, label, tipo, obrigatoria, ordem, ativo")
    .eq("mentor_id", mentorId)
    .order("ordem", { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  return Response.json({ perguntas: data || [] }, { headers: NO_CACHE })
}

// POST /api/dashboard/perguntas → cria pergunta { mentorId, label, tipo, obrigatoria }
export async function POST(request: Request) {
  let body: any
  try { body = await request.json() } catch { return Response.json({ error: "Body inválido" }, { status: 400 }) }
  const { mentorId, label, tipo, obrigatoria } = body
  if (!mentorId) return Response.json({ error: "mentorId obrigatório" }, { status: 400 })
  if (!await mentorAutorizado(mentorId)) return naoAutorizado()

  const labelTrim = String(label || "").trim()
  if (!labelTrim) return Response.json({ error: "Pergunta obrigatória" }, { status: 400 })
  const tipoOk = ["text", "textarea", "number"].includes(tipo) ? tipo : "text"

  const sb = adminClient()
  const { count } = await sb.from("custom_questions").select("*", { count: "exact", head: true }).eq("mentor_id", mentorId)

  const { data, error } = await sb
    .from("custom_questions")
    .insert({ mentor_id: mentorId, label: labelTrim, tipo: tipoOk, obrigatoria: !!obrigatoria, ordem: count || 0 })
    .select("id, label, tipo, obrigatoria, ordem, ativo")
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true, pergunta: data }, { headers: NO_CACHE })
}

// DELETE /api/dashboard/perguntas?mentorId=&id= → remove pergunta
export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const mentorId = url.searchParams.get("mentorId")
  const id = url.searchParams.get("id")
  if (!mentorId || !id) return Response.json({ error: "mentorId e id obrigatórios" }, { status: 400 })
  if (!await mentorAutorizado(mentorId)) return naoAutorizado()

  const sb = adminClient()
  const { error } = await sb.from("custom_questions").delete().eq("id", id).eq("mentor_id", mentorId)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true }, { headers: NO_CACHE })
}
