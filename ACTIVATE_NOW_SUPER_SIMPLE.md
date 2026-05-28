# 🚀 ATIVAR mentoriaOS — 1 CLIQUE

## Passo 1️⃣: Executar Schema (2 minutos — OBRIGATÓRIO)

**Opção A: Clique aqui →** [🔗 Abrir Supabase SQL Editor](https://app.supabase.com/project/pywjcpsklvgpadxgotpn/sql/new)

Quando abrir:
1. Copie TODO este SQL abaixo
2. Cole no editor branco
3. Clique [Run] (verde)
4. Aguarde ✅

---

## Schema SQL (Copie Tudo Abaixo)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgjwt";

CREATE TYPE mentee_status AS ENUM ('Ativo', 'Inativo', 'Pausado');
CREATE TYPE task_status AS ENUM ('Pendente', 'Executada', 'Atrasada');

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

CREATE OR REPLACE FUNCTION trigger_analise_ia()
RETURNS TRIGGER AS $$
BEGIN
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

ALTER TABLE mentorados ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises_ia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentor acessa seus mentorados"
  ON mentorados FOR SELECT USING (mentor_id = auth.uid());

CREATE POLICY "Admin acessa todos mentorados"
  ON mentorados FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Mentor acessa checkins de seus mentorados"
  ON checkins FOR SELECT USING (
    mentorado_id IN (SELECT id FROM mentorados WHERE mentor_id = auth.uid())
  );

CREATE POLICY "Qualquer usuário pode inserir checkin"
  ON checkins FOR INSERT WITH CHECK (true);

CREATE POLICY "Mentor acessa análises de seus mentorados"
  ON analises_ia FOR SELECT USING (
    mentorado_id IN (SELECT id FROM mentorados WHERE mentor_id = auth.uid())
  );

CREATE POLICY "Sistema insere análises"
  ON analises_ia FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

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

CREATE OR REPLACE VIEW vw_dashboard_mentor AS
SELECT
  m.id, m.nome, m.nicho, m.status, m.link_instagram,
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
  a.id, a.mentorado_id, a.checkin_id, a.data_analise,
  a.gargalo_identificado, a.pauta_call_pronta,
  m.nome as nome_mentorado, m.nicho,
  c.vendas_reais, c.leads_gerados, c.investimento_trafego
FROM analises_ia a
JOIN mentorados m ON a.mentorado_id = m.id
JOIN checkins c ON a.checkin_id = c.id
ORDER BY a.data_analise DESC;
```

---

## Passo 2️⃣: Após schema criado, execute no terminal:

```bash
cd C:\Users\rodri\Desktop\Projetos\NEXUS\mentoriaOS
bash insert_mentorados.sh
```

---

## Passo 3️⃣: Testar

Abra: **[https://mentoriaos.vercel.app](https://mentoriaos.vercel.app)**

Você deve ver:
✅ Dropdown "Selecionar Mentorado"
✅ 5 nomes na lista
✅ Dashboard com dados

---

**Tempo total: 5-10 minutos**

Pronto? [🔗 Clique aqui para ir ao SQL Editor](https://app.supabase.com/project/pywjcpsklvgpadxgotpn/sql/new) →

