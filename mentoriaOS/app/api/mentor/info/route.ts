import { adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function GET(request: Request) {
  const supabase = adminClient()
  try {
    const url = new URL(request.url)
    const mentorId = url.searchParams.get("mentorId")

    let query = supabase
      .from("mentors")
      .select("id, nome, nicho_foco, metodo_trabalho, filosofia, email, foto_url, role, empresa_id")

    if (mentorId) query = query.eq("id", mentorId)

    const { data: mentor } = await query.limit(1).single()
    return Response.json({ mentor }, { headers: NO_CACHE })
  } catch {
    return Response.json({ mentor: null }, { headers: NO_CACHE })
  }
}

export async function PATCH(request: Request) {
  const supabase = adminClient()
  try {
    const url = new URL(request.url)
    const mentorId = url.searchParams.get("mentorId")
    if (!mentorId) return Response.json({ error: "mentorId obrigatório" }, { status: 400 })

    const body = await request.json()
    const { nome, nicho_foco, metodo_trabalho, filosofia } = body

    const { data, error } = await supabase
      .from("mentors")
      .update({ nome, nicho_foco, metodo_trabalho, filosofia })
      .eq("id", mentorId)
      .select("id, nome, nicho_foco, metodo_trabalho, filosofia, email, foto_url, role, empresa_id")
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
    return Response.json({ mentor: data }, { headers: NO_CACHE })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
