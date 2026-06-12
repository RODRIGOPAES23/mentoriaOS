// Registro central de FONTES. Para adicionar uma fonte futura (Apollo, LinkedIn,
// diretório X...), basta implementar SourceAdapter e adicionar UMA linha aqui.
import type { SourceAdapter } from "./types"
import { googlePlaces } from "./google-places"
import { csv } from "./csv"

export const SOURCES: SourceAdapter[] = [
  csv,
  googlePlaces,
  // futuros: apollo, linkedin, diretorios... (1 linha cada)
]

export function getSource(id: string): SourceAdapter | undefined {
  return SOURCES.find((s) => s.id === id)
}

// metadados leves p/ a UI (sem expor a função buscar)
export function listarSources() {
  return SOURCES.map((s) => ({
    id: s.id,
    label: s.label,
    descricao: s.descricao,
    configurado: s.configurado(),
    filtros: s.filtros,
  }))
}
