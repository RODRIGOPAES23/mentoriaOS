import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    // Criar a tabela mentors
    const { error: tableError } = await (supabase as any).rpc("query", {
      sql: `
        CREATE TABLE IF NOT EXISTS public.mentors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nome TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          metodo_trabalho TEXT,
          filosofia TEXT,
          nicho_foco TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'ativo'
        );
      `
    })

    if (tableError && !tableError.message.includes("already exists")) {
      throw tableError
    }

    // Criar índice
    const { error: indexError } = await (supabase as any).rpc("query", {
      sql: `CREATE INDEX IF NOT EXISTS idx_mentors_email ON public.mentors(email);`
    })

    // RLS
    const { error: rlsError } = await (supabase as any).rpc("query", {
      sql: `ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;`
    })

    // Policy
    const { error: policyError } = await (supabase as any).rpc("query", {
      sql: `
        DROP POLICY IF EXISTS "Allow all for mentors" ON public.mentors;
        CREATE POLICY "Allow all for mentors"
          ON public.mentors
          FOR ALL USING (true) WITH CHECK (true);
      `
    })

    return Response.json({
      success: true,
      message: "Tabela mentors criada com sucesso!",
      errors: {
        table: tableError?.message,
        index: indexError?.message,
        rls: rlsError?.message,
        policy: policyError?.message
      }
    })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
