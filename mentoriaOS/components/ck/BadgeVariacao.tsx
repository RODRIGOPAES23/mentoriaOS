"use client"

import { C } from "@/utils/theme"

/** Badge de variação percentual (verde sobe / vermelho cai / cinza neutro). */
export default function BadgeVariacao({ pct }: { pct: number | null }) {
  if (pct === null) return null
  const seta = pct > 0 ? "↑" : pct < 0 ? "↓" : "→"
  const color = pct > 0 ? C.green : pct < 0 ? C.red : C.muted
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}18`, color }}
    >
      {seta} {pct > 0 ? "+" : ""}{pct.toFixed(0)}%
    </span>
  )
}
