// Analytics da fábrica (F6): funil, conversão, receita — a partir das conversas.
import { listarConversas, ESTAGIOS, type Estagio } from "./store"

export type Funil = {
  total: number
  porEstagio: Record<Estagio, number>
  porFonte: Record<string, number>
  porCanal: Record<string, number>
  porCampanha: Record<string, number>
  // funil acumulado (quem chegou AO MENOS até cada estágio)
  funilAcumulado: { estagio: Estagio; alcancaram: number; pct: number }[]
  quentes: number
  fechados: number
  perdidos: number
  // dinheiro (o "1" da Lei da Fábrica)
  receitaTotal: number
  ticketMedio: number
  taxaConversaoGeral: number // fechados / total
  taxaQuenteParaFechado: number // fechados / (alcançaram quente)
  tempoMedioFechamentoHoras: number | null
  // GRATIDÃO 0→1
  gratidao: { zero: number; um: number; pendentes: number }
}

const ORDEM: Estagio[] = [...ESTAGIOS]
// índice de progressão (perdido fica fora da régua de avanço)
const PROGRESSO: Estagio[] = ["novo", "contatado", "qualificado", "quente", "demo", "fechado"]

function inc(obj: Record<string, number>, k: string) {
  obj[k] = (obj[k] || 0) + 1
}

export async function calcularFunil(): Promise<Funil> {
  const convs = await listarConversas()
  const total = convs.length

  const porEstagio = Object.fromEntries(ORDEM.map((e) => [e, 0])) as Record<Estagio, number>
  const porFonte: Record<string, number> = {}
  const porCanal: Record<string, number> = {}
  const porCampanha: Record<string, number> = {}

  let receitaTotal = 0
  let pagos = 0
  let somaHorasFechamento = 0

  for (const c of convs) {
    porEstagio[c.estagio] = (porEstagio[c.estagio] || 0) + 1
    inc(porFonte, c.fonte || "bot")
    inc(porCanal, c.canal)
    inc(porCampanha, c.campanhaId)
    if (c.pagoEm) {
      pagos++
      receitaTotal += c.valorPago || 0
      const dt = new Date(c.pagoEm).getTime() - new Date(c.criadaEm).getTime()
      if (dt > 0) somaHorasFechamento += dt / 3_600_000
    }
  }

  // funil acumulado: quem alcançou AO MENOS o estágio X = todos com índice de progresso >= X
  const idxDe = (e: Estagio) => PROGRESSO.indexOf(e)
  const funilAcumulado = PROGRESSO.map((estagio) => {
    const alvo = idxDe(estagio)
    const alcancaram = convs.filter((c) => {
      const ci = idxDe(c.estagio)
      return ci >= alvo && ci !== -1 // 'perdido' (-1) não conta como progresso
    }).length
    return { estagio, alcancaram, pct: total ? Math.round((alcancaram / total) * 100) : 0 }
  })

  const quentes = funilAcumulado.find((f) => f.estagio === "quente")?.alcancaram || 0
  const fechados = porEstagio["fechado"] || 0
  const perdidos = porEstagio["perdido"] || 0

  return {
    total,
    porEstagio,
    porFonte,
    porCanal,
    porCampanha,
    funilAcumulado,
    quentes,
    fechados,
    perdidos,
    receitaTotal,
    ticketMedio: pagos ? Math.round(receitaTotal / pagos) : 0,
    taxaConversaoGeral: total ? +((fechados / total) * 100).toFixed(1) : 0,
    taxaQuenteParaFechado: quentes ? +((fechados / quentes) * 100).toFixed(1) : 0,
    tempoMedioFechamentoHoras: pagos ? +(somaHorasFechamento / pagos).toFixed(1) : null,
    gratidao: { zero: total, um: pagos, pendentes: total - pagos },
  }
}
