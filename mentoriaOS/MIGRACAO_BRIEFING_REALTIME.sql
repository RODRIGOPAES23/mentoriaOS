-- ══════════════════════════════════════════════════════════════
-- MIGRAÇÃO: Briefing persistente + Realtime
-- Cole no Supabase SQL Editor e execute
-- ══════════════════════════════════════════════════════════════

-- 1. Briefing persistente: coluna JSONB na tabela checkins
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS briefing_ia JSONB;

-- 2. Habilitar Realtime nas tabelas que o front vai assinar
ALTER PUBLICATION supabase_realtime ADD TABLE checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE tarefas;

-- 3. (Opcional) Índice para buscas de briefing por mentorado
CREATE INDEX IF NOT EXISTS idx_checkins_briefing ON checkins((briefing_ia IS NOT NULL));

-- Verificação
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'checkins' AND column_name = 'briefing_ia';
