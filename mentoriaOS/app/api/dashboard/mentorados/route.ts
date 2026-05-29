import { adminClient } from "@/lib/supabase-server"
import { getAuthContext, authError } from "@/lib/auth-helper"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function GET() {
  try {
    const { supabase, mentorId } = await getAuthContext()

    const { data, error } = await supabase
      .from("mentorados")
      .select("id, nome, nicho, status, foco_macro, data_inicio, foto_url")
      .eq("mentor_id", mentorId)
      .eq("status", "Ativo")
      .order("nome")

    if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })

    // Dedupe por nome, preferindo o que tem checkin
    const { data: checkRows } = await supabase
      .from("checkins")
      .select("mentorado_id")
    const comCheckin = new Set((checkRows || []).map(c => c.mentorado_id))

    const porNome = new Map<string, (typeof data)[number]>()
    for (const m of data || []) {
      const key = (m.nome || "").trim().toLowerCase()
      const atual = porNome.get(key)
      if (!atual) {
        porNome.set(key, m)
      } else if (!comCheckin.has(atual.id) && comCheckin.has(m.id)) {
        porNome.set(key, m)
      }
    }

    const unique = Array.from(porNome.values()).sort((a, b) => {
      const da = comCheckin.has(a.id) ? 0 : 1
      const db = comCheckin.has(b.id) ? 0 : 1
      if (da !== db) return da - db
      return (a.nome || "").localeCompare(b.nome || "")
    })

    return Response.json({ mentorados: unique }, { headers: NO_CACHE })
  } catch (e) {
    return authError(e)
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, mentorId } = await getAuthContext()

    let body: any
    try { body = await request.json() }
    catch { return Response.json({ error: "Body inválido" }, { status: 400 }) }

    const nome = String(body.nome || "").trim()
    if (!nome) return Response.json({ error: "Nome é obrigatório" }, { status: 400 })

    const { data, error } = await supabase
      .from("mentorados")
      .insert({
        nome,
        nicho: String(body.nicho || "").trim() || "Geral",
        foco_macro: String(body.foco_macro || "").trim() || "Definir foco",
        status: "Ativo",
        data_inicio: body.data_inicio || new Date().toISOString().slice(0, 10),
        mentor_id: mentorId,
      })
      .select("id, nome, nicho, status, foco_macro, data_inicio")
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ success: true, mentorado: data })
  } catch (e) {
    return authError(e)
  }
}
