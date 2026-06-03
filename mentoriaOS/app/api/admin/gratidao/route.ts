import { adminClient } from "@/lib/supabase-server"
import { checkAdminKey, adminUnauthorized } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

function venceu(d: string | null): boolean {
  if (!d) return false
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const [y, mo, dd] = d.split("T")[0].split("-").map(Number)
  return new Date(y, mo - 1, dd) < hoje
}

// GET /api/admin/gratidao → regras de ouro + pipeline cognitivo + oversight dos usuários
export async function GET(req: Request) {
  if (!checkAdminKey(req)) return adminUnauthorized()
  const sb = adminClient()

  const [regrasR, startupsR, empresasR, mentorsR, mentoradosR, pagamentosR, tarefasR] = await Promise.all([
    sb.from("gratidao_memoria_aprendizado").select("*").order("prioridade", { ascending: false }).limit(50),
    sb.from("gratidao_startups").select("id, nome, estado, updated_at"),
    sb.from("empresas").select("id, nome, cor_primaria, ativo"),
    sb.from("mentors").select("id, empresa_id, nome"),
    sb.from("mentorados").select("id, mentor_id"),
    sb.from("pagamentos").select("mentorado_id, status, data_vencimento"),
    sb.from("tarefas").select("mentorado_id, status, data_vencimento"),
  ])

  const mentors = mentorsR.data || []
  const mentorados = mentoradosR.data || []
  const pagamentos = pagamentosR.data || []
  const tarefas = tarefasR.data || []

  // mentorado_id -> empresa_id (via mentor)
  const mentorEmpresa: Record<string, string> = {}
  for (const m of mentors) mentorEmpresa[m.id] = m.empresa_id
  const mdEmpresa: Record<string, string> = {}
  for (const md of mentorados) mdEmpresa[md.id] = mentorEmpresa[md.mentor_id]

  // Oversight por empresa
  const oversight = (empresasR.data || []).map(e => {
    const mds = mentorados.filter(md => mdEmpresa[md.id] === e.id)
    const idsMd = new Set(mds.map(md => md.id))
    const cobrancasVenc = pagamentos.filter(p => idsMd.has(p.mentorado_id) && p.status !== "pago" && venceu(p.data_vencimento)).length
    const tarefasVenc = tarefas.filter(t => idsMd.has(t.mentorado_id) && t.status !== "completed" && venceu(t.data_vencimento)).length
    const alertas = cobrancasVenc + tarefasVenc
    return {
      empresa_id: e.id, nome: e.nome, cor: e.cor_primaria, ativo: e.ativo,
      mentores: mentors.filter(m => m.empresa_id === e.id).length,
      mentorados: mds.length,
      cobrancas_vencidas: cobrancasVenc,
      tarefas_vencidas: tarefasVenc,
      alertas,
      saude: alertas === 0 ? "ok" : alertas <= 3 ? "atencao" : "critico",
    }
  })

  // Pipeline cognitivo (contagem por estado)
  const pipeline: Record<string, number> = {}
  for (const s of startupsR.data || []) pipeline[s.estado] = (pipeline[s.estado] || 0) + 1

  return Response.json({
    regras: regrasR.data || [],
    pipeline,
    startups: startupsR.data || [],
    oversight,
    resumo: {
      total_regras: (regrasR.data || []).length,
      total_alertas: oversight.reduce((s, o) => s + o.alertas, 0),
      empresas_criticas: oversight.filter(o => o.saude === "critico").length,
    },
  }, { headers: NO_CACHE })
}
