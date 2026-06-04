import { adminClient } from "@/lib/supabase-server"
import { mentorAutorizadoPorEntidade, naoAutorizado } from "@/lib/auth-guards"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!await mentorAutorizadoPorEntidade("pagamentos", params.id)) return naoAutorizado()

  const supabase = adminClient()
  try {
    const body = await request.json()
    const update: any = {}

    if (body.status !== undefined) {
      update.status = body.status
      if (body.status === "pago") update.data_pagamento = body.data_pagamento || new Date().toISOString().slice(0, 10)
      else update.data_pagamento = null
    } else if (body.data_pagamento !== undefined) {
      update.data_pagamento = body.data_pagamento || null
    }

    if (body.valor !== undefined) update.valor = Number(body.valor) || 0
    if (body.data_vencimento !== undefined) update.data_vencimento = body.data_vencimento || null
    if (body.descricao !== undefined) update.descricao = body.descricao || null
    if (body.parcela !== undefined) update.parcela = Number(body.parcela) || 1

    const { data, error } = await supabase.from("pagamentos").update(update).eq("id", params.id).select().single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true, pagamento: data }, { headers: NO_CACHE })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!await mentorAutorizadoPorEntidade("pagamentos", params.id)) return naoAutorizado()

  const supabase = adminClient()
  const { error } = await supabase.from("pagamentos").delete().eq("id", params.id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true }, { headers: NO_CACHE })
}
