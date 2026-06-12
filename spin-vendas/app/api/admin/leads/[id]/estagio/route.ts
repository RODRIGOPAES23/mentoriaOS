import { NextRequest, NextResponse } from "next/server"
import { atualizarEstagio, ESTAGIOS, type Estagio } from "@/lib/store"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { estagio, motivoPerda } = (await req.json()) as {
      estagio: Estagio
      motivoPerda?: string
    }
    if (!ESTAGIOS.includes(estagio)) {
      return NextResponse.json({ error: "Estágio inválido" }, { status: 400 })
    }
    const conv = await atualizarEstagio(params.id, estagio, motivoPerda ?? null)
    if (!conv) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 })
    }
    return NextResponse.json({ conversa: conv })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
