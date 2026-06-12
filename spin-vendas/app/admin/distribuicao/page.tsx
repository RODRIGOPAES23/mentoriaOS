"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/basePath"
import { Shell, UI } from "../Shell"

type Target = {
  id: string
  target_id: string
  titulo: string | null
  ativo: boolean
  ultimo_comentario_em: string | null
}
type Log = {
  id: string
  target_id: string
  text: string
  status: string
  error: string | null
  criado_em: string
}
type Data = { targets: Target[]; log: Log[]; status: string }

const STATUS_LABEL: Record<string, { txt: string; cor: string }> = {
  connected: { txt: "✅ YouTube conectado", cor: "#38a169" },
  no_tokens: { txt: "⚠️ Falta autorizar (clique em Conectar)", cor: "#dd6b20" },
  no_client: { txt: "⚙️ Credenciais OAuth não configuradas (dry-run)", cor: "#718096" },
  no_supabase: { txt: "❌ Sem Supabase", cor: "#e53e3e" },
}
const LOG_COR: Record<string, string> = {
  published: "#38a169", "dry-run": "#805ad5", held: "#dd6b20", error: "#e53e3e",
}

export default function Distribuicao() {
  const [d, setD] = useState<Data | null>(null)
  const [novo, setNovo] = useState("")
  const [titulo, setTitulo] = useState("")

  async function carregar() {
    const r = await fetch(api("/api/admin/distribuicao"), { cache: "no-store" })
    setD(await r.json())
  }
  useEffect(() => {
    carregar()
    const t = setInterval(carregar, 5000)
    return () => clearInterval(t)
  }, [])

  async function adicionar() {
    if (!novo.trim()) return
    await fetch(api("/api/admin/distribuicao"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "add", target: novo, titulo }),
    })
    setNovo(""); setTitulo(""); carregar()
  }
  async function alternar(id: string, ativo: boolean) {
    await fetch(api("/api/admin/distribuicao"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "toggle", id, ativo }),
    })
    carregar()
  }
  async function rodarAgora() {
    await fetch(api("/api/cron/youtube"), { cache: "no-store" })
    setTimeout(carregar, 1500)
  }

  if (!d)
    return (
      <Shell ativo="/admin/distribuicao" titulo="Distribuição">
        <div style={{ color: UI.muted }}>Carregando…</div>
      </Shell>
    )
  const st = STATUS_LABEL[d.status] || STATUS_LABEL.no_client

  return (
    <Shell ativo="/admin/distribuicao" titulo="Distribuição — YouTube" subtitulo="Comentários por IA (sem link, anti-spam) · 1 a cada 30 min via cron">

      {/* Status + conectar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: st.cor }}>{st.txt}</span>
        <a href={api("/api/oauth/youtube/start")} style={{ background: "#3182ce", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          Conectar YouTube
        </a>
        <button onClick={rodarAgora} style={{ background: "#805ad5", color: "#fff", border: 0, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          ▶ Rodar agora (1 comentário)
        </button>
      </div>

      {/* Adicionar alvo */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Adicionar vídeo-alvo</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={novo} onChange={(e) => setNovo(e.target.value)} placeholder="URL do YouTube ou videoId"
            style={{ flex: 2, minWidth: 240, padding: "9px 12px", border: "1px solid #cbd5e0", borderRadius: 8 }} />
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="título (opcional, ajuda a IA)"
            style={{ flex: 1, minWidth: 180, padding: "9px 12px", border: "1px solid #cbd5e0", borderRadius: 8 }} />
          <button onClick={adicionar} style={{ background: "#38a169", color: "#fff", border: 0, padding: "9px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>+ Adicionar</button>
        </div>
      </div>

      {/* Alvos */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Alvos ({d.targets.length})</div>
        {d.targets.length === 0 && <div style={{ fontSize: 12, color: "#a0aec0" }}>Nenhum vídeo-alvo ainda.</div>}
        {d.targets.map((t) => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid #edf2f7", fontSize: 13 }}>
            <span style={{ flex: 1 }}>
              <b>{t.titulo || t.target_id}</b>
              <span style={{ color: "#a0aec0", marginLeft: 8 }}>{t.target_id}</span>
              {t.ultimo_comentario_em && <span style={{ color: "#a0aec0", marginLeft: 8 }}>· último: {new Date(t.ultimo_comentario_em).toLocaleString("pt-BR")}</span>}
            </span>
            <button onClick={() => alternar(t.id, !t.ativo)} style={{ background: t.ativo ? "#c6f6d5" : "#edf2f7", color: t.ativo ? "#22543d" : "#718096", border: 0, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {t.ativo ? "ativo" : "pausado"}
            </button>
          </div>
        ))}
      </div>

      {/* Log */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Últimos comentários</div>
        {d.log.length === 0 && <div style={{ fontSize: 12, color: "#a0aec0" }}>Nada ainda. Clique em "Rodar agora" para um teste em dry-run.</div>}
        {d.log.map((l) => (
          <div key={l.id} style={{ padding: "8px 0", borderTop: "1px solid #edf2f7", fontSize: 13 }}>
            <span style={{ display: "inline-block", minWidth: 70, fontSize: 11, fontWeight: 700, color: LOG_COR[l.status] || "#718096" }}>{l.status}</span>
            <span>{l.text}</span>
            {l.error && <span style={{ color: "#e53e3e", marginLeft: 8 }}>({l.error})</span>}
            <span style={{ color: "#a0aec0", marginLeft: 8 }}>· {l.target_id} · {new Date(l.criado_em).toLocaleString("pt-BR")}</span>
          </div>
        ))}
      </div>
    </Shell>
  )
}
