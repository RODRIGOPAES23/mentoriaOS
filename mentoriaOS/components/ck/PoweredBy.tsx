"use client"

import { Sparkles } from "lucide-react"

/**
 * Assinatura discreta "Powered by CKlareza" — dourado premium.
 * Aparece só quando há empresa white label (CKlareza é o motor por trás).
 * size: "sm" (rodapés) | "xs" (splash / sidebar colapsada)
 */
const GOLD = "#d4af37"
const GOLD_SOFT = "#caa84a"

export default function PoweredBy({ size = "sm", center = true }: { size?: "sm" | "xs"; center?: boolean }) {
  const isXs = size === "xs"
  return (
    <div
      className={`flex items-center gap-1.5 ${center ? "justify-center" : ""} select-none`}
      style={{ opacity: 0.72 }}
    >
      <span className={isXs ? "text-[8px]" : "text-[9px]"} style={{ color: "#4d7fa8", letterSpacing: "0.08em" }}>
        POWERED BY
      </span>
      <Sparkles className={isXs ? "w-2.5 h-2.5" : "w-3 h-3"} style={{ color: GOLD }} />
      <span
        className={`font-bold tracking-tight ${isXs ? "text-[10px]" : "text-[11px]"}`}
        style={{
          background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_SOFT} 60%, #9c7d2e 100%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        CKlareza
      </span>
    </div>
  )
}
