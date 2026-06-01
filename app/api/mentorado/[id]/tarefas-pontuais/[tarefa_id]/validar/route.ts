import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; tarefa_id: string } }
) {
  try {
    const body = await request.json()
    const {
      subtarefa_id,
      novo_status,
      mentor_id,
      observacao_validacao,
    } = body

    if (!subtarefa_id || !novo_status || !mentor_id) {
      return NextResponse.json(
        {
          error:
            "subtarefa_id, novo_status e mentor_id são obrigatórios",
        },
        { status: 400 }
      )
    }

    // Apenas MENTOR pode validar (não o mentorado)
    if (novo_status === "validado") {
      const { data: subtarefa, error: fetchError } = await supabaseAdmin
        .from("tarefas_pontuais_subtarefas")
        .select("id, tarefa_pontual_id")
        .eq("id", subtarefa_id)
        .single()

      if (fetchError || !subtarefa) {
        return NextResponse.json(
          { error: "Subtarefa não encontrada" },
          { status: 404 }
        )
      }

      // Atualizar subtarefa com validação do mentor
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("tarefas_pontuais_subtarefas")
        .update({
          status: "validado",
          validado_por: mentor_id,
          data_validacao: new Date().toISOString(),
          observacao_validacao: observacao_validacao || null,
        })
        .eq("id", subtarefa_id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          success: true,
          subtarefa: updated,
          mensagem: "Subtarefa validada pelo mentor",
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: "Status inválido. Use 'validado'" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Erro ao validar subtarefa:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
