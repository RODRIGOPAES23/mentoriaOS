// Fonte: Google Maps/Places — busca empresas por nicho + região.
// Pronto para a chave: sem GOOGLE_PLACES_API_KEY, configurado()=false e a UI
// mostra "configurar". Com a chave, busca de verdade via Places API (Text Search).
import type { SourceAdapter, Prospect, FiltroBusca } from "./types"

export const googlePlaces: SourceAdapter = {
  id: "google_places",
  label: "Google Maps",
  descricao: "Empresas por nicho + cidade/região (nome, telefone, site).",
  configurado: () => !!process.env.GOOGLE_PLACES_API_KEY,
  filtros: [
    { campo: "nicho", label: "Nicho / tipo de negócio", tipo: "text" },
    { campo: "regiao", label: "Cidade ou região", tipo: "text" },
    { campo: "limite", label: "Quantos buscar (máx 60)", tipo: "number" },
  ],
  async buscar(filtro: FiltroBusca): Promise<Prospect[]> {
    const key = process.env.GOOGLE_PLACES_API_KEY
    if (!key) return [] // sem chave → nada (a UI já avisa que precisa configurar)

    const query = [filtro.nicho, filtro.regiao].filter(Boolean).join(" em ")
    const limite = Math.min(filtro.limite || 20, 60)
    const out: Prospect[] = []
    let pageToken: string | undefined

    // Places Text Search devolve 20 por página, até 3 páginas (60).
    while (out.length < limite) {
      const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json")
      url.searchParams.set("query", query)
      url.searchParams.set("key", key)
      if (pageToken) url.searchParams.set("pagetoken", pageToken)

      const res = await fetch(url, { cache: "no-store" })
      const data = await res.json().catch(() => ({}))
      for (const p of data.results || []) {
        // Detalhe (telefone/site) exige um Place Details por item — feito sob demanda.
        let telefone: string | null = null
        let site: string | null = null
        try {
          const det = new URL("https://maps.googleapis.com/maps/api/place/details/json")
          det.searchParams.set("place_id", p.place_id)
          det.searchParams.set("fields", "formatted_phone_number,website")
          det.searchParams.set("key", key)
          const dres = await fetch(det, { cache: "no-store" })
          const dj = await dres.json().catch(() => ({}))
          telefone = dj.result?.formatted_phone_number || null
          site = dj.result?.website || null
        } catch {
          /* segue sem detalhe */
        }
        out.push({
          nome: p.name,
          empresa: p.name,
          telefone,
          site,
          regiao: filtro.regiao || null,
          nicho: filtro.nicho || null,
          dados: { endereco: p.formatted_address, rating: p.rating, place_id: p.place_id },
        })
        if (out.length >= limite) break
      }
      pageToken = data.next_page_token
      if (!pageToken) break
      await new Promise((r) => setTimeout(r, 2000)) // token leva ~2s p/ ativar
    }
    return out
  },
}
