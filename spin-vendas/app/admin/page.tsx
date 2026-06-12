"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/basePath"

type Msg = { role: "user" | "assistant"; content: string }
type Lead = {
  nome: string | null
  whatsapp: string | null
  email: string | null
  mentorados: number | null
}
type Estagio =
  | "novo"
  | "contatado"
  | "qualificado"
  | "quente"
  | "demo"
  | "fechado"
  | "perdido"
type Conversa = {
  id: string
  campanhaId: string
  canal: string
  criadaEm: string
  atualizadaEm: string
  sinalCompra: boolean
  estagio: Estagio
  motivoPerda: string | null
  fonte?: string
  notas?: string | null
  scoreIcp?: number
  scoreJustificativa?: string | null
  valorPago?: number | null
  pagoEm?: string | null
  lead: Lead | null
  messages: Msg[]
}

function corScore(s: number) {
  if (s >= 70) return "#38a169"
  if (s >= 40) return "#dd6b20"
  return "#a0aec0"
}

const COLUNAS: { id: Estagio; titulo: string; cor: string }[] = [
  { id: "novo", titulo: "Novo", cor: "#718096" },
  { id: "contatado", titulo: "Contatado", cor: "#4299e1" },
  { id: "qualificado", titulo: "Qualificado", cor: "#9f7aea" },
  { id: "quente", titulo: "🔥 Quente", cor: "#dd6b20" },
  { id: "demo", titulo: "Demo", cor: "#38b2ac" },
  { id: "fechado", titulo: "✅ Fechado", cor: "#38a169" },
  { id: "perdido", titulo: "Perdido", cor: "#a0aec0" },
]
const ORDEM: Estagio[] = COLUNAS.map((c) => c.id)

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR")
  } catch {
    return iso
  }
}

export default function Admin() {
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [sel, setSel] = useState<Conversa | null>(null)
  const [loading, setLoading] = useState(true)

  async function carregar() {
    const res = await fetch(api("/api/admin/conversas"), { cache: "no-store" })
    const data = await res.json()
    const convs: Conversa[] = (data.conversas || []).map((c: Conversa) => ({
      ...c,
      estagio: c.estagio || "novo",
    }))
    setConversas(convs)
    setLoading(false)
    // mantém o detalhe aberto atualizado
    setSel((s) => (s ? convs.find((c) => c.id === s.id) || null : null))
  }

  useEffect(() => {
    carregar()
    const t = setInterval(carregar, 5000)
    return () => clearInterval(t)
  }, [])

  async function mover(id: string, estagio: Estagio) {
    let motivoPerda: string | undefined
    if (estagio === "perdido") {
      motivoPerda = prompt("Motivo da perda?") || "não informado"
    }
    await fetch(`/api/admin/leads/${id}/estagio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estagio, motivoPerda }),
    })
    carregar()
  }

  async function marcarPago(id: string) {
    const v = prompt("Valor pago (R$)?")
    const valor = v ? Number(v.replace(",", ".")) : undefined
    await fetch(`/api/admin/leads/${id}/pago`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor }),
    })
    carregar()
  }

  const total = conversas.length
  const quentes = conversas.filter((c) => c.estagio === "quente").length
  const fechados = conversas.filter((c) => c.estagio === "fechado").length

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", height: "100dvh", display: "flex", flexDirection: "column", background: "#f7fafc", color: "#1a202c" }}>
      <header style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0", background: "#fff", display: "flex", alignItems: "center", gap: 20 }}>
        <h1 style={{ fontSize: 17, margin: 0 }}>🏭 CRM — Fábrica de Vendas</h1>
        <span style={{ fontSize: 13, color: "#718096" }}>
          {total} leads · <b style={{ color: "#dd6b20" }}>{quentes} quentes 🔥</b> · <b style={{ color: "#38a169" }}>{fechados} fechados ✅</b>
        </span>
        <a href="/admin/video" style={{ marginLeft: "auto", fontSize: 13, color: "#3182ce", fontWeight: 600 }}>🎬 Anúncios</a>
        <a href="/admin/aprendizado" style={{ fontSize: 13, color: "#3182ce", fontWeight: 600 }}>🧠 Aprendizado</a>
        <a href="/admin/analytics" style={{ fontSize: 13, color: "#3182ce", fontWeight: 600 }}>📊 Analytics</a>
        <span style={{ fontSize: 11, color: "#a0aec0" }}>
          {loading ? "carregando…" : "atualiza a cada 5s"}
        </span>
      </header>

      {/* Kanban */}
      <div style={{ flex: 1, display: "flex", gap: 12, padding: 16, overflowX: "auto" }}>
        {COLUNAS.map((col) => {
          const cards = conversas.filter((c) => c.estagio === col.id)
          return (
            <div key={col.id} style={{ minWidth: 230, width: 230, flexShrink: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: col.cor, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                <span>{col.titulo}</span>
                <span style={{ color: "#cbd5e0" }}>{cards.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
                {cards.map((c) => {
                  const ultima = c.messages.filter((m) => m.role === "user").slice(-1)[0]
                  const nome = c.lead?.nome || `Lead ${c.id.slice(0, 6)}`
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSel(c)}
                      style={{
                        background: "#fff",
                        border: sel?.id === c.id ? `2px solid ${col.cor}` : "1px solid #e2e8f0",
                        borderLeft: `4px solid ${col.cor}`,
                        borderRadius: 8,
                        padding: 10,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{nome}</div>
                      <div style={{ fontSize: 11.5, color: "#718096", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ultima?.content || "—"}
                      </div>
                      <div style={{ fontSize: 10.5, color: "#a0aec0", marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>{c.fonte || c.canal} · {c.messages.length} msgs</span>
                        <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          {!!c.scoreIcp && (
                            <span style={{ background: corScore(c.scoreIcp), color: "#fff", borderRadius: 8, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
                              {c.scoreIcp}
                            </span>
                          )}
                          {c.sinalCompra && <span>🔥</span>}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {cards.length === 0 && (
                  <div style={{ fontSize: 11, color: "#cbd5e0", padding: "8px 0" }}>vazio</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Drawer de detalhe */}
      {sel && (
        <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", justifyContent: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 460, maxWidth: "92vw", height: "100%", background: "#fff", boxShadow: "-4px 0 20px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: 16, borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 16 }}>{sel.lead?.nome || `Lead ${sel.id.slice(0, 8)}`}</h2>
                <button onClick={() => setSel(null)} style={{ border: "none", background: "transparent", fontSize: 20, cursor: "pointer", color: "#a0aec0" }}>✕</button>
              </div>
              <div style={{ fontSize: 12, color: "#718096", marginTop: 4 }}>
                {sel.canal} · {sel.campanhaId} · fonte: <b>{sel.fonte || "bot"}</b> · iniciada {fmt(sel.criadaEm)}
              </div>
              {sel.notas && (
                <div style={{ fontSize: 12, color: "#4a5568", marginTop: 6, background: "#edf2f7", padding: "6px 10px", borderRadius: 6 }}>
                  📝 {sel.notas}
                </div>
              )}

              {/* Mover estágio */}
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#718096" }}>Estágio:</span>
                <select
                  value={sel.estagio}
                  onChange={(e) => mover(sel.id, e.target.value as Estagio)}
                  style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e0", fontSize: 13 }}
                >
                  {ORDEM.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {sel.motivoPerda && (
                <div style={{ fontSize: 12, color: "#e53e3e", marginTop: 6 }}>Perda: {sel.motivoPerda}</div>
              )}

              {/* Score ICP */}
              {!!sel.scoreIcp && (
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ background: corScore(sel.scoreIcp), color: "#fff", borderRadius: 8, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>
                    Score ICP {sel.scoreIcp}
                  </span>
                  <span style={{ fontSize: 12, color: "#718096" }}>{sel.scoreJustificativa}</span>
                </div>
              )}

              {/* Fechamento */}
              <div style={{ marginTop: 12 }}>
                {sel.pagoEm ? (
                  <div style={{ fontSize: 13, color: "#276749", fontWeight: 700 }}>
                    💰 PAGO{sel.valorPago ? ` · R$ ${sel.valorPago}` : ""} ({fmt(sel.pagoEm)})
                  </div>
                ) : (
                  <button
                    onClick={() => marcarPago(sel.id)}
                    style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#38a169", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    💰 Marcar como pago
                  </button>
                )}
              </div>
            </div>

            {/* Card de dados do lead */}
            {sel.lead && (sel.lead.nome || sel.lead.whatsapp || sel.lead.email || sel.lead.mentorados != null) && (
              <div style={{ background: "#fffaf0", border: "1px solid #fbd38d", borderRadius: 10, padding: 14, margin: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#dd6b20", marginBottom: 8 }}>📇 DADOS DO LEAD</div>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px", fontSize: 13.5 }}>
                  <b>Nome:</b><span>{sel.lead.nome || "—"}</span>
                  <b>WhatsApp:</b><span>{sel.lead.whatsapp || "—"}</span>
                  <b>E-mail:</b><span>{sel.lead.email || "—"}</span>
                  <b>Mentorados:</b><span>{sel.lead.mentorados ?? "—"}</span>
                </div>
              </div>
            )}

            {/* Conversa */}
            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {sel.messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? "#3182ce" : "#edf2f7", color: m.role === "user" ? "#fff" : "#1a202c", padding: "8px 12px", borderRadius: 10, maxWidth: "82%", whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.45 }}>
                  <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 2 }}>{m.role === "user" ? "LEAD" : "BOT"}</div>
                  {m.content}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
