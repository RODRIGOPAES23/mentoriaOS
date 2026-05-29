import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: mentores, error } = await supabase
    .from("mentors")
    .select("id, nome, nicho_foco")
    .order("nome", { ascending: true })

  if (error) {
    return Response.json({ mentores: [], error: error.message }, { headers: NO_CACHE })
  }

  return Response.json({ mentores: mentores || [] }, { headers: NO_CACHE })
}
