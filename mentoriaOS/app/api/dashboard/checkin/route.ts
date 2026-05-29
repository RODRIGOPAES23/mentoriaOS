import { createClient } from "@supabase/supabase-js"

// Server-side: usa service role (ignora RLS) para carregar o checkin mais recente.
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mentoradoId = searchParams.get("mentoradoId")

  if (!mentoradoId) {
    return Response.json({ error: "mentoradoId obrigatório" }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  })

  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("mentorado_id", mentoradoId)
    .order("data_envio", { ascending: false })
    .limit(1)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ checkin: data && data.length > 0 ? data[0] : null })
}
