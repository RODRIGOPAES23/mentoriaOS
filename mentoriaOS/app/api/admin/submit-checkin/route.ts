/**
 * ADMIN ONLY: Submit a checkin and trigger analysis
 * Bypasses client-side form to test the complete flow
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminToken = process.env.ADMIN_SEED_TOKEN || "dev-seed-token"

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials")
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${adminToken}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { mentoradoId, vendas_reais, leads_gerados, investimento_trafego, videos_postados, dificuldades_texto, tarefas_executadas } = await request.json()

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Create checkin
    const { data: checkin, error: checkinError } = await supabase
      .from("checkins")
      .insert({
        mentorado_id: mentoradoId,
        vendas_reais: parseFloat(String(vendas_reais)),
        leads_gerados: parseInt(String(leads_gerados)),
        investimento_trafego: parseFloat(String(investimento_trafego)),
        videos_postados: parseInt(String(videos_postados)),
        dificuldades_texto,
        tarefas_executadas: Array.isArray(tarefas_executadas) ? tarefas_executadas : tarefas_executadas.split("\n").filter(Boolean),
      })
      .select()
      .single()

    if (checkinError) {
      throw new Error(`Failed to create checkin: ${checkinError.message}`)
    }

    console.log("Checkin created:", checkin.id)

    let analysisResult = null

    // 2. Try to trigger analysis (optional - don't fail if this doesn't work)
    try {
      const analysisResponse = await fetch("http://localhost:3000/api/analyze-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkinId: checkin.id,
          mentoradoId,
        }),
      })

      if (analysisResponse.ok) {
        analysisResult = await analysisResponse.json()
      } else {
        console.warn("Analysis endpoint returned status:", analysisResponse.status)
      }
    } catch (analysisError) {
      console.warn("Analysis call failed (not critical):", String(analysisError))
    }

    return Response.json({
      status: "success",
      message: "Checkin submitted" + (analysisResult ? " and analysis triggered" : ""),
      checkin,
      analysis: analysisResult,
    })
  } catch (error) {
    console.error("Error:", error)
    return Response.json({
      status: "error",
      message: String(error),
    }, { status: 500 })
  }
}
