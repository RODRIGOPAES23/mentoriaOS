// Briefing inteligente via OpenRouter + Gemini Flash (econômico).
// Gera diagnóstico do gargalo + pauta de call a partir do check-in real.

// Modelo econômico do Gemini Flash no OpenRouter. Troque aqui se quiser:
//   google/gemini-2.0-flash-001       (recomendado: barato + bom)
//   google/gemini-2.0-flash-lite-001  (mais barato ainda)
//   google/gemini-flash-1.5-8b        (o mais econômico)
export const BRIEFING_MODEL = "google/gemini-2.0-flash-001"

export interface BriefingIA {
  diagnostico: string
  pauta: string[]
}

interface DadosMentorado {
  nome: string
  nicho: string
  foco_macro?: string
}

interface DadosCheckin {
  vendas_reais: number
  leads_gerados: number
  investimento_trafego: number
  videos_postados: number
  dificuldades_texto: string | null
  tarefas_executadas: string[] | null
  data_envio: string
}

const SYSTEM_PROMPT = `Você é um Diretor de Operações e Estrategista de Negócios Digital de elite, preparando um mentor humano para uma call de mentoria de 30 minutos.

REGRAS:
- Analise os números com frieza. Se estão ruins, aponte a falha operacional sem suavizar.
- Correlacione os números frios com o relato de dificuldades (ex: muitos leads e poucas vendas = gargalo comercial).
- Seja específico, direto e acionável. Sem enrolação, sem elogios vazios.
- Escreva em português do Brasil.

Responda SOMENTE com um JSON válido, sem markdown, neste formato exato:
{
  "diagnostico": "Um parágrafo curto (máx 4 linhas) com o maior gargalo atual e o porquê, citando os números.",
  "pauta": ["Item 1 da call com tempo (ex: 0-10m)", "Item 2 (10-25m)", "Item 3 (25-30m)"]
}
A pauta deve ter de 3 a 5 itens acionáveis com janelas de tempo.`

export async function gerarBriefingIA(
  mentorado: DadosMentorado,
  checkin: DadosCheckin
): Promise<BriefingIA> {
  const apiKey = process.env.ANTHROPIC_API_KEY // chave OpenRouter (sk-or-...)
  if (!apiKey) throw new Error("OpenRouter API key ausente")

  const roi =
    checkin.investimento_trafego > 0
      ? (
          ((checkin.vendas_reais - checkin.investimento_trafego) /
            checkin.investimento_trafego) *
          100
        ).toFixed(0)
      : "N/A"
  const conversao =
    checkin.leads_gerados > 0
      ? (checkin.vendas_reais / checkin.leads_gerados).toFixed(0)
      : "N/A"

  const tarefas = Array.isArray(checkin.tarefas_executadas)
    ? checkin.tarefas_executadas.map((t, i) => `${i + 1}. ${t}`).join("\n")
    : "Nenhuma registrada"

  const userMessage = `MENTORADO: ${mentorado.nome} | Nicho: ${mentorado.nicho} | Foco: ${mentorado.foco_macro || "Não definido"}

DADOS DA SEMANA:
- Vendas: R$ ${checkin.vendas_reais}
- Leads: ${checkin.leads_gerados}
- Investimento em tráfego: R$ ${checkin.investimento_trafego}
- ROI: ${roi}% | R$/lead convertido: ${conversao}
- Vídeos postados: ${checkin.videos_postados}

DIFICULDADES RELATADAS:
"${checkin.dificuldades_texto || "Nenhuma relatada"}"

TAREFAS EXECUTADAS:
${tarefas}

Gere o diagnóstico e a pauta da call.`

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://mentoriaos.vercel.app",
      "X-Title": "mentoriaOS",
    },
    body: JSON.stringify({
      model: BRIEFING_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      max_tokens: 800,
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`OpenRouter ${res.status}: ${txt.slice(0, 200)}`)
  }

  const json = await res.json()
  const content: string = json?.choices?.[0]?.message?.content || ""

  // Parsing robusto: tenta JSON direto; se vier com cercas, extrai o objeto.
  let parsed: any
  try {
    parsed = JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*\}/)
    parsed = match ? JSON.parse(match[0]) : null
  }

  if (!parsed || typeof parsed.diagnostico !== "string") {
    throw new Error("Resposta da IA em formato inesperado")
  }

  return {
    diagnostico: parsed.diagnostico,
    pauta: Array.isArray(parsed.pauta) ? parsed.pauta.map(String) : [],
  }
}
