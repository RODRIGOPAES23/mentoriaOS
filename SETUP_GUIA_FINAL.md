# 🚀 mentoriaOS — GUIA DE SETUP FINAL

**Status**: Aplicação deployada ✅ | MCP integrado ✅ | **Faltando**: Banco de dados

---

## 📋 O Que Fazer (4 passos simples)

### Passo 1️⃣: Abrir Console SQL Supabase

1. **Clique no link abaixo** para abrir diretamente na aba de SQL:
   - [🔗 Supabase SQL Editor](https://app.supabase.com/project/pywjcpsklvgpadxgotpn/sql/new)

2. Você verá um editor em branco com botão **[New Query]**

### Passo 2️⃣: Copiar e Colar o Schema SQL

**Copie TODO este código:**

```sql
-- ============================================================================
-- mentoriaOS — SCHEMA SQL SUPABASE (ETAPA 1)
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
-- FUNÇÃO: Quando novo checkin é inserido, dispara webhook
-- ============================================================================

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

-- ============================================================================
-- RLS: Row Level Security
-- ============================================================================

ALTER TABLE mentorados ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises_ia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentor acessa seus mentorados"
  ON mentorados
  FOR SELECT
  USING (mentor_id = auth.uid());

CREATE POLICY "Admin acessa todos mentorados"
  ON mentorados
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Mentor acessa checkins de seus mentorados"
  ON checkins
  FOR SELECT
  USING (
    mentorado_id IN (
      SELECT id FROM mentorados WHERE mentor_id = auth.uid()
    )
  );

CREATE POLICY "Qualquer usuário pode inserir checkin"
  ON checkins
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Mentor acessa análises de seus mentorados"
  ON analises_ia
  FOR SELECT
  USING (
    mentorado_id IN (
      SELECT id FROM mentorados WHERE mentor_id = auth.uid()
    )
  );

CREATE POLICY "Sistema insere análises"
  ON analises_ia
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- FUNÇÃO: Append ao historico_acumulado
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
-- VIEWS: Dashboards
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
```

**Depois:**
1. Cole o código acima no editor Supabase
2. Clique em **[Run]** (botão verde) ou **Ctrl+Enter**
3. Aguarde até ver ✅ **Success**

### Passo 3️⃣: Inserir Dados de Teste

1. Após o schema ser criado com sucesso, abra um novo terminal/PowerShell
2. Navegue até o projeto:
   ```bash
   cd C:\Users\rodri\Desktop\Projetos\NEXUS\mentoriaOS
   ```

3. Execute o script de inserção:
   ```bash
   bash insert_mentorados.sh
   ```

**Esperado:** Você verá 5 mentorados criados com sucesso

### Passo 4️⃣: Testar a Aplicação

1. Abra: **[https://mentoriaos.vercel.app](https://mentoriaos.vercel.app)**
2. Você deve ver:
   - ✅ Header com "mentoriaOS"
   - ✅ Dropdown "Selecionar Mentorado" com 5 nomes
   - ✅ Ao clicar em um mentorado, seus dados aparecem

---

## ✅ Checklist de Conclusão

- [ ] Schema SQL executado no Supabase
- [ ] 5 mentorados aparecem no Supabase dashboard
- [ ] Aplicação abre em https://mentoriaos.vercel.app
- [ ] Dropdown mostra mentorados
- [ ] Ao selecionar, metrics aparecem
- [ ] ✨ **Sistema 100% PRONTO!**

---

## 🎯 Próximos Passos (Opcional)

### Teste Completo (Fluxo End-to-End)

1. Na aplicação, clique em um mentorado
2. Você verá:
   - **Nicho**: Nicho do mentorado
   - **Foco Macro**: Objetivo principal
   - **Status**: Ativo/Inativo
   - **Métricas**: (esperado "Sem dados de checin")
   - **Análise IA**: (esperado "Nenhuma análise")

### Próxima Fase: API de Checkins

Quando estiver pronto para testar o fluxo completo de análise IA:

```bash
# Submeter um checkin de teste
curl -X POST https://mentoriaos.vercel.app/api/checkin \
  -H "Content-Type: application/json" \
  -d '{
    "mentorado_id": "ID_DO_MENTORADO",
    "vendas_reais": 5000,
    "leads_gerados": 25,
    "investimento_trafego": 200,
    "videos_postados": 3,
    "dificuldades_texto": "Dificuldade em gerar leads qualificados"
  }'
```

---

## 🆘 Troubleshooting

### "Table 'mentorados' not found"
→ Schema SQL não foi executado. Volta ao **Passo 2** e executa no Supabase.

### "No mentorados found" no dropdown
→ Insert não funcionou. Verifica se o schema existe primeiro, depois executa `insert_mentorados.sh`.

### "Cannot connect to Supabase"
→ Verifica `.env.local` tem as credenciais corretas.

### App abre mas está vazio
→ Abre DevTools (F12) → Console e procura por erros vermelhos. Screenshot + envie para diagnóstico.

---

## 📊 Arquitetura Resumida

```
┌─────────────────────────────────────────┐
│   Next.js 15 + React 18 (Vercel)       │
├─────────────────────────────────────────┤
│   Components:                           │
│   • MenteeSelector (Dropdown)          │
│   • MetricsDisplay (4 cards)           │
│   • BriefingSection (IA output)        │
├─────────────────────────────────────────┤
│   API Routes:                           │
│   • /api/checkin (POST)                │
│   • /api/analyze-checkin (internal)   │
├─────────────────────────────────────────┤
│   Supabase PostgreSQL                   │
│   • mentorados (identidade)            │
│   • checkins (dados semanais)          │
│   • analises_ia (insights IA)          │
└─────────────────────────────────────────┘
     ↓ Claude 3.5 Sonnet via OpenRouter
```

---

## 🎓 Informações de Deploy

- **Aplicação**: https://mentoriaos.vercel.app
- **Projeto Vercel**: mentoriaOS
- **Domain Target**: mentoriaOS.nexus.tecnolog.ia.br (pendente DNS)
- **GitHub**: Privado (git@github.com:seu-usuario/mentoriaOS.git)
- **Database**: pywjcpsklvgpadxgotpn.supabase.co

---

**Pronto?** Siga os 4 passos acima e você terá um sistema de mentoria operacional! 🚀
