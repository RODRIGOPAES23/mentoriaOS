/**
 * Guards de autorização para rotas de API.
 *
 * mentorAutorizado(mentorId)         — sessão mentor/super_admin + dono do mentorId
 * sessaoMentorValida()               — qualquer sessão mentor/super_admin ativa
 * rotaCompartilhadaAutorizada(…)     — sessão mentor OU header x-portal-codigo (shared mentor+portal)
 * rotaCompartilhadaAutorizadaPorEntidade(…) — lookup mentorado_id na tabela e delega ao anterior
 * mentorAutorizadoPorEntidade(…)     — lookup mentor_id na tabela + mentorAutorizado (sem portal)
 * naoAutorizado()                    — Response 401
 */
import { createServerClient, adminClient } from "@/lib/supabase-server"

// ── helpers internos ────────────────────────────────────────────────────────

async function resolverSessao() {
  const sb = createServerClient()
  const { data: { user } } = await sb.auth.getUser()
  return user?.email ?? null
}

async function isSuperAdmin(email: string) {
  const { data } = await adminClient().from("super_admins").select("email").eq("email", email).maybeSingle()
  return !!data
}

async function mentorPorEmail(email: string) {
  const { data } = await adminClient().from("mentors").select("id").eq("email", email).maybeSingle()
  return data?.id ?? null
}

// ── guards públicos ─────────────────────────────────────────────────────────

/** Sessão é super_admin OU é exatamente o mentor com este ID. */
export async function mentorAutorizado(mentorId: string | null | undefined): Promise<boolean> {
  if (!mentorId) return false
  try {
    const email = await resolverSessao()
    if (!email) return false
    if (await isSuperAdmin(email)) return true
    const id = await mentorPorEmail(email)
    return id === mentorId
  } catch {
    return false
  }
}

/** Qualquer sessão mentor/super_admin válida (sem checar posse de mentorId). */
export async function sessaoMentorValida(): Promise<boolean> {
  try {
    const email = await resolverSessao()
    if (!email) return false
    if (await isSuperAdmin(email)) return true
    return !!(await mentorPorEmail(email))
  } catch {
    return false
  }
}

/**
 * Para rotas compartilhadas com o portal do mentorado.
 * Aceita:
 *   1. Sessão super_admin
 *   2. Sessão mentor dono deste mentorado (mentor_id matches)
 *   3. Header x-portal-codigo com o codigo_acesso deste mentorado
 */
export async function rotaCompartilhadaAutorizada(
  mentoradoId: string | null | undefined,
  request: Request
): Promise<boolean> {
  if (!mentoradoId) return false
  const admin = adminClient()
  try {
    const email = await resolverSessao()
    if (email) {
      if (await isSuperAdmin(email)) return true
      const mId = await mentorPorEmail(email)
      if (mId) {
        const { data } = await admin.from("mentorados").select("mentor_id").eq("id", mentoradoId).single()
        return !!data && data.mentor_id === mId
      }
    }
  } catch {}
  // fallback: código do portal (sem sessão — mentorado autenticado por código)
  const codigo = (request.headers.get("x-portal-codigo") || "").trim().toUpperCase()
  if (!codigo) return false
  const { data } = await admin.from("mentorados").select("id").eq("id", mentoradoId).eq("codigo_acesso", codigo).maybeSingle()
  return !!data
}

/**
 * Para rotas [id] compartilhadas — busca mentorado_id na tabela, delega ao guard anterior.
 */
export async function rotaCompartilhadaAutorizadaPorEntidade(
  tabela: "tarefas" | "sessoes" | "pagamentos",
  entityId: string,
  request: Request
): Promise<boolean> {
  const { data } = await adminClient().from(tabela).select("mentorado_id").eq("id", entityId).maybeSingle()
  if (!data?.mentorado_id) return false
  return rotaCompartilhadaAutorizada(data.mentorado_id, request)
}

/**
 * Para rotas [id] mentor-only — busca mentor_id na tabela e chama mentorAutorizado.
 * NÃO aceita código do portal.
 */
export async function mentorAutorizadoPorEntidade(
  tabela: "tarefas" | "sessoes" | "pagamentos" | "mentorados",
  entityId: string
): Promise<boolean> {
  const { data } = await adminClient().from(tabela).select("mentor_id").eq("id", entityId).maybeSingle()
  if (!data?.mentor_id) return false
  return mentorAutorizado(data.mentor_id)
}

export function naoAutorizado() {
  return Response.json({ error: "Não autorizado" }, { status: 401, headers: { "Cache-Control": "no-store" } })
}
