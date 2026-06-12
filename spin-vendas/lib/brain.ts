// Cérebro de vendas — único ponto que fala com o LLM. Todos os canais
// (web, WhatsApp, Instagram) passam por aqui. Inclui defesa anti-vazamento
// e injeção das lições aprendidas (F8).
import { buildSpinPrompt, type SpinMessage } from "./spin-prompt"
import { getCampanha } from "./campanhas"
import { getConversa, salvarConversa, type Conversa } from "./store"
import { licoesAprovadas } from "./playbook"

const OPENROUTER_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY

const MARCADORES_VAZAMENTO = [
  /neil rackham/i,
  /system prompt/i,
  /prompt inicial/i,
  /minhas instru[çc][õo]es/i,
  /fui treinado na metodologia/i,
  /need[\s-]?payoff/i,
  /sinal de compra/i,
  /confidencialidade/i,
  /regras de ouro/i,
  /metodologia spin selling/i,
]
function pareceVazamento(t: string) {
  return MARCADORES_VAZAMENTO.some((re) => re.test(t))
}

const DEFLEXAO =
  "Haha, isso é segredo da casa 😄 Mas voltando: me conta um pouco mais sobre como você opera hoje pra eu ver onde dá pra te ajudar de verdade."

export type RespostaBrain = { reply: string; conversa?: Conversa | null }

// Gera a próxima fala do vendedor.
// - web manda o array `messages` inteiro (sem persistência prévia)
// - canais (WhatsApp/IG) mandam só `userText`; o histórico vem do store
export async function gerarResposta(opts: {
  conversationId: string
  canal: "web" | "whatsapp" | "instagram"
  campanhaId?: string
  messages?: SpinMessage[]
  userText?: string
}): Promise<RespostaBrain> {
  if (!OPENROUTER_API_KEY) {
    return { reply: "Configuração incompleta (sem chave LLM)." }
  }

  const campanha = getCampanha(opts.campanhaId)

  // monta o histórico
  let messages: SpinMessage[]
  if (opts.messages) {
    messages = opts.messages
  } else {
    const conv = await getConversa(opts.conversationId)
    const historico = conv?.messages ?? []
    messages = [...historico, { role: "user", content: opts.userText ?? "" }]
  }

  // prompt = roteiro da campanha + lições aprovadas (F8)
  let systemPrompt = buildSpinPrompt(campanha)
  const licoes = await licoesAprovadas(campanha.id)
  if (licoes.length > 0) {
    systemPrompt += `\n\n## PLAYBOOK (lições de vendas que já fecharam — aplique)\n${licoes
      .map((l) => "- " + l)
      .join("\n")}`
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENROUTER_API_KEY}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.8,
      max_tokens: 600,
    }),
  })
  if (!response.ok) {
    return { reply: `Erro no provedor: ${await response.text()}` }
  }

  const data = await response.json()
  let reply: string = data.choices?.[0]?.message?.content?.trim() ?? ""
  if (pareceVazamento(reply)) reply = DEFLEXAO

  // persiste a conversa (inclui a resposta)
  await salvarConversa(
    opts.conversationId,
    [...messages, { role: "assistant", content: reply }],
    opts.canal,
    campanha.id
  )
  const conversa = await getConversa(opts.conversationId)
  return { reply, conversa }
}
