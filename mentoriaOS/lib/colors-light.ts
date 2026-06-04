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

// Alias para compatibilidade com código existente que usa "SC"
export const SC_LIGHT = {
  bg: COLORS_LIGHT.bg,
  card: COLORS_LIGHT.card,
  card2: COLORS_LIGHT.bgAlt,
  border: COLORS_LIGHT.border,
  muted: COLORS_LIGHT.textMuted,
  gold: COLORS_LIGHT.gold,
  goldL: COLORS_LIGHT.goldLight,
  teal: COLORS_LIGHT.teal,
}
