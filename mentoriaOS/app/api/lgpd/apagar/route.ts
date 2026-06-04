import { adminClient } from "@/lib/supabase-server"
import { rotaCompartilhadaAutorizada, naoAutorizado } from "@/lib/auth-guards"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

/**
 * POST /api/lgpd/apagar
 * Body: { mentoradoId, tipo: "anonimizar" | "excluir" }
 *
 * Anonimizar: substitui dados pessoais por placeholders, mantém histórico de negócio
 * (necessário por 5 anos para fins fiscais conforme LGPD art. 16, I).
 * Excluir: remove tudo (apenas se não houver obrigação legal pendente).
 *
 * Somente o próprio mentorado (via código do portal) pode solicitar via portal.
 * O mentor pode excluir via DELETE /api/dashboard/mentorados/[id].
 */
export async function POST(request: Request) {
  let body: any
  try { body = await request.json() }
  catch { return Response.json({ error: "Body inválido" }, { status: 400, headers: NO_CACHE }) }

  const { mentoradoId, tipo } = body
  if (!mentoradoId) return Response.json({ error: "mentoradoId obrigatório" }, { status: 400, headers: NO_CACHE })
  if (!["anonimizar", "excluir"].includes(tipo)) return Response.json({ error: "tipo deve ser 'anonimizar' ou 'excluir'" }, { status: 400, headers: NO_CACHE })

  if (!await rotaCompartilhadaAutorizada(mentoradoId, request)) return naoAutorizado()

  const db = adminClient()

  if (tipo === "anonimizar") {
    // Substitui dados pessoais identificáveis por placeholders.
    // Mantém dados agregados (faturamento, sessões, pagamentos) para obrigação fiscal (LGPD art. 16, I).
    const { error } = await db.from("mentorados").update({
      nome: "Dados Anonimizados",
      email: null,
      cel: null,
      contato_emergencia: null,
      instagram_handle: null,
      cidade: null,
      foto_url: null,
      codigo_acesso: "ANONIMIZADO",
    }).eq("id", mentoradoId)

    if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })

    // Remove mensagens (dados pessoais sem valor fiscal)
    await db.from("mensagens").delete().eq("mentorado_id", mentoradoId)

    return Response.json({
      success: true,
      mensagem: "Dados pessoais anonimizados. Histórico financeiro mantido por 5 anos conforme LGPD art. 16, I e legislação fiscal.",
    }, { headers: NO_CACHE })
  }

  if (tipo === "excluir") {
    // Exclui todos os dados do mentorado (use apenas se não houver obrigação fiscal pendente).
    await Promise.all([
      db.from("mensagens").delete().eq("mentorado_id", mentoradoId),
      db.from("tarefas").delete().eq("mentorado_id", mentoradoId),
      db.from("checkins").delete().eq("mentorado_id", mentoradoId),
      db.from("sessoes").delete().eq("mentorado_id", mentoradoId),
      db.from("pagamentos").delete().eq("mentorado_id", mentoradoId),
      db.from("session_notes").delete().eq("mentorado_id", mentoradoId),
    ])
    const { error } = await db.from("mentorados").delete().eq("id", mentoradoId)
    if (error) return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })

    return Response.json({
      success: true,
      mensagem: "Todos os seus dados foram excluídos permanentemente.",
    }, { headers: NO_CACHE })
  }
}
