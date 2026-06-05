/**
 * Paleta de cores — Redesign Light "Google-Clean" (v10)
 * Consistência global de branco + cinza + teal + dourado muted
 */

export const COLORS_LIGHT = {
  // Fundos
  bg: "#ffffff",          // Fundo principal (branco)
  bgAlt: "#f9fafb",       // Fundo alternado (cinza muito claro)
  card: "#f8f9fa",        // Card (cinza claro)

  // Bordas
  border: "#e5e7eb",      // Border (cinza clara)
  borderMuted: "#d1d5db", // Border mais visível

  // Textos
  textPrimary: "#1f2937",     // Texto principal (escuro)
  textSecondary: "#374151",   // Texto secundário (cinza escuro)
  textMuted: "#6b7280",       // Texto muted (cinza médio)
  textLight: "#9ca3af",       // Texto light (cinza claro)

  // Acentos
  teal: "#13a3a3",        // Primário (teal)
  tealHover: "#0d9488",   // Hover teal (mais escuro)
  tealLight: "#d0f9f7",   // Light teal (background)

  gold: "#d4af37",        // Dourado (muted, 20% opacity)
  goldLight: "#f0d97d",   // Dourado lighter

  // Utilitários
  shadow: "0 1px 3px rgba(0,0,0,0.1)",       // Shadow padrão
  shadowHover: "0 4px 6px rgba(0,0,0,0.1)",  // Shadow hover

  // Alias (compatibilidade)
  get success() { return "#10b981" },
  get warning() { return "#f59e0b" },
  get danger() { return "#ef4444" },
}

// "SC" agora aponta para CSS variables (--sc-*) definidas em globals.css.
// Assim TODOS os usos sólidos (background: SC.bg, color: SC.muted, ...) trocam
// entre light/dark automaticamente via a classe html.dark — sem JS/re-render,
// funcionando inclusive em Server Components. Usos com opacidade (${SC.x}NN)
// foram convertidos para rgb(var(--sc-x-rgb) / .NN) nas páginas.
export const SC_LIGHT = {
  bg: "var(--sc-bg)",
  card: "var(--sc-card)",
  card2: "var(--sc-card2)",
  border: "var(--sc-border)",
  muted: "var(--sc-muted)",
  text: "var(--sc-text)",
  gold: "var(--sc-gold)",
  goldL: "var(--sc-goldl)",
  teal: "var(--sc-teal)",
}
