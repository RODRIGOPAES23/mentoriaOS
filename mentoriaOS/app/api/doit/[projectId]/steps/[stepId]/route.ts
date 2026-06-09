import { NextRequest, NextResponse } from "next/server"
import { createServerClient, adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string; stepId: string } }
) {
  try {
    const sb = createServerClient()
    const { data: { user } } = await sb.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { projectId, stepId } = params
    const { status, quem_resolveu } = await req.json()
    const sbAdmin = adminClient()

    // Verificar autorização (projeto pertence ao usuário)
    const { data: project } = await sbAdmin
      .from("doit_projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    if (!project) {
      return NextResponse.json(
        { error: "Projeto não encontrado ou sem autorização" },
        { status: 404 }
      )
    }

    // Buscar passo atual
    const { data: currentStep } = await sbAdmin
      .from("doit_passos")
      .select("*")
      .eq("id", stepId)
      .eq("project_id", projectId)
      .single()

    if (!currentStep) {
      return NextResponse.json(
        { error: "Passo não encontrado" },
        { status: 404 }
      )
    }

    // Atualizar passo
    const { data: updated, error: updateError } = await sbAdmin
      .from("doit_passos")
      .update({
        status: status || currentStep.status,
        quem_resolveu: quem_resolveu || currentStep.quem_resolveu,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", stepId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Registrar evento no GRATIDÃO
    const statusAnterior = currentStep.status
    const statusNovo = status || currentStep.status

    if (statusAnterior !== statusNovo || quem_resolveu) {
      let tipoEvento = "passo_atualizado"
      if (statusNovo === "finalizado") {
        tipoEvento = quem_resolveu === "humano" ? "passo_humano" : "passo_maquina"
      }

      await sbAdmin.from("doit_gratidao_eventos").insert({
        project_id: projectId,
        passo_id: stepId,
        evento_tipo: tipoEvento,
        fase_numero: currentStep.fase_numero,
        status_anterior: statusAnterior,
        status_novo: statusNovo,
        metadata: {
          quem_resolveu,
          descricao: currentStep.descricao,
        },
      })
    }

    // Atualizar contador de passos completos no projeto
    const { data: allSteps } = await sbAdmin
      .from("doit_passos")
      .select("status")
      .eq("project_id", projectId)

    const completedCount = allSteps?.filter((s) => s.status === "finalizado").length || 0
    const totalCount = allSteps?.length || 0

    // Se todos os passos estão finalizados, marcar projeto como validado
    if (completedCount === totalCount && totalCount > 0) {
      await sbAdmin
        .from("doit_projects")
        .update({
          status: "validado",
          passos_completados: completedCount,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", projectId)

      // Registrar conclusão no GRATIDÃO (1 = Validado)
      await sbAdmin.from("doit_gratidao_eventos").insert({
        project_id: projectId,
        evento_tipo: "validacao_completa",
        status_anterior: "validando",
        status_novo: "validado",
        metadata: {
          passos_totais: totalCount,
          passos_humano: allSteps?.filter((s) => s.quem_resolveu === "humano").length,
          passos_maquina: allSteps?.filter((s) => s.quem_resolveu === "maquina").length,
        },
      })
    } else {
      // Apenas atualizar contador
      await sbAdmin
        .from("doit_projects")
        .update({
          passos_completados: completedCount,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", projectId)
    }

    return NextResponse.json({
      step: updated,
      projectStats: {
        passos_completados: completedCount,
        passos_totais: totalCount,
        percentualCompleto:
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      },
    })
  } catch (error) {
    console.error("DOIT Step PATCH error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
