import { adminClient } from "@/lib/supabase-server"
import {
  rotaCompartilhadaAutorizadaPorEntidade,
  mentorAutorizadoPorEntidade,
  naoAutorizado,
} from "@/lib/auth-guards"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

// Portal pode marcar/desmarcar tarefa; mentor pode editar qualquer campo.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!await rotaCompartilhadaAutorizadaPorEntidade("tarefas", params.id, request)) return naoAutorizado()

  let body: any
  try { body = await request.json() }
  catch { return Response.json({ error: "Body inválido" }, { status: 400, headers: NO_CACHE }) }

  const { status, texto, data_vencimento } = body
  const updateData: any = {}

  if (status !== undefined) {
    if (!["pending", "completed"].includes(status))
      return Response.json({ error: "Status inválido (pending/completed)" }, { status: 400, headers: NO_CACHE })
    updateData.status = status
    updateData.data_completada = status === "completed" ? new Date().toISOString() : null
  }

  if (texto !== undefined) {
    const textoTrimmed = String(texto || "").trim()
    if (!textoTrimmed) return Response.json({ error: "Texto não pode ser vazio" }, { status: 400, headers: NO_CACHE })
    updateData.texto = textoTrimmed
  }

  if (data_vencimento !== undefined) updateData.data_vencimento = data_vencimento || null

  const supabase = adminClient()
  const { data, error } = await supabase
    .from("tarefas")
    .update(updateData)
    .eq("id", params.id)
    .select("id, texto, status, data_vencimento, data_criacao, data_completada")
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  return Response.json({ success: true, tarefa: data }, { headers: NO_CACHE })
}

// Deletar tarefa é exclusivo do mentor (portal não pode deletar).
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!await mentorAutorizadoPorEntidade("tarefas", params.id)) return naoAutorizado()

  const supabase = adminClient()
  const { error } = await supabase.from("tarefas").delete().eq("id", params.id)
  if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  return Response.json({ success: true }, { headers: NO_CACHE })
}
