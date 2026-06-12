"use client"

import { useState } from "react"
import { api } from "@/lib/basePath"

export default function CapturaVideo({
  campanhaId,
  proximoPasso,
}: {
  campanhaId: string
  proximoPasso: string
}) {
  const [nome, setNome] = useState("")
  const [contato, setContato] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function capturar() {
    setErro("")
    if (!nome.trim() || !contato.trim()) {
      setErro("Preencha nome e contato.")
      return
    }
    const ehEmail = contato.includes("@")
    setLoading(true)
    try {
      const res = await fetch(api("/api/captacao/inbound"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email: ehEmail ? contato : undefined,
          whatsapp: ehEmail ? undefined : contato,
          campanhaId,
          fonte: "video-isca", // rastreia que o lead veio do anúncio em vídeo
          notas: `Veio do anúncio em vídeo (campanha ${campanhaId}).`,
        }),
      })
      const data = await res.json()
      if (!res.ok) setErro(data.error || "Erro ao enviar.")
      else setEnviado(true)
    } catch {
      setErro("Erro de conexão.")
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: "#f0fff4",
          border: "1px solid #9ae6b4",
          borderRadius: 10,
        }}
      >
        <strong>Recebido! 🎉</strong>
        <p style={{ marginTop: 4, fontSize: 14, color: "#2d3748" }}>
          Próximo passo: {proximoPasso}
        </p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 24, display: "grid", gap: 10 }}>
      <input
        placeholder="Seu nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="WhatsApp ou e-mail"
        value={contato}
        onChange={(e) => setContato(e.target.value)}
        style={inputStyle}
      />
      {erro && <span style={{ color: "#c53030", fontSize: 13 }}>{erro}</span>}
      <button
        onClick={capturar}
        disabled={loading}
        style={{
          padding: "12px 18px",
          background: loading ? "#a0aec0" : "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 15,
          cursor: loading ? "default" : "pointer",
        }}
      >
        {loading ? "Enviando…" : "Quero saber mais"}
      </button>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #cbd5e0",
  borderRadius: 8,
  fontSize: 15,
}
