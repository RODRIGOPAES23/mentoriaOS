/**
 * Cliente Supabase para Realtime (browser-only)
 *
 * Usa ANON KEY — o Realtime funciona com a chave pública.
 * RLS está desativado no projeto (service_role nas APIs),
 * então o canal recebe todos os eventos da tabela.
 *
 * Singleton: evita múltiplas conexões WebSocket ao trocar de mentorado.
 */

import { createBrowserClient } from "@supabase/ssr"

let _client: ReturnType<typeof createBrowserClient> | null = null

export function getRealtimeClient() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}
