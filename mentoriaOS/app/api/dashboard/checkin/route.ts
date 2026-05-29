import { createClient } from "@supabase/supabase-js"

// Server-side: usa service role (ignora RLS) para carregar o checkin mais recente.
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mentoradoId = searchParams.get("mentoradoId")

  if (!mentoradoId) {
    return Response.json({ error: "mentoradoId obrigatório" }, { status: 400, headers: NO_CACHE })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  })

  // Últimos 8 check-ins (mais recente primeiro): [0] = atual, resto = histórico p/ comparação.
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("mentorado_id", mentoradoId)
    .order("data_envio", { ascending: false })
    .limit(8)

  if (error) {
    return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  }

  return Response.json(
    {
      checkin: data && data.length > 0 ? data[0] : null,
      historico: data || [],
    },
    { headers: NO_CACHE }
  )
}
