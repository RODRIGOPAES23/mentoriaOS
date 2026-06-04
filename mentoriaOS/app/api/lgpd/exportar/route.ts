import { adminClient } from "@/lib/supabase-server"
import { rotaCompartilhadaAutorizada, mentorAutorizado, naoAutorizado } from "@/lib/auth-guards"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

// GET /api/lgpd/exportar?mentoradoId=X  → todos os dados do mentorado (portal ou mentor)
// GET /api/lgpd/exportar?mentorId=X     → todos os dados do mentor + mentorados (mentor ou super_admin)
export async function GET(request: Request) {
  const url = new URL(request.url)
  const mentoradoId = url.searchParams.get("mentoradoId")
  const mentorId = url.searchParams.get("mentorId")
  const db = adminClient()

  if (mentoradoId) {
    if (!await rotaCompartilhadaAutorizada(mentoradoId, request)) return naoAutorizado()

    const [
      { data: perfil },
      { data: checkins },
      { data: tarefas },
      { data: sessoes },
      { data: mensagens },
      { data: pagamentos },
    ] = await Promise.all([
      db.from("mentorados").select("*").eq("id", mentoradoId).single(),
      db.from("checkins").select("*").eq("mentorado_id", mentoradoId).order("data_envio", { ascending: false }),
      db.from("tarefas").select("id, texto, status, data_vencimento, data_criacao, data_completada").eq("mentorado_id", mentoradoId),
      db.from("sessoes").select("id, titulo, data_hora, duracao_min, status, notas").eq("mentorado_id", mentoradoId).order("data_hora"),
      db.from("mensagens").select("id, autor, texto, created_at").eq("mentorado_id", mentoradoId).order("created_at"),
      db.from("pagamentos").select("id, valor, data_vencimento, data_pagamento, status, descricao, parcela").eq("mentorado_id", mentoradoId),
    ])

    const exportacao = {
      exportado_em: new Date().toISOString(),
      titular: "mentorado",
      nota_legal: "Exportação gerada conforme LGPD art. 18, III (portabilidade). Dados referentes ao titular identificado pelo código de acesso.",
      perfil,
      checkins: checkins || [],
      tarefas: tarefas || [],
      sessoes: sessoes || [],
      mensagens: mensagens || [],
      pagamentos: pagamentos || [],
    }

    return new Response(JSON.stringify(exportacao, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="meus-dados-${new Date().toISOString().slice(0,10)}.json"`,
        ...NO_CACHE,
      },
    })
  }

  if (mentorId) {
    if (!await mentorAutorizado(mentorId)) return naoAutorizado()

    const { data: mentor } = await db.from("mentors").select("id, nome, email, nicho_foco, metodo_trabalho, filosofia, empresa_id, created_at").eq("id", mentorId).single()
    const { data: mentorados } = await db.from("mentorados").select("id, nome, nicho, status, data_inicio, data_fim").eq("mentor_id", mentorId)

    const exportacao = {
      exportado_em: new Date().toISOString(),
      titular: "mentor",
      nota_legal: "Exportação gerada conforme LGPD art. 18, III. Dados do mentor e lista de mentorados (sem dados pessoais completos dos mentorados — cada mentorado pode exportar os próprios dados pelo portal).",
      mentor,
      mentorados: mentorados || [],
    }

    return new Response(JSON.stringify(exportacao, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="dados-mentor-${new Date().toISOString().slice(0,10)}.json"`,
        ...NO_CACHE,
      },
    })
  }

  return Response.json({ error: "mentoradoId ou mentorId obrigatório" }, { status: 400, headers: NO_CACHE })
}
