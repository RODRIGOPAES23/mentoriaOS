"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/basePath"
import { Shell, Painel, UI } from "../Shell"

type Filtro = { campo: string; label: string; tipo: string }
type Source = { id: string; label: string; descricao: string; configurado: boolean; filtros: Filtro[] }
type Channel = { id: string; label: string; descricao: string; campoDestino: string; configurado: boolean; aviso: string | null }
type Prospect = {
  id: string; nome: string | null; empresa: string | null; telefone: string | null
  email: string | null; instagram: string | null; regiao: string | null; nicho: string | null
  fonte: string; status: string
}
type Log = { id: string; canal: string; status: string; mensagem: string; criado_em: string }
type Data = { sources: Source[]; channels: Channel[]; prospects: Prospect[]; log: Log[] }

const badge = (cfg: boolean) => ({
  fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
  background: cfg ? "#dcfce7" : "#fef3c7", color: cfg ? "#166534" : "#92400e",
})

export default function Prospeccao() {
  const [d, setD] = useState<Data | null>(null)
  const [fonteId, setFonteId] = useState("csv")
  const [valores, setValores] = useState<Record<string, string>>({})
  const [buscando, setBuscando] = useState(false)
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [canalId, setCanalId] = useState("mock")
  const [mensagem, setMensagem] = useState("Oi {nome}! Vi a sua operação e acho que posso ajudar a organizar e reter mais clientes. Posso te mostrar em 2 minutos?")
  const [aviso, setAviso] = useState("")

  async function carregar() {
    const r = await fetch(api("/api/admin/prospeccao"), { cache: "no-store" })
    setD(await r.json())
  }
  useEffect(() => { carregar() }, [])

  const fonte = d?.sources.find((s) => s.id === fonteId)
  const canal = d?.channels.find((c) => c.id === canalId)

  async function buscar() {
    if (!fonte) return
    if (!fonte.configurado) { setAviso(`A fonte "${fonte.label}" precisa de chave. Configure depois — o resto já funciona.`); return }
    setBuscando(true); setAviso("")
    const extra: Record<string, string> = {}
    const base: Record<string, any> = { acao: "buscar", fonte: fonteId }
    for (const f of fonte.filtros) {
      const v = valores[f.campo] || ""
      if (["nicho", "regiao", "limite"].includes(f.campo)) base[f.campo] = f.campo === "limite" ? Number(v) : v
      else extra[f.campo] = v
    }
    base.extra = extra
    const r = await fetch(api("/api/admin/prospeccao"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(base) }).then((x) => x.json())
    setAviso(`Busca: ${r.achados || 0} encontrados, ${r.gravados || 0} novos na base.`)
    setBuscando(false); carregar()
  }

  function toggle(id: string) {
    setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function selTodos() {
    if (!d) return
    setSel((s) => s.size === d.prospects.length ? new Set() : new Set(d.prospects.map((p) => p.id)))
  }

  async function disparar() {
    if (!canal) return
    if (sel.size === 0) { setAviso("Selecione ao menos 1 lead."); return }
    if (!canal.configurado && canal.id !== "mock") { setAviso(`O canal "${canal.label}" precisa de chave. Use "Simulação" para testar a régua agora.`); return }
    const r = await fetch(api("/api/admin/prospeccao"), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "disparar", canal: canalId, ids: [...sel], mensagem }),
    }).then((x) => x.json())
    setAviso(`Disparo: ${r.enviados || 0} processados · ${JSON.stringify(r.resultados || {})}`)
    setSel(new Set()); carregar()
  }

  if (!d) return <Shell ativo="/admin/prospeccao" titulo="Buscar leads"><div style={{ color: UI.muted }}>Carregando…</div></Shell>

  return (
    <Shell ativo="/admin/prospeccao" titulo="Buscar leads" subtitulo="Fontes e canais plugáveis — adicione a chave quando quiser, o resto já roda">
      {aviso && <div style={{ background: "#faf5ff", border: `1px solid ${UI.roxo}33`, color: UI.roxoEscuro, padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{aviso}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18, alignItems: "start" }}>
        {/* FASE 1: Buscar */}
        <Painel titulo="1 · Buscar de uma fonte">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {d.sources.map((s) => (
              <button key={s.id} onClick={() => { setFonteId(s.id); setValores({}) }}
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left", flex: "1 1 45%",
                  border: `1.5px solid ${fonteId === s.id ? UI.roxo : UI.borda}`, background: fonteId === s.id ? "#faf5ff" : "#fff" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13 }}>{s.label} <span style={badge(s.configurado)}>{s.configurado ? "pronto" : "+chave"}</span></span>
                <span style={{ fontSize: 11, color: UI.muted }}>{s.descricao}</span>
              </button>
            ))}
          </div>
          {fonte?.filtros.map((f) => (
            <div key={f.campo} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: UI.muted, display: "block", marginBottom: 4 }}>{f.label}</label>
              {f.tipo === "textarea" ? (
                <textarea value={valores[f.campo] || ""} onChange={(e) => setValores((v) => ({ ...v, [f.campo]: e.target.value }))} rows={5}
                  style={{ width: "100%", padding: 10, border: `1px solid ${UI.borda}`, borderRadius: 8, fontSize: 12.5, fontFamily: "monospace" }} />
              ) : (
                <input type={f.tipo} value={valores[f.campo] || ""} onChange={(e) => setValores((v) => ({ ...v, [f.campo]: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: `1px solid ${UI.borda}`, borderRadius: 8, fontSize: 13 }} />
              )}
            </div>
          ))}
          <button onClick={buscar} disabled={buscando}
            style={{ background: `linear-gradient(135deg, ${UI.roxo}, ${UI.roxoEscuro})`, color: "#fff", border: 0, padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: buscando ? 0.6 : 1 }}>
            {buscando ? "Buscando…" : "🔎 Buscar e carregar na base"}
          </button>
        </Painel>

        {/* FASE 3: Disparar */}
        <Painel titulo="3 · Disparar abordagem">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {d.channels.map((c) => (
              <button key={c.id} onClick={() => setCanalId(c.id)}
                style={{ padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                  border: `1.5px solid ${canalId === c.id ? UI.roxo : UI.borda}`, background: canalId === c.id ? "#faf5ff" : "#fff" }}>
                {c.label} <span style={badge(c.configurado)}>{c.configurado ? "pronto" : "+chave"}</span>
              </button>
            ))}
          </div>
          {canal?.aviso && <div style={{ fontSize: 11.5, color: UI.laranja, background: "#fffbeb", padding: "8px 10px", borderRadius: 8, marginBottom: 10, lineHeight: 1.45 }}>⚠️ {canal.aviso}</div>}
          <label style={{ fontSize: 12, color: UI.muted, display: "block", marginBottom: 4 }}>Mensagem (use {"{nome}"} se quiser)</label>
          <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={4}
            style={{ width: "100%", padding: 10, border: `1px solid ${UI.borda}`, borderRadius: 8, fontSize: 13, marginBottom: 12 }} />
          <div style={{ fontSize: 12.5, color: UI.muted, marginBottom: 12 }}><b style={{ color: UI.tinta }}>{sel.size}</b> lead(s) selecionado(s)</div>
          <button onClick={disparar}
            style={{ background: canal?.id === "mock" ? UI.roxo : UI.verde, color: "#fff", border: 0, padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            {canal?.id === "mock" ? "▶ Simular disparo (dry-run)" : `🚀 Disparar via ${canal?.label}`}
          </button>
        </Painel>
      </div>

      {/* FASE 2: Base de leads */}
      <div style={{ marginBottom: 18 }}>
        <Painel titulo={`2 · Base de leads (${d.prospects.length})`} acao={
          <button onClick={selTodos} style={{ background: "none", border: `1px solid ${UI.borda}`, padding: "5px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", color: UI.muted }}>
            {sel.size === d.prospects.length && d.prospects.length > 0 ? "limpar seleção" : "selecionar todos"}
          </button>
        }>
          {d.prospects.length === 0 && <div style={{ fontSize: 13, color: UI.muted }}>Base vazia. Busque de uma fonte acima (o CSV funciona sem chave).</div>}
          {d.prospects.map((p) => (
            <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: `1px solid ${UI.borda}`, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={sel.has(p.id)} onChange={() => toggle(p.id)} style={{ width: 16, height: 16, accentColor: UI.roxo }} />
              <span style={{ flex: 1, fontWeight: 600 }}>{p.nome || p.empresa || "—"}</span>
              <span style={{ color: UI.muted, fontSize: 12, width: 130 }}>{p.telefone || p.email || p.instagram || "sem contato"}</span>
              <span style={{ color: UI.muted, fontSize: 12, width: 90 }}>{p.nicho || "—"} · {p.regiao || "—"}</span>
              <span style={{ ...badge(p.status === "contatado"), width: 70, textAlign: "center" }}>{p.status}</span>
              <span style={{ fontSize: 11, color: UI.muted, width: 80 }}>{p.fonte}</span>
            </label>
          ))}
        </Painel>
      </div>

      {/* Log de disparos */}
      <Painel titulo="Histórico de disparos">
        {d.log.length === 0 && <div style={{ fontSize: 13, color: UI.muted }}>Nada ainda.</div>}
        {d.log.map((l) => (
          <div key={l.id} style={{ padding: "7px 0", borderTop: `1px solid ${UI.borda}`, fontSize: 12.5, display: "flex", gap: 10 }}>
            <span style={{ ...badge(l.status === "enviado"), minWidth: 64, textAlign: "center" }}>{l.status}</span>
            <span style={{ color: UI.muted, minWidth: 70 }}>{l.canal}</span>
            <span style={{ flex: 1, color: UI.tinta, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.mensagem}</span>
            <span style={{ color: UI.muted }}>{new Date(l.criado_em).toLocaleString("pt-BR")}</span>
          </div>
        ))}
      </Painel>
    </Shell>
  )
}
