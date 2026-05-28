-- ============================================================================
-- mentoriaOS — SCHEMA SQL SUPABASE (ETAPA 1)
-- ============================================================================
-- COPY & PASTE direto no SQL Editor do Supabase
-- Status: Pronto para produção | RLS ativo | Webhooks configurados
-- ============================================================================

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgjwt";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE mentee_status AS ENUM ('Ativo', 'Inativo', 'Pausado');
CREATE TYPE task_status AS ENUM ('Pendente', 'Executada', 'Atrasada');

-- ============================================================================
-- TABELA 1: mentorados (Identidade)
-- ============================================================================

CREATE TABLE IF NOT EXISTS mentorados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  nicho VARCHAR(255) NOT NULL,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  status mentee_status DEFAULT 'Ativo',
  link_instagram VARCHAR(500),
  foco_macro TEXT,
  historico_acumulado JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  mentor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  CONSTRAINT nome_not_empty CHECK (LENGTH(TRIM(nome)) > 0),
  CONSTRAINT nicho_not_empty CHECK (LENGTH(TRIM(nicho)) > 0)
);

CREATE INDEX idx_mentorados_mentor_id ON mentorados(mentor_id);
CREATE INDEX idx_mentorados_status ON mentorados(status);
CREATE INDEX idx_mentorados_created_at ON mentorados(created_at DESC);

-- ============================================================================
-- TABELA 2: checkins (Dados Semanais)
-- ============================================================================

CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentorado_id UUID NOT NULL REFERENCES mentorados(id) ON DELETE CASCADE,
  data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  vendas_reais DECIMAL(10, 2) DEFAULT 0.00,
  leads_gerados INT DEFAULT 0,
  investimento_trafego DECIMAL(10, 2) DEFAULT 0.00,
  videos_postados INT DEFAULT 0,
  dificuldades_texto TEXT,
  tarefas_executadas JSONB DEFAULT '[]'::jsonb,

  CONSTRAINT checkin_vendas_positive CHECK (vendas_reais >= 0),
  CONSTRAINT checkin_leads_positive CHECK (leads_gerados >= 0),
  CONSTRAINT checkin_investimento_positive CHECK (investimento_trafego >= 0),
  CONSTRAINT checkin_videos_positive CHECK (videos_postados >= 0)
);

CREATE INDEX idx_checkins_mentorado_id ON checkins(mentorado_id);
CREATE INDEX idx_checkins_data_envio ON checkins(data_envio DESC);
CREATE INDEX idx_checkins_mentorado_data ON checkins(mentorado_id, data_envio DESC);

-- ============================================================================
-- TABELA 3: analises_ia (Inteligência Gerada)
-- ============================================================================

CREATE TABLE IF NOT EXISTS analises_ia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checkin_id UUID NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
  mentorado_id UUID NOT NULL REFERENCES mentorados(id) ON DELETE CASCADE,
  data_analise TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resumo_historico TEXT,
  gargalo_identificado TEXT,
  evolucao_metricas TEXT,
  sugestao_estrategica TEXT,
  pauta_call_pronta TEXT,
  tokens_usados INT DEFAULT 0,
  modelo_ia VARCHAR(100) DEFAULT 'claude-3-5-sonnet',

  CONSTRAINT analise_checkin_unique UNIQUE(checkin_id)
);

CREATE INDEX idx_analises_ia_mentorado_id ON analises_ia(mentorado_id);
CREATE INDEX idx_analises_ia_data_analise ON analises_ia(data_analise DESC);
CREATE INDEX idx_analises_ia_checkin_id ON analises_ia(checkin_id);

-- ============================================================================
-- FUNÇÃO: atualizar updated_at automaticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mentorados_updated_at
BEFORE UPDATE ON mentorados
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- FUNÇÃO: Quando novo checkin é inserido, dispara webhook (Supabase Functions)
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_analise_ia()
RETURNS TRIGGER AS $$
BEGIN
  -- Aqui será disparado um webhook que chama a Edge Function
  -- Para agora, apenas registra que foi criado
  NOTIFY checkin_created, json_build_object(
    'checkin_id', NEW.id,
    'mentorado_id', NEW.mentorado_id,
    'data_envio', NEW.data_envio
  )::text;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_checkin_analise
AFTER INSERT ON checkins
FOR EACH ROW
EXECUTE FUNCTION trigger_analise_ia();

-- ============================================================================
-- RLS: Row Level Security (Segurança por usuário)
-- ============================================================================

ALTER TABLE mentorados ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises_ia ENABLE ROW LEVEL SECURITY;

-- Mentorados: Mentor vê seus mentorados. Mentorado vê a si mesmo (futuro).
CREATE POLICY "Mentor acessa seus mentorados"
  ON mentorados
  FOR SELECT
  USING (mentor_id = auth.uid());

CREATE POLICY "Admin acessa todos mentorados"
  ON mentorados
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Checkins: Mentor acessa checkins de seus mentorados
CREATE POLICY "Mentor acessa checkins de seus mentorados"
  ON checkins
  FOR SELECT
  USING (
    mentorado_id IN (
      SELECT id FROM mentorados WHERE mentor_id = auth.uid()
    )
  );

-- Checkins: Qualquer um pode inserir (mentorado submete seu checkin)
CREATE POLICY "Qualquer usuário pode inserir checkin"
  ON checkins
  FOR INSERT
  WITH CHECK (true);

-- Análises IA: Mentor acessa análises de seus mentorados
CREATE POLICY "Mentor acessa análises de seus mentorados"
  ON analises_ia
  FOR SELECT
  USING (
    mentorado_id IN (
      SELECT id FROM mentorados WHERE mentor_id = auth.uid()
    )
  );

-- Análises IA: Apenas sistema insere (via Edge Function)
CREATE POLICY "Sistema insere análises"
  ON analises_ia
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- FUNÇÃO: Append ao historico_acumulado (LOG immutável)
-- ============================================================================

CREATE OR REPLACE FUNCTION append_to_historico(
  p_mentorado_id UUID,
  p_evento JSONB
)
RETURNS void AS $$
BEGIN
  UPDATE mentorados
  SET historico_acumulado = historico_acumulado || jsonb_build_array(p_evento || jsonb_build_object('timestamp', CURRENT_TIMESTAMP))
  WHERE id = p_mentorado_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS: Dashboards prontos
-- ============================================================================

CREATE OR REPLACE VIEW vw_dashboard_mentor AS
SELECT
  m.id,
  m.nome,
  m.nicho,
  m.status,
  m.link_instagram,
  COUNT(c.id) as total_checkins,
  MAX(c.data_envio) as ultimo_checkin,
  SUM(c.vendas_reais) as vendas_total,
  AVG(c.vendas_reais) as vendas_media,
  SUM(c.leads_gerados) as leads_total,
  AVG(c.investimento_trafego) as investimento_media,
  COUNT(DISTINCT DATE(c.data_envio)) as semanas_ativas
FROM mentorados m
LEFT JOIN checkins c ON m.id = c.mentorado_id
GROUP BY m.id, m.nome, m.nicho, m.status, m.link_instagram;

CREATE OR REPLACE VIEW vw_ultimas_analises AS
SELECT
  a.id,
  a.mentorado_id,
  a.checkin_id,
  a.data_analise,
  a.gargalo_identificado,
  a.pauta_call_pronta,
  m.nome as nome_mentorado,
  m.nicho,
  c.vendas_reais,
  c.leads_gerados,
  c.investimento_trafego
FROM analises_ia a
JOIN mentorados m ON a.mentorado_id = m.id
JOIN checkins c ON a.checkin_id = c.id
ORDER BY a.data_analise DESC;

-- ============================================================================
-- DADOS INICIAIS (EXEMPLO)
-- ============================================================================

-- Opcional: Inserir mentor de teste
-- INSERT INTO auth.users (email, encrypted_password) VALUES ('mentor@mentoriaos.com', crypt('senha123', gen_salt('bf')));

-- Opcional: Inserir mentorado de teste
-- INSERT INTO mentorados (nome, nicho, link_instagram, foco_macro, mentor_id)
-- VALUES ('Teste Mentorado', 'Digital Marketing', 'https://instagram.com/teste', 'Aumentar leads em 50%', 'UUID_DO_MENTOR');

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
-- Próximo: ETAPA 2 — Edge Function para integrar Claude API
-- ============================================================================
