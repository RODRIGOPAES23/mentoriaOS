import { NextRequest, NextResponse } from "next/server"
import { marcarPago } from "@/lib/store"

export const dynamic = "force-dynamic"

// Marcação manual de pagamento (sem Stripe) — útil pra testes e fechamento manual.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { valor } = (await req.json().catch(() => ({}))) as { valor?: number }
    const conv = await marcarPago({ id: params.id }, valor)
    if (!conv) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 })
    return NextResponse.json({ conversa: conv })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
