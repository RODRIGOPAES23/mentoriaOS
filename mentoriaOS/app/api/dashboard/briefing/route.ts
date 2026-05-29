import { createClient } from "@supabase/supabase-js"
import { gerarBriefingIA } from "@/lib/briefing-ia"

// Gera o briefing inteligente (Gemini Flash via OpenRouter) para um check-in.
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400, headers: NO_CACHE })
  }

  const { mentoradoId, checkinId } = body
  if (!mentoradoId || !checkinId) {
    return Response.json({ error: "mentoradoId e checkinId obrigatórios" }, { status: 400, headers: NO_CACHE })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const [{ data: mentorado }, { data: checkin }] = await Promise.all([
    supabase.from("mentorados").select("nome, nicho, foco_macro").eq("id", mentoradoId).single(),
    supabase.from("checkins").select("*").eq("id", checkinId).single(),
  ])

  if (!mentorado || !checkin) {
    return Response.json({ error: "Dados não encontrados" }, { status: 404, headers: NO_CACHE })
  }

  try {
    const briefing = await gerarBriefingIA(mentorado as any, checkin as any)
    return Response.json({ briefing }, { headers: NO_CACHE })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 502, headers: NO_CACHE })
  }
}
