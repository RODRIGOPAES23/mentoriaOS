import { NextRequest, NextResponse } from "next/server"
import { createServerClient, adminClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"
export const maxDuration = 60 // geração LLM + inserts pode levar dezenas de segundos

const OPENROUTER_API_KEY = process.env.ANTHROPIC_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const sb = createServerClient()
    const { data: { user } } = await sb.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const sbAdmin = adminClient()

    const { objetivo } = await req.json()
    if (!objetivo || objetivo.trim().length === 0) {
      return NextResponse.json(
        { error: "Objetivo é obrigatório" },
        { status: 400 }
      )
    }

    // Criar projeto DOIT
    const { data: project, error: projError } = await sbAdmin
      .from("doit_projects")
      .insert({
        user_id: user.id,
        objetivo,
        resumo_1linha: objetivo.substring(0, 100),
        status: "ideacao",
      })
      .select()
      .single()

    if (projError) {
      return NextResponse.json(
        { error: `Erro ao criar projeto: ${projError.message}` },
        { status: 500 }
      )
    }

    // Chamar OpenRouter para quebrar objetivo em passos
    const prompt = `Você é um especialista em quebrar objetivos complexos em roadmaps operativos.

OBJETIVO: "${objetivo}"

Responda com JSON PURO (sem markdown, sem backticks):
{
  "fases": [
    {
      "numero": 1,
      "nome": "Nome Descritivo da Fase",
      "descricao": "O que será feito nesta fase",
      "passos": [
        {
          "numero": 1,
          "descricao": "Descrição clara da tarefa",
          "responsabilidade_humana": "O que exatamente a PESSOA precisa fazer ou decidir",
          "processamento_automatizado": "O que a MÁQUINA/IA pode fazer automaticamente",
          "llm_recomendado": "Claude 3.5 Sonnet ou outro modelo apropriado",
          "conectores": ["API/Serviço 1", "API/Serviço 2"],
          "skills": ["Skill técnica 1", "Skill técnica 2"],
          "tempo_estimado_horas": 1
        }
      ]
    }
  ]
}

REGRAS:
- Máximo 5 fases
- 2-4 passos por fase
- Responsabilidade humana deve ser CLARA e EXECUTÁVEL
- Processamento automatizado deve ser ESPECÍFICO (APIs, ferramentas, dados)
- Conectores reais: n8n, Zapier, APIs conhecidas, etc
- Apenas JSON, sem explicação extra`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4.5",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: `OpenRouter error: ${error}` },
        { status: 500 }
      )
    }

    const llmData = await response.json()
    let content = llmData.choices[0].message.content.trim()

    // Remover cercas markdown (```json ... ```) que o modelo às vezes adiciona
    content = content
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    // Parse JSON da resposta
    let rotas
    try {
      rotas = JSON.parse(content)
    } catch {
      return NextResponse.json(
        { error: `Erro ao parsear resposta LLM: ${content}` },
        { status: 500 }
      )
    }

    // Montar todos os passos e inserir em LOTE (1 query em vez de N) — muito mais rápido
    const passosParaInserir = rotas.fases.flatMap((fase: any) =>
      fase.passos.map((passo: any) => ({
        project_id: project.id,
        fase_numero: fase.numero,
        fase_nome: fase.nome,
        passo_numero: passo.numero,
        descricao: passo.descricao,
        responsabilidade_humana: passo.responsabilidade_humana,
        processamento_automatizado: passo.processamento_automatizado,
        llm_principal: passo.llm_recomendado,
        conectores: passo.conectores,
        skills: passo.skills,
        tempo_estimado_horas: passo.tempo_estimado_horas || 1,
        status: "backlog",
      }))
    )
    const totalPassos = passosParaInserir.length

    const { error: passosError } = await sbAdmin.from("doit_passos").insert(passosParaInserir)
    if (passosError) {
      return NextResponse.json(
        { error: `Erro ao inserir passos: ${passosError.message}` },
        { status: 500 }
      )
    }

    // Atualizar contadores no projeto
    await sbAdmin
      .from("doit_projects")
      .update({
        fases_total: rotas.fases.length,
        passos_totais: totalPassos,
        status: "validando",
      })
      .eq("id", project.id)

    // Registrar evento no GRATIDÃO (criação do projeto = 0)
    await sbAdmin.from("doit_gratidao_eventos").insert({
      project_id: project.id,
      evento_tipo: "criacao",
      status_anterior: null,
      status_novo: "ideacao",
      metadata: {
        objetivo,
        fases: rotas.fases.length,
        passos: totalPassos,
      },
    })

    return NextResponse.json({
      projectId: project.id,
      objetivo,
      fases: rotas.fases.length,
      passos: totalPassos,
      rotas,
    })
  } catch (error) {
    console.error("DOIT Generate error:", error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
