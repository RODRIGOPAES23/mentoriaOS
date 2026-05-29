import { createClient } from "@supabase/supabase-js"

// Server-side: usa service role (ignora RLS) para carregar mentorados.
export const dynamic = "force-dynamic"

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  })

  const { data, error } = await supabase
    .from("mentorados")
    .select("id, nome, nicho, status, foco_macro, data_inicio")
    .eq("status", "Ativo")
    .order("nome")

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // Quais mentorados têm checkin (para preferir esses ao deduplicar).
  const { data: checkRows } = await supabase
    .from("checkins")
    .select("mentorado_id")
  const comCheckin = new Set((checkRows || []).map((c) => c.mentorado_id))

  // Dedupe por nome, preferindo o registro que possui checkin (mostra métricas).
  const porNome = new Map<string, (typeof data)[number]>()
  for (const m of data || []) {
    const key = (m.nome || "").trim().toLowerCase()
    const atual = porNome.get(key)
    if (!atual) {
      porNome.set(key, m)
    } else if (!comCheckin.has(atual.id) && comCheckin.has(m.id)) {
      porNome.set(key, m) // troca para o que tem dados
    }
  }

  // Ordena: quem tem checkin primeiro, depois alfabético.
  const unique = Array.from(porNome.values()).sort((a, b) => {
    const da = comCheckin.has(a.id) ? 0 : 1
    const db = comCheckin.has(b.id) ? 0 : 1
    if (da !== db) return da - db
    return (a.nome || "").localeCompare(b.nome || "")
  })

  return Response.json({ mentorados: unique })
}
