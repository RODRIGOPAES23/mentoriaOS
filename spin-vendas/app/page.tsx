"use client"

import { useState, useRef, useEffect } from "react"
import { api } from "@/lib/basePath"

type Msg = { role: "user" | "assistant"; content: string }

const SAUDACAO =
  "Oi! Tudo bem? 👋 Sou do CKlareza. Pra eu te entender melhor: você já trabalha com mentoria/consultoria hoje? Quantos alunos mais ou menos?"

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: SAUDACAO },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const convId = useRef<string>(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now())
  )
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const next = [...messages, { role: "user" as const, content: text }]
    setMessages(next)
    setInput("")
    setLoading(true)
    try {
      const res = await fetch(api("/api/spin"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // não mandamos a saudação inicial (é só UI) — o cérebro recria o fluxo
        body: JSON.stringify({
          messages: next.slice(1),
          conversationId: convId.current,
          campanhaId: "cklareza",
        }),
      })
      const data = await res.json()
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply || data.error || "Sem resposta.",
        },
      ])
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Erro de conexão. Tenta de novo." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        maxWidth: 480,
        margin: "0 auto",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
        background: "#0b141a",
        color: "#e9edef",
      }}
    >
      <header
        style={{
          padding: "14px 16px",
          background: "#202c33",
          fontWeight: 600,
          fontSize: 15,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 20 }}>💬</span>
        Vendedor SPIN — CKlareza
        <span style={{ marginLeft: "auto", fontSize: 11, opacity: 0.6 }}>teste</span>
      </header>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "#005c4b" : "#202c33",
              padding: "8px 12px",
              borderRadius: 10,
              maxWidth: "82%",
              whiteSpace: "pre-wrap",
              lineHeight: 1.4,
              fontSize: 14.5,
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", opacity: 0.6, fontSize: 13 }}>
            digitando…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: 8, padding: 12, background: "#202c33" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Responda como se fosse o lead…"
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 20,
            border: "none",
            outline: "none",
            background: "#2a3942",
            color: "#e9edef",
            fontSize: 14.5,
          }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{
            border: "none",
            borderRadius: "50%",
            width: 42,
            height: 42,
            background: "#00a884",
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          ➤
        </button>
      </div>
    </main>
  )
}
