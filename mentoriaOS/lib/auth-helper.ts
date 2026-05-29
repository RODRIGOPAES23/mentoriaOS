/**
 * Auth Helper — MODO TESTE (sem autenticação)
 *
 * Usa service_role + mentorId via query param (comportamento v1.x)
 * Para ativar RLS real: descomentar bloco getAuthContext() abaixo
 * e remover getDevContext()
 */

import { adminClient } from "./supabase-server"

// ── MODO TESTE: lê mentorId do query param ou body ──────────────────
export async function getAuthContext(request?: Request) {
  const supabase = adminClient()

  let mentorId: string | null = null

  if (request) {
    const url = new URL(request.url)
    mentorId = url.searchParams.get("mentorId") || url.searchParams.get("mentor_id")
  }

  return { supabase, mentorId: mentorId || "", userId: null, user: null }
}

export function authError(e: unknown) {
  const err = e as { status?: number; message?: string }
  return Response.json(
    { error: err.message || "Erro interno" },
    { status: err.status || 500 }
  )
}

/* ── ATIVAR EM PRODUÇÃO — substitui as funções acima ──────────────────
import { createServerClient } from "./supabase-server"

export async function getAuthContext() {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw { status: 401, message: "Não autenticado" }

  const { data: mentor, error: mErr } = await supabase
    .from("mentors")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (mErr || !mentor) throw { status: 403, message: "Mentor não encontrado" }
  return { supabase, mentorId: mentor.id, userId: user.id, user }
}
────────────────────────────────────────────────────────────────────── */
