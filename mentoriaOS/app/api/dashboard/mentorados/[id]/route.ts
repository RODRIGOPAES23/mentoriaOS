import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

// GET um mentorado específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    const { data, error } = await supabase
      .from("mentorados")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error || !data) {
      return Response.json({ error: "Mentorado não encontrado" }, { status: 404, headers: NO_CACHE })
    }

    return Response.json({ mentorado: data }, { headers: NO_CACHE })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500, headers: NO_CACHE })
  }
}

// UPDATE mentorado
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  let body: any
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400, headers: NO_CACHE })
  }

  try {
    const update: any = {
      nome: body.nome,
      nicho: body.nicho,
      foco_macro: body.foco_macro,
      status: body.status,
    }
    if (body.cidade !== undefined) update.cidade = body.cidade || null
    if (body.data_fim !== undefined) update.data_fim = body.data_fim || null
    if (body.faturamento_atual !== undefined) update.faturamento_atual = body.faturamento_atual ? Number(body.faturamento_atual) : null
    if (body.meta_faturamento !== undefined) update.meta_faturamento = body.meta_faturamento ? Number(body.meta_faturamento) : null
    if (body.meta_atual !== undefined) update.meta_atual = body.meta_atual || null

    // Campos expandidos do cadastro completo (v7) — persistidos no edit / "Meu Cadastro"
    const camposExpandidos = [
      "email", "cel", "contato_emergencia", "tempo_mercado", "formacao",
      "tem_clinica", "experiencia_mentoria", "experiencia_trafego", "experiencia_agencia_mkt",
      "expectativa_30_dias", "expectativa_90_dias", "expectativa_6_meses", "expectativa_12_meses",
      "faturamento_medio_3m", "atua_trafego", "investimento_trafego_mensal", "tem_vendedora_time",
      "instagram_handle",
    ]
    for (const k of camposExpandidos) {
      if (body[k] !== undefined) update[k] = body[k] === "" ? null : body[k]
    }

    const { data, error } = await supabase
      .from("mentorados")
      .update(update)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
    }

    return Response.json({ success: true, mentorado: data }, { headers: NO_CACHE })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500, headers: NO_CACHE })
  }
}

// DELETE mentorado
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    // Primeiro deleta os check-ins associados
    await supabase.from("checkins").delete().eq("mentorado_id", params.id)

    // Depois deleta o mentorado
    const { error } = await supabase.from("mentorados").delete().eq("id", params.id)

    if (error) {
      return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
    }

    return Response.json({ success: true, message: "Mentorado deletado com sucesso" }, { headers: NO_CACHE })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500, headers: NO_CACHE })
  }
}
