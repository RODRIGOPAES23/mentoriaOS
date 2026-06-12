// API admin da distribuição: lista alvos + log + status, e cria/alterna alvos.
import { NextRequest, NextResponse } from "next/server"
import { listarTargets, addTarget, toggleTarget, listarLog } from "@/lib/distribuicao"
import { statusConexao } from "@/lib/youtube"

export const dynamic = "force-dynamic"

// Extrai videoId de uma URL do YouTube ou aceita o ID puro.
function extrairVideoId(input: string): string {
  const s = input.trim()
  const m =
    s.match(/[?&]v=([\w-]{11})/) ||
    s.match(/youtu\.be\/([\w-]{11})/) ||
    s.match(/\/shorts\/([\w-]{11})/)
  return m ? m[1] : s
}

export async function GET() {
  const [targets, log, status] = await Promise.all([
    listarTargets("youtube"),
    listarLog("youtube", 30),
    statusConexao(),
  ])
  return NextResponse.json({ targets, log, status })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (body.acao === "toggle" && body.id) {
    await toggleTarget(body.id, !!body.ativo)
    return NextResponse.json({ ok: true })
  }
  if (body.acao === "add" && body.target) {
    const videoId = extrairVideoId(String(body.target))
    if (videoId.length < 8) return NextResponse.json({ error: "ID/URL inválido" }, { status: 400 })
    const t = await addTarget("youtube", videoId, body.titulo)
    return NextResponse.json({ ok: true, target: t })
  }
  return NextResponse.json({ error: "ação desconhecida" }, { status: 400 })
}
