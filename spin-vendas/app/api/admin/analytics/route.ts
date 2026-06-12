import { NextResponse } from "next/server"
import { calcularLoop } from "@/lib/loop"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const loop = await calcularLoop()
    // Retrocompat: espalha o funil na raiz (consumidores antigos) + bloco loop/vendas novo.
    return NextResponse.json({ ...loop.funil, loop, vendas: loop.vendas })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
