import { NextRequest, NextResponse } from "next/server"
import { createServerClient, adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const sb = createServerClient()
    const { data: { user } } = await sb.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { projectId } = params
    const sbAdmin = adminClient()

    // Verificar autorização
    const { data: project, error: projError } = await sbAdmin
      .from("doit_projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    if (projError || !project) {
      return NextResponse.json(
        { error: "Projeto não encontrado ou sem autorização" },
        { status: 404 }
      )
    }

    // Buscar passos
    const { data: passos } = await sbAdmin
      .from("doit_passos")
      .select("*")
      .eq("project_id", projectId)
      .order("fase_numero", { ascending: true })
      .order("passo_numero", { ascending: true })

    // Agrupar por fase
    const fasesPorNumero: Record<number, any> = {}
    passos?.forEach((p) => {
      if (!fasesPorNumero[p.fase_numero]) {
        fasesPorNumero[p.fase_numero] = {
          numero: p.fase_numero,
          nome: p.fase_nome,
          passos: [],
        }
      }
      fasesPorNumero[p.fase_numero].passos.push(p)
    })

    const fases = Object.values(fasesPorNumero)

    // Calcular stats
    const totalPassos = passos?.length || 0
    const passosCompletos = passos?.filter((p) => p.status === "finalizado").length || 0
    const passosHumano = passos?.filter((p) => p.quem_resolveu === "humano").length || 0
    const passosMaquina = passos?.filter((p) => p.quem_resolveu === "maquina").length || 0

    return NextResponse.json({
      project: {
        ...project,
        stats: {
          totalPassos,
          passosCompletos,
          percentualCompleto: totalPassos > 0 ? Math.round((passosCompletos / totalPassos) * 100) : 0,
          passosHumano,
          passosMaquina,
        },
      },
      fases,
      passos,
    })
  } catch (error) {
    console.error("DOIT GET error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const sb = createServerClient()
    const { data: { user } } = await sb.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { projectId } = params
    const { objetivo, status } = await req.json()
    const sbAdmin = adminClient()

    // Verificar autorização
    const { data: project, error: projError } = await sbAdmin
      .from("doit_projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    if (projError || !project) {
      return NextResponse.json(
        { error: "Projeto não encontrado ou sem autorização" },
        { status: 404 }
      )
    }

    // Atualizar projeto
    const { data: updated, error: updateError } = await sbAdmin
      .from("doit_projects")
      .update({
        objetivo: objetivo || project.objetivo,
        status: status || project.status,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("DOIT PATCH error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
