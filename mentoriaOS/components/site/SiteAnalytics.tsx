"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

function sessionId(): string | null {
  try {
    let s = localStorage.getItem("ck_sid")
    if (!s) { s = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("ck_sid", s) }
    return s
  } catch { return null }
}

/** Beacon de analytics próprio — registra um pageview por rota (sem cookies de rastreio). */
export default function SiteAnalytics() {
  const pathname = usePathname()
  useEffect(() => {
    // Não rastrear bots/crawlers — evita erro no Google Search Console
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent.toLowerCase()
      if (/bot|crawl|spider|google|bing|baidu|yandex|slurp|duckduck/.test(ua)) return
    }
    const path = pathname || (typeof location !== "undefined" ? location.pathname : "/")
    const logged = /^\/(dashboard|admin|selecionar|m\/)/.test(path)
    const payload = JSON.stringify({
      path,
      referrer: typeof document !== "undefined" ? (document.referrer || null) : null,
      session_id: sessionId(),
      lang: typeof navigator !== "undefined" ? navigator.language : null,
      logged_in: logged,
    })
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }))
      } else {
        fetch("/api/track", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true })
          .catch(() => {}) // silencia erros de rede
      }
    } catch {}
  }, [pathname])
  return null
}
