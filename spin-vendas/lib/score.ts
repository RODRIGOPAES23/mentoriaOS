// Score ICP (F4 — Estação 2): pontua 0–100 o quanto o lead bate com o
// Perfil de Cliente Ideal da campanha. Usa Gemini Flash (barato).
import type { Campanha } from "./campanhas"
import type { SpinMessage } from "./spin-prompt"
import type { Lead } from "./extract"

const OPENROUTER_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY

export type ScoreIcp = { score: number; justificativa: string }

export async function scoreLead(
  campanha: Campanha,
  ctx: { lead: Lead | null; notas?: string | null; messages?: SpinMessage[] }
): Promise<ScoreIcp> {
  if (!OPENROUTER_API_KEY) return { score: 0, justificativa: "sem chave LLM" }

  const conversa = (ctx.messages ?? [])
    .map((m) => `${m.role === "user" ? "LEAD" : "BOT"}: ${m.content}`)
    .join("\n")

  const prompt = `Você é um qualificador de leads. Pontue de 0 a 100 o quanto este lead bate com o Perfil de Cliente Ideal (ICP). Responda APENAS JSON puro: {"score": <0-100>, "justificativa": "<1 frase curta>"}.

ICP: ${campanha.icp.descricao}
Sinais POSITIVOS (aumentam o score): ${campanha.icp.sinaisPositivos.join("; ")}
Sinais NEGATIVOS (derrubam o score): ${campanha.icp.sinaisNegativos.join("; ")}

DADOS DO LEAD: ${JSON.stringify(ctx.lead)}
NOTAS: ${ctx.notas ?? "—"}
CONVERSA:
${conversa || "—"}`

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        max_tokens: 120,
      }),
    })
    if (!res.ok) return { score: 0, justificativa: "erro no score" }
    const data = await res.json()
    let c: string = data.choices?.[0]?.message?.content?.trim() ?? "{}"
    c = c.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
    const parsed = JSON.parse(c)
    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)))
    return { score, justificativa: String(parsed.justificativa ?? "") }
  } catch (e) {
    console.error("Falha no score ICP:", e)
    return { score: 0, justificativa: "erro no score" }
  }
}
