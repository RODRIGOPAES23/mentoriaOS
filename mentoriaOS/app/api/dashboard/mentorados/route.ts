import { adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

function admin() { return adminClient() }

export async function GET(request: Request) {
  const supabase = admin()
  const url = new URL(request.url)
  const mentorId = url.searchParams.get("mentorId")

  let query = supabase
    .from("mentorados")
    .select("id, nome, nicho, status, foco_macro, data_inicio, data_fim, cidade, faturamento_atual, meta_faturamento, foto_url, ordem, codigo_acesso")
    .eq("status", "Ativo")

  if (mentorId) query = query.eq("mentor_id", mentorId)

  const { data, error } = await query.order("ordem", { ascending: true }).order("nome")
  if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })

  const { data: checkRows } = await supabase.from("checkins").select("mentorado_id")
  const comCheckin = new Set((checkRows || []).map(c => c.mentorado_id))

  const porNome = new Map<string, (typeof data)[number]>()
  for (const m of data || []) {
    const key = (m.nome || "").trim().toLowerCase()
    const atual = porNome.get(key)
    if (!atual) { porNome.set(key, m) }
    else if (!comCheckin.has(atual.id) && comCheckin.has(m.id)) { porNome.set(key, m) }
  }

  const unique = Array.from(porNome.values()).sort((a, b) => {
    const da = comCheckin.has(a.id) ? 0 : 1
    const db = comCheckin.has(b.id) ? 0 : 1
    if (da !== db) return da - db
    return (a.nome || "").localeCompare(b.nome || "")
  })

  return Response.json({ mentorados: unique }, { headers: NO_CACHE })
}

export async function POST(request: Request) {
  let body: any
  try { body = await request.json() }
  catch { return Response.json({ error: "Body inválido" }, { status: 400 }) }

  const nome = String(body.nome || "").trim()
  if (!nome) return Response.json({ error: "Nome é obrigatório" }, { status: 400 })

  const url = new URL(request.url)
  const mentorId = body.mentor_id || url.searchParams.get("mentorId")

  const supabase = admin()
  // Código de acesso único do portal do mentorado (8 chars, sem ambíguos)
  const gerarCodigo = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let c = ""
    for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)]
    return c
  }
  const insertData: any = {
    nome,
    nicho: String(body.nicho || "").trim() || "Geral",
    foco_macro: String(body.foco_macro || "").trim() || "Definir foco",
    status: "Ativo",
    data_inicio: body.data_inicio || new Date().toISOString().slice(0, 10),
    codigo_acesso: gerarCodigo(),
  }
  if (mentorId) insertData.mentor_id = mentorId

  const { data, error } = await supabase
    .from("mentorados")
    .insert(insertData)
    .select("id, nome, nicho, status, foco_macro, data_inicio, codigo_acesso")
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true, mentorado: data })
}
