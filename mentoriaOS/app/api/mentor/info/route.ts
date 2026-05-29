import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    const { data: mentor } = await supabase
      .from("mentors")
      .select("nome, nicho_foco, metodo_trabalho, filosofia")
      .limit(1)
      .single()

    return Response.json({ mentor }, { headers: NO_CACHE })
  } catch (e) {
    // Se não houver mentor, retorna null
    return Response.json({ mentor: null }, { headers: NO_CACHE })
  }
}
