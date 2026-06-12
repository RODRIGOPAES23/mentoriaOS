// Cliente Supabase server-side (service role — ignora RLS).
// Usado só no servidor (API routes). NUNCA expor a service key no client.
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _client: SupabaseClient | null = null

export function supabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null // sem creds → store cai no fallback JSON
  if (!_client) {
    _client = createClient(url, key, {
      auth: { persistSession: false },
      // O Next.js 14 cacheia requisições GET do fetch global por padrão — isso
      // congelaria os SELECTs do supabase-js no primeiro snapshot. Forçamos
      // no-store para que toda leitura reflita o estado atual do banco.
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: "no-store" }),
      },
    })
  }
  return _client
}
