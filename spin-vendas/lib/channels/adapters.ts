// Adaptadores de canal. Cada um é no-op seguro até a chave existir (status
// 'sem-chave'), então a régua inteira é testável sem queimar nada.
import type { ChannelAdapter } from "./types"
import { enviarWhatsApp } from "../meta"

// Canal MOCK: sempre disponível, não envia nada — só confirma a régua (dry-run).
export const mock: ChannelAdapter = {
  id: "mock",
  label: "Simulação (dry-run)",
  descricao: "Não envia de verdade — testa a régua e registra o log. Sempre disponível.",
  campoDestino: "qualquer",
  configurado: () => true,
  async enviar() {
    return { status: "dry-run" }
  },
}

// E-mail: cold outbound legítimo. Pronto p/ Resend (RESEND_API_KEY + EMAIL_FROM).
export const email: ChannelAdapter = {
  id: "email",
  label: "E-mail",
  descricao: "Sequência de e-mail. O canal de cold outbound mais seguro.",
  campoDestino: "email",
  configurado: () => !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
  async enviar(destino, mensagem) {
    const key = process.env.RESEND_API_KEY
    const from = process.env.EMAIL_FROM
    if (!key || !from) return { status: "sem-chave" }
    if (!destino.email) return { status: "erro", erro: "prospect sem e-mail" }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: destino.email,
        subject: "Sobre a sua operação",
        text: mensagem,
      }),
    })
    return res.ok ? { status: "enviado" } : { status: "erro", erro: `HTTP ${res.status}` }
  },
}

// WhatsApp: via Cloud API (reusa lib/meta.ts). ⚠️ só template aprovado p/ cold.
export const whatsapp: ChannelAdapter = {
  id: "whatsapp",
  label: "WhatsApp",
  descricao: "Mensagem via WhatsApp Cloud API.",
  campoDestino: "telefone",
  aviso: "Cold só com TEMPLATE aprovado pela Meta + opt-out. Volume controlado p/ não banir o número.",
  configurado: () => !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
  async enviar(destino, mensagem) {
    if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) return { status: "sem-chave" }
    if (!destino.telefone) return { status: "erro", erro: "prospect sem telefone" }
    const tel = destino.telefone.replace(/\D/g, "")
    const ok = await enviarWhatsApp(tel, mensagem)
    return ok ? { status: "enviado" } : { status: "erro", erro: "falha no envio" }
  },
}

// Instagram: ⚠️ a API NÃO permite cold DM. Só responde a quem já te escreveu.
// Fica registrado para transparência; sempre retorna bloqueado p/ cold.
export const instagram: ChannelAdapter = {
  id: "instagram",
  label: "Instagram DM",
  descricao: "DM via Graph API.",
  campoDestino: "instagram",
  aviso: "A API do IG NÃO permite cold DM a quem nunca te escreveu. Use o ímã inbound (comentário→DM).",
  configurado: () => false, // cold outbound é impossível por design
  async enviar() {
    return { status: "erro", erro: "cold DM não é permitido pela API do Instagram" }
  },
}
