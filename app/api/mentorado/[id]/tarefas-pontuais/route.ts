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

    // Buscar tarefas pontuais ativas
    const { data: tarefas, error: tarefasError } = await supabaseAdmin
      .from("tarefas_pontuais")
      .select(
        `
        id, titulo, descricao, data_vencimento, status, data_criacao,
        tarefas_pontuais_subtarefas (
          id, descricao, ordem, status, validado_por, data_validacao, observacao_validacao
        )
      `
      )
      .eq("mentorado_id", mentoradoId)
      .neq("status", "cancelada")
      .order("data_criacao", { ascending: false })

    if (tarefasError) {
      return NextResponse.json({ error: tarefasError.message }, { status: 500 })
    }

    // Calcular progresso de cada tarefa
    const tarefasComProgresso = tarefas?.map((tarefa: any) => {
      const subtarefas = tarefa.tarefas_pontuais_subtarefas || []
      const validadas = subtarefas.filter(
        (s: any) => s.status === "validado"
      ).length
      const total = subtarefas.length

      return {
        ...tarefa,
        progresso: total > 0 ? Math.round((validadas / total) * 100) : 0,
        subtarefas_validadas: validadas,
        subtarefas_total: total,
      }
    })

    return NextResponse.json(
      {
        success: true,
        tarefas: tarefasComProgresso || [],
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao buscar tarefas pontuais:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mentoradoId = params.id
    const body = await request.json()
    const { titulo, descricao, data_vencimento, mentor_id, subtarefas } = body

    if (!titulo || !mentor_id) {
      return NextResponse.json(
        { error: "titulo e mentor_id são obrigatórios" },
        { status: 400 }
      )
    }

    // Criar tarefa pontual
    const { data: tarefa, error: tarefaError } = await supabaseAdmin
      .from("tarefas_pontuais")
      .insert({
        mentorado_id,
        mentor_id,
        titulo,
        descricao,
        data_vencimento,
        status: "ativa",
        criado_por: mentor_id,
      })
      .select()
      .single()

    if (tarefaError) {
      return NextResponse.json({ error: tarefaError.message }, { status: 500 })
    }

    // Criar subtarefas se fornecidas
    let subtarefasCriadas = []
    if (subtarefas && Array.isArray(subtarefas)) {
      const { data: subs, error: subsError } = await supabaseAdmin
        .from("tarefas_pontuais_subtarefas")
        .insert(
          subtarefas.map((sub: any, idx: number) => ({
            tarefa_pontual_id: tarefa.id,
            descricao: sub,
            ordem: idx,
            status: "pending",
          }))
        )
        .select()

      if (!subsError) {
        subtarefasCriadas = subs || []
      }
    }

    return NextResponse.json(
      {
        success: true,
        tarefa: {
          ...tarefa,
          tarefas_pontuais_subtarefas: subtarefasCriadas,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao criar tarefa pontual:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
