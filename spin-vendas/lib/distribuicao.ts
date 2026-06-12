// Camada de dados da distribuição: alvos (vídeos) + log de comentários.
import { supabaseAdmin } from "./supabase"

export type Target = {
  id: string
  platform: string
  target_id: string
  titulo: string | null
  ativo: boolean
  ultimo_comentario_em: string | null
  criado_em: string
}

export type CommentLog = {
  id: string
  platform: string
  target_id: string
  text: string
  status: "published" | "held" | "error" | "dry-run"
  error: string | null
  external_id: string | null
  criado_em: string
}

export async function listarTargets(platform = "youtube"): Promise<Target[]> {
  const sb = supabaseAdmin()
  if (!sb) return []
  const { data } = await sb
    .from("distribuicao_targets")
    .select("*")
    .eq("platform", platform)
    .order("criado_em", { ascending: false })
  return (data as Target[]) || []
}

export async function addTarget(platform: string, targetId: string, titulo?: string): Promise<Target | null> {
  const sb = supabaseAdmin()
  if (!sb) return null
  const { data } = await sb
    .from("distribuicao_targets")
    .upsert({ platform, target_id: targetId, titulo: titulo || null }, { onConflict: "platform,target_id" })
    .select()
    .maybeSingle()
  return (data as Target) || null
}

export async function toggleTarget(id: string, ativo: boolean): Promise<void> {
  const sb = supabaseAdmin()
  if (!sb) return
  await sb.from("distribuicao_targets").update({ ativo }).eq("id", id)
}

// Próximo alvo a comentar: ativo, com ultimo_comentario_em mais antigo (nulls primeiro).
export async function proximoTarget(platform = "youtube"): Promise<Target | null> {
  const sb = supabaseAdmin()
  if (!sb) return null
  const { data } = await sb
    .from("distribuicao_targets")
    .select("*")
    .eq("platform", platform)
    .eq("ativo", true)
    .order("ultimo_comentario_em", { ascending: true, nullsFirst: true })
    .limit(1)
    .maybeSingle()
  return (data as Target) || null
}

export async function marcarComentado(id: string): Promise<void> {
  const sb = supabaseAdmin()
  if (!sb) return
  await sb.from("distribuicao_targets").update({ ultimo_comentario_em: new Date().toISOString() }).eq("id", id)
}

export async function logComment(entry: {
  platform: string
  target_id: string
  text: string
  status: CommentLog["status"]
  error?: string | null
  external_id?: string | null
}): Promise<void> {
  const sb = supabaseAdmin()
  if (!sb) return
  await sb.from("comments_log").insert({
    platform: entry.platform,
    target_id: entry.target_id,
    text: entry.text,
    status: entry.status,
    error: entry.error || null,
    external_id: entry.external_id || null,
  })
}

export async function listarLog(platform?: string, limit = 30): Promise<CommentLog[]> {
  const sb = supabaseAdmin()
  if (!sb) return []
  let q = sb.from("comments_log").select("*").order("criado_em", { ascending: false }).limit(limit)
  if (platform) q = q.eq("platform", platform)
  const { data } = await q
  return (data as CommentLog[]) || []
}
