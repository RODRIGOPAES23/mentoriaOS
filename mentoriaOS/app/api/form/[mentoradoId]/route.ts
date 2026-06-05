import { createClient } from "@supabase/supabase-js"

// API pública do formulário do mentorado.
// GET  -> retorna dados básicos do mentorado (para exibir no formulário)
// POST -> grava o check-in semanal (usa service role, ignora RLS)
export const dynamic = "force-dynamic"

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

export async function GET(
  _request: Request,
  { params }: { params: { mentoradoId: string } }
) {
  const supabase = admin()
  const { data, error } = await supabase
    .from("mentorados")
    .select("id, nome, nicho, foco_macro, mentor_id")
    .eq("id", params.mentoradoId)
    .single()

  if (error || !data) {
    return Response.json({ error: "Mentorado não encontrado" }, { status: 404 })
  }

  // Perguntas personalizadas do mentor (dinâmicas) — vão para o formulário do mentorado
  let perguntas: any[] = []
  if (data.mentor_id) {
    const { data: qs } = await supabase
      .from("custom_questions")
      .select("id, label, tipo, obrigatoria, ordem")
      .eq("mentor_id", data.mentor_id)
      .eq("ativo", true)
      .order("ordem", { ascending: true })
    perguntas = qs || []
  }

  return Response.json({ mentorado: data, perguntas })
}

export async function POST(
  request: Request,
  { params }: { params: { mentoradoId: string } }
) {
  const supabase = admin()

  // Garante que o mentorado existe antes de gravar.
  const { data: mentorado } = await supabase
    .from("mentorados")
    .select("id")
    .eq("id", params.mentoradoId)
    .single()

  if (!mentorado) {
    return Response.json({ error: "Mentorado inválido" }, { status: 404 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400 })
  }

  const tarefas = Array.isArray(body.tarefas_executadas)
    ? body.tarefas_executadas
    : String(body.tarefas_executadas || "")
        .split("\n")
        .map((t: string) => t.trim())
        .filter(Boolean)

  const { data, error } = await supabase
    .from("checkins")
    .insert({
      mentorado_id: params.mentoradoId,
      vendas_reais: parseFloat(String(body.vendas_reais)) || 0,
      leads_gerados: parseInt(String(body.leads_gerados)) || 0,
      investimento_trafego: parseFloat(String(body.investimento_trafego)) || 0,
      videos_postados: parseInt(String(body.videos_postados)) || 0,
      dificuldades_texto: body.dificuldades_texto || "",
      tarefas_executadas: tarefas,
      respostas_customizadas: (body.respostas_customizadas && typeof body.respostas_customizadas === "object")
        ? body.respostas_customizadas : {},
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true, checkin: data })
}
