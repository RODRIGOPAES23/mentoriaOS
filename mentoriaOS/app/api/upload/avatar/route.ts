import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// POST /api/upload/avatar
// FormData: { file: File, type: "mentor" | "mentorado", id: string }
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "mentor" | "mentorado"
    const id = formData.get("id") as string

    if (!file || !type || !id) {
      return Response.json({ error: "file, type e id são obrigatórios" }, { status: 400 })
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const path = `${type}-${id}.${ext}`

    const supabase = admin()

    // Upload para o bucket 'avatars'
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, {
        upsert: true,
        contentType: file.type || "image/jpeg",
      })

    if (uploadError) {
      return Response.json({ error: uploadError.message }, { status: 500 })
    }

    // Gerar URL pública
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path)
    const publicUrl = urlData.publicUrl

    // Salvar URL no banco (update na tabela correspondente)
    if (type === "empresa-musica") {
      const { error: dbError } = await supabase.from("empresas").update({ musica_url: publicUrl }).eq("id", id)
      if (dbError) console.error("DB error:", dbError)
    } else if (type === "empresa") {
      const { error: dbError } = await supabase.from("empresas").update({ logo_url: publicUrl }).eq("id", id)
      if (dbError) console.error("DB error:", dbError)
    } else {
      const table = type === "mentor" ? "mentors" : "mentorados"
      const { error: dbError } = await supabase.from(table).update({ foto_url: publicUrl }).eq("id", id)
      if (dbError && !dbError.message.includes("foto_url")) console.error("DB error:", dbError)
    }

    return Response.json({ success: true, url: publicUrl })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
