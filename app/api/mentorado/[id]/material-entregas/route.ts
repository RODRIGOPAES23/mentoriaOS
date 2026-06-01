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

    const { data: materiais, error } = await supabaseAdmin
      .from("material_entregas")
      .select("*")
      .eq("mentorado_id", mentoradoId)
      .order("data_criacao", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Agrupar por status
    const groupedByStatus = {
      pendente: materiais?.filter((m) => m.status === "pendente") || [],
      enviado: materiais?.filter((m) => m.status === "enviado") || [],
      recebido: materiais?.filter((m) => m.status === "recebido") || [],
    }

    return NextResponse.json(
      {
        success: true,
        materiais: materiais || [],
        resumo: {
          total: materiais?.length || 0,
          pendentes: groupedByStatus.pendente.length,
          enviados: groupedByStatus.enviado.length,
          recebidos: groupedByStatus.recebido.length,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao buscar material entregas:", error)
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
    const {
      descricao_material,
      tipo_material,
      data_prometida,
      mentor_id,
      link_arquivo,
      notas,
    } = body

    if (!descricao_material || !mentor_id) {
      return NextResponse.json(
        { error: "descricao_material e mentor_id são obrigatórios" },
        { status: 400 }
      )
    }

    const { data: material, error } = await supabaseAdmin
      .from("material_entregas")
      .insert({
        mentorado_id,
        mentor_id,
        descricao_material,
        tipo_material,
        data_prometida,
        status: "pendente",
        link_arquivo,
        notas,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        material,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao criar material entrega:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { material_id, novo_status } = body

    if (!material_id || !novo_status) {
      return NextResponse.json(
        { error: "material_id e novo_status são obrigatórios" },
        { status: 400 }
      )
    }

    const { data: updated, error } = await supabaseAdmin
      .from("material_entregas")
      .update({
        status: novo_status,
        enviado: novo_status !== "pendente",
        data_envio: novo_status === "enviado" ? new Date().toISOString() : null,
      })
      .eq("id", material_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        material: updated,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao atualizar material entrega:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
