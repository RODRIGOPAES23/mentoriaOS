"use client"

import { C } from "@/utils/theme"

/** Contagem regressiva até o fim da mentoria (vermelho ≤30d, âmbar ≤90d, verde >90d). */
export default function CountdownDias({ dataFim }: { dataFim: string }) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const [y, mo, d] = dataFim.split("T")[0].split("-").map(Number)
  const diff = Math.ceil((new Date(y, mo - 1, d).getTime() - hoje.getTime()) / 86400000)
  if (diff < 0) {
    return <span className="text-xs font-semibold" style={{ color: C.red }}>Encerrada há {Math.abs(diff)} dias</span>
  }
  const cor = diff <= 30 ? C.red : diff <= 90 ? C.amber : C.green
  return <span className="text-xs font-semibold" style={{ color: cor }}>{diff} dias restantes</span>
}
