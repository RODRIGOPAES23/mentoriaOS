/**
 * Clientes Supabase para Next.js App Router
 *
 * - createServerClient: API Routes + Server Components (lê cookies da request)
 * - createBrowserClient: Client Components
 * - adminClient: service_role para operações que bypassam RLS
 *   (formulário público de check-in, uploads de avatar)
 */

import { createServerClient as _createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!

// ── Server-side (API Routes): respeita sessão do usuário → aciona RLS
export function createServerClient() {
  const cookieStore = cookies()
  return _createServerClient(URL, ANON, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component — cookies read-only, ignorar
        }
      },
    },
  })
}

// ── Admin (service_role): sem RLS — apenas para:
//    1. Formulário público de check-in (mentorado não autenticado)
//    2. Upload de avatar
//    3. Seeds / migrações
export function adminClient() {
  return createClient(URL, SERVICE, { auth: { persistSession: false } })
}
