-- Tabela para perguntas customizadas do check-in por mentor
CREATE TABLE IF NOT EXISTS custom_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('text', 'textarea', 'number')) DEFAULT 'text',
  obrigatoria BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(mentor_id, label)
);

-- Índices
CREATE INDEX idx_custom_questions_mentor_id ON custom_questions(mentor_id);
CREATE INDEX idx_custom_questions_mentor_ativo ON custom_questions(mentor_id, ativo);

-- RLS
ALTER TABLE custom_questions ENABLE ROW LEVEL SECURITY;

-- Política: Mentor só vê suas próprias perguntas
CREATE POLICY "Mentor vê suas perguntas" ON custom_questions
  FOR SELECT USING (mentor_id = (SELECT id FROM mentors WHERE user_id = auth.uid()));

-- Política: Mentor só pode criar/editar/deletar suas próprias perguntas
CREATE POLICY "Mentor gerencia suas perguntas" ON custom_questions
  FOR ALL USING (mentor_id = (SELECT id FROM mentors WHERE user_id = auth.uid()));

-- Service role bypassa RLS para o formulário do mentorado ler (GET /api/form/[mentoradoId])
