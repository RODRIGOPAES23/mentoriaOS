import { getAuthContext, authError } from "@/lib/auth-helper"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function GET() {
  try {
    const { supabase, mentorId } = await getAuthContext()

    const { data: mentor, error } = await supabase
      .from("mentors")
      .select("id, nome, nicho_foco, metodo_trabalho, filosofia, email, foto_url")
      .eq("id", mentorId)
      .single()

    if (error) return Response.json({ mentor: null }, { headers: NO_CACHE })
    return Response.json({ mentor }, { headers: NO_CACHE })
  } catch (e) {
    return authError(e)
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, mentorId } = await getAuthContext()
    const body = await request.json()
    const { nome, nicho_foco, metodo_trabalho, filosofia } = body

    const { data, error } = await supabase
      .from("mentors")
      .update({ nome, nicho_foco, metodo_trabalho, filosofia })
      .eq("id", mentorId)
      .select("id, nome, nicho_foco, metodo_trabalho, filosofia, email, foto_url")
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
    return Response.json({ mentor: data }, { headers: NO_CACHE })
  } catch (e) {
    return authError(e)
  }
}
