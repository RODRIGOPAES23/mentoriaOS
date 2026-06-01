import { adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

/**
 * GET /api/dashboard/acao?mentorId=X
 * Dashboard de Ação (admin): agrega a EMPRESA inteira, priorizado por urgência.
 *  - urgencias: contadores acionáveis (vencidas / a vencer financeiro / calls hoje)
 *  - atencao: lista de mentorados ordenada por SCORE de urgência combinada
 *  - agendaHoje: calls de hoje + próximas
 *  - pulso: stats macro da empresa
 *
 * SCORE de urgência combinada por mentorado:
 *   vencidas*10  +  (paga em ≤3d)*8  +  (progresso<40%)*5  +  (último mês)*6
 */
export async function GET(request: Request) {
  const supabase = adminClient()
  const url = new URL(request.url)
  const mentorId = url.searchParams.get("mentorId")
  if (!mentorId) return Response.json({ error: "mentorId obrigatório" }, { status: 400, headers: NO_CACHE })

  // Quem pede + empresa
  const { data: solicitante } = await supabase
    .from("mentors").select("id, role, empresa_id").eq("id", mentorId).single()
  if (!solicitante?.empresa_id) return Response.json({ error: "Mentor sem empresa" }, { status: 404, headers: NO_CACHE })

  const empresaId = solicitante.empresa_id

  // Mentores da empresa
  const { data: mentores } = await supabase
    .from("mentors").select("id, nome, foto_url, role").eq("empresa_id", empresaId)
  const mentorIds = (mentores || []).map(m => m.id)
  const mentorNome: Record<string, string> = {}
  for (const m of mentores || []) mentorNome[m.id] = m.nome

  // Mentorados ativos de TODOS os mentores
  let mentorados: any[] = []
  if (mentorIds.length > 0) {
    const { data } = await supabase
      .from("mentorados")
      .select("id, nome, nicho, foto_url, mentor_id, data_fim")
      .in("mentor_id", mentorIds).eq("status", "Ativo")
    mentorados = data || []
  }
  const mentoradoIds = mentorados.map(m => m.id)

  // Tarefas (progresso + vencidas)
  let tarefas: any[] = []
  if (mentoradoIds.length > 0) {
    const { data } = await supabase
      .from("tarefas").select("mentorado_id, status, data_vencimento").in("mentorado_id", mentoradoIds)
    tarefas = data || []
  }

  // Pagamentos pendentes (financeiro)
  let pagamentos: any[] = []
  if (mentoradoIds.length > 0) {
    const { data } = await supabase
      .from("pagamentos")
      .select("mentorado_id, valor, data_vencimento, status")
      .in("mentorado_id", mentoradoIds).neq("status", "pago")
    pagamentos = data || []
  }

  // Sessões futuras (agenda)
  const agora = new Date()
  const { data: sessoes } = await supabase
    .from("sessoes")
    .select("id, mentorado_id, data_hora, titulo, link_call")
    .eq("mentor_id", mentorId)   // admin pode estender depois; por ora as do mentor
    .gte("data_hora", agora.toISOString())
    .eq("status", "agendada")
    .order("data_hora", { ascending: true })
    .limit(8)

  // Helpers de data
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const diasAte = (d: string | null) => {
    if (!d) return null
    const [y, mo, dd] = d.split("T")[0].split("-").map(Number)
    return Math.ceil((new Date(y, mo - 1, dd).getTime() - hoje.getTime()) / 86400000)
  }

  // ── Enriquecer + SCORE de urgência ──────────────────────────────────────
  const lista = mentorados.map(mo => {
    const ts = tarefas.filter(t => t.mentorado_id === mo.id)
    const total = ts.length
    const concluidas = ts.filter(t => t.status === "completed").length
    const vencidas = ts.filter(t => t.status === "pending" && (diasAte(t.data_vencimento) ?? 99) < 0).length
    const progresso = total > 0 ? Math.round((concluidas / total) * 100) : 0

    const pgs = pagamentos.filter(p => p.mentorado_id === mo.id)
    const pagaEmDias = pgs.map(p => diasAte(p.data_vencimento)).filter(d => d !== null && d >= 0).sort((a: any, b: any) => a - b)[0]
    const valorPendente = pgs.reduce((s, p) => s + Number(p.valor || 0), 0)
    const pagaLogo = pagaEmDias !== undefined && pagaEmDias <= 3

    const diasRestantesMentoria = diasAte(mo.data_fim)
    const ultimoMes = diasRestantesMentoria !== null && diasRestantesMentoria >= 0 && diasRestantesMentoria <= 30

    const score =
      vencidas * 10 +
      (pagaLogo ? 8 : 0) +
      (progresso < 40 ? 5 : 0) +
      (ultimoMes ? 6 : 0)

    // motivos legíveis (chips na linha)
    const motivos: string[] = []
    if (vencidas > 0) motivos.push(`${vencidas} atrasada${vencidas > 1 ? "s" : ""}`)
    if (pagaLogo) motivos.push(pagaEmDias === 0 ? "paga hoje" : `paga em ${pagaEmDias}d`)
    if (progresso < 40) motivos.push(`${progresso}% progresso`)
    if (ultimoMes) motivos.push("último mês")

    return {
      id: mo.id, nome: mo.nome, nicho: mo.nicho, foto_url: mo.foto_url,
      mentor_nome: mentorNome[mo.mentor_id] || "—",
      progresso, vencidas, valorPendente, diasRestantesMentoria,
      score, motivos,
    }
  })

  // Lista de atenção = score > 0, ordenada desc
  const atencao = lista.filter(m => m.score > 0).sort((a, b) => b.score - a.score)

  // ── Urgências (contadores acionáveis) ───────────────────────────────────
  const totalVencidas = lista.reduce((s, m) => s + m.vencidas, 0)
  const financeiroAVencer = pagamentos
    .filter(p => { const d = diasAte(p.data_vencimento); return d !== null && d >= 0 && d <= 3 })
    .reduce((s, p) => s + Number(p.valor || 0), 0)
  const callsHoje = (sessoes || []).filter(s => diasAte(s.data_hora) === 0)

  // Agenda enriquecida com nome
  const agenda = (sessoes || []).map(s => ({
    ...s,
    mentorado_nome: mentorados.find(m => m.id === s.mentorado_id)?.nome || "—",
    hoje: diasAte(s.data_hora) === 0,
  }))

  // ── Pulso da empresa ────────────────────────────────────────────────────
  const progressoMedio = lista.length > 0
    ? Math.round(lista.reduce((s, m) => s + m.progresso, 0) / lista.length) : 0
  const totalPendenteGeral = pagamentos.reduce((s, p) => s + Number(p.valor || 0), 0)

  return Response.json({
    urgencias: {
      vencidas: totalVencidas,
      financeiro_a_vencer: financeiroAVencer,
      calls_hoje: callsHoje.length,
    },
    atencao,
    agenda,
    pulso: {
      total_mentorados: mentorados.length,
      total_mentores: (mentores || []).length,
      progresso_medio: progressoMedio,
      total_pendente: totalPendenteGeral,
    },
  }, { headers: NO_CACHE })
}
