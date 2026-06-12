// API da prospecção: GET = fontes+canais+base+log · POST = buscar/disparar.
import { NextRequest, NextResponse } from "next/server"
import { listarSources } from "@/lib/sources/registry"
import { listarChannels } from "@/lib/channels/registry"
import { buscarEGravar, listarProspects, dispararLote, listarOutreachLog } from "@/lib/prospeccao"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const [prospects, log] = await Promise.all([
    listarProspects({ nicho: p.get("nicho") || undefined, regiao: p.get("regiao") || undefined, status: p.get("status") || undefined }),
    listarOutreachLog(50),
  ])
  return NextResponse.json({
    sources: listarSources(),
    channels: listarChannels(),
    prospects,
    log,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))

  if (body.acao === "buscar" && body.fonte) {
    const r = await buscarEGravar(body.fonte, {
      nicho: body.nicho,
      regiao: body.regiao,
      limite: body.limite,
      extra: body.extra,
    })
    return NextResponse.json({ ok: true, ...r })
  }

  if (body.acao === "disparar" && body.canal && Array.isArray(body.ids)) {
    if (!body.mensagem) return NextResponse.json({ error: "mensagem obrigatória" }, { status: 400 })
    const r = await dispararLote(body.canal, body.ids, body.mensagem)
    return NextResponse.json({ ok: true, ...r })
  }

  return NextResponse.json({ error: "ação desconhecida" }, { status: 400 })
}
