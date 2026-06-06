"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { SC } from "@/components/site/SiteChrome"

// ─── Lógica de preço por mentorado ────────────────────────────────────────────
// Âncoras: 10 → R$98,50 | 30 → R$78,80 | 100 → R$59,10
// Base (sem CKlareza): R$197/mentorado (custo de gestor manual)
function precoUnit(n: number): number {
  if (n <= 20) return 98.5
  if (n <= 30) {
    const t = (n - 20) / 10
    return 98.5 + t * (78.8 - 98.5)
  }
  const t = Math.min((n - 30) / 70, 1)
  return 78.8 + t * (59.1 - 78.8)
}
const totalMes = (n: number) => Math.round(precoUnit(n) * n)
const desconto = (n: number) => Math.round((1 - totalMes(n) / (197 * n)) * 100)
const economia = (n: number) => Math.round(197 * n - totalMes(n))
const fmt = (n: number) => n.toLocaleString("pt-BR")

const PLANOS = [
  {
    nome: "Mentor",
    sub: "Até 20 mentorados — para mentores solo",
    preco: "R$98,50",
    unidade: "/mentorado/mês",
    exemplo: "10 mentorados = R$985/mês",
    badge: null,
    feats: ["Dashboard de operação", "Financeiro + cobranças", "Atividades em Kanban", "Portal do aluno", "Briefing com IA", "Suporte por email"],
    destaque: false,
    href: "/login",
    cta: "Começar Grátis",
  },
  {
    nome: "Empresa",
    sub: "21+ mentorados — escale sem trabalhar mais",
    preco: "60–80%",
    unidade: "de desconto",
    exemplo: "30 = R$2.364/mês · 100 = R$5.910/mês",
    badge: "MAIS ESCOLHIDO",
    feats: ["Tudo do Mentor", "Marca, cores e domínio próprios", "Vários mentores", "Radar de churn antecipado", "Analytics avançado", "Suporte prioritário (4h)"],
    destaque: true,
    href: "/login",
    cta: "Começar Grátis",
  },
  {
    nome: "Enterprise",
    sub: "Para agências e operações multi-mentor",
    preco: "Sob consulta",
    unidade: "",
    exemplo: "Mentorados ilimitados · SLA 99.9%",
    badge: null,
    feats: ["Tudo do Empresa", "Onboarding dedicado", "White-label completo", "Volume ilimitado", "Suporte prioritário", "Integrações sob medida"],
    destaque: false,
    href: "/contato",
    cta: "Falar com a gente",
  },
]

const TABELA = [5, 10, 20, 30, 50, 100]

export default function PricingCalc() {
  const [n, setN] = useState(10)

  return (
    <>
      {/* ── CALCULADORA ── */}
      <section id="calculadora" className="max-w-3xl mx-auto px-5 pb-16">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
            style={{ background: `${SC.gold}22`, color: SC.goldL }}>
            CALCULADORA DE DESCONTO
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: SC.text }}>
            Calcule seu desconto real
          </h2>
          <p style={{ color: SC.muted }}>Mova o slider e veja quanto você paga por mês</p>
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

          {/* 4 métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="text-center p-4 rounded-xl"
              style={{ background: "#0c1322", border: `1px solid #1e3a5f` }}>
              <p className="text-2xl font-extrabold" style={{ color: SC.gold }}>
                R${precoUnit(n).toFixed(2).replace(".", ",")}
              </p>
              <p className="text-[11px] mt-1" style={{ color: SC.muted }}>por mentorado/mês</p>
            </div>
            <div className="text-center p-4 rounded-xl"
              style={{ background: "#0c1322", border: `1px solid #1e3a5f` }}>
              <p className="text-2xl font-extrabold" style={{ color: SC.text }}>
                R${fmt(totalMes(n))}
              </p>
              <p className="text-[11px] mt-1" style={{ color: SC.muted }}>total mensal</p>
            </div>
            <div className="text-center p-4 rounded-xl"
              style={{ background: `${SC.teal}15`, border: `1px solid ${SC.teal}50` }}>
              <p className="text-2xl font-extrabold" style={{ color: SC.teal }}>
                {desconto(n)}%
              </p>
              <p className="text-[11px] mt-1" style={{ color: SC.muted }}>de desconto</p>
            </div>
            <div className="text-center p-4 rounded-xl"
              style={{ background: `${SC.teal}15`, border: `1px solid ${SC.teal}50` }}>
              <p className="text-2xl font-extrabold" style={{ color: SC.teal }}>
                R${fmt(economia(n))}
              </p>
              <p className="text-[11px] mt-1" style={{ color: SC.muted }}>economia/mês</p>
            </div>
          </div>

          {/* Barra comparativa */}
          <div className="mb-7">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: SC.muted }}>
              <span>Sem CKlareza — R${fmt(197 * n)}/mês</span>
              <span style={{ color: SC.teal }}>{desconto(n)}% off</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "#1e3a5f" }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${100 - desconto(n)}%`,
                  background: `linear-gradient(to right, ${SC.gold}, ${SC.teal})`
                }} />
            </div>
            <div className="flex justify-between text-xs mt-1.5">
              <span style={{ color: SC.gold }}>Com CKlareza — R${fmt(totalMes(n))}/mês</span>
              <span style={{ color: SC.muted }}>Base: R$197/mentorado</span>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5"
              style={{ background: SC.gold, color: "#04121a", boxShadow: `0 8px 24px ${SC.gold}40` }}>
              Começar com {n} mentorados <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs mt-3" style={{ color: SC.muted }}>
              ✦ 50% de desconto para novos clientes no primeiro mês
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
                    {desconto(row)}% off
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

            <Link href={p.href}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all"
              style={p.destaque
                ? { background: SC.gold, color: "#1a1407" }
                : { background: "transparent", border: `1px solid ${SC.border}`, color: SC.text }}>
              {p.cta} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </section>
    </>
  )
}
