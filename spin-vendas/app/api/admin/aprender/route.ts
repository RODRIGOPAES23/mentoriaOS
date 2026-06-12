import { NextRequest, NextResponse } from "next/server"
import { aprenderComVendas } from "@/lib/playbook"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Dispara o aprendizado: analisa vendas fechadas e propõe lições (pendentes).
export async function POST(req: NextRequest) {
  try {
    const { campanhaId } = (await req.json().catch(() => ({}))) as { campanhaId?: string }
    const r = await aprenderComVendas(campanhaId || "cklareza")
    return NextResponse.json(r)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
