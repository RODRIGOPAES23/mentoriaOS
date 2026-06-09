# DOIT — AI Agentic Orchestrator

## O Que É?

**DOIT** é um checklist kanban gerado por IA que quebra qualquer objetivo complexo em um roadmap operativo, separando **o que você faz (humano)** do **o que a máquina faz automaticamente**.

### Exemplo
```
Objetivo: "Vender meu curso online para 100 pessoas"

DOIT gera:
├─ FASE 1: Setup (3 passos)
│  ├─ Passo 1: [HUMANO] Validar 10 ICPs
│  │           [MÁQUINA] Extrair perfis LinkedIn via Phantombuster
│  ├─ Passo 2: [HUMANO] Revisar copy do email
│  │           [MÁQUINA] Enriquecer lista com emails via Hunter.io
│  └─ Passo 3: [HUMANO] Aprovar sequência
│              [MÁQUINA] Agendar disparos via Instantly.ai
```

---

## Features

✅ **Quebra automática via IA**
- Objetivo → Fases → Passos (via OpenRouter Claude 3.5 Sonnet)
- Cada passo tem: descrição, responsabilidade humana, processamento automatizado

✅ **Kanban interativo**
- Drag-and-drop entre Backlog → Processando → Finalizado
- Marca quem resolveu: Humano ou Máquina

✅ **Rastreamento GRATIDÃO**
- Cada passo registrado como evento (0→1 Validação)
- Dashboard de progresso humano vs máquina

✅ **Stack técnico explícito**
- LLM recomendado por passo
- Conectores (APIs, ferramentas, serviços)
- Skills técnicas necessárias

---

## Arquitetura

### Schema Supabase

```sql
doit_projects
├─ id (uuid)
├─ user_id (uuid) → auth.users
├─ objetivo (text)
├─ status (enum: ideacao, validando, validado)
├─ fases_total (int)
├─ passos_totais (int)
├─ passos_completados (int)
└─ criado_em, atualizado_em

doit_passos
├─ id (uuid)
├─ project_id (uuid) → doit_projects
├─ fase_numero, fase_nome
├─ passo_numero, descricao
├─ responsabilidade_humana
├─ processamento_automatizado
├─ llm_principal (ex: "Claude 3.5 Sonnet")
├─ conectores (jsonb array)
├─ skills (jsonb array)
├─ status (enum: backlog, processando, finalizado)
├─ quem_resolveu (enum: humano, maquina)
└─ tempo_estimado_horas

doit_gratidao_eventos
├─ id (uuid)
├─ project_id → doit_projects
├─ evento_tipo (criacao, passo_humano, passo_maquina, validacao_completa)
├─ metadata (jsonb)
└─ criado_em
```

---

## API Endpoints

### POST `/api/doit/generate`
Cria novo projeto quebra objetivo em passos

**Request:**
```json
{
  "objetivo": "Quero correr uma maratona de 42km"
}
```

**Response:**
```json
{
  "projectId": "uuid",
  "objetivo": "...",
  "fases": 5,
  "passos": 14,
  "rotas": { "fases": [...] }
}
```

### GET `/api/doit/[projectId]`
Retorna projeto + passos agrupados por fase

### PATCH `/api/doit/[projectId]`
Atualiza objetivo ou status do projeto

### PATCH `/api/doit/[projectId]/steps/[stepId]`
Marca passo como concluído + registra quem resolveu

**Request:**
```json
{
  "status": "finalizado",
  "quem_resolveu": "humano" | "maquina"
}
```

---

## Como Usar

### Setup (First Time)

1. **Executar migrations SQL**
```bash
# Copy do migrations/doit_schema.sql
# Colar em: https://pywjcpsklvgpadxgotpn.supabase.co → SQL Editor
```

2. **Instalar deps (já tem)**
```bash
npm install
```

3. **Verificar env vars** (já tem em .env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=sk-or-v1-... (OpenRouter)
```

### Usar DOIT

1. **Acessar**: `http://localhost:3000/doit` (após `npm run dev`)
2. **Escrever objetivo**: "Quero vender meu produto para 100 pessoas"
3. **Clicar "EXECUTAR"** → Gera roadmap (1-2s)
4. **Ver Kanban** → Backlog | Processando | Finalizado
5. **Clicar em passo** → Ver detalhes (humano/máquina/stack)
6. **Marcar como done** → "Finalizar (Humano)" ou "Finalizar (Máquina)"
7. **GRATIDÃO rastreia** tudo automaticamente

---

## Integração GRATIDÃO

Cada ação em DOIT dispara um evento em `doit_gratidao_eventos`:

```
1. Criar projeto → evento: criacao (status: 0)
2. Finalizar passo → evento: passo_humano | passo_maquina
3. Completar todos → evento: validacao_completa (status: 1)
```

**Dashboard GRATIDÃO** pode mostrar:
- Quantos projetos "0" (ideação)
- Taxa de conversão → "1" (validado)
- Ratio humano/máquina por objetivo
- LLM mais eficaz por tipo de tarefa

---

## Exemplos de Objetivos

### ✅ Maratona 42km
**Fases sugeridas:**
1. Setup & Grounding (Strava, Google Fit)
2. Adaptação (Spotify, Biofeedback)
3. Progressão (OpenWeather, Apple Health)
4. Recuperação (Nutrition tracking, Sleep monitoring)
5. Lançamento da corrida (Day of)

### ✅ Vender Curso Online
**Fases sugeridas:**
1. Lead Scraping (LinkedIn, Phantombuster)
2. Enriquecimento (Hunter.io, ZeroBounce)
3. Outbound Ativo (Instantly.ai, HubSpot)
4. Onboarding (Email sequence, Supabase)
5. Retention (Dashboard, Analytics)

### ✅ Viagem para o Japão
**Fases sugeridas:**
1. Planejamento (Google Maps, Skyscanner)
2. Booking (Airbnb, JR Pass, Hotéis)
3. Roteiro (Google Docs, Trello)
4. Packing (Checklist)
5. Documentação (Passaporte, Visto)

---

## Testes

### Teste Manual
```bash
# Terminal 1: Dev server
cd mentoriaOS && npm run dev

# Terminal 2: Criar projeto
curl -X POST http://localhost:3000/api/doit/generate \
  -H "Content-Type: application/json" \
  -d '{"objetivo": "Quero correr uma maratona de 42km"}'

# Copie o projectId da resposta

# Pegar projeto
curl http://localhost:3000/api/doit/[projectId]

# Marcar passo (copie stepId do resultado anterior)
curl -X PATCH http://localhost:3000/api/doit/[projectId]/steps/[stepId] \
  -H "Content-Type: application/json" \
  -d '{"status": "finalizado", "quem_resolveu": "humano"}'

# Verificar eventos GRATIDÃO
select * from doit_gratidao_eventos where project_id = '[projectId]';
```

### Com Seu Checklist SEATZERO
O arquivo `seatzero_checklist.txt` pode ser usado para:
1. Validar que DOIT gera estrutura similar (13 fases, múltiplos passos)
2. Comparar formato de checklist manual vs automático
3. Treinar IA com exemplos reais

---

## Roadmap

- [ ] **v1.0** (AGORA): Core kanban + GRATIDÃO tracking + geração IA
- [ ] **v1.1**: Webhooks reais para conectores (n8n, Make)
- [ ] **v1.2**: Dashboard GRATIDÃO com stats DOIT
- [ ] **v2.0**: Multi-language (PT/EN/ES)
- [ ] **v2.1**: Templates de objetivos comuns
- [ ] **v3.0**: Histórico de projetos + recomendações

---

## Troubleshooting

### "Projeto não encontrado"
- Verificar se está logado (Clerk auth)
- Verificar se projectId está correto

### "Erro ao parsear resposta LLM"
- Verificar ANTHROPIC_API_KEY (OpenRouter)
- Verificar se prompt está válido

### "Passo não atualiza"
- Verificar RLS policies (doit_passos)
- Verificar se user_id está correto

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 + React 19 + Tailwind |
| Backend | Next.js API Routes |
| Database | Supabase PostgreSQL |
| Auth | Clerk (reutiliza CKlareza) |
| LLM | OpenRouter + Claude 3.5 Sonnet |
| Observer | GRATIDÃO (events + metrics) |
| Deployment | Vercel |

---

**Criado**: 2026-06-08  
**Status**: 🟢 Pronto para MVP  
**Próximo**: Deploy + testes com SEATZERO checklist
