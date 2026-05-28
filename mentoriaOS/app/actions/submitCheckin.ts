"use server"

import { createClient } from "@supabase/supabase-js"

export async function submitCheckinAction(
  mentoradoId: string,
  formData: {
    vendas_reais: number
    leads_gerados: number
    investimento_trafego: number
    videos_postados: number
    dificuldades_texto: string
    tarefas_executadas: string[]
  }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create checkin in database
    const { data: checkin, error: checkinError } = await supabase
      .from("checkins")
      .insert({
        mentorado_id: mentoradoId,
        vendas_reais: parseFloat(String(formData.vendas_reais)),
        leads_gerados: parseInt(String(formData.leads_gerados)),
        investimento_trafego: parseFloat(String(formData.investimento_trafego)),
        videos_postados: parseInt(String(formData.videos_postados)),
        dificuldades_texto: formData.dificuldades_texto,
        tarefas_executadas: formData.tarefas_executadas,
      })
      .select()
      .single()

    if (checkinError) {
      throw new Error(`Failed to create checkin: ${checkinError.message}`)
    }

    // Trigger analysis (optional - don't fail if this doesn't work)
    try {
      const analysisResponse = await fetch("http://localhost:3000/api/analyze-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkinId: checkin.id,
          mentoradoId,
        }),
      })

      if (!analysisResponse.ok) {
        console.warn("Analysis endpoint returned status:", analysisResponse.status)
      }
    } catch (analysisError) {
      console.warn("Analysis call failed (not critical):", String(analysisError))
    }

    return {
      status: "success",
      checkinId: checkin.id,
    }
  } catch (error) {
    return {
      status: "error",
      message: String(error),
    }
  }
}
