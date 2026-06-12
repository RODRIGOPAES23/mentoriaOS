// Extração estruturada dos dados do lead a partir da conversa.
// Email/telefone via regex (confiável); nome/mentorados via LLM (Gemini flash, barato).
import type { SpinMessage } from "./spin-prompt"

const OPENROUTER_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY

export type Lead = {
  nome: string | null
  whatsapp: string | null
  email: string | null
  mentorados: number | null
}

const RE_EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/
// telefone BR: aceita (xx) xxxxx-xxxx, xx xxxxxxxxx, +55..., etc (>= 8 dígitos)
const RE_TEL = /(?:\+?55\s*)?(?:\(?\d{2}\)?[\s.-]*)?(?:9?\d{4})[\s.-]*\d{4}/

function regexFields(messages: SpinMessage[]): Pick<Lead, "email" | "whatsapp"> {
  const txt = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n")
  const email = txt.match(RE_EMAIL)?.[0] ?? null
  const telMatch = txt.match(RE_TEL)?.[0] ?? null
  // só conta como telefone se tiver >= 10 dígitos
  const whatsapp = telMatch && (telMatch.replace(/\D/g, "").length >= 10) ? telMatch.trim() : null
  return { email, whatsapp }
}

export async function extrairLead(messages: SpinMessage[]): Promise<Lead> {
  const base = regexFields(messages)
  let nome: string | null = null
  let mentorados: number | null = null

  if (OPENROUTER_API_KEY) {
    try {
      const conversa = messages
        .map((m) => `${m.role === "user" ? "LEAD" : "BOT"}: ${m.content}`)
        .join("\n")
      const prompt = `Extraia os dados do LEAD desta conversa de vendas. Responda APENAS JSON puro, sem markdown:
{"nome": <nome completo do lead ou null>, "mentorados": <numero de mentorados/alunos que ele tem, inteiro, ou null>}

CONVERSA:
${conversa}`

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
          max_tokens: 100,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        let c: string = data.choices?.[0]?.message?.content?.trim() ?? "{}"
        c = c.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
        const parsed = JSON.parse(c)
        nome = parsed.nome ?? null
        mentorados =
          typeof parsed.mentorados === "number" ? parsed.mentorados : null
      }
    } catch (e) {
      console.error("Falha na extração do lead:", e)
    }
  }

  return { nome, mentorados, ...base }
}
