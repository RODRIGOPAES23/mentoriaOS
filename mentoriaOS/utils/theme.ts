/**
 * Paleta centralizada CKlareza — Google-Clean Light
 * Única fonte de verdade. Nunca duplicar inline.
 */
export const C = {
  bg:     "#ffffff",   // body
  card:   "#f8f9fa",   // superfícies primárias
  card2:  "#f3f4f6",   // superfícies secundárias / hover
  input:  "#ffffff",   // fundo de inputs (branco)
  border: "#e5e7eb",   // bordas sutis
  muted:  "#6b7280",   // texto secundário
  green:  "#10b981",   // sucesso / ativo
  blue:   "#3b82f6",   // destaque / info
  amber:  "#f59e0b",   // atenção / warning
  red:    "#ef4444",   // erro / vencido
  violet: "#8b5cf6",   // IA / briefing
  gold:   "#d4af37",   // assinatura de marca CKlareza (20% opacidade)
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
