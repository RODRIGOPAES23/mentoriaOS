import { adminClient } from "@/lib/supabase-server"
import { mentorAutorizado, sessaoMentorValida, naoAutorizado } from "@/lib/auth-guards"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

const OPENROUTER_KEY = process.env.ANTHROPIC_API_KEY!

async function analisarCallComIA(transcricao: string, nomeMentorado: string, nomeMentor: string): Promise<any> {
  const prompt = `Você é um assistente especializado em mentoria. Analise a transcrição abaixo de uma call de onboarding entre o mentor ${nomeMentor} e a mentorada ${nomeMentorado}.

Extraia e estruture EXATAMENTE:
1. TAREFAS DA MENTORADA: o que ela deve fazer (ações concretas)
2. COMPROMISSOS DA EQUIPE: o que o mentor/equipe prometeu entregar
3. RESUMO DA CALL: 3-5 pontos principais
4. INSIGHTS: observações importantes sobre o perfil e momento da mentorada

Responda em JSON PURO sem markdown, neste formato:
{
  "tarefas_mentorado": [{"texto": "...", "prioridade": "alta|media|baixa"}],
  "compromissos_equipe": [{"texto": "...", "responsavel": "Victor|Larissa|Silas|Equipe"}],
  "resumo": "...",
  "insights": ["...", "..."]
}

TRANSCRIÇÃO:
${transcricao.slice(0, 12000)}`

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  })

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`)
  const json = await res.json()
  const content = json.choices?.[0]?.message?.content || "{}"

  // Limpar markdown se presente
  const clean = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  return JSON.parse(clean)
}

export async function POST(request: Request) {
  let body: any
  try { body = await request.json() }
  catch { return Response.json({ error: "Body inválido" }, { status: 400 }) }

  const { mentoradoId, mentorId, transcricao, fonte } = body
  if (!mentoradoId || !mentorId || !transcricao?.trim())
    return Response.json({ error: "mentoradoId, mentorId e transcricao obrigatórios" }, { status: 400 })

  if (!await mentorAutorizado(mentorId)) return naoAutorizado()

  const supabase = adminClient()

  // Buscar nomes para contextualizar o prompt
  const [{ data: mentorado }, { data: mentor }] = await Promise.all([
    supabase.from("mentorados").select("nome").eq("id", mentoradoId).single(),
    supabase.from("mentors").select("nome").eq("id", mentorId).single(),
  ])

  try {
    const analise = await analisarCallComIA(
      transcricao,
      mentorado?.nome || "mentorada",
      mentor?.nome || "mentor"
    )

    // Salvar análise no banco
    const { data: saved, error } = await supabase
      .from("call_analyses")
      .insert({
        mentorado_id: mentoradoId,
        mentor_id: mentorId,
        fonte: fonte || "texto",
        transcricao: transcricao.slice(0, 50000),
        resumo: analise.resumo || "",
        tarefas_mentorado: analise.tarefas_mentorado || [],
        compromissos_equipe: analise.compromissos_equipe || [],
        insights: analise.insights || [],
        data_call: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) console.error("Erro ao salvar análise:", error)

    // Criar tarefas automaticamente no banco
    const tarefas = analise.tarefas_mentorado || []
    if (tarefas.length > 0) {
      await supabase.from("tarefas").insert(
        tarefas.map((t: any) => ({
          mentorado_id: mentoradoId,
          mentor_id: mentorId,
          texto: `[Call] ${t.texto}`,
          status: "pending",
        }))
      )
    }

    return Response.json({
      success: true,
      analise,
      id: saved?.id,
      tarefas_criadas: tarefas.length,
    }, { headers: NO_CACHE })

  } catch (e) {
    return Response.json({ error: `Erro na análise: ${String(e)}` }, { status: 502 })
  }
}

export async function GET(request: Request) {
  if (!await sessaoMentorValida()) return naoAutorizado()

  const supabase = adminClient()
  const url = new URL(request.url)
  const mentoradoId = url.searchParams.get("mentoradoId")

  if (!mentoradoId) return Response.json({ analyses: [] }, { headers: NO_CACHE })

  const { data, error } = await supabase
    .from("call_analyses")
    .select("id, fonte, resumo, tarefas_mentorado, compromissos_equipe, insights, data_call, created_at")
    .eq("mentorado_id", mentoradoId)
    .order("data_call", { ascending: false })
    .limit(10)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ analyses: data || [] }, { headers: NO_CACHE })
}
