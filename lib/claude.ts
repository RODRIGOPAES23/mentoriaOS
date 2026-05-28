import Anthropic from "@anthropic-ai/sdk"
import type { Mentorado, Checkin } from "./supabase"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
})

const SYSTEM_PROMPT = `Você é um Diretor de Operações e Estrategista de Negócios Digital de Elite.

Analise os números (vendas, leads, tráfego, vídeos) e os textos de dificuldades do mentorado. Compare com o histórico acumulado dele.

Entregue um output estruturado em Markdown com:

# Resumo do Momento Atual
[Síntese dos últimos dados do checkin: vendas, leads, investimento, vídeos postados]

# Diagnóstico do Maior Gargalo
[Identifique o problema crítico que bloqueia crescimento. Seja específico e direto.]

# Sugestão de Direcionamento Estratégico
[Ação tática imediata para resolver o gargalo. Vincule aos históricos anteriores se relevante.]

# Pauta Pronta para a Call de Mentoria
[Estrutura de call de 30-60 min focada em resolver o gargalo. Inclua perguntas, ações, e próximos passos.]

Seja conciso, prático e orientado a resultados.`

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

  const userMessage = `
## Mentorado: ${mentorado.nome}
**Nicho**: ${mentorado.nicho}
**Foco Macro**: ${mentorado.foco_macro || "Não definido"}
**Data de Início**: ${mentorado.data_inicio}
**Status**: ${mentorado.status}

## Dados do Checkin (${new Date(checkin.data_envio).toLocaleDateString("pt-BR")})
- **Vendas Reais**: R$ ${checkin.vendas_reais.toFixed(2)}
- **Leads Gerados**: ${checkin.leads_gerados}
- **Investimento em Tráfego**: R$ ${checkin.investimento_trafego.toFixed(2)}
- **Vídeos Postados**: ${checkin.videos_postados}
- **Dificuldades Relatadas**: ${checkin.dificuldades_texto || "Nenhuma"}
- **Tarefas Executadas**: ${JSON.stringify(checkin.tarefas_executadas || [])}

## Histórico Acumulado (Últimas 12 semanas)
${historico}

Faça análise profunda, contextuada e pronta para ação.
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

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : ""

  const sections = parseMarkdownResponse(responseText)

  return {
    resumo_historico: sections["Resumo do Momento Atual"] || "",
    gargalo_identificado: sections["Diagnóstico do Maior Gargalo"] || "",
    evolucao_metricas: sections["Sugestão de Direcionamento Estratégico"] || "",
    sugestao_estrategica: sections["Sugestão de Direcionamento Estratégico"] || "",
    pauta_call_pronta: sections["Pauta Pronta para a Call de Mentoria"] || "",
    tokens_usados: message.usage.input_tokens + message.usage.output_tokens,
  }
}

function parseMarkdownResponse(text: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const lines = text.split("\n")
  let currentSection = ""
  let currentContent = ""

  for (const line of lines) {
    if (line.startsWith("# ")) {
      if (currentSection) {
        sections[currentSection] = currentContent.trim()
      }
      currentSection = line.replace(/^# /, "").trim()
      currentContent = ""
    } else {
      currentContent += line + "\n"
    }
  }

  if (currentSection) {
    sections[currentSection] = currentContent.trim()
  }

  return sections
}
