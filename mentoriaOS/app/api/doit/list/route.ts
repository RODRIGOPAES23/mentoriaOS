import { NextResponse } from "next/server"
import { createServerClient, adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

// GET /api/doit/list → projetos DOIT do usuário logado (mais recentes primeiro)
export async function GET() {
  try {
    const sb = createServerClient()
    const { data: { user } } = await sb.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const sbAdmin = adminClient()
    const { data: projects, error } = await sbAdmin
      .from("doit_projects")
      .select("id, objetivo, status, fases_total, passos_totais, passos_completados, criado_em")
      .eq("user_id", user.id)
      .order("criado_em", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ projects: projects || [] })
  } catch (error) {
    console.error("DOIT list error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
