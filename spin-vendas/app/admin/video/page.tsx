"use client"

import { useEffect, useRef, useState } from "react"
import { api, BASE_PATH } from "@/lib/basePath"

type Campanha = {
  id: string
  nome: string
  produto: { nome: string; oneLiner: string; precoLabel: string }
}

// Estado do MPT: -1=falhou | 1=concluído | 4=processando
const ST = { FAILED: -1, COMPLETE: 1, PROCESSING: 4 } as const

type Status = {
  state?: number
  progress?: number
  videos?: string[]
  combined_videos?: string[]
  error?: string
}

const MPT_BASE =
  process.env.NEXT_PUBLIC_MPT_API_URL || "http://localhost:8080"

export default function VideoPage() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [campanhaId, setCampanhaId] = useState("")
  const [taskId, setTaskId] = useState<string | null>(null)
  const [status, setStatus] = useState<Status | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [gerando, setGerando] = useState(false)
  const poll = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch(api("/api/admin/campanhas"))
      .then((r) => r.json())
      .then((d) => {
        setCampanhas(d.campanhas || [])
        if (d.campanhas?.[0]) setCampanhaId(d.campanhas[0].id)
      })
      .catch(() => {})
    return () => {
      if (poll.current) clearInterval(poll.current)
    }
  }, [])

  async function gerar() {
    setErro(null)
    setStatus(null)
    setTaskId(null)
    setGerando(true)
    try {
      const res = await fetch(api("/api/admin/video"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campanhaId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Falha ao criar vídeo")
      setTaskId(data.task_id)
      iniciarPolling(data.task_id)
    } catch (e) {
      setErro(String(e))
      setGerando(false)
    }
  }

  function iniciarPolling(id: string) {
    if (poll.current) clearInterval(poll.current)
    poll.current = setInterval(async () => {
      try {
        const res = await fetch(api(`/api/admin/video?taskId=${id}`))
        const data: Status = await res.json()
        setStatus(data)
        if (data.state === ST.COMPLETE || data.state === ST.FAILED) {
          if (poll.current) clearInterval(poll.current)
          setGerando(false)
        }
      } catch {
        /* mantém tentando */
      }
    }, 3000)
  }

  // MPT devolve caminhos relativos (tasks/..) — resolve contra a base do MPT.
  function resolverUrl(u: string) {
    if (u.startsWith("http")) return u
    return `${MPT_BASE.replace(/\/$/, "")}/${u.replace(/^\//, "")}`
  }

  // videos[] = final (com narração + legenda queimada) · combined_videos[] = intermediário SEM som
  const prontos = status?.videos?.length
    ? status.videos
    : status?.combined_videos || []

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>🎬 Gerador de Anúncios</h1>
      <p style={{ color: "#718096", marginTop: 4 }}>
        Gera um vídeo curto de venda (isca) a partir de uma campanha, via
        MoneyPrinterTurbo.
      </p>

      <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <label style={{ flex: 1, minWidth: 240 }}>
          <span style={{ display: "block", fontSize: 13, color: "#4a5568", marginBottom: 4 }}>
            Campanha
          </span>
          <select
            value={campanhaId}
            onChange={(e) => setCampanhaId(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e0", borderRadius: 8 }}
          >
            {campanhas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} — {c.produto.precoLabel}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={gerar}
          disabled={gerando || !campanhaId}
          style={{
            padding: "10px 18px",
            background: gerando ? "#a0aec0" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: gerando ? "default" : "pointer",
          }}
        >
          {gerando ? "Gerando…" : "Gerar vídeo"}
        </button>
      </div>

      {erro && (
        <div style={{ marginTop: 16, padding: 12, background: "#fff5f5", color: "#c53030", borderRadius: 8, fontSize: 14 }}>
          {erro}
          <div style={{ marginTop: 4, color: "#718096", fontSize: 12 }}>
            O MoneyPrinterTurbo está rodando em {MPT_BASE}? (porta 8080)
          </div>
        </div>
      )}

      {taskId && (
        <div style={{ marginTop: 24, padding: 16, border: "1px solid #e2e8f0", borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: "#a0aec0" }}>task: {taskId}</div>
          {status?.state === ST.PROCESSING && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 14, color: "#4a5568" }}>
                Processando… {status.progress ?? 0}%
              </div>
              <div style={{ height: 8, background: "#edf2f7", borderRadius: 4, marginTop: 6 }}>
                <div
                  style={{
                    height: 8,
                    width: `${status.progress ?? 5}%`,
                    background: "#2563eb",
                    borderRadius: 4,
                    transition: "width .3s",
                  }}
                />
              </div>
            </div>
          )}
          {status?.state === ST.FAILED && (
            <div style={{ marginTop: 8, color: "#c53030" }}>Falhou na geração. Veja os logs do MPT.</div>
          )}
          {status?.state === ST.COMPLETE && (
            <div style={{ marginTop: 12, padding: 12, background: "#ebf8ff", borderRadius: 8, fontSize: 13 }}>
              <div style={{ fontWeight: 600, color: "#2c5282" }}>Link de isca (coloque na bio):</div>
              <code style={{ color: "#2b6cb0" }}>
                {typeof window !== "undefined" ? window.location.origin : ""}
                {BASE_PATH}/isca/video/{campanhaId}
              </code>
              <div style={{ marginTop: 4, color: "#718096" }}>
                Quem chegar por aqui entra no funil com fonte <b>video-isca</b>.
              </div>
            </div>
          )}
          {status?.state === ST.COMPLETE && prontos.length > 0 && (
            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              {prontos.map((v, i) => (
                <div key={i}>
                  <video
                    src={resolverUrl(v)}
                    controls
                    style={{ width: "100%", maxWidth: 300, borderRadius: 10, background: "#000" }}
                  />
                  <div>
                    <a href={resolverUrl(v)} download style={{ fontSize: 13, color: "#2563eb" }}>
                      Baixar vídeo
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
