"use client"

import { useState } from "react"
import { api } from "@/lib/basePath"

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })

export default function CalculadoraChurn() {
  // entradas
  const [alunos, setAlunos] = useState(20)
  const [ticket, setTicket] = useState(297)
  const [churn, setChurn] = useState(10) // % ao mês

  // resultado
  const perdidosMes = alunos * (churn / 100)
  const perdaMes = perdidosMes * ticket
  const perdaAno = perdaMes * 12

  // captura
  const [enviado, setEnviado] = useState(false)
  const [nome, setNome] = useState("")
  const [contato, setContato] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

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
          mentorados: alunos,
          campanhaId: "cklareza",
          notas: `Calculadora de Churn: ${alunos} alunos · ticket ${brl(
            ticket
          )} · churn ${churn}%/mês → perde ${brl(perdaMes)}/mês (${brl(perdaAno)}/ano)`,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErro(data.error || "Erro ao enviar.")
      } else {
        setEnviado(true)
      }
    } catch {
      setErro("Erro de conexão.")
    } finally {
      setLoading(false)
    }
  }

  const card: React.CSSProperties = {
    background: "#fff",
    borderRadius: 16,
    padding: 28,
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
    maxWidth: 480,
    width: "100%",
  }
  const label: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#4a5568", marginBottom: 6, display: "block" }
  const input: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e0", fontSize: 15, boxSizing: "border-box" }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "system-ui, sans-serif",
        background: "linear-gradient(135deg,#0f766e,#134e4a)",
        color: "#1a202c",
      }}
    >
      <div style={card}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#0f766e", letterSpacing: 1, marginBottom: 6 }}>
          CKLAREZA · CALCULADORA GRATUITA
        </div>
        <h1 style={{ fontSize: 24, margin: "0 0 6px" }}>Quanto o churn custa na sua mentoria?</h1>
        <p style={{ fontSize: 14, color: "#718096", marginTop: 0 }}>
          Ajuste os números e descubra quanto você perde por mês quando um aluno some sem você perceber.
        </p>

        <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
          <div>
            <label style={label}>Nº de mentorados ativos: <b>{alunos}</b></label>
            <input type="range" min={1} max={300} value={alunos} onChange={(e) => setAlunos(+e.target.value)} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={label}>Ticket mensal por aluno (R$)</label>
            <input type="number" value={ticket} min={0} onChange={(e) => setTicket(+e.target.value)} style={input} />
          </div>
          <div>
            <label style={label}>Churn estimado: <b>{churn}%</b> ao mês</label>
            <input type="range" min={1} max={40} value={churn} onChange={(e) => setChurn(+e.target.value)} style={{ width: "100%" }} />
          </div>
        </div>

        {/* Resultado */}
        <div style={{ background: "#fff5f5", border: "1px solid #feb2b2", borderRadius: 12, padding: 16, marginTop: 18 }}>
          <div style={{ fontSize: 13, color: "#c53030" }}>Você está perdendo aproximadamente</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "#c53030", lineHeight: 1.1 }}>{brl(perdaMes)}<span style={{ fontSize: 15, fontWeight: 600 }}> /mês</span></div>
          <div style={{ fontSize: 14, color: "#718096", marginTop: 4 }}>
            ≈ <b>{brl(perdaAno)}</b> por ano · {perdidosMes.toFixed(1)} alunos/mês escapando
          </div>
        </div>

        {/* Captura */}
        {!enviado ? (
          <div style={{ marginTop: 18 }}>
            <p style={{ fontSize: 13.5, color: "#4a5568", marginBottom: 10 }}>
              Quer um plano pra <b>recuperar essa receita</b>? Deixe seu contato que a gente te mostra como o CKlareza reduz isso:
            </p>
            <div style={{ display: "grid", gap: 10 }}>
              <input placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} style={input} />
              <input placeholder="WhatsApp ou e-mail" value={contato} onChange={(e) => setContato(e.target.value)} style={input} />
              {erro && <div style={{ color: "#e53e3e", fontSize: 13 }}>{erro}</div>}
              <button
                onClick={capturar}
                disabled={loading}
                style={{ padding: "12px", borderRadius: 8, border: "none", background: "#0f766e", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
              >
                {loading ? "Enviando…" : "Quero recuperar essa receita →"}
              </button>
              <div style={{ fontSize: 11, color: "#a0aec0", textAlign: "center" }}>
                Sem spam. Usamos seu contato só pra te mostrar a solução. Descadastro a qualquer momento.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 18, background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: 12, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>✅</div>
            <div style={{ fontWeight: 700, color: "#276749" }}>Recebido, {nome.split(" ")[0]}!</div>
            <div style={{ fontSize: 13.5, color: "#4a5568", marginTop: 4 }}>
              Em breve te chamamos pra mostrar como cortar esses {brl(perdaMes)}/mês. 🚀
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
