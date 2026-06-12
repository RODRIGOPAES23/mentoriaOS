import { NextRequest, NextResponse } from "next/server"
import { gerarResposta } from "@/lib/brain"
import { enviarWhatsApp } from "@/lib/meta"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Verificação do webhook (Meta chama via GET na configuração)
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const mode = p.get("hub.mode")
  const token = p.get("hub.verify_token")
  const challenge = p.get("hub.challenge")
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 })
  }
  return new NextResponse("forbidden", { status: 403 })
}

// Recebe mensagens do WhatsApp Cloud API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const changes = body?.entry?.flatMap((e: any) => e.changes ?? []) ?? []
    for (const ch of changes) {
      const value = ch.value ?? {}
      const messages = value.messages ?? []
      for (const msg of messages) {
        if (msg.type !== "text") continue
        const from: string = msg.from // telefone do lead
        const texto: string = msg.text?.body ?? ""
        if (!from || !texto) continue

        const { reply } = await gerarResposta({
          conversationId: `wa:${from}`,
          canal: "whatsapp",
          campanhaId: process.env.WHATSAPP_CAMPANHA || "cklareza",
          userText: texto,
        })
        await enviarWhatsApp(from, reply)
      }
    }
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("WhatsApp webhook erro:", error)
    return NextResponse.json({ error: String(error) }, { status: 200 }) // 200 evita reenvio em loop
  }
}
