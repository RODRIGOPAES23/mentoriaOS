import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

    // BLOCO 1: Pendências financeiras (24h, 2 dias, 3 dias)
    const { data: financeiro } = await supabaseAdmin
      .from("v_financeiro_resumo")
      .select("*")
      .eq("mentor_id", mentorId)
      .single()

    // BLOCO 2: Mentorados ativos + renovações próximas 30/60 dias
    const today = new Date()
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

    const alunoMaisAtrasado = progresso?.reduce((prev, curr) => {
      return (curr.tarefas_atrasadas || 0) > (prev.tarefas_atrasadas || 0) ? curr : prev
    })

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
