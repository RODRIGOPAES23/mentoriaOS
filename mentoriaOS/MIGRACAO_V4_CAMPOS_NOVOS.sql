-- ══════════════════════════════════════════════════════════════════
-- MIGRAÇÃO v4: Novos campos + Drag & Drop + Financeiro
-- Execute no Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- 1. Novos campos no mentorado
ALTER TABLE mentorados
  ADD COLUMN IF NOT EXISTS cidade TEXT,
  ADD COLUMN IF NOT EXISTS data_fim DATE,
  ADD COLUMN IF NOT EXISTS faturamento_atual NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS meta_faturamento NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS ordem INT DEFAULT 0;

-- 2. Índice para ordenação
CREATE INDEX IF NOT EXISTS idx_mentorados_ordem ON mentorados(mentor_id, ordem);

-- 3. Tabela financeiro (pagamentos)
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorado_id UUID NOT NULL REFERENCES mentorados(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  valor NUMERIC(12,2) NOT NULL DEFAULT 0,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado')),
  descricao TEXT,
  parcela INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_mentorado ON pagamentos(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_vencimento ON pagamentos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);

-- 4. Habilitar Realtime para pagamentos
ALTER PUBLICATION supabase_realtime ADD TABLE pagamentos;

-- 5. Tabela call_analyses (transcrições analisadas)
CREATE TABLE IF NOT EXISTS call_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorado_id UUID NOT NULL REFERENCES mentorados(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  fonte TEXT,                    -- URL do Fathom ou "texto"
  transcricao TEXT,              -- Texto completo
  resumo TEXT,                   -- Resumo gerado pela IA
  tarefas_mentorado JSONB,       -- [{texto, prioridade}]
  compromissos_equipe JSONB,     -- [{texto, responsavel}]
  insights JSONB,                -- Pontos-chave da call
  data_call TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_call_analyses_mentorado ON call_analyses(mentorado_id);

-- Verificação
SELECT 'mentorados' as tabela, column_name
FROM information_schema.columns
WHERE table_name = 'mentorados'
  AND column_name IN ('cidade','data_fim','faturamento_atual','meta_faturamento','ordem')
UNION ALL
SELECT 'pagamentos', 'criada'
FROM information_schema.tables WHERE table_name = 'pagamentos'
UNION ALL
SELECT 'call_analyses', 'criada'
FROM information_schema.tables WHERE table_name = 'call_analyses';
