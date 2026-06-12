"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/basePath"
import { Shell, Card, Painel, UI } from "../Shell"

type Vendas = {
  trials: number
  ativos: number
  pagosReais: number
  receitaReais: number
  porStatus: Record<string, number>
}
type Loop = {
  vendas: Vendas
  leadsComEmail: number
  leadsViraramCliente: number
  taxaLeadParaCliente: number
  etapas: { nome: string; valor: number }[]
}
type Funil = {
  total: number
  porFonte: Record<string, number>
  porCanal: Record<string, number>
  funilAcumulado: { estagio: string; alcancaram: number; pct: number }[]
  quentes: number
  fechados: number
  perdidos: number
  ticketMedio: number
  taxaQuenteParaFechado: number
  tempoMedioFechamentoHoras: number | null
  gratidao: { zero: number; um: number; pendentes: number }
  vendas?: Vendas
  loop?: Loop
}

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })

function Distribuicao({ titulo, dados }: { titulo: string; dados: Record<string, number> }) {
  const entradas = Object.entries(dados).sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...entradas.map(([, v]) => v))
  return (
    <Painel titulo={titulo}>
      {entradas.length === 0 && <div style={{ fontSize: 13, color: UI.muted }}>—</div>}
      {entradas.map(([k, v]) => (
        <div key={k} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
            <span style={{ color: UI.muted }}>{k}</span><b>{v}</b>
          </div>
          <div style={{ height: 7, background: "#f1eefb", borderRadius: 5 }}>
            <div style={{ width: `${(v / max) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${UI.roxo}, ${UI.magenta})`, borderRadius: 5 }} />
          </div>
        </div>
      ))}
    </Painel>
  )
}

export default function Dashboard() {
  const [f, setF] = useState<Funil | null>(null)

  async function carregar() {
    const res = await fetch(api("/api/admin/analytics"), { cache: "no-store" })
    setF(await res.json())
  }
  useEffect(() => {
    carregar()
    const t = setInterval(carregar, 5000)
    return () => clearInterval(t)
  }, [])

  if (!f)
    return (
      <Shell ativo="/admin/analytics" titulo="Dashboard">
        <div style={{ color: UI.muted }}>Carregando…</div>
      </Shell>
    )

  const vendas = f.vendas
  const loop = f.loop
  const etapas = loop?.etapas || []
  const maxEtapa = Math.max(1, ...etapas.map((e) => e.valor))
  const qualificados = f.funilAcumulado.find((x) => x.estagio === "qualificado")?.alcancaram || 0

  return (
    <Shell ativo="/admin/analytics" titulo="Dashboard" subtitulo="Do lead à venda — em tempo real">
      {/* Linha 1: KPIs de captação */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        <Card titulo="Leads totais" valor={String(f.total)} cor={UI.roxo} icone="👥" />
        <Card titulo="Qualificados" valor={String(qualificados)} cor={UI.azul} icone="✓" />
        <Card titulo="Quentes" valor={String(f.quentes)} cor={UI.laranja} icone="🔥" />
        <Card titulo="Lead → cliente" valor={`${loop?.taxaLeadParaCliente ?? 0}%`} cor={UI.magenta} sub={`${loop?.leadsViraramCliente ?? 0}/${loop?.leadsComEmail ?? 0} por e-mail`} />
      </div>

      {/* Linha 2: KPIs de venda real */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
        <Card titulo="Trials ativos" valor={String(vendas?.trials ?? 0)} cor={UI.roxo} icone="🎟️" sub="empresas em teste" />
        <Card titulo="Pagantes" valor={String(vendas?.ativos ?? 0)} cor={UI.verde} icone="💚" />
        <Card titulo="Receita real (Stripe)" valor={brl(vendas?.receitaReais ?? 0)} cor={UI.verde} sub={`${vendas?.pagosReais ?? 0} pagamentos`} />
        <Card titulo="Ticket médio" valor={brl(f.ticketMedio)} cor={UI.azul} />
      </div>

      {/* Funil do lead à venda */}
      {etapas.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <Painel titulo="🔗 Funil — do lead à venda">
            {etapas.map((e, i) => (
              <div key={e.nome} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                <div style={{ width: 110, fontSize: 13.5, fontWeight: 600 }}>{e.nome}</div>
                <div style={{ flex: 1, height: 30, background: "#f1eefb", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{
                    width: `${(e.valor / maxEtapa) * 100}%`, height: "100%",
                    background: i >= 3 ? `linear-gradient(90deg, ${UI.verde}, #059669)` : `linear-gradient(90deg, ${UI.roxo}, ${UI.magenta})`,
                    display: "flex", alignItems: "center", paddingLeft: 10, color: "#fff", fontSize: 13, fontWeight: 700, minWidth: 30,
                  }}>
                    {e.valor}
                  </div>
                </div>
                <div style={{ width: 46, textAlign: "right", fontSize: 12.5, color: UI.muted }}>
                  {f.total ? Math.round((e.valor / f.total) * 100) : 0}%
                </div>
              </div>
            ))}
            {f.tempoMedioFechamentoHoras != null && (
              <div style={{ fontSize: 12.5, color: UI.muted, marginTop: 10 }}>
                ⏱️ Tempo médio até fechar: <b style={{ color: UI.tinta }}>{f.tempoMedioFechamentoHoras}h</b>
              </div>
            )}
          </Painel>
        </div>
      )}

      {/* GRATIDÃO 0→1 + distribuições */}
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "stretch" }}>
        <div style={{ flex: "1 1 280px", background: `linear-gradient(135deg, ${UI.roxoEscuro}, ${UI.roxo})`, color: "#fff", borderRadius: 16, padding: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>🧠 GRATIDÃO · Lei da Fábrica (0→1)</div>
          <div style={{ display: "flex", gap: 26, marginTop: 16 }}>
            <div><div style={{ fontSize: 32, fontWeight: 800 }}>{f.gratidao.zero}</div><div style={{ fontSize: 11.5, opacity: 0.75 }}>0 · entraram</div></div>
            <div><div style={{ fontSize: 32, fontWeight: 800, color: "#a7f3d0" }}>{vendas?.ativos ?? 0}</div><div style={{ fontSize: 11.5, opacity: 0.75 }}>1 · pagantes</div></div>
            <div><div style={{ fontSize: 32, fontWeight: 800, color: "#fde68a" }}>{vendas?.trials ?? 0}</div><div style={{ fontSize: 11.5, opacity: 0.75 }}>em trial</div></div>
          </div>
          <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 14, lineHeight: 1.5 }}>
            O "1" é lastreado em pagamento real no Stripe. Cada conversão consolida o passo como workflow replicável.
          </div>
        </div>
        <div style={{ flex: "1 1 240px" }}><Distribuicao titulo="Leads por fonte" dados={f.porFonte} /></div>
        <div style={{ flex: "1 1 240px" }}><Distribuicao titulo="Leads por canal" dados={f.porCanal} /></div>
      </div>
    </Shell>
  )
}
