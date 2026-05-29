-- ════════════════════════════════════════════════════════════════════════════════
-- 🚀 MIGRAÇÃO: Criar tabela TAREFAS (Pendências do Mentorado)
-- Data: 2026-05-29
-- Objetivo: Implementar checklist de pendências com status de conclusão
-- ════════════════════════════════════════════════════════════════════════════════

-- Criar tabela de tarefas (Pendências do Mentorado)
CREATE TABLE IF NOT EXISTS public.tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorado_id UUID NOT NULL REFERENCES mentorados(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  data_vencimento DATE,
  data_criacao TIMESTAMP DEFAULT now(),
  data_completada TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices para performance (queries rápidas)
CREATE INDEX IF NOT EXISTS idx_tarefas_mentorado_id ON tarefas(mentorado_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_mentor_id ON tarefas(mentor_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_data_vencimento ON tarefas(data_vencimento);

-- Comentários para documentação
COMMENT ON TABLE tarefas IS 'Pendências diárias do mentorado - checklist de tarefas com status e data vencimento';
COMMENT ON COLUMN tarefas.id IS 'Identificador único da tarefa';
COMMENT ON COLUMN tarefas.mentorado_id IS 'FK para mentorado (quem tem a tarefa)';
COMMENT ON COLUMN tarefas.mentor_id IS 'FK para mentor (quem criou/gerencia a tarefa)';
COMMENT ON COLUMN tarefas.texto IS 'Descrição da tarefa';
COMMENT ON COLUMN tarefas.status IS 'Status: pending = aberta, completed = concluída';
COMMENT ON COLUMN tarefas.data_vencimento IS 'Data limite para conclusão (opcional)';
COMMENT ON COLUMN tarefas.data_criacao IS 'Quando foi criada (user-facing)';
COMMENT ON COLUMN tarefas.data_completada IS 'Data/hora quando foi marcada como completa';

-- ✅ FIM DA MIGRAÇÃO
-- Próximo passo: Deploy da aplicação (npm run build && git push)
