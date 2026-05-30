import { adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = adminClient()
  try {
    const body = await request.json()
    const { status, data_pagamento } = body
    const update: any = { status }
    if (status === "pago" && !data_pagamento) update.data_pagamento = new Date().toISOString().slice(0, 10)
    else if (data_pagamento) update.data_pagamento = data_pagamento

    const { data, error } = await supabase
      .from("pagamentos")
      .update(update)
      .eq("id", params.id)
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true, pagamento: data }, { headers: NO_CACHE })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = adminClient()
  const { error } = await supabase.from("pagamentos").delete().eq("id", params.id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true }, { headers: NO_CACHE })
}
