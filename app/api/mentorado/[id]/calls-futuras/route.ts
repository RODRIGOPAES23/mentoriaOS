import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mentoradoId = params.id

    // Buscar calls futuras ordenadas por data
    const { data: calls, error } = await supabaseAdmin
      .from("sessoes")
      .select(
        `
        id, data_hora, titulo, duracao_min, status, link_call,
        mentors(nome, foto_url)
      `
      )
      .eq("mentorado_id", mentoradoId)
      .gte("data_hora", new Date().toISOString())
      .eq("status", "agendada")
      .order("data_hora", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Formatar para calendário com dias da semana
    const callsFormatadas = calls?.map((call: any) => {
      const data = new Date(call.data_hora)
      const diasSemana = [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
      ]

      return {
        id: call.id,
        data_hora: call.data_hora,
        data_formatada: data.toLocaleDateString("pt-BR"),
        dia_semana: diasSemana[data.getDay()],
        hora: data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        titulo: call.titulo || "Call com mentor",
        duracao_min: call.duracao_min || 60,
        mentor_nome: call.mentors?.nome,
        mentor_foto: call.mentors?.foto_url,
        link_call: call.link_call,
      }
    })

    // Agrupar por mês
    const callsPorMes: { [key: string]: any[] } = {}
    callsFormatadas?.forEach((call: any) => {
      const mesAno = new Date(call.data_hora).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
      if (!callsPorMes[mesAno]) {
        callsPorMes[mesAno] = []
      }
      callsPorMes[mesAno].push(call)
    })

    return NextResponse.json(
      {
        success: true,
        total_calls: callsFormatadas?.length || 0,
        calls: callsFormatadas || [],
        por_mes: callsPorMes,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao buscar calls futuras:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
