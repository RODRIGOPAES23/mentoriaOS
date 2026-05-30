import { adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

// PATCH /api/dashboard/mentorados/reorder
// Body: { items: [{id: string, ordem: number}] }
export async function PATCH(request: Request) {
  let body: any
  try { body = await request.json() }
  catch { return Response.json({ error: "Body inválido" }, { status: 400 }) }

  const { items } = body
  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "items[] obrigatório" }, { status: 400 })
  }

  const supabase = adminClient()

  // Upsert em paralelo
  await Promise.all(
    items.map(({ id, ordem }: { id: string; ordem: number }) =>
      supabase.from("mentorados").update({ ordem }).eq("id", id)
    )
  )

  return Response.json({ success: true })
}
