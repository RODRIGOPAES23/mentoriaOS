/**
 * Paleta centralizada CKlareza — Plecto Navy
 * Única fonte de verdade. Nunca duplicar inline.
 */
export const C = {
  bg:     "#0c1c2c",   // body
  card:   "#0f2540",   // superfícies primárias
  card2:  "#112a4a",   // superfícies secundárias / hover
  border: "#1e3a5f",   // bordas sutis
  muted:  "#4d7fa8",   // texto secundário
  green:  "#00d68f",   // sucesso / ativo
  blue:   "#4c9aff",   // destaque / info
  amber:  "#f59e0b",   // atenção / warning
  red:    "#f05252",   // erro / vencido
  violet: "#a78bfa",   // IA / briefing
} as const

export type ThemeColor = keyof typeof C

/** Badge semitransparente para tema dark */
export function badgeStyle(color: string) {
  return {
    background: `${color}18`,
    border: `1px solid ${color}33`,
    color,
  }
}

/** Card style padrão */
export const cardStyle = {
  background: C.card,
  border: `1px solid ${C.border}`,
} as const
