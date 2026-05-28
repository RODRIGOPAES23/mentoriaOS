import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase credentials")
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST() {
  try {
    // Try to insert mentorados one by one
    const mentoradosData = [
      {
        nome: "João Silva",
        nicho: "Tráfego Local",
        data_inicio: "2026-01-15",
        status: "Ativo",
        foco_macro: "Estruturação Comercial & Escala de Tráfego",
      },
      {
        nome: "Maria Oliveira",
        nicho: "E-commerce",
        data_inicio: "2026-02-01",
        status: "Ativo",
        foco_macro: "Otimização de Conversão & Scaling",
      },
      {
        nome: "Carlos Santos",
        nicho: "Consultoria Digital",
        data_inicio: "2026-01-20",
        status: "Ativo",
        foco_macro: "Posicionamento & Geração de Leads B2B",
      },
    ]

    // Check if mentorados already exist
    const { data: existing } = await supabase
      .from("mentorados")
      .select("id")
      .limit(1)

    if (existing && existing.length > 0) {
      return Response.json({
        message: "Mentorados already exist in database",
        count: existing.length,
      })
    }

    // Try to insert
    const { data, error } = await supabase
      .from("mentorados")
      .insert(mentoradosData)
      .select()

    if (error) {
      console.error("Insert error:", error)
      // If regular insert fails due to RLS, provide instructions
      return Response.json({
        message: "Could not auto-seed mentorados. RLS policy may need adjustment.",
        error: error.message,
        hint: "Please visit your Supabase console and run the migration SQL manually, or disable RLS temporarily.",
        sql_needed: `
INSERT INTO mentorados (nome, nicho, data_inicio, status, foco_macro)
VALUES
  ('João Silva', 'Tráfego Local', '2026-01-15', 'Ativo', 'Estruturação Comercial & Escala de Tráfego'),
  ('Maria Oliveira', 'E-commerce', '2026-02-01', 'Ativo', 'Otimização de Conversão & Scaling'),
  ('Carlos Santos', 'Consultoria Digital', '2026-01-20', 'Ativo', 'Posicionamento & Geração de Leads B2B');
        `.trim(),
      })
    }

    return Response.json({
      message: "Mentorados seeded successfully",
      inserted: data?.length || 0,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return Response.json({
      error: "Failed to seed mentorados",
      details: String(error),
    })
  }
}
