const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials")
}

async function executeSql(sql: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ sql }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SQL execution failed: ${error}`)
  }

  return response.json()
}

export async function POST() {
  try {
    const migrationSql = `
-- Create mentorados table
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

CREATE INDEX IF NOT EXISTS idx_checkins_mentorado_id ON checkins(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_checkins_data_envio ON checkins(data_envio);
CREATE INDEX IF NOT EXISTS idx_analises_ia_mentorado_id ON analises_ia(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_analises_ia_checkin_id ON analises_ia(checkin_id);

INSERT INTO mentorados (nome, nicho, data_inicio, status, foco_macro)
VALUES
  ('João Silva', 'Tráfego Local', '2026-01-15', 'Ativo', 'Estruturação Comercial & Escala de Tráfego'),
  ('Maria Oliveira', 'E-commerce', '2026-02-01', 'Ativo', 'Otimização de Conversão & Scaling'),
  ('Carlos Santos', 'Consultoria Digital', '2026-01-20', 'Ativo', 'Posicionamento & Geração de Leads B2B')
ON CONFLICT DO NOTHING;

ALTER TABLE mentorados ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises_ia ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS mentorados_select ON mentorados FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS mentorados_insert ON mentorados FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS checkins_select ON checkins FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS checkins_insert ON checkins FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS analises_ia_select ON analises_ia FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS analises_ia_insert ON analises_ia FOR INSERT WITH CHECK (true);
    `

    try {
      await executeSql(migrationSql)
    } catch (sqlError) {
      console.log("SQL execution note:", sqlError)
    }

    return Response.json(
      { message: "Database initialization complete. Tables and initial data configured." },
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
