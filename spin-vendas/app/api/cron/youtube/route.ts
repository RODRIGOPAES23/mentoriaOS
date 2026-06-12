// Cron do YouTube — posta NO MÁXIMO 1 comentário por execução.
// Agendar a cada 30 min (vercel.json). Protegido por CRON_SECRET.
// Sem token OAuth → roda em DRY-RUN (gera texto + loga, sem chamar o Google).
import { NextRequest, NextResponse } from "next/server"
import { proximoTarget, marcarComentado, logComment } from "@/lib/distribuicao"
import { gerarComentario } from "@/lib/comentario"
import { postComment, temClientCreds, getAccessToken } from "@/lib/youtube"

export const dynamic = "force-dynamic"

function autorizado(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // sem secret configurado → liberado (dev local)
  const auth = req.headers.get("authorization") || ""
  const q = req.nextUrl.searchParams.get("secret")
  return auth === `Bearer ${secret}` || q === secret
}

export async function GET(req: NextRequest) {
  if (!autorizado(req)) return NextResponse.json({ error: "não autorizado" }, { status: 401 })

  const alvo = await proximoTarget("youtube")
  if (!alvo) return NextResponse.json({ ok: true, msg: "nenhum alvo ativo" })

  const texto = await gerarComentario({
    tituloVideo: alvo.titulo || alvo.target_id,
    contextoMarca: "CKlareza — plataforma de gestão de mentorias",
  })

  // DRY-RUN: sem credencial de cliente OU sem token → não chama o Google
  const token = temClientCreds() ? await getAccessToken() : null
  if (!token) {
    await logComment({ platform: "youtube", target_id: alvo.target_id, text: texto, status: "dry-run" })
    await marcarComentado(alvo.id)
    return NextResponse.json({ ok: true, modo: "dry-run", target: alvo.target_id, texto })
  }

  const r = await postComment(alvo.target_id, texto)
  await logComment({
    platform: "youtube",
    target_id: alvo.target_id,
    text: texto,
    status: r.ok ? "published" : "error",
    error: r.error || null,
    external_id: r.externalId || null,
  })
  await marcarComentado(alvo.id)
  return NextResponse.json({ ok: r.ok, modo: "live", target: alvo.target_id, texto, erro: r.error })
}
