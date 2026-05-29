import { createClient } from "@supabase/supabase-js"

/**
 * PATCH /api/dashboard/tarefas/[id]
 *   → Atualiza tarefa (status, data_vencimento, texto)
 *
 * DELETE /api/dashboard/tarefas/[id]
 *   → Deleta tarefa
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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400, headers: NO_CACHE })
  }

  const { status, texto, data_vencimento } = body
  const tarefaId = params.id

  const supabase = admin()

  const updateData: any = {}

  if (status !== undefined) {
    if (!["pending", "completed"].includes(status)) {
      return Response.json({ error: "Status inválido (pending/completed)" }, { status: 400, headers: NO_CACHE })
    }
    updateData.status = status

    // Se foi marcada como completa, salvar timestamp
    if (status === "completed") {
      updateData.data_completada = new Date().toISOString()
    } else {
      updateData.data_completada = null
    }
  }

  if (texto !== undefined) {
    const textoTrimmed = String(texto || "").trim()
    if (!textoTrimmed) {
      return Response.json({ error: "Texto não pode ser vazio" }, { status: 400, headers: NO_CACHE })
    }
    updateData.texto = textoTrimmed
  }

  if (data_vencimento !== undefined) {
    updateData.data_vencimento = data_vencimento || null
  }

  const { data, error } = await supabase
    .from("tarefas")
    .update(updateData)
    .eq("id", tarefaId)
    .select("id, texto, status, data_vencimento, data_criacao, data_completada")
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  }

  return Response.json({ success: true, tarefa: data }, { headers: NO_CACHE })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const tarefaId = params.id

  const supabase = admin()
  const { error } = await supabase.from("tarefas").delete().eq("id", tarefaId)

  if (error) {
    return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  }

  return Response.json({ success: true }, { headers: NO_CACHE })
}
