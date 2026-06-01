import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mentoradoId = params.id

    // Buscar últimas 10 calls do mentorado ordenadas por data (recentes primeiro)
    const { data: calls, error: callsError } = await supabaseAdmin
      .from("v_calls_historico")
      .select(
        "id, data_call, titulo, principal, resumo_estruturado, status_entrega, alinhamento_pendencias, transcricao, posicao_recente"
      )
      .eq("mentorado_id", mentoradoId)
      .limit(10)

    if (callsError) {
      return NextResponse.json({ error: callsError.message }, { status: 500 })
    }

    // Gerar resumão consolidado com IA (simplificado aqui, idealmente usa Claude API)
    const resumao = {
      total_calls: calls?.length || 0,
      principais_topicos: extrairTopicos(calls),
      o_que_foi_feito: extrairEntregues(calls),
      o_que_falta: extrairPendentes(calls),
      progressao: gerarProgressao(calls),
      proxima_abordagem:
        calls && calls.length > 0
          ? sugerirAbordagem(calls[0], calls.slice(1))
          : "Ainda sem histórico de calls",
    }

    return NextResponse.json(
      {
        success: true,
        calls: calls || [],
        resumao,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro no resumão de calls:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

function extrairTopicos(calls: any[]) {
  const topicos = new Set<string>()
  calls?.forEach((call) => {
    if (call.titulo) topicos.add(call.titulo)
    if (call.resumo_estruturado?.bullets) {
      call.resumo_estruturado.bullets.forEach((b: string) => topicos.add(b))
    }
  })
  return Array.from(topicos).slice(0, 5)
}

function extrairEntregues(calls: any[]) {
  const entregues: string[] = []
  calls?.forEach((call) => {
    if (call.status_entrega?.concluido) {
      const items = Array.isArray(call.status_entrega.concluido)
        ? call.status_entrega.concluido
        : [call.status_entrega.concluido]
      entregues.push(...items)
    }
  })
  return entregues.slice(0, 10)
}

function extrairPendentes(calls: any[]) {
  const pendentes: string[] = []
  calls?.forEach((call) => {
    if (call.alinhamento_pendencias?.pendente) {
      const items = Array.isArray(call.alinhamento_pendencias.pendente)
        ? call.alinhamento_pendencias.pendente
        : [call.alinhamento_pendencias.pendente]
      pendentes.push(...items)
    }
  })
  return pendentes.slice(0, 10)
}

function gerarProgressao(calls: any[]) {
  if (!calls || calls.length === 0) return "Sem progressão registrada"

  const first = calls[calls.length - 1]
  const last = calls[0]

  return {
    primeira_call: first.data_call,
    ultima_call: last.data_call,
    total_chamadas: calls.length,
    tendencia: "Acompanhando regularmente",
  }
}

function sugerirAbordagem(ultimaCall: any, callsAnteriores: any[]) {
  const topicos = new Set<string>()
  if (ultimaCall.alinhamento_pendencias?.pendente) {
    const pendentes = Array.isArray(
      ultimaCall.alinhamento_pendencias.pendente
    )
      ? ultimaCall.alinhamento_pendencias.pendente
      : [ultimaCall.alinhamento_pendencias.pendente]
    pendentes.forEach((p: string) => topicos.add(p))
  }

  return {
    foco: "Acompanhar pendências da última call",
    perguntas_abertas: Array.from(topicos).slice(0, 3),
    validar_progresso: true,
  }
}
