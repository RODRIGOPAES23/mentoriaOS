// Fonte: CSV / colar lista — funciona SEM nenhuma chave (ideal pra testar a
// base e os disparos hoje). O texto colado vem no filtro.extra.csv.
import type { SourceAdapter, Prospect, FiltroBusca } from "./types"

// Parser CSV simples: 1ª linha = cabeçalho. Aceita ; ou , como separador.
function parseCSV(texto: string): Prospect[] {
  const linhas = texto.trim().split(/\r?\n/).filter(Boolean)
  if (linhas.length < 2) return []
  const sep = linhas[0].includes(";") ? ";" : ","
  const cab = linhas[0].split(sep).map((c) => c.trim().toLowerCase())
  const idx = (nomes: string[]) => cab.findIndex((c) => nomes.includes(c))
  const iNome = idx(["nome", "name", "contato"])
  const iEmpresa = idx(["empresa", "company", "negocio"])
  const iTel = idx(["telefone", "phone", "whatsapp", "celular", "fone"])
  const iEmail = idx(["email", "e-mail"])
  const iInsta = idx(["instagram", "insta", "@"])
  const iSite = idx(["site", "website", "url"])
  const iRegiao = idx(["regiao", "região", "cidade", "city"])
  const iNicho = idx(["nicho", "segmento", "tipo"])

  return linhas.slice(1).map((l) => {
    const col = l.split(sep).map((c) => c.trim())
    const g = (i: number) => (i >= 0 ? col[i] || null : null)
    return {
      nome: g(iNome),
      empresa: g(iEmpresa),
      telefone: g(iTel),
      email: g(iEmail),
      instagram: g(iInsta),
      site: g(iSite),
      regiao: g(iRegiao),
      nicho: g(iNicho),
      dados: { origem: "csv" },
    }
  })
}

export const csv: SourceAdapter = {
  id: "csv",
  label: "Importar lista (CSV)",
  descricao: "Cole uma lista que você já tem. Funciona sem nenhuma chave.",
  configurado: () => true, // nunca precisa de credencial
  filtros: [
    { campo: "csv", label: "Cole o CSV (1ª linha = cabeçalho: nome,telefone,email,...)", tipo: "textarea" },
    { campo: "nicho", label: "Nicho (rótulo p/ todos)", tipo: "text" },
    { campo: "regiao", label: "Região (rótulo p/ todos)", tipo: "text" },
  ],
  async buscar(filtro: FiltroBusca): Promise<Prospect[]> {
    const texto = filtro.extra?.csv as string | undefined
    if (!texto) return []
    const ps = parseCSV(texto)
    // aplica rótulos globais quando a linha não trouxe
    return ps.map((p) => ({
      ...p,
      nicho: p.nicho || filtro.nicho || null,
      regiao: p.regiao || filtro.regiao || null,
    }))
  },
}
