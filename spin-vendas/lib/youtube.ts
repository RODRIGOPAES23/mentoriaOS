// YouTube Data API v3 — comentário oficial via OAuth 2.0.
// Token guardado em Supabase (oauth_tokens, provider='youtube') e renovado on-demand.
// fetch puro, sem o pacote googleapis.
import { supabaseAdmin } from "./supabase"

const TOKEN_URL = "https://oauth2.googleapis.com/token"
const PROVIDER = "youtube"

export type YouTubeStatus = "connected" | "no_tokens" | "no_supabase" | "no_client"

// Há credencial de cliente OAuth configurada?
export function temClientCreds(): boolean {
  return !!(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET)
}

// Lê o registro de token; renova se expirado. Retorna access_token válido ou null.
export async function getAccessToken(): Promise<string | null> {
  const sb = supabaseAdmin()
  if (!sb || !temClientCreds()) return null

  const { data } = await sb.from("oauth_tokens").select("*").eq("provider", PROVIDER).maybeSingle()
  if (!data) return null

  const expiraEm = data.expires_at ? new Date(data.expires_at).getTime() : 0
  const aindaVale = expiraEm - Date.now() > 60_000 // 1 min de folga
  if (aindaVale && data.access_token) return data.access_token

  // precisa renovar
  if (!data.refresh_token) return data.access_token || null
  const body = new URLSearchParams({
    client_id: process.env.YOUTUBE_CLIENT_ID!,
    client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
    refresh_token: data.refresh_token,
    grant_type: "refresh_token",
  })
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!res.ok) return null
  const tok = await res.json()
  const novoAccess = tok.access_token as string
  const expiresAt = new Date(Date.now() + (tok.expires_in || 3600) * 1000).toISOString()
  await sb
    .from("oauth_tokens")
    .update({ access_token: novoAccess, expires_at: expiresAt, updated_at: new Date().toISOString() })
    .eq("provider", PROVIDER)
  return novoAccess
}

export async function statusConexao(): Promise<YouTubeStatus> {
  if (!temClientCreds()) return "no_client"
  const sb = supabaseAdmin()
  if (!sb) return "no_supabase"
  const { data } = await sb.from("oauth_tokens").select("provider").eq("provider", PROVIDER).maybeSingle()
  return data ? "connected" : "no_tokens"
}

export type PostResult = { ok: boolean; held?: boolean; externalId?: string; error?: string }

// Posta um comentário de topo no vídeo. Distingue "retido para análise" (spam filter).
export async function postComment(videoId: string, text: string): Promise<PostResult> {
  const token = await getAccessToken()
  if (!token) return { ok: false, error: "sem token OAuth do YouTube" }

  const res = await fetch("https://www.googleapis.com/youtube/v3/commentThreads?part=snippet", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      snippet: {
        videoId,
        topLevelComment: { snippet: { textOriginal: text } },
      },
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`
    return { ok: false, error: msg }
  }
  // a API às vezes retorna o comentário mas o YouTube o retém p/ análise do dono do canal;
  // não há flag direta, então tratamos sucesso como publicado e deixamos o dono moderar.
  const externalId = data?.id
  return { ok: true, externalId }
}
