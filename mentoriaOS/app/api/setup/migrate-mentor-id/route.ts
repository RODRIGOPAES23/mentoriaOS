import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    // Adicionar coluna mentor_id se não existir
    await supabase.rpc("exec_sql", {
      sql: `
        ALTER TABLE public.mentorados
        ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE;

        CREATE INDEX IF NOT EXISTS idx_mentorados_mentor_id ON public.mentorados(mentor_id);
      `,
    }).catch(() => null) // Ignore se já existir

    // Se houver mentores cadastrados, associar mentorados ao primeiro mentor
    const { data: mentores } = await supabase
      .from("mentors")
      .select("id")
      .limit(1)

    if (mentores && mentores.length > 0) {
      const mentorId = mentores[0].id
      // Atualizar mentorados sem mentor_id para o primeiro mentor
      await supabase
        .from("mentorados")
        .update({ mentor_id: mentorId })
        .is("mentor_id", null)
    }

    return Response.json({
      success: true,
      message: "Migration concluída com sucesso",
    })
  } catch (e) {
    console.error("Migration error:", e)
    return Response.json({
      error: String(e),
      hint: "Execute manualmente no Supabase SQL Editor",
      sql: `
ALTER TABLE public.mentorados
ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_mentorados_mentor_id ON public.mentorados(mentor_id);
      `,
    })
  }
}
