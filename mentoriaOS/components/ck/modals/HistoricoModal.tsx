"use client"

import { X } from "lucide-react"
import { C } from "@/utils/theme"
import type { CheckinRow } from "@/lib/supabase"
import type { Mentorado } from "../types"

interface Props {
  selected: Mentorado
  historico: CheckinRow[]
  onClose: () => void
}

export default function HistoricoModal({ selected, historico, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4" style={{ background: "#00000070" }} onClick={onClose}>
      <div className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" style={{ background: C.card2, border: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h2 className="text-base font-semibold" style={{ color: C.text }}>Histórico — {selected.nome}</h2>
          <button onClick={onClose} className="p-2 rounded-lg" style={{ color: C.muted }}><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-y-auto max-h-[60vh] p-6">
          {historico.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: C.muted }}>Nenhum histórico disponível.</p>
          ) : (
            <div className="space-y-4">
              {historico.map((h, i) => (
                <div key={h.id} className="p-4 rounded-xl"
                  style={i === 0
                    ? { background: `${C.green}10`, border: `1px solid ${C.green}33` }
                    : { background: C.input, border: `1px solid ${C.border}` }}>
                  <p className="text-xs font-bold mb-2" style={{ color: C.muted }}>{i === 0 ? "✓ Atual" : `Semana -${i}`} · {h.data_envio?.slice(0, 10)}</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <span style={{ color: C.muted }}>Leads: <span className="font-bold" style={{ color: C.text }}>{h.leads_gerados}</span></span>
                    <span style={{ color: C.muted }}>Vendas: <span className="font-bold" style={{ color: C.green }}>R${h.vendas_reais?.toLocaleString("pt-BR")}</span></span>
                    <span style={{ color: C.muted }}>Investimento: <span className="font-bold" style={{ color: C.text }}>R${h.investimento_trafego?.toLocaleString("pt-BR")}</span></span>
                    <span style={{ color: C.muted }}>Vídeos: <span className="font-bold" style={{ color: C.text }}>{h.videos_postados}</span></span>
                  </div>
                  {(h as any).respostas_customizadas && Object.keys((h as any).respostas_customizadas).length > 0 && (
                    <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: `1px solid ${C.border}` }}>
                      {Object.entries((h as any).respostas_customizadas as Record<string, string>).map(([label, resp]) => (
                        <div key={label} className="text-xs">
                          <span className="font-semibold" style={{ color: C.text }}>{label}: </span>
                          <span style={{ color: C.muted }}>{resp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
