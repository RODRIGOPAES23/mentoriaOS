import { adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function GET(request: Request) {
  const supabase = adminClient()
  const url = new URL(request.url)
  const mentoradoId = url.searchParams.get("mentoradoId")
  const status = url.searchParams.get("status") || "pending"

  if (!mentoradoId) return Response.json({ error: "mentoradoId obrigatório" }, { status: 400, headers: NO_CACHE })

  let query = supabase
    .from("tarefas")
    .select("id, texto, status, data_vencimento, data_criacao, data_completada, mentorado_id")
    .eq("mentorado_id", mentoradoId)

  if (status !== "all") query = query.eq("status", status)

  const { data, error } = await query
    .order("data_vencimento", { ascending: true })
    .order("data_criacao", { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  return Response.json({ tarefas: data || [] }, { headers: NO_CACHE })
}

export async function POST(request: Request) {
  let body: any
  try { body = await request.json() }
  catch { return Response.json({ error: "Body inválido" }, { status: 400 }) }

  const { mentoradoId, mentorId, texto, data_vencimento } = body
  if (!mentoradoId || !mentorId) return Response.json({ error: "mentoradoId e mentorId obrigatórios" }, { status: 400 })

  const textoTrimmed = String(texto || "").trim()
  if (!textoTrimmed) return Response.json({ error: "Texto obrigatório" }, { status: 400 })

  const supabase = adminClient()
  const { data, error } = await supabase
    .from("tarefas")
    .insert({ mentorado_id: mentoradoId, mentor_id: mentorId, texto: textoTrimmed, status: "pending", data_vencimento: data_vencimento || null })
    .select("id, texto, status, data_vencimento, data_criacao, data_completada")
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true, tarefa: data }, { headers: NO_CACHE })
}
