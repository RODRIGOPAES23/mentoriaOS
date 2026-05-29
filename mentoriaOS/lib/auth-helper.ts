/**
 * Helper para API Routes autenticadas.
 *
 * Retorna { supabase, mentorId } onde:
 *   - supabase: cliente com sessão do usuário logado (aciona RLS)
 *   - mentorId: UUID do mentor na tabela mentors (ligado ao auth.uid())
 *
 * Se não houver sessão válida → lança erro 401.
 * Se mentor não existir para o usuário → lança erro 403.
 */

import { createServerClient } from "./supabase-server"

export async function getAuthContext() {
  const supabase = createServerClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw { status: 401, message: "Não autenticado" }
  }

  // Busca o mentor linkado ao user_id do auth
  const { data: mentor, error: mentorError } = await supabase
    .from("mentors")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (mentorError || !mentor) {
    throw { status: 403, message: "Mentor não encontrado para este usuário" }
  }

  return { supabase, mentorId: mentor.id, userId: user.id, user }
}

export function authError(e: unknown) {
  const err = e as { status?: number; message?: string }
  return Response.json(
    { error: err.message || "Erro de autenticação" },
    { status: err.status || 500 }
  )
}
