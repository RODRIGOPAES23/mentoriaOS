import { NextRequest, NextResponse } from "next/server"
import { decidirLicao } from "@/lib/playbook"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = (await req.json()) as { status: "aprovado" | "rejeitado" }
    if (status !== "aprovado" && status !== "rejeitado") {
      return NextResponse.json({ error: "status inválido" }, { status: 400 })
    }
    const licao = await decidirLicao(params.id, status)
    if (!licao) return NextResponse.json({ error: "não encontrada" }, { status: 404 })
    return NextResponse.json({ licao })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
