"use client"

// Landing pública do Pré-Validador de NF — sem login.
// Foco: mostrar a redução de gastos de validar a nota ANTES do envio à prefeitura/SEFAZ.

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Sparkles, ShieldCheck, AlertCircle, Check, X, ArrowRight, Clock,
  FileX2, FileCheck2, Calculator, TrendingDown, Sun, Moon, Zap, Target,
} from "lucide-react"

type Theme = "dark" | "light"

const PALETTES: Record<Theme, any> = {
  light: {
    bg: "#ffffff", card: "#f8f9fa", card2: "#f3f4f6", border: "#e5e7eb",
    muted: "#5f6368", ink: "#1f2937",
    gold: "#d4af37", goldDeep: "#9a7916", teal: "#0f8a8a",
    onAccent: "#1a1407", red: "#dc2626", green: "#16a34a",
  },
  dark: {
    bg: "#060913", card: "#0c1322", card2: "#111c30", border: "#1e3a5f",
    muted: "#93a8c9", ink: "#e8f1ff",
    gold: "#22d3ee", goldDeep: "#3dd7f0", teal: "#34d399",
    onAccent: "#04121a", red: "#f87171", green: "#4ade80",
  },
}

// ─── Premissas da calculadora (conservadoras, explicadas na própria página) ──
const MIN_CORRECAO = 25          // minutos médios para diagnosticar + corrigir + reemitir 1 nota rejeitada
const PCT_PEGO_ANTES = 0.95      // % dos erros que a pré-validação detecta antes do envio
const DIAS_ATRASO_RECEBIMENTO = 5 // dias médios que uma nota rejeitada atrasa o recebimento
const PCT_CAMINHAO_PARADO = 0.10 // % das rejeições que param um caminhão / atrasam entrega crítica
const DIARIA_CAMINHAO = 600      // R$ por diária de caminhão parado (estadia, mercado: R$500–1.500)
const PCT_AUTUACAO = 0.01        // % das rejeições que evoluem para autuação / perda fiscal
const CUSTO_AUTUACAO = 300       // R$ médio conservador por ocorrência fiscal

const fmt = (n: number) => Math.round(n).toLocaleString("pt-BR")

// Ferramenta de validação (app separado pre_validador_sefaz na Vercel)
const URL_FERRAMENTA = "https://prevalidadorsefaz.vercel.app"

// Fora do componente da página: manter a identidade estável evita remontar o
// <input range> a cada render (o arrasto do slider seria interrompido)
function Slider({ label, value, setValue, min, max, step, prefix = "", suffix = "", c }: any) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold" style={{ color: c.muted }}>{label}</label>
        <span className="text-lg font-extrabold" style={{ color: c.gold }}>{prefix}{value.toLocaleString("pt-BR")}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => setValue(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${c.gold} ${pct}%, ${c.card2} ${pct}%)`, accentColor: c.gold }} />
    </div>
  )
}

// JSON-LD — FAQ da página
const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "O que é um pré-validador de nota fiscal?", acceptedAnswer: { "@type": "Answer", text: "É uma camada de verificação que analisa a nota (XML, campos, regras da prefeitura/SEFAZ) ANTES do envio oficial. Em vez de descobrir o erro na rejeição, você corrige em segundos, antes de transmitir." } },
    { "@type": "Question", name: "Quanto custa uma nota fiscal rejeitada?", acceptedAnswer: { "@type": "Answer", text: "Além do retrabalho da equipe (20 a 40 minutos por nota entre diagnóstico, correção e reemissão), a rejeição atrasa o recebimento — o cliente não paga sem nota válida — e expõe a empresa a multas por emissão fora do prazo de competência." } },
    { "@type": "Question", name: "Que tipos de erro o pré-validador detecta?", acceptedAnswer: { "@type": "Answer", text: "Erros de schema do XML, tags incorretas ou trocadas, série e numeração inconsistentes, códigos de serviço inválidos, retenções de ISS calculadas errado e divergências com as regras específicas de cada prefeitura." } },
  ],
}

export default function PrevalidadorPage() {
  const [theme, setTheme] = useState<Theme>("dark")
  // Calculadora
  const [notasMes, setNotasMes] = useState(300)
  const [taxaRejeicao, setTaxaRejeicao] = useState(8)
  const [custoHora, setCustoHora] = useState(60)
  const [ticketNota, setTicketNota] = useState(800)
  const [logistica, setLogistica] = useState(true)       // rejeições atrasam caminhões/entregas?
  const [investimento, setInvestimento] = useState(500)  // R$/mês na ferramenta (para o payback)

  useEffect(() => {
    const saved = localStorage.getItem("ck_theme")
    if (saved === "light" || saved === "dark") setTheme(saved)
  }, [])
  const toggleTheme = () => setTheme(prev => {
    const next: Theme = prev === "dark" ? "light" : "dark"
    localStorage.setItem("ck_theme", next)
    return next
  })

  const c = PALETTES[theme]

  // ─── Matemática da economia ────────────────────────────────────────────────
  const rejeitadasMes = notasMes * (taxaRejeicao / 100)
  const horasRetrabalhoMes = (rejeitadasMes * MIN_CORRECAO) / 60
  const custoRetrabalhoMes = horasRetrabalhoMes * custoHora
  // capital parado: valor das notas rejeitadas × dias de atraso × custo de oportunidade (~2% a.m. ≈ 0,066%/dia)
  const capitalAtrasadoMes = rejeitadasMes * ticketNota
  const custoAtrasoMes = capitalAtrasadoMes * 0.00066 * DIAS_ATRASO_RECEBIMENTO
  // fricção logística: parte das rejeições para caminhão / atrasa entrega crítica (estadia)
  const custoLogisticaMes = logistica ? rejeitadasMes * PCT_CAMINHAO_PARADO * DIARIA_CAMINHAO : 0
  // risco fiscal: parte das rejeições evolui para autuação / perda
  const custoFiscalMes = rejeitadasMes * PCT_AUTUACAO * CUSTO_AUTUACAO
  const custoTotalAno = (custoRetrabalhoMes + custoAtrasoMes + custoLogisticaMes + custoFiscalMes) * 12
  const economiaAno = custoTotalAno * PCT_PEGO_ANTES
  const horasAno = horasRetrabalhoMes * 12 * PCT_PEGO_ANTES
  // payback: em quantos dias do ano a economia cobre o investimento anual na ferramenta
  const paybackDias = economiaAno > 0 ? Math.ceil(((investimento * 12) / economiaAno) * 365) : null

  return (
    <div style={{ background: c.bg, color: c.ink, transition: "background 0.3s, color 0.3s" }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />

      {/* ── NAV ── */}
      <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: `${c.bg}cc`, borderBottom: `1px solid ${c.border}` }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-[22px] h-[22px]" style={{ color: c.gold }} />
            <div className="leading-none">
              <span className="font-bold tracking-tight text-[22px]" style={{ color: c.goldDeep }}>CKlareza</span>
              <span className="block text-[9px] tracking-[0.25em] mt-0.5" style={{ color: c.teal }}>PRÉ-VALIDADOR</span>
            </div>
          </Link>
          <div className="flex items-center gap-2.5">
            <button onClick={toggleTheme} aria-label="Alternar tema"
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ color: c.gold, border: `1px solid ${c.border}`, background: `${c.gold}10` }}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <a href="#calculadora"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: c.gold, color: c.onAccent, boxShadow: `0 6px 20px ${c.gold}40` }}>
              Calcular economia <Calculator className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(60% 50% at 50% 0%, ${c.gold}1f 0%, transparent 70%)` }} />
        <div className="relative max-w-4xl mx-auto px-5 pt-16 pb-12 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: `${c.red}15`, border: `1px solid ${c.red}40`, color: c.red }}>
            <AlertCircle className="w-3.5 h-3.5" /> Sua nota foi rejeitada — de novo
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.08]">
            Cada nota rejeitada<br />
            <span style={{ color: c.red }}>custa dinheiro.</span>{" "}
            <span style={{ color: c.teal }}>Pegue o erro antes.</span>
          </h1>
          <p className="text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed" style={{ color: c.muted }}>
            O <strong style={{ color: c.ink }}>Pré-Validador</strong> analisa sua nota fiscal — XML, campos, série, numeração,
            regras da prefeitura — <strong style={{ color: c.teal }}>antes do envio oficial</strong>.
            O erro que a SEFAZ levaria horas para devolver, você corrige em segundos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
            <a href="#calculadora"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold transition-all hover:-translate-y-0.5"
              style={{ background: c.gold, color: c.onAccent, boxShadow: `0 10px 30px ${c.gold}40` }}>
              <Calculator className="w-4 h-4" /> Calcular quanto eu perco hoje
            </a>
            <Link href="/contato"
              className="px-6 py-3.5 rounded-xl text-base font-semibold"
              style={{ background: c.card, border: `1px solid ${c.border}`, color: c.ink }}>
              Falar com a gente →
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            {["Sem login para simular", "Validação antes do envio", "Regras por prefeitura"].map(tr => (
              <span key={tr} className="flex items-center gap-1.5 text-sm" style={{ color: c.muted }}>
                <Check className="w-4 h-4" style={{ color: c.teal }} /> {tr}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── O CUSTO INVISÍVEL ── */}
      <section className="max-w-4xl mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: c.border, color: c.muted }}>
            O CUSTO QUE NINGUÉM CONTABILIZA
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold">Uma rejeição nunca custa só a rejeição.</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: Clock, titulo: "Retrabalho da equipe", desc: "Diagnosticar o erro, corrigir, reemitir, conferir: 20–40 minutos por nota. Em escala, são dias inteiros de trabalho por mês jogados fora." },
            { icon: TrendingDown, titulo: "Recebimento atrasado", desc: "Cliente não paga sem nota válida. Cada rejeição empurra o recebimento em ~5 dias — é capital seu parado no caixa do cliente." },
            { icon: AlertCircle, titulo: "Multa e exposição fiscal", desc: "Nota reemitida fora do prazo de competência, ISS retido calculado errado, cancelamento fora da janela: cada um é porta para multa." },
          ].map(({ icon: Icon, titulo, desc }) => (
            <div key={titulo} className="p-6 rounded-2xl" style={{ background: `${c.red}08`, border: `1px solid ${c.red}30` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${c.red}15` }}>
                <Icon className="w-5 h-5" style={{ color: c.red }} />
              </div>
              <h3 className="font-bold text-lg mb-2">{titulo}</h3>
              <p className="text-sm leading-relaxed" style={{ color: c.muted }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CALCULADORA — o coração da página ── */}
      <section id="calculadora" className="max-w-4xl mx-auto px-5 py-14">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: `${c.gold}18`, color: c.goldDeep }}>
            CALCULADORA DE DESPERDÍCIO
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2">Quanto a sua operação perde por ano?</h2>
          <p style={{ color: c.muted }}>Mova os controles — os números são da SUA realidade, não da nossa.</p>
        </div>

        <div className="rounded-2xl p-8 md:p-10" style={{ background: c.card, border: `2px solid ${c.gold}40` }}>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-7 mb-9">
            <Slider c={c} label="Notas emitidas por mês" value={notasMes} setValue={setNotasMes} min={20} max={5000} step={20} />
            <Slider c={c} label="Taxa de rejeição/erro" value={taxaRejeicao} setValue={setTaxaRejeicao} min={1} max={25} step={1} suffix="%" />
            <Slider c={c} label="Custo-hora da equipe fiscal" value={custoHora} setValue={setCustoHora} min={20} max={200} step={5} prefix="R$" />
            <Slider c={c} label="Valor médio por nota" value={ticketNota} setValue={setTicketNota} min={100} max={20000} step={100} prefix="R$" />
            <label className="flex items-start gap-3 p-4 rounded-xl cursor-pointer"
              style={{ background: c.card2, border: `1px solid ${logistica ? c.gold : c.border}` }}>
              <input type="checkbox" checked={logistica} onChange={e => setLogistica(e.target.checked)}
                className="mt-0.5 w-4 h-4 cursor-pointer" style={{ accentColor: c.gold }} />
              <span>
                <span className="text-sm font-semibold block" style={{ color: c.ink }}>🚚 As rejeições atrasam caminhões ou entregas?</span>
                <span className="text-xs" style={{ color: c.muted }}>Aplica estadia/diária de caminhão parado ({PCT_CAMINHAO_PARADO * 100}% das rejeições × R${DIARIA_CAMINHAO}/dia — mercado: R$500–1.500)</span>
              </span>
            </label>
            <Slider c={c} label="Investimento na ferramenta (R$/mês)" value={investimento} setValue={setInvestimento} min={100} max={5000} step={100} prefix="R$" />
          </div>

          {/* Resultado: SEM vs COM */}
          <div className="grid md:grid-cols-2 gap-5 mb-7">
            <div className="p-6 rounded-xl text-center" style={{ background: `${c.red}0a`, border: `1px solid ${c.red}35` }}>
              <p className="flex items-center justify-center gap-2 text-sm font-bold mb-2" style={{ color: c.red }}>
                <FileX2 className="w-4 h-4" /> SEM pré-validação
              </p>
              <p className="text-3xl md:text-4xl font-extrabold" style={{ color: c.red }}>R${fmt(custoTotalAno)}</p>
              <p className="text-xs mt-1" style={{ color: c.muted }}>desperdiçados por ano</p>
              <p className="text-xs mt-3" style={{ color: c.muted }}>
                {fmt(rejeitadasMes * 12)} notas rejeitadas/ano · {fmt(horasRetrabalhoMes * 12)}h de retrabalho
              </p>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: c.muted }}>
                retrabalho R${fmt(custoRetrabalhoMes * 12)}
                {logistica ? <> · logística R${fmt(custoLogisticaMes * 12)}</> : null}
                {" "}· capital parado R${fmt(custoAtrasoMes * 12)} · risco fiscal R${fmt(custoFiscalMes * 12)}
              </p>
            </div>
            <div className="p-6 rounded-xl text-center" style={{ background: `${c.teal}0d`, border: `2px solid ${c.teal}50` }}>
              <p className="flex items-center justify-center gap-2 text-sm font-bold mb-2" style={{ color: c.teal }}>
                <FileCheck2 className="w-4 h-4" /> COM pré-validação
              </p>
              <p className="text-3xl md:text-4xl font-extrabold" style={{ color: c.teal }}>R${fmt(economiaAno)}</p>
              <p className="text-xs mt-1" style={{ color: c.muted }}>de volta no seu caixa, por ano</p>
              <p className="text-xs mt-3" style={{ color: c.muted }}>
                + {fmt(horasAno)} horas/ano devolvidas à equipe
              </p>
              {paybackDias !== null && paybackDias <= 365 && (
                <p className="text-sm font-bold mt-3 px-3 py-1.5 rounded-lg inline-block"
                  style={{ background: `${c.teal}18`, color: c.teal }}>
                  ⚡ Se paga nos primeiros {paybackDias} dias do ano
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-center mb-7" style={{ color: c.muted }}>
            Premissas conservadoras: {MIN_CORRECAO} min de correção por nota rejeitada · pré-validação detecta {PCT_PEGO_ANTES * 100}% dos erros antes do envio ·
            rejeição atrasa o recebimento em ~{DIAS_ATRASO_RECEBIMENTO} dias (custo de oportunidade de 2% a.m.) ·
            inclui estimativa de estadias logísticas e gargalos de expedição ({PCT_CAMINHAO_PARADO * 100}% das rejeições × R${DIARIA_CAMINHAO}/diária) e
            risco fiscal ({PCT_AUTUACAO * 100}% × R${CUSTO_AUTUACAO}). Glosa de crédito IBS/CBS da Reforma Tributária não incluída — considere o resultado um piso.
          </p>

          <div className="text-center">
            <a href={URL_FERRAMENTA}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold transition-all hover:-translate-y-0.5"
              style={{ background: c.gold, color: c.onAccent, boxShadow: `0 8px 24px ${c.gold}40` }}>
              Quero recuperar R${fmt(economiaAno)}/ano <ArrowRight className="w-4 h-4" />
            </a>
            <p className="text-xs mt-3" style={{ color: c.muted }}>Acesso direto à ferramenta · sem compromisso</p>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="max-w-4xl mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: `${c.teal}18`, color: c.teal }}>
            COMO FUNCIONA
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold">O erro morre antes de virar rejeição.</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { n: "1", icon: Zap, titulo: "Envie a nota", desc: "XML ou dados da nota entram no pré-validador antes de qualquer transmissão oficial. Em lote ou uma a uma." },
            { n: "2", icon: Target, titulo: "Validação completa", desc: "Schema do XML, tags obrigatórias, série e numeração, código de serviço, retenções de ISS e as regras específicas da sua prefeitura." },
            { n: "3", icon: ShieldCheck, titulo: "Corrija em segundos", desc: "Relatório aponta exatamente o campo errado e o porquê. Você corrige na hora e transmite com aprovação praticamente garantida." },
          ].map(({ n, icon: Icon, titulo, desc }) => (
            <div key={n} className="p-6 rounded-2xl relative" style={{ background: c.card, border: `1px solid ${c.border}` }}>
              <span className="absolute top-4 right-5 text-4xl font-extrabold opacity-15" style={{ color: c.gold }}>{n}</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${c.teal}15` }}>
                <Icon className="w-5 h-5" style={{ color: c.teal }} />
              </div>
              <h3 className="font-bold text-lg mb-2">{titulo}</h3>
              <p className="text-sm leading-relaxed" style={{ color: c.muted }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ANTES vs DEPOIS ── */}
      <section className="max-w-3xl mx-auto px-5 py-14">
        <h2 className="text-3xl font-extrabold text-center mb-9">O mesmo erro, dois finais.</h2>
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
          {[
            ["Quando você descobre o erro", "Na rejeição, horas depois", "Em segundos, antes do envio"],
            ["Tempo gasto por erro", "20–40 min de retrabalho", "Correção de 1 campo, na hora"],
            ["Recebimento do cliente", "Atrasa ~5 dias", "Segue o fluxo normal"],
            ["Risco de multa por prazo", "Real a cada reemissão", "Praticamente zero"],
            ["Moral da equipe fiscal", "Apagando incêndio", "Operando no controle"],
          ].map(([item, sem, com], i) => (
            <div key={item} className="grid grid-cols-3 text-sm" style={{ background: i % 2 === 0 ? c.card : c.card2, borderTop: i > 0 ? `1px solid ${c.border}` : undefined }}>
              <div className="px-4 py-3.5 font-semibold">{item}</div>
              <div className="px-4 py-3.5 flex items-start gap-1.5" style={{ color: c.muted }}>
                <X className="w-4 h-4 shrink-0 mt-0.5" style={{ color: c.red }} /> {sem}
              </div>
              <div className="px-4 py-3.5 flex items-start gap-1.5" style={{ color: c.muted }}>
                <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: c.teal }} /> {com}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="max-w-3xl mx-auto px-5 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          A próxima rejeição já está na sua fila de emissão.
        </h2>
        <p className="text-lg mb-8" style={{ color: c.muted }}>
          A pergunta não é <em>se</em> vai acontecer — é se você vai descobrir antes ou depois de custar dinheiro.
        </p>
        <a href={URL_FERRAMENTA}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold transition-all hover:-translate-y-1"
          style={{ background: c.gold, color: c.onAccent, boxShadow: `0 15px 40px ${c.gold}40` }}>
          Quero pré-validar minhas notas <ArrowRight className="w-5 h-5" />
        </a>
        <p className="mt-4 text-sm" style={{ color: c.muted }}>
          Ou volte à <a href="#calculadora" className="font-semibold" style={{ color: c.goldDeep }}>calculadora</a> e veja seu número de novo.
        </p>
      </section>

      <footer className="py-8 text-center text-xs" style={{ borderTop: `1px solid ${c.border}`, color: c.muted }}>
        <Link href="/" className="font-semibold" style={{ color: c.goldDeep }}>CKlareza</Link> · Pré-Validador de Notas Fiscais · <Link href="/privacidade">Privacidade</Link>
      </footer>
    </div>
  )
}
