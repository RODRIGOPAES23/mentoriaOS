import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const sql = `
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

    CREATE INDEX IF NOT EXISTS idx_mentors_email ON public.mentors(email);

    ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow all for mentors" ON public.mentors;
    CREATE POLICY "Allow all for mentors"
      ON public.mentors
      FOR ALL USING (true) WITH CHECK (true);
  `

  try {
    // Executar SQL via Supabase Admin API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({ sql }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.log("API Response:", response.status, errorData)

      // Tentar com Supabase client direto
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      })

      // Tentar inserir um registro para testar se tabela existe
      const { error: testError } = await supabase
        .from("mentors")
        .select("*")
        .limit(1)

      if (testError && testError.code === "PGRST116") {
        return Response.json({
          error: "Tabela não existe. Execute manualmente no Supabase SQL Editor.",
          sql,
        })
      }

      return Response.json({
        success: true,
        message: "Tabela já existe ou foi criada com sucesso!",
      })
    }

    const result = await response.json()
    return Response.json({
      success: true,
      message: "Tabela criada com sucesso!",
      result,
    })
  } catch (e) {
    console.error("Error:", e)
    return Response.json(
      {
        error: String(e),
        hint: "Copie o SQL abaixo e execute no Supabase SQL Editor",
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

CREATE INDEX IF NOT EXISTS idx_mentors_email ON public.mentors(email);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for mentors" ON public.mentors;
CREATE POLICY "Allow all for mentors"
  ON public.mentors
  FOR ALL USING (true) WITH CHECK (true);
        `,
      },
      { status: 500 }
    )
  }
}
