import { adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

// GET — carrega a nota mais recente do mentorado
export async function GET(request: Request) {
  const supabase = adminClient()
  const url = new URL(request.url)
  const mentoradoId = url.searchParams.get("mentoradoId")
  if (!mentoradoId) return Response.json({ error: "mentoradoId obrigatório" }, { status: 400, headers: NO_CACHE })

  const { data } = await supabase
    .from("session_notes")
    .select("id, conteudo, updated_at")
    .eq("mentorado_id", mentoradoId)
    .order("updated_at", { ascending: false })
    .limit(1)

  return Response.json({ nota: data?.[0] || null }, { headers: NO_CACHE })
}

// PUT — salva (upsert) a nota. Chamado com debounce pelo client.
export async function PUT(request: Request) {
  const supabase = adminClient()
  let body: any
  try { body = await request.json() }
  catch { return Response.json({ error: "Body inválido" }, { status: 400, headers: NO_CACHE }) }

  const { mentoradoId, mentorId, conteudo, id } = body
  if (!mentoradoId || !mentorId) {
    return Response.json({ error: "mentoradoId e mentorId obrigatórios" }, { status: 400, headers: NO_CACHE })
  }

  // Se já tem id → update; senão verifica se existe nota, ou cria
  if (id) {
    const { error } = await supabase
      .from("session_notes")
      .update({ conteudo: conteudo || "", updated_at: new Date().toISOString() })
      .eq("id", id)
    if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
    return Response.json({ success: true, id }, { headers: NO_CACHE })
  }

  // Procura nota existente
  const { data: existing } = await supabase
    .from("session_notes")
    .select("id")
    .eq("mentorado_id", mentoradoId)
    .order("updated_at", { ascending: false })
    .limit(1)

  if (existing?.[0]) {
    await supabase.from("session_notes")
      .update({ conteudo: conteudo || "", updated_at: new Date().toISOString() })
      .eq("id", existing[0].id)
    return Response.json({ success: true, id: existing[0].id }, { headers: NO_CACHE })
  }

  const { data, error } = await supabase
    .from("session_notes")
    .insert({ mentorado_id: mentoradoId, mentor_id: mentorId, conteudo: conteudo || "" })
    .select("id")
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  return Response.json({ success: true, id: data.id }, { headers: NO_CACHE })
}
