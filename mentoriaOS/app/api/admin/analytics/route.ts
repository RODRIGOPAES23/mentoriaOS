import { adminClient } from "@/lib/supabase-server"
import { isAdminAuthorized, adminUnauthorized } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

const DAY = 86400000

function topCounts(rows: any[], key: string, limit = 10) {
  const m: Record<string, number> = {}
  for (const r of rows) {
    const v = (r[key] || "—") as string
    m[v] = (m[v] || 0) + 1
  }
  return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, valor]) => ({ label, valor }))
}

// GET /api/admin/analytics → métricas de uso do site + status do GRATIDÃO (super-admin)
export async function GET(req: Request) {
  if (!(await isAdminAuthorized(req))) return adminUnauthorized()
  const sb = adminClient()

  // Até 20k visitas recentes (suficiente para agregação em memória nesta fase)
  const { data: visitsRaw } = await sb
    .from("site_visits")
    .select("created_at, path, country, city, region, device, session_id, logged_in, referrer")
    .order("created_at", { ascending: false })
    .limit(20000)
  const visits = visitsRaw || []

  const now = Date.now()
  const since = (d: number) => visits.filter(v => now - new Date(v.created_at).getTime() <= d * DAY)
  const v7 = since(7), v30 = since(30), vToday = since(1)

  const uniq = (arr: any[]) => new Set(arr.map(v => v.session_id).filter(Boolean)).size

  // Conversão: sessões que chegaram à área logada / total de sessões
  const sessoesLogadas = new Set(visits.filter(v => v.logged_in).map(v => v.session_id).filter(Boolean)).size
  const sessoesTotais = uniq(visits)

  // Série dos últimos 14 dias (visitas por dia)
  const serie: { dia: string; valor: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * DAY)
    const key = d.toISOString().slice(0, 10)
    const valor = visits.filter(v => v.created_at.slice(0, 10) === key).length
    serie.push({ dia: key.slice(5), valor })
  }

  // GRATIDÃO — sinais de funcionamento
  const [{ count: gMem }, { data: gLast }, { count: gStartups }, { count: gCheck }] = await Promise.all([
    sb.from("gratidao_memoria_aprendizado").select("*", { count: "exact", head: true }),
    sb.from("gratidao_memoria_aprendizado").select("created_at").order("created_at", { ascending: false }).limit(1),
    sb.from("gratidao_startups").select("*", { count: "exact", head: true }),
    sb.from("gratidao_checklist").select("*", { count: "exact", head: true }),
  ]).catch(() => [{ count: 0 }, { data: [] }, { count: 0 }, { count: 0 }] as any)

  const ultimaMemoria = gLast?.[0]?.created_at || null
  const gratidao = {
    memorias: gMem || 0,
    startups: gStartups || 0,
    checklist: gCheck || 0,
    ultima_atividade: ultimaMemoria,
    ativo: (gMem || 0) > 0,
  }

  return Response.json({
    kpis: {
      total: visits.length,
      hoje: vToday.length,
      ultimos7: v7.length,
      ultimos30: v30.length,
      visitantes_unicos: sessoesTotais,
      visitantes_unicos_7d: uniq(v7),
      sessoes_logadas: sessoesLogadas,
      conversao: sessoesTotais > 0 ? Math.round((sessoesLogadas / sessoesTotais) * 100) : 0,
    },
    serie,
    paises: topCounts(v30, "country"),
    cidades: topCounts(v30, "city"),
    paginas: topCounts(v30, "path"),
    dispositivos: topCounts(v30, "device", 3),
    origens: topCounts(v30.filter(v => v.referrer), "referrer", 8),
    gratidao,
  }, { headers: NO_CACHE })
}
