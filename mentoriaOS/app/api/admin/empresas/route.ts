import { adminClient } from "@/lib/supabase-server"
import { isAdminAuthorized, adminUnauthorized } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "").slice(0, 40)
}

// POST /api/admin/empresas → cria nova empresa (cliente white-label)
export async function POST(req: Request) {
  if (!(await isAdminAuthorized(req))) return adminUnauthorized()
  let body: any
  try { body = await req.json() } catch { return Response.json({ error: "Body inválido" }, { status: 400 }) }

  const nome = String(body.nome || "").trim()
  if (!nome) return Response.json({ error: "Nome obrigatório" }, { status: 400, headers: NO_CACHE })
  const slug = slugify(body.slug || nome)
  if (!slug) return Response.json({ error: "Slug inválido" }, { status: 400, headers: NO_CACHE })

  const sb = adminClient()

  // slug único
  const { data: existe } = await sb.from("empresas").select("id").eq("slug", slug).maybeSingle()
  if (existe) return Response.json({ error: `Slug "${slug}" já existe` }, { status: 409, headers: NO_CACHE })

  const { data, error } = await sb.from("empresas").insert({
    nome,
    slug,
    cor_primaria: body.cor_primaria || "#00d68f",
    cor_secundaria: body.cor_secundaria || "#0f2540",
    logo_url: body.logo_url || null,
    dominio_proprio: body.dominio_proprio || null,
    nicho_foco: body.nicho_foco || null,
    esconder_marca: body.esconder_marca ?? false,
    ativo: true,
  }).select().single()

  if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  return Response.json({ success: true, empresa: data }, { headers: NO_CACHE })
}
