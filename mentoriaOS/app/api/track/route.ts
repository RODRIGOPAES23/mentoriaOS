import { adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

/**
 * POST /api/track — registra um pageview (analytics próprio do super-admin).
 * Geo vem dos headers da Vercel (sem cookies de rastreio). Escreve via service
 * role (a tabela tem RLS sem policies públicas).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const h = req.headers
    const country = h.get("x-vercel-ip-country") || null
    const city = decodeURIComponent(h.get("x-vercel-ip-city") || "") || null
    const region = h.get("x-vercel-ip-country-region") || null
    const ua = h.get("user-agent") || ""
    const device = /mobile/i.test(ua) ? "mobile" : /tablet|ipad/i.test(ua) ? "tablet" : "desktop"

    const path = typeof body.path === "string" ? body.path.slice(0, 300) : null
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 300) : null
    const session_id = typeof body.session_id === "string" ? body.session_id.slice(0, 64) : null
    const lang = typeof body.lang === "string" ? body.lang.slice(0, 8) : null
    const logged_in = !!body.logged_in

    const sb = adminClient()
    await sb.from("site_visits").insert({ path, referrer, country, city, region, device, lang, session_id, logged_in })

    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return Response.json({ ok: false }, { status: 200 }) // nunca quebra a navegação
  }
}
