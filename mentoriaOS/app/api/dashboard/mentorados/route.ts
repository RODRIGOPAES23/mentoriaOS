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
    .select("id, nome, nicho, status, foco_macro, data_inicio, data_fim, cidade, faturamento_atual, meta_faturamento, foto_url, ordem, codigo_acesso, instagram_handle, expectativa_30_dias, expectativa_90_dias")
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

  // Enriquecer com datas de call (automático das sessões)
  const ids = unique.map(m => m.id)
  if (ids.length > 0) {
    const agoraIso = new Date().toISOString()
    const { data: sessoes } = await supabase
      .from("sessoes")
      .select("mentorado_id, data_hora, status")
      .in("mentorado_id", ids)
    const ultimaCall: Record<string, string> = {}
    const proximaCall: Record<string, string> = {}
    for (const s of sessoes || []) {
      if (s.data_hora < agoraIso) {
        if (!ultimaCall[s.mentorado_id] || s.data_hora > ultimaCall[s.mentorado_id]) ultimaCall[s.mentorado_id] = s.data_hora
      } else if (s.status === "agendada") {
        if (!proximaCall[s.mentorado_id] || s.data_hora < proximaCall[s.mentorado_id]) proximaCall[s.mentorado_id] = s.data_hora
      }
    }
    for (const m of unique as any[]) {
      m.data_ultima_call = ultimaCall[m.id] || null
      m.data_proxima_call = proximaCall[m.id] || null
    }
  }

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

  // Campos expandidos v7 (cadastro completo) — passados só se presentes
  const camposExpandidos = [
    "email", "cel", "contato_emergencia", "tempo_mercado", "formacao",
    "tem_clinica", "experiencia_mentoria", "experiencia_trafego", "experiencia_agencia_mkt",
    "expectativa_30_dias", "expectativa_90_dias", "expectativa_6_meses", "expectativa_12_meses",
    "faturamento_medio_3m", "atua_trafego", "investimento_trafego_mensal", "tem_vendedora_time",
    "instagram_handle", "cidade", "data_fim",
  ]
  for (const k of camposExpandidos) {
    if (body[k] !== undefined && body[k] !== "" && body[k] !== null) insertData[k] = body[k]
  }

  const { data, error } = await supabase
    .from("mentorados")
    .insert(insertData)
    .select("id, nome, nicho, status, foco_macro, data_inicio, codigo_acesso")
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true, mentorado: data })
}
