import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function POST(request: Request) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400, headers: NO_CACHE })
  }

  const { nome, email, metodo_trabalho, filosofia, nicho_foco } = body

  if (!nome || !email || !metodo_trabalho) {
    return Response.json(
      { error: "Nome, email e método de trabalho são obrigatórios" },
      { status: 400, headers: NO_CACHE }
    )
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    // Verifica se mentor já existe
    const { data: existing } = await supabase
      .from("mentors")
      .select("id")
      .eq("email", email)
      .single()

    if (existing) {
      return Response.json(
        { error: "Esse email já está cadastrado" },
        { status: 409, headers: NO_CACHE }
      )
    }

    // Insere novo mentor
    const { data, error } = await supabase
      .from("mentors")
      .insert({
        nome,
        email,
        metodo_trabalho,
        filosofia: filosofia || null,
        nicho_foco: nicho_foco || null,
      })
      .select()
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500, headers: NO_CACHE })
    }

    return Response.json(
      { success: true, mentor: data },
      { status: 201, headers: NO_CACHE }
    )
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 502, headers: NO_CACHE })
  }
}
