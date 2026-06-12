"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/basePath"

type Licao = {
  id: string
  campanhaId: string
  titulo: string
  licao: string
  baseadoEm: number
  status: "pendente" | "aprovado" | "rejeitado"
  criadoEm: string
}

export default function Aprendizado() {
  const [licoes, setLicoes] = useState<Licao[]>([])
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  async function carregar() {
    const res = await fetch(api("/api/admin/playbook"), { cache: "no-store" })
    const data = await res.json()
    setLicoes(data.licoes || [])
  }
  useEffect(() => {
    carregar()
  }, [])

  async function aprender() {
    setLoading(true)
    setMsg("Analisando as vendas que fecharam…")
    const res = await fetch(api("/api/admin/aprender"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campanhaId: "cklareza" }),
    })
    const r = await res.json()
    setMsg(
      r.proposta > 0
        ? `✨ ${r.proposta} lição(ões) proposta(s) a partir de ${r.baseadoEm} venda(s). Aprove abaixo.`
        : `Nenhuma lição nova (vendas fechadas analisadas: ${r.baseadoEm || 0}). Feche mais vendas pra alimentar o aprendizado.`
    )
    setLoading(false)
    carregar()
  }

  async function decidir(id: string, status: "aprovado" | "rejeitado") {
    await fetch(`/api/admin/playbook/${id}/decidir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    carregar()
  }

  const cor: Record<string, string> = { pendente: "#dd6b20", aprovado: "#38a169", rejeitado: "#a0aec0" }
  const pendentes = licoes.filter((l) => l.status === "pendente")
  const resto = licoes.filter((l) => l.status !== "pendente")

  function Card({ l }: { l: Licao }) {
    return (
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: `4px solid ${cor[l.status]}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <b style={{ fontSize: 14 }}>{l.titulo}</b>
          <span style={{ fontSize: 11, color: cor[l.status], fontWeight: 700, textTransform: "uppercase" }}>{l.status}</span>
        </div>
        <div style={{ fontSize: 13.5, color: "#4a5568", marginTop: 6 }}>{l.licao}</div>
        <div style={{ fontSize: 11, color: "#a0aec0", marginTop: 6 }}>baseado em {l.baseadoEm} venda(s)</div>
        {l.status === "pendente" && (
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => decidir(l.id, "aprovado")} style={{ padding: "6px 14px", border: "none", borderRadius: 6, background: "#38a169", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>✓ Aprovar</button>
            <button onClick={() => decidir(l.id, "rejeitado")} style={{ padding: "6px 14px", border: "1px solid #cbd5e0", borderRadius: 6, background: "#fff", color: "#718096", cursor: "pointer", fontSize: 13 }}>✕ Rejeitar</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", minHeight: "100dvh", background: "#f7fafc", color: "#1a202c", padding: 20, maxWidth: 760, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <h1 style={{ fontSize: 18, margin: 0 }}>🧠 Aprendizado do Vendedor</h1>
        <a href="/admin" style={{ fontSize: 13, color: "#3182ce" }}>← CRM</a>
        <a href="/admin/analytics" style={{ fontSize: 13, color: "#3182ce" }}>Analytics</a>
      </header>
      <p style={{ fontSize: 13.5, color: "#718096", marginTop: 0 }}>
        O bot analisa as conversas que <b>fecharam no Stripe</b> e propõe lições do que funcionou.
        Só entram no roteiro as que <b>você aprovar</b> — aí o vendedor passa a replicar o que vende.
      </p>

      <button onClick={aprender} disabled={loading} style={{ padding: "10px 18px", border: "none", borderRadius: 8, background: "#0f766e", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
        {loading ? "Aprendendo…" : "🔁 Aprender com as vendas fechadas"}
      </button>
      {msg && <div style={{ fontSize: 13, color: "#4a5568", marginTop: 10 }}>{msg}</div>}

      <h2 style={{ fontSize: 15, marginTop: 24 }}>Pendentes de aprovação ({pendentes.length})</h2>
      {pendentes.length === 0 && <div style={{ fontSize: 13, color: "#a0aec0" }}>Nada pendente.</div>}
      {pendentes.map((l) => <Card key={l.id} l={l} />)}

      {resto.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, marginTop: 24 }}>Decididas</h2>
          {resto.map((l) => <Card key={l.id} l={l} />)}
        </>
      )}
    </main>
  )
}
