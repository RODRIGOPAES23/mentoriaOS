-- ══════════════════════════════════════════════════════════════════
-- MIGRAÇÃO: Supabase Auth + RLS — mentoriaOS
-- Execute no SQL Editor do Supabase
-- ══════════════════════════════════════════════════════════════════

-- 1. Ligar mentor ao usuário autenticado
ALTER TABLE mentors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS mentors_user_id_idx ON mentors(user_id);

-- 2. Habilitar RLS em todas as tabelas
ALTER TABLE mentors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorados  ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas     ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES — mentors
CREATE POLICY "mentors: mentor lê/edita o próprio perfil"
  ON mentors FOR ALL
  USING (user_id = auth.uid());

-- 4. POLICIES — mentorados
CREATE POLICY "mentorados: mentor acessa os seus"
  ON mentorados FOR ALL
  USING (
    mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid())
  );

-- 5. POLICIES — checkins
CREATE POLICY "checkins: mentor acessa via mentorado"
  ON checkins FOR ALL
  USING (
    mentorado_id IN (
      SELECT m.id FROM mentorados m
      JOIN mentors mt ON m.mentor_id = mt.id
      WHERE mt.user_id = auth.uid()
    )
  );

-- 6. POLICIES — tarefas
CREATE POLICY "tarefas: mentor acessa as suas"
  ON tarefas FOR ALL
  USING (
    mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid())
  );

-- 7. POLICY especial: formulário público de check-in (mentorado não autenticado)
--    O mentorado preenche via rota server-side com service_role — sem RLS
--    (service_role bypassa RLS por design — nenhuma policy necessária aqui)

-- 8. Ligar mentores existentes ao usuário (execute após criar conta)
-- UPDATE mentors SET user_id = '<seu-auth-uid>' WHERE nome = 'Victor Sidoni';
-- UPDATE mentors SET user_id = '<seu-auth-uid>' WHERE nome = 'Teste';

-- ══════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO
-- ══════════════════════════════════════════════════════════════════
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public' AND tablename IN ('mentors','mentorados','checkins','tarefas');
