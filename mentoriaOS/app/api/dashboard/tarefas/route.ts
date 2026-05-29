import { createClient } from "@supabase/supabase-js"

/**
 * GET /api/dashboard/tarefas?mentoradoId=xxx&status=pending
 *   → Lista tarefas do mentorado (filtra por status se fornecido)
 *
 * POST /api/dashboard/tarefas
 *   → Cria nova tarefa (body: {mentoradoId, texto, data_vencimento})
 */

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
}

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

export async function GET(request: Request) {
  const supabase = admin()
  const url = new URL(request.url)

  const mentoradoId = url.searchParams.get("mentoradoId")
  const status = url.searchParams.get("status") || "pending"

  if (!mentoradoId) {
    return Response.json({ error: "mentoradoId é obrigatório" }, { status: 400, headers: NO_CACHE })
  }

  let query = supabase
    .from("tarefas")
    .select("id, texto, status, data_vencimento, data_criacao, data_completada, mentorado_id")
    .eq("mentorado_id", mentoradoId)

  if (status === "pending") {
    query = query.eq("status", "pending")
  } else if (status === "completed") {
    query = query.eq("status", "completed")
  } else if (status === "all") {
    // Sem filtro de status
  }

  const { data, error } = await query.order("data_vencimento", { ascending: true }).order("data_criacao", { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  }

  return Response.json({ tarefas: data || [] }, { headers: NO_CACHE })
}

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400, headers: NO_CACHE })
  }

  const { mentoradoId, mentorId, texto, data_vencimento } = body

  if (!mentoradoId || !mentorId) {
    return Response.json({ error: "mentoradoId e mentorId são obrigatórios" }, { status: 400, headers: NO_CACHE })
  }

  const textoTrimmed = String(texto || "").trim()
  if (!textoTrimmed) {
    return Response.json({ error: "Texto da tarefa é obrigatório" }, { status: 400, headers: NO_CACHE })
  }

  const supabase = admin()
  const { data, error } = await supabase
    .from("tarefas")
    .insert({
      mentorado_id: mentoradoId,
      mentor_id: mentorId,
      texto: textoTrimmed,
      status: "pending",
      data_vencimento: data_vencimento || null,
    })
    .select("id, texto, status, data_vencimento, data_criacao, data_completada")
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  }

  return Response.json({ success: true, tarefa: data }, { headers: NO_CACHE })
}
