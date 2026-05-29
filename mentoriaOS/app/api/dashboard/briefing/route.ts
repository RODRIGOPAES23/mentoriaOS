import { adminClient } from "@/lib/supabase-server"
import { gerarBriefingIA } from "@/lib/briefing-ia"

/**
 * POST /api/dashboard/briefing
 *
 * Fluxo com persistência:
 *   1. Busca o checkin — se já tem briefing_ia salvo, devolve direto (0 tokens)
 *   2. Se não tem → gera via Gemini Flash, salva no banco, devolve
 *
 * O cache in-memory (useRef no cliente) foi REMOVIDO.
 * A fonte da verdade agora é checkins.briefing_ia (JSONB).
 */
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function POST(request: Request) {
  let body: any
  try { body = await request.json() }
  catch { return Response.json({ error: "Body inválido" }, { status: 400, headers: NO_CACHE }) }

  const { mentoradoId, checkinId } = body
  if (!mentoradoId || !checkinId) {
    return Response.json({ error: "mentoradoId e checkinId obrigatórios" }, { status: 400, headers: NO_CACHE })
  }

  const supabase = adminClient()

  // ── 1. Buscar checkin — verificar se briefing já está persistido ──────────
  const { data: checkinRow } = await supabase
    .from("checkins")
    .select("briefing_ia")
    .eq("id", checkinId)
    .single()

  if (checkinRow?.briefing_ia) {
    // Cache hit no banco — zero chamadas para IA
    return Response.json({ briefing: checkinRow.briefing_ia, cached: true }, { headers: NO_CACHE })
  }

  // ── 2. Cache miss → buscar dados necessários e gerar via IA ──────────────
  const [{ data: mentorado }, { data: historico }, { data: mentores }] = await Promise.all([
    supabase.from("mentorados").select("nome, nicho, foco_macro").eq("id", mentoradoId).single(),
    supabase
      .from("checkins")
      .select("*")
      .eq("mentorado_id", mentoradoId)
      .order("data_envio", { ascending: false })
      .limit(8),
    supabase.from("mentors").select("nome, metodo_trabalho, filosofia, nicho_foco").limit(1),
  ])

  if (!mentorado || !historico || historico.length === 0) {
    return Response.json({ error: "Dados não encontrados" }, { status: 404, headers: NO_CACHE })
  }

  try {
    const mentor = mentores?.[0] || null
    const briefing = await gerarBriefingIA(mentorado as any, historico as any, mentor as any)

    // ── 3. Persistir no banco para próximas requisições ───────────────────
    await supabase
      .from("checkins")
      .update({ briefing_ia: briefing })
      .eq("id", checkinId)

    return Response.json({ briefing, cached: false }, { headers: NO_CACHE })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 502, headers: NO_CACHE })
  }
}
