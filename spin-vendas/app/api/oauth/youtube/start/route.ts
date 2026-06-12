// Inicia o consentimento OAuth do YouTube. Redireciona para o Google.
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const clientId = process.env.YOUTUBE_CLIENT_ID
  const redirect = process.env.YOUTUBE_REDIRECT_URI
  if (!clientId || !redirect) {
    return NextResponse.json({ error: "YOUTUBE_CLIENT_ID / YOUTUBE_REDIRECT_URI não configurados" }, { status: 400 })
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirect,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.force-ssl",
    access_type: "offline",
    prompt: "consent", // força retorno do refresh_token
  })
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
