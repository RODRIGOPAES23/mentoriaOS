import { NextRequest, NextResponse } from "next/server"

import { createClient } from "@supabase/supabase-js"
import { mentorAutorizado, naoAutorizado } from "@/lib/auth-guards"

export const dynamic = "force-dynamic"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mentorId = searchParams.get("mentor_id")

    if (!mentorId) {
      return NextResponse.json(
        { error: "mentor_id é obrigatório" },
        { status: 400 }
      )
    }

    if (!(await mentorAutorizado(mentorId))) return naoAutorizado()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    const in60Days = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)

    const { data: mentorados } = await supabaseAdmin
      .from("mentorados")
      .select(
        "id, nome, foto_url, status, data_fim, faturamento_atual, meta_faturamento, data_ultima_call, data_proxima_call"
      )
      .eq("mentor_id", mentorId)
      .eq("status", "Ativo")
      .order("data_fim", { ascending: true })

    // BLOCO 1: Pendências financeiras NOMINAIS (quem paga, quanto, em quantos dias)
    const nomeDe = (id: string) => mentorados?.find(m => m.id === id)?.nome || "—"
    const { data: pagamentos } = await supabaseAdmin
      .from("pagamentos")
      .select("id, mentorado_id, valor, data_vencimento, status")
      .eq("mentor_id", mentorId)
      .neq("status", "pago")
      .order("data_vencimento", { ascending: true })

    const diasAte = (d: string | null) => {
      if (!d) return null
      const [y, mo, dd] = d.split("T")[0].split("-").map(Number)
      return Math.ceil((new Date(y, mo - 1, dd).getTime() - today.getTime()) / 86400000)
    }
    const aReceber = (pagamentos || []).map(p => ({
      id: p.id, mentorado_id: p.mentorado_id, nome: nomeDe(p.mentorado_id),
      valor: Number(p.valor || 0), dias: diasAte(p.data_vencimento), vencido: (diasAte(p.data_vencimento) ?? 99) < 0,
    }))
    const financeiro = {
      vence_24h: aReceber.filter(p => p.dias === 0 || p.dias === 1).reduce((s, p) => s + p.valor, 0),
      vence_2_dias: aReceber.filter(p => p.dias === 2).reduce((s, p) => s + p.valor, 0),
      vence_3_dias: aReceber.filter(p => p.dias === 3).reduce((s, p) => s + p.valor, 0),
      total_pendente: aReceber.reduce((s, p) => s + p.valor, 0),
      // lista nominal: só os próximos 7 dias + vencidos (o que o mentor precisa cobrar)
      proximos: aReceber.filter(p => (p.dias ?? 99) <= 7).slice(0, 8),
      vencidos: aReceber.filter(p => p.vencido),
    }

    const mentoradosComRenovacao = {
      total: mentorados?.length || 0,
      prox_30_dias: mentorados?.filter(
        (m) => m.data_fim && new Date(m.data_fim) <= in30Days && new Date(m.data_fim) >= today
      ) || [],
      prox_60_dias: mentorados?.filter(
        (m) => m.data_fim && new Date(m.data_fim) > in30Days && new Date(m.data_fim) <= in60Days
      ) || [],
      ultimo_mes: mentorados?.filter((m) => {
        if (!m.data_fim) return false
        const diffDays = Math.ceil(
          (new Date(m.data_fim).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
        return diffDays <= 30 && diffDays > 0
      }) || [],
    }

    // BLOCO 3: Progresso de tarefas + aluno mais atrasado
    const { data: progresso } = await supabaseAdmin
      .from("v_progresso_tarefas_mentorado")
      .select("*")
      .in(
        "mentorado_id",
        mentorados?.map((m) => m.id) || []
      )

    const alunoMaisAtrasado = progresso && progresso.length > 0
      ? progresso.reduce((prev, curr) =>
          (curr.tarefas_atrasadas || 0) > (prev.tarefas_atrasadas || 0) ? curr : prev
        )
      : null

    // BLOCO 4: Calendário de calls futuras
    const { data: calls } = await supabaseAdmin
      .from("sessoes")
      .select("id, mentorado_id, data_hora, titulo, status")
      .eq("mentor_id", mentorId)
      .gte("data_hora", new Date().toISOString())
      .eq("status", "agendada")
      .order("data_hora", { ascending: true })
      .limit(10)

    // Enriquecer calls com nome do mentorado
    const callsComMentorado = calls?.map((call) => {
      const mentorado = mentorados?.find((m) => m.id === call.mentorado_id)
      return {
        ...call,
        mentorado_nome: mentorado?.nome,
      }
    })

    return NextResponse.json(
      {
        success: true,
        blocos: {
          bloco1_financeiro: financeiro || {
            vence_24h: 0,
            vence_2_dias: 0,
            vence_3_dias: 0,
            total_pendente: 0,
          },
          bloco2_mentorados: mentoradosComRenovacao,
          bloco3_progresso: {
            alunoMaisAtrasado,
            progresoGeral: progresso,
          },
          bloco4_calls: callsComMentorado || [],
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro no dashboard mentor:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
