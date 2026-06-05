/**
 * Paleta centralizada CKlareza — reativa ao tema (light / dark cyberpunk).
 *
 * `C` é um Proxy: cada acesso (C.card, C.text, ...) devolve o valor do tema
 * ATIVO no momento da leitura. Como os componentes leem C.* durante o render,
 * basta re-renderizar a árvore ao trocar o tema (setGlobalTheme + state) para
 * tudo (inclusive o padrão `${C.x}33` de opacidade) se atualizar — sem precisar
 * tocar em cada componente.
 */

export type Theme = "light" | "dark"

export interface Palette {
  bg: string
  card: string
  card2: string
  input: string
  border: string
  text: string
  muted: string
  green: string
  blue: string
  amber: string
  red: string
  violet: string
  gold: string
}

// LIGHT — Google-Clean
const LIGHT: Palette = {
  bg: "#ffffff",
  card: "#f8f9fa",
  card2: "#f3f4f6",
  input: "#fafbfc",
  border: "#e5e7eb",
  text: "#1f2937",
  muted: "#6b7280",
  green: "#10b981",
  blue: "#3b82f6",
  amber: "#f59e0b",
  red: "#ef4444",
  violet: "#8b5cf6",
  gold: "#d4af37",
}

// DARK — cyberpunk neon (ciano + verde) sobre #060913
const DARK: Palette = {
  bg: "#060913",
  card: "#0c1322",
  card2: "#111c30",
  input: "#0a1626",
  border: "#1e3a5f",
  text: "#e8f1ff",
  muted: "#8aa0c0",
  green: "#34d399",   // verde neon (sucesso / positivo)
  blue: "#22d3ee",    // ciano neon (info / navegação)
  amber: "#fbbf24",
  red: "#f87171",
  violet: "#a78bfa",
  gold: "#e8c24a",    // ouro brilhante p/ assinatura sobre escuro
}

const PALETTES: Record<Theme, Palette> = { light: LIGHT, dark: DARK }

let _theme: Theme = "light"
export function setGlobalTheme(t: Theme) { _theme = t }
export function getGlobalTheme(): Theme { return _theme }

/** Proxy reativo — lê sempre o tema ativo. */
export const C = new Proxy({} as Palette, {
  get: (_t, prop: string) => (PALETTES[_theme] as any)[prop],
}) as Palette

export type ThemeColor = keyof Palette

/** Badge semitransparente com a cor passada. */
export function badgeStyle(color: string) {
  return {
    background: `${color}18`,
    border: `1px solid ${color}33`,
    color,
  }
}
