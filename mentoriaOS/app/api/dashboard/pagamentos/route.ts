import { adminClient } from "@/lib/supabase-server"
import { sessaoMentorValida, mentorAutorizado, naoAutorizado } from "@/lib/auth-guards"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function GET(request: Request) {
  if (!await sessaoMentorValida()) return naoAutorizado()

  const supabase = adminClient()
  const url = new URL(request.url)
  const mentoradoId = url.searchParams.get("mentoradoId")
  const mentorId = url.searchParams.get("mentorId")

  let query = supabase
    .from("pagamentos")
    .select("id, valor, data_vencimento, data_pagamento, status, descricao, parcela, mentorado_id")
    .order("data_vencimento", { ascending: true })

  if (mentoradoId) query = query.eq("mentorado_id", mentoradoId)
  else if (mentorId) query = query.eq("mentor_id", mentorId)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  return Response.json({ pagamentos: data || [] }, { headers: NO_CACHE })
}

export async function POST(request: Request) {
  let body: any
  try { body = await request.json() }
  catch { return Response.json({ error: "Body inválido" }, { status: 400 }) }

  const { mentoradoId, mentorId, valor, data_vencimento, descricao, parcela } = body
  if (!mentoradoId || !mentorId || !data_vencimento)
    return Response.json({ error: "mentoradoId, mentorId e data_vencimento obrigatórios" }, { status: 400 })

  if (!await mentorAutorizado(mentorId)) return naoAutorizado()

  const supabase = adminClient()
  const { data, error } = await supabase
    .from("pagamentos")
    .insert({ mentorado_id: mentoradoId, mentor_id: mentorId, valor: valor || 0, data_vencimento, descricao: descricao || null, parcela: parcela || 1, status: "pendente" })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true, pagamento: data }, { headers: NO_CACHE })
}
