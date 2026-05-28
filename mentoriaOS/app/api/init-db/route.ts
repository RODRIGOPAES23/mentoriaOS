import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST() {
  try {
    // Check if tables already exist
    const { data: tables } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["mentorados", "checkins", "analises_ia"])

    if (tables && tables.length === 3) {
      return Response.json({ message: "Database already initialized" }, { status: 200 })
    }

    // Create mentorados table
    await supabase.rpc("execute_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS mentorados (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nome TEXT NOT NULL,
          nicho TEXT NOT NULL,
          data_inicio DATE DEFAULT CURRENT_DATE,
          status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Pausado')),
          link_instagram TEXT,
          foco_macro TEXT,
          historico_acumulado JSONB DEFAULT '[]'::jsonb,
          mentor_id UUID,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `,
    })

    // Create checkins table
    await supabase.rpc("execute_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS checkins (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          mentorado_id UUID NOT NULL REFERENCES mentorados(id) ON DELETE CASCADE,
          data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          vendas_reais DECIMAL(10,2) NOT NULL DEFAULT 0,
          leads_gerados INTEGER NOT NULL DEFAULT 0,
          investimento_trafego DECIMAL(10,2) NOT NULL DEFAULT 0,
          videos_postados INTEGER NOT NULL DEFAULT 0,
          dificuldades_texto TEXT,
          tarefas_executadas JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `,
    })

    // Create analises_ia table
    await supabase.rpc("execute_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS analises_ia (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          checkin_id UUID NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
          mentorado_id UUID NOT NULL REFERENCES mentorados(id) ON DELETE CASCADE,
          data_analise TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          resumo_historico TEXT,
          gargalo_identificado TEXT,
          evolucao_metricas TEXT,
          sugestao_estrategica TEXT,
          pauta_call_pronta TEXT,
          tokens_usados INTEGER,
          modelo_ia TEXT DEFAULT 'claude-3-5-sonnet',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `,
    })

    // Insert initial data
    const { error: insertError } = await supabase.from("mentorados").insert([
      {
        nome: "João Silva",
        nicho: "Tráfego Local",
        data_inicio: "2026-01-15",
        status: "Ativo",
        foco_macro: "Estruturação Comercial & Escala de Tráfego",
        historico_acumulado: [],
      },
      {
        nome: "Maria Oliveira",
        nicho: "E-commerce",
        data_inicio: "2026-02-01",
        status: "Ativo",
        foco_macro: "Otimização de Conversão & Scaling",
        historico_acumulado: [],
      },
      {
        nome: "Carlos Santos",
        nicho: "Consultoria Digital",
        data_inicio: "2026-01-20",
        status: "Ativo",
        foco_macro: "Posicionamento & Geração de Leads B2B",
        historico_acumulado: [],
      },
    ])

    if (insertError) {
      console.error("Insert error:", insertError)
    }

    return Response.json(
      { message: "Database initialized successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Database initialization error:", error)
    return Response.json(
      { error: "Failed to initialize database", details: String(error) },
      { status: 500 }
    )
  }
}
