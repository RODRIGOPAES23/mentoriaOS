import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

/**
 * POST /api/upload/signed
 * Body: { path: string }
 * Gera uma signed upload URL (service role) para o cliente subir arquivos grandes
 * DIRETO pro Supabase, sem passar pelo limite de 4.5MB do Vercel e sem expor o bucket.
 */
export async function POST(request: Request) {
  let body: any
  try { body = await request.json() }
  catch { return Response.json({ error: "Body inválido" }, { status: 400, headers: NO_CACHE }) }

  const path = String(body.path || "").trim()
  if (!path) return Response.json({ error: "path obrigatório" }, { status: 400, headers: NO_CACHE })

  const supabase = admin()
  // upsert via signed URL: removemos o existente para permitir reupload do mesmo path
  await supabase.storage.from("avatars").remove([path]).catch(() => {})

  const { data, error } = await supabase.storage.from("avatars").createSignedUploadUrl(path)
  if (error || !data) {
    return Response.json({ error: error?.message || "Falha ao gerar URL" }, { status: 500, headers: NO_CACHE })
  }

  const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path)

  return Response.json({
    token: data.token,
    path: data.path,
    publicUrl: pub.publicUrl,
  }, { headers: NO_CACHE })
}
