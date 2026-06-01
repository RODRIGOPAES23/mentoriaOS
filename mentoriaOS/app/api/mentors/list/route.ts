import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

// GET /api/mentors/list?empresa=termolaser → mentores da empresa (white label)
export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const url = new URL(request.url)
  const slug = (url.searchParams.get("empresa") || "").trim().toLowerCase()

  let empresaId: string | null = null
  if (slug) {
    const { data: emp } = await supabase.from("empresas").select("id").eq("slug", slug).single()
    empresaId = emp?.id || null
  }

  let query = supabase
    .from("mentors")
    .select("id, nome, nicho_foco, foto_url, role, empresa_id")
    .order("role", { ascending: true })
    .order("nome", { ascending: true })

  // Se a empresa foi resolvida, filtra só os mentores dela
  if (empresaId) query = query.eq("empresa_id", empresaId)

  const { data: mentores, error } = await query

  if (error) {
    return Response.json({ mentores: [], error: error.message }, { headers: NO_CACHE })
  }

  return Response.json({ mentores: mentores || [] }, { headers: NO_CACHE })
}
