// =============================================================
// MOTOR DE CAMPANHA (F1) — torna a fábrica multiproduto.
// Uma campanha = um produto + um ICP + um roteiro. Trocar de
// produto = trocar de campanha, sem código novo.
// =============================================================

export type Campanha = {
  id: string
  nome: string
  ativa: boolean
  produto: {
    nome: string
    oneLiner: string
    paraQuem: string
    dores: string[]
    ganhos: string[]
    prova: string
    precoLabel: string // ex: "R$ 297/mês" — usado no fechamento
    checkoutUrl: string // Stripe Payment Link (vazio = handoff humano)
    proximoPasso: string
  }
  icp: {
    descricao: string
    sinaisPositivos: string[] // alimentam o score (Estação 2)
    sinaisNegativos: string[]
  }
  spinPromptExtra?: string // ajustes finos do roteiro p/ esse produto
  canais: Array<"web" | "whatsapp" | "instagram" | "email">
}

// -------------------------------------------------------------
// Registro de campanhas (por ora em código; vira tabela no Supabase em F7)
// -------------------------------------------------------------
const CAMPANHAS: Record<string, Campanha> = {
  cklareza: {
    id: "cklareza",
    nome: "CKlareza — Mentores",
    ativa: true,
    produto: {
      nome: "CKlareza",
      oneLiner:
        "Plataforma white-label de gestão de mentorias: o mentor opera tudo (mentorados, calls, financeiro, tarefas, check-ins) com a própria marca.",
      paraQuem:
        "Mentores, consultores e infoprodutores que já têm alunos pagantes e perdem tempo/receita gerenciando a operação no improviso (planilha, WhatsApp, caderno).",
      dores: [
        "Perde mentorado por falta de acompanhamento (churn silencioso)",
        "Não sabe quem está atrasado em pagamento nem quem está sumindo",
        "Operação espalhada em planilha + WhatsApp + agenda, sem visão única",
        "Não consegue escalar: cada novo aluno aumenta o caos manual",
        "Marca amadora — usa ferramentas genéricas em vez da própria identidade",
      ],
      ganhos: [
        "Dashboard único: quem paga, quem deve, quem está atrasado, próximas calls",
        "Reduz churn com acompanhamento e check-ins estruturados",
        "Marca própria (white-label) — parece um produto seu, não terceirizado",
        "Escala sem virar refém de planilha",
        "Financeiro nominal: vê exatamente quem deve quanto e quando",
      ],
      prova: "100/100 no Google PageSpeed, conforme LGPD, dados criptografados.",
      precoLabel: "a partir de R$ 297/mês",
      checkoutUrl: "", // preencher com Stripe Payment Link (F5)
      proximoPasso:
        "Uma demonstração de 15 min mostrando o painel com a operação dele, ou um teste guiado.",
    },
    icp: {
      descricao: "Mentor/consultor com alunos pagantes e operação no improviso.",
      sinaisPositivos: [
        "tem alunos/mentorados pagantes",
        "cobra recorrente ou pacote",
        "já reclama de churn ou controle manual",
        "tem audiência/presença digital",
        "fatura o suficiente pra pagar uma ferramenta",
      ],
      sinaisNegativos: [
        "hobby, sem cobrar",
        "sem nenhum aluno",
        "só curiosidade, sem operação real",
      ],
    },
    canais: ["web", "whatsapp", "instagram"],
  },
}

export const CAMPANHA_PADRAO = "cklareza"

export function getCampanha(id?: string): Campanha {
  const camp = id ? CAMPANHAS[id] : undefined
  return camp ?? CAMPANHAS[CAMPANHA_PADRAO]
}

export function listarCampanhas(): Campanha[] {
  return Object.values(CAMPANHAS)
}
