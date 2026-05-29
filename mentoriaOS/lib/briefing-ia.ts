// Briefing inteligente via OpenRouter + Gemini Flash (econômico).
// Analisa o histórico de check-ins (comparando semanas) e gera:
// diagnóstico do gargalo + evolução + pauta de call.

// Modelo econômico do Gemini Flash no OpenRouter. Troque aqui se quiser:
//   google/gemini-2.0-flash-001       (recomendado: barato + bom)
//   google/gemini-2.0-flash-lite-001  (mais barato ainda)
//   google/gemini-flash-1.5-8b        (o mais econômico)
export const BRIEFING_MODEL = "google/gemini-2.0-flash-001"

export interface BriefingIA {
  diagnostico: string
  evolucao: string
  pauta: string[]
}

interface DadosMentorado {
  nome: string
  nicho: string
  foco_macro?: string
}

interface DadosMentor {
  nome?: string
  metodo_trabalho?: string
  filosofia?: string
  nicho_foco?: string
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
- COMPARE AS SEMANAS do histórico: identifique tendências (subindo/caindo/estagnado) e o que mudou.
- Correlacione os números frios com o relato de dificuldades (ex: leads subindo mas vendas caindo = gargalo comercial).
- Seja específico, direto e acionável. Cite números e variações reais (%). Sem elogios vazios.
- Escreva em português do Brasil.

Responda SOMENTE com um JSON válido, sem markdown, neste formato exato:
{
  "diagnostico": "Parágrafo curto (máx 4 linhas) com o maior gargalo atual e o porquê, citando números da semana mais recente.",
  "evolucao": "Parágrafo curto (máx 4 linhas) comparando as semanas: o que melhorou, o que piorou e a tendência. Cite variações (%). Se só há 1 semana, diga que é a primeira e não há base de comparação.",
  "pauta": ["Item 1 da call com janela de tempo (ex: 0-10m)", "Item 2 (10-25m)", "Item 3 (25-30m)"]
}
A pauta deve ter de 3 a 5 itens acionáveis com janelas de tempo.`

function roiPct(c: DadosCheckin): string {
  return c.investimento_trafego > 0
    ? (((c.vendas_reais - c.investimento_trafego) / c.investimento_trafego) * 100).toFixed(0)
    : "N/A"
}

/**
 * @param historicoDesc check-ins ordenados do MAIS RECENTE para o mais antigo.
 */
export async function gerarBriefingIA(
  mentorado: DadosMentorado,
  historicoDesc: DadosCheckin[],
  mentor?: DadosMentor | null
): Promise<BriefingIA> {
  const apiKey = process.env.ANTHROPIC_API_KEY // chave OpenRouter (sk-or-...)
  if (!apiKey) throw new Error("OpenRouter API key ausente")
  if (!historicoDesc || historicoDesc.length === 0) {
    throw new Error("Sem check-ins para analisar")
  }

  const atual = historicoDesc[0]
  // Tabela cronológica (mais antiga → mais recente) para a IA enxergar a evolução.
  const cronologico = [...historicoDesc].reverse()
  const tabela = cronologico
    .map((c, i) => {
      const data = new Date(c.data_envio).toLocaleDateString("pt-BR")
      const conv = c.leads_gerados > 0 ? (c.vendas_reais / c.leads_gerados).toFixed(0) : "N/A"
      return `Semana ${i + 1} (${data}): Vendas R$ ${c.vendas_reais} | Leads ${c.leads_gerados} | Invest R$ ${c.investimento_trafego} | ROI ${roiPct(c)}% | R$/lead ${conv} | Vídeos ${c.videos_postados}`
    })
    .join("\n")

  const tarefas = Array.isArray(atual.tarefas_executadas)
    ? atual.tarefas_executadas.map((t, i) => `${i + 1}. ${t}`).join("\n")
    : "Nenhuma registrada"

  const mentorInfo = mentor?.metodo_trabalho || mentor?.filosofia
    ? `\nMENTOR: ${mentor?.nome || "Não configurado"}
MÉTODO DE TRABALHO: ${mentor?.metodo_trabalho || "Não definido"}
FILOSOFIA DE MENTORIA: ${mentor?.filosofia || "Não definida"}
NICHO FOCO DO MENTOR: ${mentor?.nicho_foco || "Geral"}`
    : ""

  const userMessage = `MENTORADO: ${mentorado.nome} | Nicho: ${mentorado.nicho} | Foco: ${mentorado.foco_macro || "Não definido"}${mentorInfo}

HISTÓRICO DE CHECK-INS (mais antiga → mais recente, ${cronologico.length} semana(s)):
${tabela}

SEMANA MAIS RECENTE — DIFICULDADES RELATADAS:
"${atual.dificuldades_texto || "Nenhuma relatada"}"

SEMANA MAIS RECENTE — TAREFAS EXECUTADAS:
${tarefas}

Considere o método de trabalho e filosofia do mentor ao gerar o diagnóstico e a pauta.
Compare as semanas, diagnostique o gargalo e gere a pauta da call alinhada com a metodologia do mentor.`

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
      max_tokens: 1000,
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
    evolucao: typeof parsed.evolucao === "string" ? parsed.evolucao : "",
    pauta: Array.isArray(parsed.pauta) ? parsed.pauta.map(String) : [],
  }
}
