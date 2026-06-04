import { createClient } from "@supabase/supabase-js"
import { isAdminAuthorized, adminUnauthorized } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

const NO_CACHE = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" }

export async function POST(request: Request) {
  if (!await isAdminAuthorized(request)) return adminUnauthorized()
  let body: any
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Body inválido" }, { status: 400, headers: NO_CACHE })
  }

  const { nome, email, metodo_trabalho, filosofia, nicho_foco, empresa_slug } = body

  if (!nome || !email) {
    return Response.json(
      { error: "Nome e email são obrigatórios" },
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

    // Resolve empresa pelo slug (white label) e herda método/filosofia se vazios
    let empresaId: string | null = null
    let empresaMetodo: string | null = null
    let empresaFilosofia: string | null = null
    let empresaNicho: string | null = null
    if (empresa_slug) {
      const { data: emp } = await supabase
        .from("empresas")
        .select("id, metodo_trabalho, filosofia, nicho_foco")
        .eq("slug", String(empresa_slug).toLowerCase())
        .single()
      if (emp) {
        empresaId = emp.id
        empresaMetodo = emp.metodo_trabalho
        empresaFilosofia = emp.filosofia
        empresaNicho = emp.nicho_foco
      }
    }

    // Insere novo mentor — herda DNA da empresa se não informou
    const { data, error } = await supabase
      .from("mentors")
      .insert({
        nome,
        email,
        metodo_trabalho: metodo_trabalho || empresaMetodo || null,
        filosofia: filosofia || empresaFilosofia || null,
        nicho_foco: nicho_foco || empresaNicho || null,
        empresa_id: empresaId,
        role: "mentor",
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
