// Envio de mensagens via Meta Graph API (WhatsApp Cloud + Instagram).
// Credenciais via env — se faltarem, as funções viram no-op (logam aviso).
const GRAPH = "https://graph.facebook.com/v21.0"

export async function enviarWhatsApp(para: string, texto: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneId) {
    console.warn("WhatsApp: faltam WHATSAPP_TOKEN/WHATSAPP_PHONE_NUMBER_ID")
    return false
  }
  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: para,
      type: "text",
      text: { body: texto },
    }),
  })
  if (!res.ok) console.error("WhatsApp send falhou:", await res.text())
  return res.ok
}

export async function enviarInstagram(para: string, texto: string): Promise<boolean> {
  const token = process.env.INSTAGRAM_TOKEN // page access token
  if (!token) {
    console.warn("Instagram: falta INSTAGRAM_TOKEN")
    return false
  }
  const res = await fetch(`${GRAPH}/me/messages?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: { id: para }, message: { text: texto } }),
  })
  if (!res.ok) console.error("Instagram send falhou:", await res.text())
  return res.ok
}

// Resposta PRIVADA a um comentário (vira DM) — usado no gatilho de palavra-chave.
export async function responderComentarioIG(commentId: string, texto: string): Promise<boolean> {
  const token = process.env.INSTAGRAM_TOKEN
  if (!token) {
    console.warn("Instagram: falta INSTAGRAM_TOKEN (private_reply no-op)")
    return false
  }
  const res = await fetch(`${GRAPH}/${commentId}/private_replies?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: texto }),
  })
  if (!res.ok) console.error("Instagram private_reply falhou:", await res.text())
  return res.ok
}
