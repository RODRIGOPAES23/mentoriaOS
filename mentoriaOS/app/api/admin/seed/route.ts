/**
 * ADMIN ONLY: Seed initial mentorados data
 * This endpoint temporarily disables RLS to insert seed data
 * Should only be accessible during initial setup
 */

import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  // Security: In production, verify admin token here
  const authHeader = request.headers.get("authorization")
  const adminToken = process.env.ADMIN_SEED_TOKEN || "dev-seed-token"

  if (authHeader !== `Bearer ${adminToken}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return Response.json(
        { error: "Missing Supabase credentials" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Attempt 1: Direct insert via Supabase client with upsert
    console.log("Attempting to seed mentorados...")

    const mentorados = [
      {
        nome: "João Silva",
        nicho: "Tráfego Local",
        data_inicio: "2026-01-15",
        status: "Ativo",
        foco_macro: "Estruturação Comercial & Escala de Tráfego",
        historico_acumulado: [] as any,
      },
      {
        nome: "Maria Oliveira",
        nicho: "E-commerce",
        data_inicio: "2026-02-01",
        status: "Ativo",
        foco_macro: "Otimização de Conversão & Scaling",
        historico_acumulado: [] as any,
      },
      {
        nome: "Carlos Santos",
        nicho: "Consultoria Digital",
        data_inicio: "2026-01-20",
        status: "Ativo",
        foco_macro: "Posicionamento & Geração de Leads B2B",
        historico_acumulado: [] as any,
      },
    ]

    // Try direct table access with service role
    const { data, error } = await supabase
      .from("mentorados")
      .insert(mentorados)
      .select()

    if (error) {
      console.error("Insert failed:", error)

      // If RLS is still blocking, return detailed instructions
      if (error.message.includes("row-level security")) {
        return Response.json(
          {
            status: "RLS_BLOCKING",
            message: "RLS policy is blocking inserts. Manual intervention required.",
            instructions:
              "Go to Supabase SQL Editor and run the command below to temporarily disable RLS, then run the INSERT statement",
            step_1_disable_rls: `
ALTER TABLE mentorados DISABLE ROW LEVEL SECURITY;
ALTER TABLE checkins DISABLE ROW LEVEL SECURITY;
ALTER TABLE analises_ia DISABLE ROW LEVEL SECURITY;
            `.trim(),
            step_2_insert_data: `
INSERT INTO mentorados (nome, nicho, data_inicio, status, foco_macro, historico_acumulado)
VALUES
  ('João Silva', 'Tráfego Local', '2026-01-15', 'Ativo', 'Estruturação Comercial & Escala de Tráfego', '[]'::jsonb),
  ('Maria Oliveira', 'E-commerce', '2026-02-01', 'Ativo', 'Otimização de Conversão & Scaling', '[]'::jsonb),
  ('Carlos Santos', 'Consultoria Digital', '2026-01-20', 'Ativo', 'Posicionamento & Geração de Leads B2B', '[]'::jsonb);
            `.trim(),
            step_3_enable_rls: `
ALTER TABLE mentorados ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises_ia ENABLE ROW LEVEL SECURITY;
            `.trim(),
          },
          { status: 403 }
        )
      }

      throw error
    }

    return Response.json({
      status: "success",
      message: "Mentorados seeded successfully",
      count: data?.length || 0,
      data,
    })
  } catch (error) {
    console.error("Seeding error:", error)
    return Response.json(
      {
        status: "error",
        message: String(error),
      },
      { status: 500 }
    )
  }
}
