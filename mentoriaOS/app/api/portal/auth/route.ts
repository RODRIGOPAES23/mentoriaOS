import { adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

// GET /api/portal/auth?codigo=XXXX → valida código e retorna dados do mentorado + mentor
export async function GET(request: Request) {
  const supabase = adminClient()
  const url = new URL(request.url)
  const codigo = (url.searchParams.get("codigo") || "").trim().toUpperCase()

  if (!codigo) return Response.json({ error: "Código obrigatório" }, { status: 400, headers: NO_CACHE })

  const { data: mentorado, error } = await supabase
    .from("mentorados")
    .select("id, nome, nicho, foco_macro, meta_atual, data_inicio, data_fim, foto_url, mentor_id, status")
    .eq("codigo_acesso", codigo)
    .single()

  if (error || !mentorado) {
    return Response.json({ error: "Código inválido. Verifique com seu mentor." }, { status: 404, headers: NO_CACHE })
  }

  // Dados do mentor (nome + foto para o portal)
  const { data: mentor } = await supabase
    .from("mentors")
    .select("id, nome, foto_url, nicho_foco")
    .eq("id", mentorado.mentor_id)
    .single()

  return Response.json({
    mentorado,
    mentor: mentor || null,
  }, { headers: NO_CACHE })
}
