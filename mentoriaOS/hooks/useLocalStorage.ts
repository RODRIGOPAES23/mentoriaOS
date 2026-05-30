"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * Estado persistido no localStorage (SSR-safe).
 * Ex: const [collapsed, setCollapsed] = useLocalStorage("ck:sidebar", false)
 */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)

  // Hidrata do localStorage após mount (evita mismatch SSR)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) setValue(JSON.parse(raw))
    } catch {}
  }, [key])

  const set = useCallback((v: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v
      try { window.localStorage.setItem(key, JSON.stringify(next)) } catch {}
      return next
    })
  }, [key])

  return [value, set] as const
}
