import { adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

/**
 * GET /api/empresa?slug=termolaser
 * Resolve a empresa (white label) por slug — branding + config.
 */
export async function GET(request: Request) {
  const supabase = adminClient()
  const url = new URL(request.url)
  const slug = (url.searchParams.get("slug") || "").trim().toLowerCase()

  if (!slug) return Response.json({ error: "slug obrigatório" }, { status: 400, headers: NO_CACHE })

  const { data: empresa, error } = await supabase
    .from("empresas")
    .select("id, slug, nome, logo_url, cor_primaria, cor_secundaria, esconder_marca, ativo")
    .eq("slug", slug)
    .eq("ativo", true)
    .single()

  if (error || !empresa) {
    return Response.json({ error: "Empresa não encontrada" }, { status: 404, headers: NO_CACHE })
  }

  return Response.json({ empresa }, { headers: NO_CACHE })
}
