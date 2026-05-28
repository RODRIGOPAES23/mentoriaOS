/**
 * ADMIN ONLY: Run complete database migrations
 * Creates all tables and indexes
 */

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  const adminToken = process.env.ADMIN_SEED_TOKEN || "dev-seed-token"

  if (authHeader !== `Bearer ${adminToken}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRole) {
      return Response.json(
        { error: "Missing Supabase credentials" },
        { status: 500 }
      )
    }

    const migrationSQL = `
-- Create all tables if they don't exist
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_checkins_mentorado_id ON checkins(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_checkins_data_envio ON checkins(data_envio);
CREATE INDEX IF NOT EXISTS idx_analises_ia_mentorado_id ON analises_ia(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_analises_ia_checkin_id ON analises_ia(checkin_id);

-- Enable RLS
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises_ia ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS checkins_select ON checkins;
DROP POLICY IF EXISTS checkins_insert ON checkins;
DROP POLICY IF EXISTS analises_ia_select ON analises_ia;
DROP POLICY IF EXISTS analises_ia_insert ON analises_ia;

CREATE POLICY checkins_select ON checkins FOR SELECT USING (true);
CREATE POLICY checkins_insert ON checkins FOR INSERT WITH CHECK (true);
CREATE POLICY analises_ia_select ON analises_ia FOR SELECT USING (true);
CREATE POLICY analises_ia_insert ON analises_ia FOR INSERT WITH CHECK (true);
    `

    // Execute via direct fetch to Supabase SQL endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql_command`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql: migrationSQL }),
    })

    const result = await response.json()

    if (!response.ok) {
      return Response.json(
        {
          status: "warning",
          message: "Migration endpoint not available, but tables should exist",
          note: "Run the SQL manually in Supabase SQL editor if tables are missing",
          sql: migrationSQL,
          apiResult: result,
        },
        { status: 200 }
      )
    }

    return Response.json({
      status: "success",
      message: "Migration completed successfully",
      result,
    })
  } catch (error) {
    return Response.json(
      {
        status: "error",
        message: String(error),
      },
      { status: 500 }
    )
  }
}
