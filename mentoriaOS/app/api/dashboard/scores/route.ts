import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { mentorAutorizado, naoAutorizado } from "@/lib/auth-guards"

export const dynamic = "force-dynamic"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/dashboard/scores?mentor_id=X
 *
 * Substitui N×2 chamadas paralelas de tarefas+pagamentos por mentorado.
 * Faz 2 queries no banco (todos os mentorados do mentor de uma vez)
 * e calcula o Score de Urgência server-side.
 *
 * Score = vencidas*10 + pagaLogo*8 + (progresso<40)*5 + ultimoMes*6
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mentorId = searchParams.get("mentor_id")

  if (!mentorId) return NextResponse.json({ error: "mentor_id obrigatório" }, { status: 400 })
  if (!(await mentorAutorizado(mentorId))) return naoAutorizado()

  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)

  // 1. Buscar todos os mentorados ativos do mentor (para saber data_fim)
  const { data: mentorados } = await supabaseAdmin
    .from("mentorados")
    .select("id, data_fim")
    .eq("mentor_id", mentorId)
    .eq("status", "Ativo")

  if (!mentorados || mentorados.length === 0) {
    return NextResponse.json({ scores: {}, tarefasVencidas: 0 })
  }

  const ids = mentorados.map(m => m.id)

  // 2. UMA query para todas as tarefas pendentes dos mentorados
  const { data: tarefas } = await supabaseAdmin
    .from("tarefas")
    .select("mentorado_id, status, data_vencimento")
    .in("mentorado_id", ids)

  // 3. UMA query para todos os pagamentos não pagos
  const { data: pagamentos } = await supabaseAdmin
    .from("pagamentos")
    .select("mentorado_id, status, data_vencimento")
    .in("mentorado_id", ids)
    .neq("status", "pago")

  // Agrupar por mentorado
  const tarefasMap: Record<string, typeof tarefas> = {}
  const pagamentosMap: Record<string, typeof pagamentos> = {}

  for (const t of tarefas || []) {
    if (!tarefasMap[t.mentorado_id]) tarefasMap[t.mentorado_id] = []
    tarefasMap[t.mentorado_id]!.push(t)
  }
  for (const p of pagamentos || []) {
    if (!pagamentosMap[p.mentorado_id]) pagamentosMap[p.mentorado_id] = []
    pagamentosMap[p.mentorado_id]!.push(p)
  }

  const diasAte = (d: string | null) => {
    if (!d) return null
    const [y, mo, dd] = d.split("T")[0].split("-").map(Number)
    return Math.ceil((new Date(y, mo - 1, dd).getTime() - hoje.getTime()) / 86400000)
  }

  const scores: Record<string, number> = {}
  let tarefasVencidas = 0

  for (const m of mentorados) {
    const mTarefas = tarefasMap[m.id] || []
    const mPagamentos = pagamentosMap[m.id] || []

    const pendentes = mTarefas.filter(t => t.status === "pending")
    const vencidas = pendentes.filter(t => {
      if (!t.data_vencimento) return false
      const d = diasAte(t.data_vencimento)
      return d !== null && d < 0
    }).length

    const total = mTarefas.length
    const concluidas = total - pendentes.length
    const progresso = total > 0 ? (concluidas / total) * 100 : 100

    const pagaLogo = mPagamentos.some(p => {
      const d = diasAte(p.data_vencimento)
      return d !== null && d <= 3
    }) ? 1 : 0

    const d = diasAte(m.data_fim)
    const ultimoMes = (d !== null && d <= 30 && d > 0) ? 1 : 0

    scores[m.id] = vencidas * 10 + pagaLogo * 8 + (progresso < 40 ? 1 : 0) * 5 + ultimoMes * 6
    tarefasVencidas += vencidas
  }

  return NextResponse.json({ scores, tarefasVencidas })
}
