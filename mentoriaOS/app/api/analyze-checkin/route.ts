import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { analyzeCheckinWithClaude } from "@/lib/claude"
import type { Mentorado, Checkin } from "@/lib/supabase"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { checkin_id, mentorado_id } = body

    if (!checkin_id || !mentorado_id) {
      return NextResponse.json(
        { error: "checkin_id e mentorado_id são obrigatórios" },
        { status: 400 }
      )
    }

    // Buscar checkin completo
    const { data: checkin, error: checkinError } = await supabaseAdmin
      .from("checkins")
      .select("*")
      .eq("id", checkin_id)
      .single()

    if (checkinError || !checkin) {
      return NextResponse.json(
        { error: "Checkin não encontrado" },
        { status: 404 }
      )
    }

    // Buscar mentorado completo
    const { data: mentorado, error: menteeError } = await supabaseAdmin
      .from("mentorados")
      .select("*")
      .eq("id", mentorado_id)
      .single()

    if (menteeError || !mentorado) {
      return NextResponse.json(
        { error: "Mentorado não encontrado" },
        { status: 404 }
      )
    }

    // Analisar com Claude
    const analise = await analyzeCheckinWithClaude(
      mentorado as Mentorado,
      checkin as Checkin
    )

    // Salvar análise no banco
    const { data: savedAnalise, error: saveError } = await supabaseAdmin
      .from("analises_ia")
      .insert({
        checkin_id,
        mentorado_id,
        data_analise: new Date().toISOString(),
        ...analise,
      })
      .select()
      .single()

    if (saveError) {
      console.error("Erro ao salvar análise:", saveError)
      return NextResponse.json(
        { error: "Erro ao salvar análise" },
        { status: 500 }
      )
    }

    // Append ao histórico acumulado do mentorado (optional - non-blocking)
    const historicoEntry = {
      tipo: "analise_ia",
      data: new Date().toISOString(),
      checkin_vendas: checkin.vendas_reais,
      checkin_leads: checkin.leads_gerados,
      gargalo: analise.gargalo_identificado,
    }

    try {
      // Try to call the RPC, but don't fail if it doesn't exist
      await supabaseAdmin.rpc("append_to_historico", {
        p_mentorado_id: mentorado_id,
        p_evento: historicoEntry,
      })
    } catch (rpcError) {
      console.warn("RPC call failed (non-blocking):", String(rpcError))
      // Fallback: manually update the historico_acumulado
      try {
        const { historico_acumulado = [] } = mentorado
        const updatedHistorico = [...(Array.isArray(historico_acumulado) ? historico_acumulado : []), historicoEntry]
        await supabaseAdmin
          .from("mentorados")
          .update({ historico_acumulado: updatedHistorico })
          .eq("id", mentorado_id)
      } catch (fallbackError) {
        console.warn("Fallback historico update also failed:", String(fallbackError))
      }
    }

    return NextResponse.json(
      {
        success: true,
        analise: savedAnalise,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro na análise:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
