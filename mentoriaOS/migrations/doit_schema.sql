-- DOIT Schema: AI Agentic Orchestrator
-- Rastreia objetivos quebrados em passos humano/máquina
-- Integrado com GRATIDÃO para observação 0→1

-- Tabela de Projetos DOIT
create table if not exists doit_projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  objetivo text not null,
  resumo_1linha text,
  status text default 'ideacao', -- ideacao, validando, validado
  fases_total int default 0,
  passos_totais int default 0,
  passos_completados int default 0,
  criado_em timestamp default now(),
  atualizado_em timestamp default now(),
  created_at timestamp default now()
);

-- Tabela de Passos (Fases)
create table if not exists doit_passos (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references doit_projects(id) on delete cascade,
  fase_numero int not null,
  fase_nome text not null,
  passo_numero int not null,
  descricao text,
  responsabilidade_humana text not null,
  processamento_automatizado text not null,
  llm_principal text, -- ex: "Claude 3.5 Sonnet"
  conectores jsonb default '[]', -- array de conectores usados
  skills jsonb default '[]', -- array de skills ativadas
  status text default 'backlog', -- backlog, processando, finalizado
  quem_resolveu text, -- 'humano', 'maquina', null
  tempo_estimado_horas int,
  criado_em timestamp default now(),
  atualizado_em timestamp default now()
);

-- Tabela de Rastreamento GRATIDÃO (observer)
create table if not exists doit_gratidao_eventos (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references doit_projects(id) on delete cascade,
  evento_tipo text not null, -- 'criacao', 'passo_humano', 'passo_maquina', 'fase_concluida', 'validacao_completa'
  passo_id uuid references doit_passos(id),
  fase_numero int,
  status_anterior text,
  status_novo text,
  metadata jsonb,
  criado_em timestamp default now()
);

-- RLS Policies
alter table doit_projects enable row level security;
alter table doit_passos enable row level security;
alter table doit_gratidao_eventos enable row level security;

-- Usuário só vê seus projetos
create policy "doit_projects_user_read" on doit_projects for select using (auth.uid() = user_id);
create policy "doit_projects_user_insert" on doit_projects for insert with check (auth.uid() = user_id);
create policy "doit_projects_user_update" on doit_projects for update using (auth.uid() = user_id);
create policy "doit_projects_user_delete" on doit_projects for delete using (auth.uid() = user_id);

-- Passos herdam da projeto
create policy "doit_passos_user_read" on doit_passos for select
  using (project_id in (select id from doit_projects where user_id = auth.uid()));
create policy "doit_passos_user_insert" on doit_passos for insert
  with check (project_id in (select id from doit_projects where user_id = auth.uid()));
create policy "doit_passos_user_update" on doit_passos for update
  using (project_id in (select id from doit_projects where user_id = auth.uid()));

-- Eventos herdam da projeto
create policy "doit_gratidao_eventos_user_read" on doit_gratidao_eventos for select
  using (project_id in (select id from doit_projects where user_id = auth.uid()));
create policy "doit_gratidao_eventos_user_insert" on doit_gratidao_eventos for insert
  with check (project_id in (select id from doit_projects where user_id = auth.uid()));

-- Índices
create index idx_doit_projects_user_id on doit_projects(user_id);
create index idx_doit_passos_project_id on doit_passos(project_id);
create index idx_doit_eventos_project_id on doit_gratidao_eventos(project_id);
