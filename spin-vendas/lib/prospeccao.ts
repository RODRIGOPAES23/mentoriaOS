// Serviço de prospecção: orquestra fontes → base (prospects) → disparo (canais).
import { supabaseAdmin } from "./supabase"
import { getSource } from "./sources/registry"
import { getChannel } from "./channels/registry"
import type { FiltroBusca } from "./sources/types"

export type ProspectRow = {
  id: string
  nome: string | null
  empresa: string | null
  telefone: string | null
  email: string | null
  instagram: string | null
  site: string | null
  regiao: string | null
  nicho: string | null
  fonte: string
  score_icp: number
  status: string
  criado_em: string
}

// Busca numa fonte e GRAVA na base (dedup por fonte+telefone+email).
export async function buscarEGravar(fonteId: string, filtro: FiltroBusca): Promise<{ achados: number; gravados: number }> {
  const fonte = getSource(fonteId)
  if (!fonte) throw new Error(`fonte desconhecida: ${fonteId}`)
  const prospects = await fonte.buscar(filtro)
  const sb = supabaseAdmin()
  if (!sb) return { achados: prospects.length, gravados: 0 }

  let gravados = 0
  for (const p of prospects) {
    const { error } = await sb.from("prospects").upsert(
      {
        nome: p.nome ?? null,
        empresa: p.empresa ?? null,
        telefone: p.telefone ?? null,
        email: p.email ?? null,
        instagram: p.instagram ?? null,
        site: p.site ?? null,
        regiao: p.regiao ?? null,
        nicho: p.nicho ?? null,
        fonte: fonteId,
        dados: p.dados ?? null,
      },
      { onConflict: "fonte,telefone,email", ignoreDuplicates: true }
    )
    if (!error) gravados++
  }
  return { achados: prospects.length, gravados }
}

export async function listarProspects(filtros?: { nicho?: string; regiao?: string; status?: string }): Promise<ProspectRow[]> {
  const sb = supabaseAdmin()
  if (!sb) return []
  let q = sb.from("prospects").select("*").order("criado_em", { ascending: false }).limit(500)
  if (filtros?.nicho) q = q.ilike("nicho", `%${filtros.nicho}%`)
  if (filtros?.regiao) q = q.ilike("regiao", `%${filtros.regiao}%`)
  if (filtros?.status) q = q.eq("status", filtros.status)
  const { data } = await q
  return (data as ProspectRow[]) || []
}

// Dispara mensagem para uma lista de prospect ids por um canal.
export async function dispararLote(
  canalId: string,
  prospectIds: string[],
  mensagem: string
): Promise<{ enviados: number; resultados: Record<string, number> }> {
  const canal = getChannel(canalId)
  if (!canal) throw new Error(`canal desconhecido: ${canalId}`)
  const sb = supabaseAdmin()
  if (!sb) return { enviados: 0, resultados: {} }

  const { data } = await sb.from("prospects").select("*").in("id", prospectIds)
  const prospects = (data as ProspectRow[]) || []
  const resultados: Record<string, number> = {}
  let enviados = 0

  for (const p of prospects) {
    const r = await canal.enviar({ nome: p.nome, telefone: p.telefone, email: p.email, instagram: p.instagram }, mensagem)
    resultados[r.status] = (resultados[r.status] || 0) + 1
    if (r.status === "enviado" || r.status === "dry-run") enviados++
    await sb.from("outreach_log").insert({
      prospect_id: p.id,
      canal: canalId,
      mensagem,
      status: r.status,
      erro: r.erro || null,
    })
    if (r.status === "enviado") {
      await sb.from("prospects").update({ status: "contatado" }).eq("id", p.id)
    }
  }
  return { enviados, resultados }
}

export async function listarOutreachLog(limit = 50) {
  const sb = supabaseAdmin()
  if (!sb) return []
  const { data } = await sb.from("outreach_log").select("*").order("criado_em", { ascending: false }).limit(limit)
  return data || []
}
