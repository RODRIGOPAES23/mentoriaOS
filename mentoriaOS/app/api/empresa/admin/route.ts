import { adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

/**
 * GET /api/empresa/admin?mentorId=X
 * Visão de ADMIN: agrega TODA a empresa do mentor (se ele for admin).
 *  - dados da empresa (nome, método, filosofia, branding)
 *  - todos os mentores da empresa + contagem de mentorados
 *  - todos os mentorados de todos os mentores
 *  - métricas consolidadas
 */
export async function GET(request: Request) {
  const supabase = adminClient()
  const url = new URL(request.url)
  const mentorId = url.searchParams.get("mentorId")
  if (!mentorId) return Response.json({ error: "mentorId obrigatório" }, { status: 400, headers: NO_CACHE })

  // Quem está pedindo? Precisa ser admin.
  const { data: solicitante } = await supabase
    .from("mentors")
    .select("id, role, empresa_id")
    .eq("id", mentorId)
    .single()

  if (!solicitante?.empresa_id) {
    return Response.json({ error: "Mentor sem empresa" }, { status: 404, headers: NO_CACHE })
  }
  if (solicitante.role !== "admin") {
    return Response.json({ error: "Acesso restrito ao admin da empresa", isAdmin: false }, { status: 403, headers: NO_CACHE })
  }

  const empresaId = solicitante.empresa_id

  // Empresa (com DNA: método + filosofia)
  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, slug, nome, logo_url, cor_primaria, cor_secundaria, nicho_foco, metodo_trabalho, filosofia, esconder_marca, musica_url")
    .eq("id", empresaId)
    .single()

  // Todos os mentores da empresa
  const { data: mentores } = await supabase
    .from("mentors")
    .select("id, nome, nicho_foco, foto_url, role")
    .eq("empresa_id", empresaId)
    .order("role", { ascending: true })
    .order("nome", { ascending: true })

  const mentorIds = (mentores || []).map(m => m.id)

  // Todos os mentorados da empresa (de todos os mentores)
  let mentorados: any[] = []
  if (mentorIds.length > 0) {
    const { data } = await supabase
      .from("mentorados")
      .select("id, nome, nicho, foco_macro, status, foto_url, mentor_id, data_fim, codigo_acesso")
      .in("mentor_id", mentorIds)
      .eq("status", "Ativo")
      .order("nome", { ascending: true })
    mentorados = data || []
  }

  // Tarefas para progresso por mentorado
  const mentoradoIds = mentorados.map(m => m.id)
  let tarefas: any[] = []
  if (mentoradoIds.length > 0) {
    const { data } = await supabase
      .from("tarefas")
      .select("mentorado_id, status, data_vencimento")
      .in("mentorado_id", mentoradoIds)
    tarefas = data || []
  }

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const isVencida = (d: string | null) => {
    if (!d) return false
    const [y, mo, dd] = d.split("T")[0].split("-").map(Number)
    return new Date(y, mo - 1, dd) < hoje
  }

  // Mapa mentor → nome (para exibir o responsável de cada mentorado)
  const mentorNome: Record<string, string> = {}
  for (const m of mentores || []) mentorNome[m.id] = m.nome

  const mentoradosEnriquecidos = mentorados.map(mo => {
    const ts = tarefas.filter(t => t.mentorado_id === mo.id)
    const total = ts.length
    const concluidas = ts.filter(t => t.status === "completed").length
    const vencidas = ts.filter(t => t.status === "pending" && isVencida(t.data_vencimento)).length
    return {
      ...mo,
      mentor_nome: mentorNome[mo.mentor_id] || "—",
      progresso: total > 0 ? Math.round((concluidas / total) * 100) : 0,
      vencidas,
    }
  })

  // Contagem de mentorados por mentor
  const mentoresComContagem = (mentores || []).map(m => ({
    ...m,
    total_mentorados: mentorados.filter(mo => mo.mentor_id === m.id).length,
  }))

  return Response.json({
    isAdmin: true,
    empresa,
    mentores: mentoresComContagem,
    mentorados: mentoradosEnriquecidos,
    stats: {
      total_mentores: (mentores || []).length,
      total_mentorados: mentorados.length,
      total_vencidas: mentoradosEnriquecidos.reduce((s, m) => s + m.vencidas, 0),
    },
  }, { headers: NO_CACHE })
}

// PATCH — admin edita DNA da empresa (método, filosofia, nome, cores)
export async function PATCH(request: Request) {
  const supabase = adminClient()
  let body: any
  try { body = await request.json() }
  catch { return Response.json({ error: "Body inválido" }, { status: 400, headers: NO_CACHE }) }

  const { mentorId } = body
  const { data: solicitante } = await supabase
    .from("mentors").select("role, empresa_id").eq("id", mentorId).single()
  if (solicitante?.role !== "admin") {
    return Response.json({ error: "Acesso restrito ao admin" }, { status: 403, headers: NO_CACHE })
  }

  // Ação: promover/rebaixar mentor (admin ↔ mentor)
  if (body.acao === "set_role" && body.targetMentorId && body.novoRole) {
    if (!["admin", "mentor"].includes(body.novoRole)) {
      return Response.json({ error: "role inválido" }, { status: 400, headers: NO_CACHE })
    }
    // Garante que o alvo é da mesma empresa
    const { data: alvo } = await supabase.from("mentors").select("empresa_id").eq("id", body.targetMentorId).single()
    if (alvo?.empresa_id !== solicitante.empresa_id) {
      return Response.json({ error: "Mentor não pertence à sua empresa" }, { status: 403, headers: NO_CACHE })
    }
    const { error } = await supabase.from("mentors").update({ role: body.novoRole }).eq("id", body.targetMentorId)
    if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
    return Response.json({ success: true }, { headers: NO_CACHE })
  }

  // Edição do DNA / branding da empresa
  const update: any = {}
  for (const k of ["nome", "metodo_trabalho", "filosofia", "nicho_foco", "cor_primaria", "cor_secundaria", "logo_url"]) {
    if (body[k] !== undefined) update[k] = body[k]
  }

  const { error } = await supabase.from("empresas").update(update).eq("id", solicitante.empresa_id)
  if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
  return Response.json({ success: true }, { headers: NO_CACHE })
}
