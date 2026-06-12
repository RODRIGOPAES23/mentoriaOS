// Callback do OAuth do YouTube: troca o code por tokens e grava em oauth_tokens.
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { api } from "@/lib/basePath"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  if (!code) return NextResponse.json({ error: "code ausente" }, { status: 400 })

  const clientId = process.env.YOUTUBE_CLIENT_ID
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET
  const redirect = process.env.YOUTUBE_REDIRECT_URI
  if (!clientId || !clientSecret || !redirect) {
    return NextResponse.json({ error: "credenciais OAuth não configuradas" }, { status: 400 })
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirect,
      grant_type: "authorization_code",
    }),
  })
  const tok = await tokenRes.json().catch(() => ({}))
  if (!tokenRes.ok || !tok.access_token) {
    return NextResponse.json({ error: "falha ao trocar code", detalhe: tok }, { status: 400 })
  }

  const sb = supabaseAdmin()
  if (!sb) return NextResponse.json({ error: "sem Supabase" }, { status: 500 })

  await sb.from("oauth_tokens").upsert(
    {
      provider: "youtube",
      access_token: tok.access_token,
      refresh_token: tok.refresh_token || null,
      expires_at: new Date(Date.now() + (tok.expires_in || 3600) * 1000).toISOString(),
      scope: tok.scope || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "provider" }
  )

  // volta pro painel de distribuição
  return NextResponse.redirect(new URL(api("/admin/distribuicao?conectado=1"), req.nextUrl.origin))
}
