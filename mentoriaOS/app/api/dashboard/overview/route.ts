import { adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

/**
 * GET /api/dashboard/overview?mentorId=X[&mentoradoId=Y]
 *
 * Agrega dados REAIS para a tela "Visão Geral" do CKlareza:
 *  - proximaSessao: próxima sessão agendada do mentor
 *  - progresso: % de tarefas concluídas (do mentorado em foco ou geral)
 *  - meta: meta_atual ou foco_macro do mentorado em foco
 *  - insights: do briefing_ia mais recente (real, gerado pela IA)
 *  - mentorados: lista com status de prontidão calculado
 */
export async function GET(request: Request) {
  const supabase = adminClient()
  const url = new URL(request.url)
  const mentorId = url.searchParams.get("mentorId")
  const focoId = url.searchParams.get("mentoradoId")

  if (!mentorId) return Response.json({ error: "mentorId obrigatório" }, { status: 400, headers: NO_CACHE })

  // ── Mentorados do mentor ──────────────────────────────────────────────
  const { data: mentorados } = await supabase
    .from("mentorados")
    .select("id, nome, nicho, foco_macro, meta_atual, data_inicio, data_fim, foto_url, status, ordem")
    .eq("mentor_id", mentorId)
    .eq("status", "Ativo")
    .order("ordem", { ascending: true })

  const ids = (mentorados || []).map(m => m.id)

  // ── Tarefas de todos (para progresso e status) ────────────────────────
  let tarefas: any[] = []
  if (ids.length > 0) {
    const { data } = await supabase
      .from("tarefas")
      .select("id, mentorado_id, status, data_vencimento")
      .in("mentorado_id", ids)
    tarefas = data || []
  }

  // ── Próximas sessões ──────────────────────────────────────────────────
  const { data: sessoesRaw } = await supabase
    .from("sessoes")
    .select("id, titulo, data_hora, duracao_min, mentorado_id, link_call")
    .eq("mentor_id", mentorId)
    .eq("status", "agendada")
    .gte("data_hora", new Date().toISOString())
    .order("data_hora", { ascending: true })
    .limit(5)

  const sessoesPorMentorado: Record<string, any> = {}
  for (const s of sessoesRaw || []) {
    if (!sessoesPorMentorado[s.mentorado_id]) sessoesPorMentorado[s.mentorado_id] = s
  }

  // Próxima sessão global (a mais próxima)
  const proximaSessaoRaw = (sessoesRaw || [])[0] || null
  let proximaSessao = null
  if (proximaSessaoRaw) {
    const m = (mentorados || []).find(x => x.id === proximaSessaoRaw.mentorado_id)
    proximaSessao = {
      ...proximaSessaoRaw,
      mentorado_nome: m?.nome || "—",
      mentorado_foto: m?.foto_url || null,
    }
  }

  // ── Hoje (para vencidas) ──────────────────────────────────────────────
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const isVencida = (d: string | null) => {
    if (!d) return false
    const [y, mo, dd] = d.split("T")[0].split("-").map(Number)
    return new Date(y, mo - 1, dd) < hoje
  }

  // ── Monta lista de mentorados com métricas e status ───────────────────
  const lista = (mentorados || []).map(m => {
    const ts = tarefas.filter(t => t.mentorado_id === m.id)
    const total = ts.length
    const concluidas = ts.filter(t => t.status === "completed").length
    const pendentes = ts.filter(t => t.status === "pending").length
    const vencidas = ts.filter(t => t.status === "pending" && isVencida(t.data_vencimento)).length
    const progresso = total > 0 ? Math.round((concluidas / total) * 100) : 0
    const temSessao = !!sessoesPorMentorado[m.id]

    // Status de prontidão
    let statusTag: "pronto" | "pendencias" | "atencao" | "sem_dados"
    if (vencidas > 0) statusTag = "atencao"
    else if (temSessao && pendentes === 0) statusTag = "pronto"
    else if (pendentes > 0) statusTag = "pendencias"
    else statusTag = "sem_dados"

    // dias restantes
    let diasRestantes: number | null = null
    if (m.data_fim) {
      const [y, mo, dd] = m.data_fim.split("T")[0].split("-").map(Number)
      diasRestantes = Math.ceil((new Date(y, mo - 1, dd).getTime() - hoje.getTime()) / 86400000)
    }

    return {
      id: m.id,
      nome: m.nome,
      nicho: m.nicho,
      foto_url: m.foto_url,
      foco_macro: m.foco_macro,
      meta_atual: m.meta_atual,
      progresso,
      total,
      concluidas,
      pendentes,
      vencidas,
      statusTag,
      diasRestantes,
      proximaSessao: sessoesPorMentorado[m.id]
        ? { data_hora: sessoesPorMentorado[m.id].data_hora, titulo: sessoesPorMentorado[m.id].titulo }
        : null,
    }
  })

  // ── Foco: mentorado selecionado ou o primeiro ─────────────────────────
  const foco = lista.find(x => x.id === focoId) || lista[0] || null

  // ── Insights reais do briefing_ia do foco ─────────────────────────────
  let insights: string[] = []
  let metaFoco = ""
  if (foco) {
    metaFoco = foco.meta_atual || foco.foco_macro || ""
    const { data: ck } = await supabase
      .from("checkins")
      .select("briefing_ia")
      .eq("mentorado_id", foco.id)
      .not("briefing_ia", "is", null)
      .order("data_envio", { ascending: false })
      .limit(1)
    const brief = ck?.[0]?.briefing_ia as any
    if (brief) {
      if (brief.diagnostico) insights.push(brief.diagnostico)
      if (Array.isArray(brief.pauta)) insights.push(...brief.pauta.slice(0, 3))
      else if (brief.evolucao) insights.push(brief.evolucao)
    }
  }

  // ── Checklist de tarefas concluídas recentes do foco ──────────────────
  let checklist: { texto: string; done: boolean }[] = []
  if (foco) {
    const { data: ts } = await supabase
      .from("tarefas")
      .select("texto, status")
      .eq("mentorado_id", foco.id)
      .order("data_criacao", { ascending: false })
      .limit(6)
    checklist = (ts || []).map(t => ({ texto: t.texto, done: t.status === "completed" }))
  }

  return Response.json({
    proximaSessao,
    foco: foco ? { ...foco, meta: metaFoco, insights, checklist } : null,
    mentorados: lista,
    totalMentorados: lista.length,
    totalSessoesAgendadas: (sessoesRaw || []).length,
  }, { headers: NO_CACHE })
}
