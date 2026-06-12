import { NextRequest, NextResponse } from "next/server"
import { gerarResposta } from "@/lib/brain"
import type { SpinMessage } from "@/lib/spin-prompt"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId, campanhaId } = (await req.json()) as {
      messages: SpinMessage[]
      conversationId?: string
      campanhaId?: string
    }
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "messages[] é obrigatório" }, { status: 400 })
    }

    const { reply } = await gerarResposta({
      conversationId: conversationId || crypto.randomUUID(),
      canal: "web",
      campanhaId,
      messages,
    })
    return NextResponse.json({ reply })
  } catch (error) {
    console.error("SPIN error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
