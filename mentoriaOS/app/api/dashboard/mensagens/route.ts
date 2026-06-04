import { adminClient } from "@/lib/supabase-server"
import { rotaCompartilhadaAutorizada, naoAutorizado } from "@/lib/auth-guards"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function GET(request: Request) {
  const url = new URL(request.url)
  const mentoradoId = url.searchParams.get("mentoradoId")
  if (!mentoradoId) return Response.json({ error: "mentoradoId obrigatório" }, { status: 400, headers: NO_CACHE })

  if (!await rotaCompartilhadaAutorizada(mentoradoId, request)) return naoAutorizado()

  const supabase = adminClient()
  const { data, error } = await supabase
    .from("mensagens")
    .select("id, autor, texto, lida, created_at")
    .eq("mentorado_id", mentoradoId)
    .order("created_at", { ascending: true })
    .limit(200)

  if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  return Response.json({ mensagens: data || [] }, { headers: NO_CACHE })
}

export async function POST(request: Request) {
  const supabase = adminClient()
  let body: any
  try { body = await request.json() }
  catch { return Response.json({ error: "Body inválido" }, { status: 400, headers: NO_CACHE }) }

  const { mentoradoId, mentorId, autor, texto } = body
  if (!mentoradoId || !mentorId || !autor || !texto?.trim())
    return Response.json({ error: "Campos obrigatórios faltando" }, { status: 400, headers: NO_CACHE })
  if (autor !== "mentor" && autor !== "mentorado")
    return Response.json({ error: "autor inválido" }, { status: 400, headers: NO_CACHE })

  if (!await rotaCompartilhadaAutorizada(mentoradoId, request)) return naoAutorizado()

  const { data, error } = await supabase
    .from("mensagens")
    .insert({ mentorado_id: mentoradoId, mentor_id: mentorId, autor, texto: texto.trim() })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  return Response.json({ success: true, mensagem: data }, { headers: NO_CACHE })
}
