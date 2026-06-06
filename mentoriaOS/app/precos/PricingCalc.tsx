"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ArrowRight, Loader2, TrendingUp, Clock, Shield, DollarSign } from "lucide-react"
import { SC } from "@/components/site/SiteChrome"

async function iniciarCheckout(mentorados: number, setLoading: (v: boolean) => void) {
  setLoading(true)
  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorados }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else alert("Erro ao iniciar checkout. Tente novamente.")
  } catch {
    alert("Erro de conexão. Tente novamente.")
  } finally {
    setLoading(false)
  }
}

// ─── Lógica de preço por mentorado ────────────────────────────────────────────
// Base: R$197/mentorado · Descontos fixos por faixa:
// até 20 → 50% off (R$98,50) | 21-50 → 60% off (R$78,80)
// 51-99  → 70% off (R$59,10) | 100+  → 80% off (R$39,40)
function descPct(n: number): number {
  if (n <= 20) return 50
  if (n <= 50) return 60
  if (n <= 99) return 70
  return 80
}
function precoUnit(n: number): number { return 197 * (1 - descPct(n) / 100) }
const totalMes = (n: number) => Math.round(precoUnit(n) * n)
// Bloco 2: faturamento sob gestão (ticket médio R$2.000/mentorado/mês)
const faturamentoProtegido = (n: number) => n * 2000
// Bloco 3: tempo recuperado (1.2h poupadas por mentorado/mês)
const horasLivres = (n: number) => Math.round(n * 1.2 * 10) / 10
// Bloco 4: ROI churn — 10% dos mentorados podem cancelar; salvar 1 já paga tudo
const alunosSalvos = (n: number) => Math.max(1, Math.ceil(n * 0.1))
const roiChurn = (n: number) => alunosSalvos(n) * 2000 * 12
const fmt = (n: number) => n.toLocaleString("pt-BR")

const PLANOS = [
  {
    nome: "Solo",
    sub: "Até 20 mentorados — para mentores solo",
    preco: "50% off",
    unidade: "= R$98,50/mentorado",
    exemplo: "10 mentorados = R$985/mês",
    badge: null,
    feats: ["Dashboard de operação", "Financeiro + cobranças", "Atividades em Kanban", "Portal do aluno", "Briefing com IA", "Suporte por email"],
    destaque: false,
    href: "/comecar",
    cta: "Começar Grátis — 14 dias",
    mentorados_exemplo: 10,
  },
  {
    nome: "Empresa",
    sub: "21–50 mentorados — escale sem trabalhar mais",
    preco: "60% off",
    unidade: "= R$78,80/mentorado",
    exemplo: "30 mentorados = R$2.364/mês",
    badge: "MAIS ESCOLHIDO",
    feats: ["Tudo do Solo", "Marca, cores e domínio próprios", "Vários mentores", "Radar de churn antecipado", "Analytics avançado", "Suporte prioritário (4h)"],
    destaque: true,
    href: "/comecar",
    cta: "Começar Grátis — 14 dias",
    mentorados_exemplo: 30,
  },
  {
    nome: "Scale",
    sub: "51+ mentorados — operações de alto volume",
    preco: "70–80% off",
    unidade: "= R$39,40–59,10/mentorado",
    exemplo: "100 mentorados = R$3.940/mês",
    badge: null,
    feats: ["Tudo do Empresa", "Onboarding dedicado", "White-label completo", "Volume ilimitado", "SLA 99.9%", "Suporte prioritário"],
    destaque: false,
    href: "/comecar",
    cta: "Começar Grátis — 14 dias",
    mentorados_exemplo: 60,
  },
]

const TABELA = [10, 20, 30, 50, 60, 100]

export default function PricingCalc() {
  const [n, setN] = useState(10)
  const [loading, setLoading] = useState(false)

  const pu = precoUnit(n)
  const fat = faturamentoProtegido(n)
  const horas = horasLivres(n)
  const roi = roiChurn(n)
  const salvos = alunosSalvos(n)
  const pct = descPct(n)
  // largura da barra: quanto menor o preço/mentorado vs R$197, mais preenchida
  const barPct = Math.round((pu / 197) * 100)

  return (
    <>
      {/* ── CALCULADORA ── */}
      <section id="calculadora" className="max-w-3xl mx-auto px-5 pb-16">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: `${SC.gold}22`, color: SC.goldL }}>
            CALCULADORA DE IMPACTO
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: SC.text }}>
            Quanto a CKlareza vale para você?
          </h2>
          <p style={{ color: SC.muted }}>Mova o slider e veja o impacto real no seu negócio</p>
        </div>

        <div className="rounded-2xl p-8 md:p-10"
          style={{ background: SC.card, border: `2px solid ${SC.gold}55` }}>

          {/* Slider */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold" style={{ color: SC.muted }}>
                Número de mentorados
              </label>
              <span className="text-3xl font-extrabold" style={{ color: SC.gold }}>{n}</span>
            </div>
            <input
              type="range" min={1} max={100} step={1} value={n}
              onChange={e => setN(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${SC.gold} ${n}%, #1e3a5f ${n}%)`,
                accentColor: SC.gold,
              }}
            />
            <div className="flex justify-between text-xs mt-2" style={{ color: SC.muted }}>
              <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
            </div>
          </div>

          {/* 4 blocos de impacto */}
          <div className="grid grid-cols-2 gap-3 mb-8">

            {/* Bloco 1 — Investimento/mentorado */}
            <div className="p-5 rounded-2xl flex flex-col gap-1"
              style={{ background: "#0a1e3d", border: `1px solid #1e4080` }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#7ba4e0" }}>
                Investimento / mentorado
              </p>
              <p className="text-3xl font-extrabold leading-none" style={{ color: SC.gold }}>
                R${pu.toFixed(2).replace(".", ",")}
              </p>
              <p className="text-[11px]" style={{ color: "#7ba4e0" }}>
                por mentorado/mês{" "}
                <span style={{ color: "#4a6fa5" }}>(Base: R$197)</span>
              </p>
            </div>

            {/* Bloco 2 — Faturamento Protegido */}
            <div className="p-5 rounded-2xl flex flex-col gap-1"
              style={{ background: "#0d1f3a", border: `1px solid #1a3a70` }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#7ba4e0" }}>
                Faturamento Protegido
              </p>
              <p className="text-3xl font-extrabold leading-none" style={{ color: SC.text }}>
                R${fmt(fat)}
              </p>
              <p className="text-[11px]" style={{ color: "#7ba4e0" }}>
                sob gestão da IA/mês
              </p>
            </div>

            {/* Bloco 3 — Tempo Recuperado */}
            <div className="p-5 rounded-2xl flex flex-col gap-1"
              style={{ background: "#062718", border: `1px solid #0d4a2e` }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#4ade80" }}>
                Tempo Recuperado
              </p>
              <p className="text-3xl font-extrabold leading-none" style={{ color: "#4ade80" }}>
                {horas}h
              </p>
              <p className="text-[11px]" style={{ color: "#2d7a50" }}>
                livres por mês
              </p>
            </div>

            {/* Bloco 4 — ROI da Retenção */}
            <div className="p-5 rounded-2xl flex flex-col gap-1"
              style={{ background: "#071f12", border: `1px solid #0f5a30` }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#34d399" }}>
                ROI da Retenção (Churn)
              </p>
              <p className="text-3xl font-extrabold leading-none" style={{ color: "#34d399" }}>
                +R${fmt(roi)}
              </p>
              <p className="text-[11px]" style={{ color: "#1a6640" }}>
                salvando {salvos} aluno{salvos > 1 ? "s" : ""}/ano
              </p>
            </div>
          </div>

          {/* Barra: desconto progressivo por escala */}
          <div className="mb-7">
            <div className="flex justify-between text-xs mb-1.5">
              <span style={{ color: SC.muted }}>Preço de tabela (1 mentorado) → R$197/mês</span>
              <span style={{ color: SC.gold }} className="font-semibold">{pct}% off por volume</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "#1e3a5f" }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${100 - barPct}%`,
                  background: `linear-gradient(to right, ${SC.gold}, #34d399)`
                }} />
            </div>
            <div className="flex justify-between text-xs mt-1.5">
              <span style={{ color: "#34d399" }}>
                Seu preço com {n} mentorado{n > 1 ? "s" : ""} → R${pu.toFixed(2).replace(".", ",")}/mês por aluno
              </span>
              <span style={{ color: SC.muted }}>Economia automática por volume</span>
            </div>
          </div>

          {/* Insight de ROI */}
          <div className="rounded-xl px-4 py-3 mb-6 flex items-start gap-3"
            style={{ background: `${SC.gold}12`, border: `1px solid ${SC.gold}30` }}>
            <span className="text-lg mt-0.5">💡</span>
            <p className="text-sm leading-relaxed" style={{ color: SC.muted }}>
              Um investimento de{" "}
              <strong style={{ color: SC.gold }}>R${fmt(totalMes(n))}/mês</strong>{" "}
              para proteger{" "}
              <strong style={{ color: SC.text }}>R${fmt(fat)}/mês</strong>{" "}
              em faturamento. Salvar {salvos} aluno{salvos > 1 ? "s" : ""}/ano já cobre{" "}
              <strong style={{ color: "#34d399" }}>
                {Math.round(roi / totalMes(n))}x o custo anual
              </strong>
              .
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={() => iniciarCheckout(n, setLoading)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-bold text-base transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: SC.gold, color: "#04121a", boxShadow: `0 8px 32px ${SC.gold}50` }}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Abrindo checkout…</>
                : <>Garantir minha ferramenta com desconto de escala <ArrowRight className="w-4 h-4" /></>
              }
            </button>
            <p className="text-xs mt-3" style={{ color: SC.muted }}>
              Teste gratuito de 14 dias · Sem cartão de crédito · Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* ── TABELA REFERÊNCIA ── */}
      <section className="max-w-3xl mx-auto px-5 pb-10">
        <h3 className="text-center text-lg font-bold mb-4" style={{ color: SC.text }}>
          Referência rápida de preços
        </h3>
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${SC.border}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#111c30" }}>
                <th className="text-left px-5 py-3 font-semibold" style={{ color: SC.muted }}>Mentorados</th>
                <th className="text-right px-5 py-3 font-semibold" style={{ color: SC.muted }}>R$/unidade</th>
                <th className="text-right px-5 py-3 font-semibold" style={{ color: SC.muted }}>Total/mês</th>
                <th className="text-right px-5 py-3 font-semibold" style={{ color: SC.teal }}>Desconto</th>
              </tr>
            </thead>
            <tbody>
              {TABELA.map((row, i) => (
                <tr key={row}
                  onClick={() => setN(row)}
                  className="cursor-pointer transition-colors"
                  style={{
                    background: n === row ? `${SC.gold}18` : i % 2 === 0 ? SC.card : "#111c30",
                    borderTop: `1px solid ${SC.border}`,
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${SC.gold}12`}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n === row ? `${SC.gold}18` : i % 2 === 0 ? SC.card : "#111c30"}>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: n === row ? SC.gold : SC.text }}>
                    {row} mentorados
                  </td>
                  <td className="px-5 py-3.5 text-right" style={{ color: SC.muted }}>
                    R${precoUnit(row).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold" style={{ color: n === row ? SC.gold : SC.text }}>
                    R${fmt(totalMes(row))}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold" style={{ color: SC.teal }}>
                    {descPct(row)}% off
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-xs mt-3" style={{ color: SC.muted }}>
          ↑ Clique em qualquer linha para atualizar a calculadora
        </p>
      </section>

      {/* ── CARDS DE PLANOS ── */}
      <section className="max-w-5xl mx-auto px-5 pb-16 grid md:grid-cols-3 gap-5 items-start">
        {PLANOS.map(p => (
          <div key={p.nome} className="rounded-2xl p-7 relative flex flex-col"
            style={{
              background: p.destaque ? `${SC.gold}10` : SC.card,
              border: `${p.destaque ? "2px" : "1px"} solid ${p.destaque ? SC.gold : SC.border}`,
              boxShadow: p.destaque ? `0 20px 60px -20px ${SC.gold}40` : "none",
            }}>
            {p.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ background: SC.gold, color: "#1a1407" }}>
                {p.badge}
              </span>
            )}
            <h2 className="text-xl font-bold mb-1" style={{ color: SC.text }}>{p.nome}</h2>
            <p className="text-sm mb-4" style={{ color: SC.muted }}>{p.sub}</p>

            <div className="mb-1">
              <span className="text-3xl font-extrabold" style={{ color: p.destaque ? SC.gold : SC.text }}>
                {p.preco}
              </span>
              {p.unidade && (
                <span className="text-sm ml-1" style={{ color: SC.muted }}>{p.unidade}</span>
              )}
            </div>
            <p className="text-xs mb-5" style={{ color: SC.teal }}>{p.exemplo}</p>

            <ul className="space-y-2.5 mb-6 flex-1">
              {p.feats.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: SC.teal }} />
                  <span style={{ color: SC.muted }}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => iniciarCheckout(p.mentorados_exemplo, setLoading)}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all disabled:opacity-70"
              style={p.destaque
                ? { background: SC.gold, color: "#1a1407" }
                : { background: "transparent", border: `1px solid ${SC.border}`, color: SC.text }}>
              {p.cta} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </section>
    </>
  )
}
