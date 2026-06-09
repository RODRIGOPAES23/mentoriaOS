# 🚀 DOIT Migrations — Instruções Passo-a-Passo

**Tempo**: 5 minutos  
**Dificuldade**: Fácil (copy-paste no SQL Editor)

---

## Passo 1: Acessar Supabase SQL Editor

1. Abra seu navegador
2. Vá para: https://pywjcpsklvgpadxgotpn.supabase.co
3. Faça login (se necessário)
4. Clique em **"SQL Editor"** (menu esquerdo)
5. Clique em **"New Query"**

---

## Passo 2: Copiar SQL

Abra o arquivo:
```
mentoriaOS/migrations/doit_schema.sql
```

**OU copie o SQL abaixo na integra:**

```sql
-- DOIT Schema: AI Agentic Orchestrator
create table if not exists doit_projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  objetivo text not null,
  resumo_1linha text,
  status text default 'ideacao',
  fases_total int default 0,
  passos_totais int default 0,
  passos_completados int default 0,
  criado_em timestamp default now(),
  atualizado_em timestamp default now(),
  created_at timestamp default now()
);

create table if not exists doit_passos (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references doit_projects(id) on delete cascade,
  fase_numero int not null,
  fase_nome text not null,
  passo_numero int not null,
  descricao text,
  responsabilidade_humana text not null,
  processamento_automatizado text not null,
  llm_principal text,
  conectores jsonb default '[]',
  skills jsonb default '[]',
  status text default 'backlog',
  quem_resolveu text,
  tempo_estimado_horas int,
  criado_em timestamp default now(),
  atualizado_em timestamp default now()
);

create table if not exists doit_gratidao_eventos (
  id uuid default gen_random_uuid() primary key,
  project_id uuid not null references doit_projects(id) on delete cascade,
  evento_tipo text not null,
  passo_id uuid references doit_passos(id),
  fase_numero int,
  status_anterior text,
  status_novo text,
  metadata jsonb,
  criado_em timestamp default now()
);

alter table doit_projects enable row level security;
alter table doit_passos enable row level security;
alter table doit_gratidao_eventos enable row level security;

create policy "doit_projects_user_read" on doit_projects for select using (auth.uid() = user_id);
create policy "doit_projects_user_insert" on doit_projects for insert with check (auth.uid() = user_id);
create policy "doit_projects_user_update" on doit_projects for update using (auth.uid() = user_id);
create policy "doit_projects_user_delete" on doit_projects for delete using (auth.uid() = user_id);

create policy "doit_passos_user_read" on doit_passos for select
  using (project_id in (select id from doit_projects where user_id = auth.uid()));
create policy "doit_passos_user_insert" on doit_passos for insert
  with check (project_id in (select id from doit_projects where user_id = auth.uid()));
create policy "doit_passos_user_update" on doit_passos for update
  using (project_id in (select id from doit_projects where user_id = auth.uid()));

create policy "doit_gratidao_eventos_user_read" on doit_gratidao_eventos for select
  using (project_id in (select id from doit_projects where user_id = auth.uid()));
create policy "doit_gratidao_eventos_user_insert" on doit_gratidao_eventos for insert
  with check (project_id in (select id from doit_projects where user_id = auth.uid()));

create index if not exists idx_doit_projects_user_id on doit_projects(user_id);
create index if not exists idx_doit_passos_project_id on doit_passos(project_id);
create index if not exists idx_doit_eventos_project_id on doit_gratidao_eventos(project_id);
```

---

## Passo 3: Colar no SQL Editor

1. Cole todo o SQL acima na janela do SQL Editor do Supabase
2. Você verá o SQL formatado e com syntax highlighting

---

## Passo 4: Executar

1. Clique no botão **"Run"** (ícone de play, canto superior direito)
2. **OU** pressione `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
3. Aguarde 2-3 segundos

---

## Passo 5: Verificar Sucesso

### Sinais Positivos ✅
- Sem erros na tela
- Output aparece abaixo com "Query succeeded"
- Menu esquerdo → **"Tables"** mostra:
  - `doit_projects`
  - `doit_passos`
  - `doit_gratidao_eventos`

### Se der erro ❌
- Verifique se há um erro "table already exists"
  - → OK! Significa que foi criada numa execução anterior
- Se outro erro: copie o erro e pergunte em /help

---

## Passo 6: Testar Localmente

Após migrations OK:

```bash
cd mentoriaOS
npm run dev
# Acessar http://localhost:3000/doit
# Criar um projeto
# Verificar Kanban aparecendo
```

---

## Passo 7: Verificar GRATIDÃO Events

De volta no Supabase SQL Editor, execute:

```sql
select evento_tipo, project_id, metadata, criado_em 
from doit_gratidao_eventos 
order by criado_em desc 
limit 10;
```

**Esperado:**
- 1 linha com `evento_tipo: "criacao"`
- Outras linhas com `passo_humano` ou `passo_maquina`

---

## 🎯 Resumo

| Etapa | Tempo | Status |
|-------|-------|--------|
| 1. Acessar Supabase | 30s | ✅ |
| 2. Copiar SQL | 1m | ✅ |
| 3. Colar | 30s | ✅ |
| 4. Executar | 3s | ✅ |
| 5. Verificar | 1m | ✅ |
| 6. Testar local | 2m | ✅ |
| 7. Checar eventos | 1m | ✅ |

**Total: ~6 minutos**

---

## 📞 Troubleshooting

### "Table already exists"
Normalmente aparece se você executou 2x. Ignore, está OK.

### "Permission denied"
Você não está logado. Faça login no Supabase.

### "Foreign key constraint failed"
Você executou apenas parte do SQL. Execute todo o bloco novamente.

### "No results" ao verificar eventos
- Você não criou um projeto DOIT ainda
- Ou criou, mas sem fazer evento (botão "Executar")
- Crie projeto teste

---

**Pronto!** DOIT está instalado e operacional. 🚀
