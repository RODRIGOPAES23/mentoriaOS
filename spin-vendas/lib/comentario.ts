// Gera comentário contextual e NÃO-spam para vídeos do YouTube.
// Mesmo padrão OpenRouter do brain.ts. Regra de ouro: SEM link no corpo
// (link dispara retenção por spam do YouTube) e frase sempre variada.
const OPENROUTER_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY

// Frases de fallback (caso o LLM falhe) — genéricas, sem link, sem auto-promoção agressiva.
const FALLBACKS = [
  "Conteúdo muito bom, agregou bastante por aqui!",
  "Excelente abordagem, obrigado por compartilhar.",
  "Salvando esse vídeo, baita material.",
  "Ótimos pontos — clareou várias dúvidas que eu tinha.",
]

export async function gerarComentario(opts: {
  tituloVideo: string
  contextoMarca?: string // ex: "CKlareza, gestão de mentorias" — usado só pro tom, NÃO vira propaganda
}): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
  }

  const sys = [
    "Você escreve UM comentário curto e genuíno para um vídeo do YouTube.",
    "Regras rígidas:",
    "- 1 a 2 frases, máximo ~180 caracteres.",
    "- NUNCA inclua link, URL, @, ou 'acesse/clique/confira no site'. Link é proibido.",
    "- Tom de espectador real interessado, não de anúncio. Sem emoji em excesso (no máx 1).",
    "- Pode demonstrar afinidade com o tema, mas sem se vender abertamente.",
    "- Responda APENAS o texto do comentário, sem aspas e sem explicação.",
  ].join("\n")

  const user = `Título do vídeo: "${opts.tituloVideo}"${
    opts.contextoMarca ? `\n(Contexto de quem comenta, só para o tom: ${opts.contextoMarca})` : ""
  }`

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENROUTER_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.9,
        max_tokens: 120,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
      }),
    })
    if (!response.ok) return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
    const data = await response.json()
    let txt: string = data.choices?.[0]?.message?.content?.trim() ?? ""
    txt = txt.replace(/^["']|["']$/g, "").trim()
    // defesa: se o modelo escorregou e meteu link/@, descarta e usa fallback
    if (!txt || /https?:\/\/|www\.|@\w/i.test(txt)) {
      return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
    }
    return txt.slice(0, 200)
  } catch {
    return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
  }
}
