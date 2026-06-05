import { createContext, useContext } from "react"
import type { Theme } from "@/utils/theme"

/**
 * Contexto só para FORÇAR re-render dos componentes memoizados
 * (DashboardMentor, AdminView) quando o tema troca. Quem lê cores usa `C`
 * (proxy reativo de utils/theme); este contexto apenas os "inscreve" na troca.
 */
export const ThemeCtx = createContext<Theme>("light")
export const useThemeCtx = () => useContext(ThemeCtx)
