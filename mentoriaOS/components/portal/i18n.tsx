"use client"

import { createContext, useContext } from "react"

/**
 * i18n leve do Portal do Mentorado.
 * Em vez de chaves, usa tradução inline: `t("texto PT", "text EN", "texto ES")`.
 * Legível direto no JSX e sem dicionário paralelo pra manter sincronizado.
 *
 * O idioma vem do header do portal (seletor 🌐), persistido em `ck_lang`
 * (mesma chave da landing) e provido via LangCtx.
 */
export type Lang = "pt" | "en" | "es"

export const LANGS: { code: Lang; label: string }[] = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
]

export const LangCtx = createContext<Lang>("pt")

export function useLang(): Lang {
  return useContext(LangCtx)
}

/** Hook tradutor: `const t = useT(); t("Olá","Hello","Hola")`. */
export function useT() {
  const lang = useContext(LangCtx)
  return (pt: string, en: string, es: string) => (lang === "en" ? en : lang === "es" ? es : pt)
}

/** Locale BCP-47 do idioma atual (para datas/horas). */
export function localeOf(lang: Lang): string {
  return lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR"
}
