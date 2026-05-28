import Anthropic from "@anthropic-ai/sdk"
import type { Mentorado, Checkin } from "./supabase"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
})

const SYSTEM_PROMPT = `Você é um Diretor de Operações e Estrategista de Negócios Digital de Elite. Sua missão é analisar o check-in semanal do mentorado e preparar o mentor humano para uma call de mentoria altamente estratégica de 30 minutos.

INSTRUÇÕES CRÍTICAS:
- Analise os números (vendas, leads, tráfego, vídeos) com frieza total.
- Correlacione com o histórico acumulado para detectar tendências.
- NUNCA concorde com o mentorado por simpatia. Se os números estão ruins, aponte a falha operacional.
- Estruture sua resposta OBRIGATORIAMENTE usando as tags XML abaixo. NÃO use Markdown, NÃO use ### headers.

OUTPUT OBRIGATÓRIO EM TAGS XML:

<gargalo>
[Descreva o maior obstáculo atual em um parágrafo curto (máx 3 linhas). Seja específico e direto.]
</gargalo>

<sugestao>
[Escreva as recomendações estratégicas ACIONÁVEIS. Lista numerada de ações imediatas. Máx 5 ações.]
</sugestao>

<pauta>
[Monte o roteiro minuto a minuto da call de 30-60 min. Estrutura: Abertura (2min) → Diagnóstico (10min) → Ações (15min) → Métricas de Sucesso (5min) → Encerramento (3min). Use bullet points.]
</pauta>

REGRAS DE TOM:
- Direto, pragmático, sem enrolação.
- Foque na correlação entre números frios e relatos quentes.
- Se há incoerência (ex: muitos leads mas poucas vendas), identifique o gap.`

export async function analyzeCheckinWithClaude(
  mentorado: Mentorado,
  checkin: Checkin
): Promise<{
  resumo_historico: string
  gargalo_identificado: string
  evolucao_metricas: string
  sugestao_estrategica: string
  pauta_call_pronta: string
  tokens_usados: number
}> {
  const historico = mentorado.historico_acumulado
    ? JSON.stringify(mentorado.historico_acumulado, null, 2)
    : "Sem histórico anterior"

  const roi = checkin.investimento_trafego > 0
    ? (checkin.vendas_reais / checkin.investimento_trafego).toFixed(2)
    : "Sem investimento"

  const userMessage = `
CONTEXTO DO MENTORADO:
- Nome: ${mentorado.nome}
- Nicho: ${mentorado.nicho}
- Foco Macro: ${mentorado.foco_macro || "Não definido"}
- Status: ${mentorado.status}

DADOS DA SEMANA (${new Date(checkin.data_envio).toLocaleDateString("pt-BR")}):
- Vendas Reais: R$ ${checkin.vendas_reais.toFixed(2)}
- Leads Gerados: ${checkin.leads_gerados}
- Investimento em Tráfego: R$ ${checkin.investimento_trafego.toFixed(2)}
- ROI: ${roi}x
- Vídeos Postados: ${checkin.videos_postados}

DIFICULDADES RELATADAS:
"${checkin.dificuldades_texto || "Nenhuma relatada"}"

TAREFAS EXECUTADAS:
${Array.isArray(checkin.tarefas_executadas)
  ? checkin.tarefas_executadas.map((t, i) => `${i + 1}. ${t}`).join("\n")
  : "Nenhuma registrada"}

HISTÓRICO ACUMULADO (últimas 12 semanas):
${historico}

Analise profunda e pronta para ação.
`

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  })

  // PARSING SEGURO COM REGEX (Evita crash de parsing errado)
  const responseText =
    message.content[0].type === "text" ? message.content[0].text : ""

  const gargalo = extractXMLTag("gargalo", responseText)
  const sugestao = extractXMLTag("sugestao", responseText)
  const pauta = extractXMLTag("pauta", responseText)

  return {
    resumo_historico: `Análise de ${mentorado.nome} - Semana de ${new Date(checkin.data_envio).toLocaleDateString("pt-BR")}`,
    gargalo_identificado: gargalo,
    evolucao_metricas: `ROI: ${roi}x | Leads/Vendas: ${checkin.leads_gerados > 0 ? (checkin.vendas_reais / checkin.leads_gerados).toFixed(2) : "N/A"}`,
    sugestao_estrategica: sugestao,
    pauta_call_pronta: pauta,
    tokens_usados: message.usage.input_tokens + message.usage.output_tokens,
  }
}

/**
 * Extrai conteúdo seguro de tags XML usando Regex
 * Robusto contra quebras ou formatação incorreta do Claude
 */
function extractXMLTag(tagName: string, text: string): string {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "i")
  const match = text.match(regex)

  if (match && match[1]) {
    return match[1].trim()
  }

  // Fallback se a tag não for encontrada
  console.warn(`Tag <${tagName}> não encontrada na resposta do Claude`)
  return `Análise de ${tagName} não disponível. Por favor, tente novamente.`
}
