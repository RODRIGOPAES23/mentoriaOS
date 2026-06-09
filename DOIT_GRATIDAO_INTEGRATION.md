# DOIT × GRATIDÃO Integration
## AI Agentic Orchestrator Rastreado por GRATIDÃO (0→1)

### Visão Geral

**DOIT** é um novo feature do ecossistema CKlareza que quebra objetivos complexos em roadmaps operativos, separando **o que você faz (humano)** do **o que a máquina faz (IA)**.

**GRATIDÃO** observa cada projeto DOIT desde a criação até a validação completa, rastreando:
- ✅ **0 (Ideação)**: Objetivo criado
- ⏳ **Passos Individuais**: Quem resolveu cada passo (humano/máquina)
- ✅ **1 (Validação)**: Projeto completo

---

## Fluxo de Rastreamento GRATIDÃO

### 1️⃣ Criação do Projeto (Evento: `criacao`)

```
POST /api/doit/generate
├── Criar doit_projects (status: "ideacao")
├── Quebrar objetivo em fases/passos via OpenRouter
├── Inserir doit_passos
└── Registrar evento GRATIDÃO:
    {
      evento_tipo: "criacao",
      status: "0 (Ideação)",
      metadata: {
        objetivo: "...",
        fases: 5,
        passos: 12
      }
    }
```

### 2️⃣ Cada Passo Finalizado (Evento: `passo_humano` ou `passo_maquina`)

```
PATCH /api/doit/[projectId]/steps/[stepId]
├── Atualizar doit_passos (status: "finalizado", quem_resolveu: "humano|maquina")
├── Validar se todos os passos estão completos
└── Registrar evento GRATIDÃO:
    {
      evento_tipo: "passo_humano" | "passo_maquina",
      passo_id: "...",
      status_anterior: "backlog|processando",
      status_novo: "finalizado",
      metadata: {
        descricao: "...",
        quem_resolveu: "humano|maquina"
      }
    }
```

### 3️⃣ Projeto Finalizado (Evento: `validacao_completa`)

```
Se todos os passos estão "finalizado":
├── Atualizar doit_projects (status: "validado")
└── Registrar evento GRATIDÃO:
    {
      evento_tipo: "validacao_completa",
      status_anterior: "ideacao|validando",
      status_novo: "validado",
      metadata: {
        passos_totais: 12,
        passos_humano: 7,
        passos_maquina: 5,
        tempo_total_horas: 24
      }
    }
```

---

## Schema GRATIDÃO para DOIT

Tabela: `doit_gratidao_eventos`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | ID único do evento |
| project_id | uuid | Referência ao doit_projects |
| evento_tipo | text | `criacao`, `passo_humano`, `passo_maquina`, `validacao_completa` |
| passo_id | uuid | Referência ao doit_passos (null para eventos de projeto) |
| fase_numero | int | Qual fase o passo pertence |
| status_anterior | text | Estado anterior |
| status_novo | text | Estado novo |
| metadata | jsonb | Dados adicionais (objetivo, skills, conectores, etc) |
| criado_em | timestamp | Timestamp do evento |

---

## Queries GRATIDÃO para Relatórios

### Projetos em Andamento
```sql
select 
  dp.id, 
  dp.objetivo,
  dp.status,
  count(dpass.id) as total_passos,
  count(case when dpass.status = 'finalizado' then 1 end) as passos_completados
from doit_projects dp
left join doit_passos dpass on dp.id = dpass.project_id
where dp.status != 'validado'
group by dp.id
order by dp.criado_em desc;
```

### Taxa de Sucesso (Humano vs Máquina)
```sql
select 
  dge.evento_tipo,
  count(*) as total,
  count(distinct dge.project_id) as projetos_unicos
from doit_gratidao_eventos dge
where dge.evento_tipo in ('passo_humano', 'passo_maquina')
group by dge.evento_tipo;
```

### Tempo Médio de Projeto
```sql
select 
  avg(extract(epoch from (dge2.criado_em - dge1.criado_em)) / 3600) as horas_media
from doit_gratidao_eventos dge1
join doit_gratidao_eventos dge2 on dge1.project_id = dge2.project_id
where dge1.evento_tipo = 'criacao'
  and dge2.evento_tipo = 'validacao_completa';
```

---

## Próximas Integrações (Roadmap)

### Fase 2: Webhooks com GRATIDÃO
- [ ] Webhook automático quando projeto finaliza
- [ ] Notificação ao GRATIDÃO com resultado final
- [ ] Marcação como "1 (Validação)" no GRATIDÃO

### Fase 3: Dashboard Unificado
- [ ] `/admin/gratidao` mostra estatísticas DOIT
- [ ] Heatmap: quais tarefas humanos mais resolvem vs máquinas
- [ ] Recomendação de automação

### Fase 4: Feedback Loop
- [ ] GRATIDÃO sugere otimizações baseado em histórico DOIT
- [ ] Machine learning: qual LLM funciona melhor para cada tipo de objetivo
- [ ] Predição de tempo de projeto

---

## Stack Técnico

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 + React 19 |
| Backend | Next.js API Routes |
| DB | Supabase PostgreSQL |
| Auth | Clerk (reutiliza de CKlareza) |
| LLM | OpenRouter (Claude 3.5 Sonnet) |
| Observer | GRATIDÃO (tabela `doit_gratidao_eventos`) |

---

## Como Testar

### 1. Setup Local
```bash
cd mentoriaOS
npm install
source .env.local  # Já tem credenciais
npm run dev
```

### 2. Executar Migrations
Copie o SQL de `migrations/doit_schema.sql` e execute no Supabase:
```
https://pywjcpsklvgpadxgotpn.supabase.co → SQL Editor
```

### 3. Criar Primeiro Projeto
```bash
curl -X POST http://localhost:3000/api/doit/generate \
  -H "Content-Type: application/json" \
  -d '{"objetivo": "Quero correr uma maratona de 42km"}'
```

### 4. Acompanhar no GRATIDÃO
```sql
select * from doit_gratidao_eventos order by criado_em desc;
```

---

## Checklist SEATZERO como Referência

O checklist do SEATZERO serve como template para como DOIT quebra objetivos:
- **13 Fases** (Organização → Mentalidade)
- **80+ Passos** (cada checkbox é um passo kanban)
- **Status**: Backlog → Processando → Finalizado
- **Responsável**: Humano ou Máquina por passo

DOIT generative faz isso automaticamente via IA, em vez de manual.

---

## Métricas GRATIDÃO para DOIT

```json
{
  "0_projetos_criados": 42,
  "1_projetos_validados": 8,
  "taxa_conversao": "19%",
  "passos_humano": 156,
  "passos_maquina": 94,
  "ratio_humano_maquina": "1.66:1",
  "llm_mais_usado": "Claude 3.5 Sonnet",
  "objetivo_mais_comum": "Venda/Marketing",
  "tempo_medio_horas": 24.3
}
```

---

**Rodrigo Rafael** | NEXUS Ecosystem | 2026-06-08
