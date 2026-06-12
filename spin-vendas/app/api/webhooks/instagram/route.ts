import { NextRequest, NextResponse } from "next/server"
import { gerarResposta } from "@/lib/brain"
import { enviarInstagram } from "@/lib/meta"
import {
  parseComentarios,
  parseMencoes,
  processarComentario,
  processarMencao,
} from "@/lib/instagram-inbound"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const mode = p.get("hub.mode")
  const token = p.get("hub.verify_token")
  const challenge = p.get("hub.challenge")
  if (mode === "subscribe" && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 })
  }
  return new NextResponse("forbidden", { status: 403 })
}

// Recebe eventos do Instagram: DMs (messaging), comentários e menções (changes).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 1) DMs → cérebro SPIN (fluxo já existente)
    for (const e of body?.entry ?? []) {
      const messaging = e.messaging ?? e.standby ?? []
      for (const m of messaging) {
        const senderId: string = m.sender?.id
        const texto: string = m.message?.text ?? ""
        if (!senderId || !texto || m.message?.is_echo) continue
        const { reply } = await gerarResposta({
          conversationId: `ig:${senderId}`,
          canal: "instagram",
          campanhaId: process.env.INSTAGRAM_CAMPANHA || "cklareza",
          userText: texto,
        })
        await enviarInstagram(senderId, reply)
      }
    }

    // 2) Comentários nos nossos posts → gatilho de palavra-chave → DM + lead
    for (const c of parseComentarios(body)) {
      await processarComentario(c)
    }

    // 3) Menções → lead leve para acompanhamento
    for (const m of parseMencoes(body)) {
      await processarMencao(m)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Instagram webhook erro:", error)
    return NextResponse.json({ error: String(error) }, { status: 200 })
  }
}
