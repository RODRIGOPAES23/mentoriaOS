# 🎓 mentoriaOS — Sistema Operacional de Mentoria

> **Centralizar jornada de 12 meses de mentorados, eliminar contexto perdido, gerar pautas de call ultra-precisas baseadas em Claude IA.**

## 🚀 Status Atual (2026-05-28)

✅ **DEPLOYADO** | ✅ **MCP INTEGRADO** | ⏳ **AGUARDANDO ATIVAÇÃO DO BANCO**

- **App**: https://mentoriaos.vercel.app
- **Database**: Pronto para criar (schema.sql)
- **Tempo para ativar**: 5 minutos

## 📋 Guia Rápido

1. **[CHECKLIST_ATIVACAO.md](./CHECKLIST_ATIVACAO.md)** ← **COMECE AQUI** (4 passos ilustrados)
2. **[SETUP_GUIA_FINAL.md](./SETUP_GUIA_FINAL.md)** ← Detalhado passo-a-passo
3. **[STATUS_PROJETO.md](./STATUS_PROJETO.md)** ← Status técnico completo

## 📋 Tabela de Conteúdos

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. **[ATIVAÇÃO (5 MIN)](#ativação-rápida-5-minutos)** ← Fazer primeiro
5. [Fluxo Operacional](#fluxo-operacional)
6. [Documentação de Banco de Dados](#documentação-de-banco-de-dados)

---

## ⚡ Ativação Rápida (5 minutos)

### 3 Passos para Ligar o Sistema

```bash
# 1️⃣ Criar schema no Supabase (2 min)
# → Abra: https://app.supabase.com/project/pywjcpsklvgpadxgotpn/sql/new
# → Cole: schema.sql (copie TODO o arquivo)
# → Clique: [Run]

# 2️⃣ Inserir dados de teste (1 min)
bash insert_mentorados.sh

# 3️⃣ Acessar aplicação (pronto!)
# → https://mentoriaos.vercel.app
```

**Mais detalhes?** → [CHECKLIST_ATIVACAO.md](./CHECKLIST_ATIVACAO.md)

---

## 🎯 Visão Geral

**Problema**: Mentores perdem contexto acumulado entre calls. Mentorados submetem dados, mas sem análise estruturada. Resultado: pautas genéricas, ineficiência.

**Solução**: Sistema que:
- ✅ Centraliza dados semanais (checkins) em tabelas normalizadas
- ✅ Dispara análise automática via Claude API (IA contextualizada)
- ✅ Gera pautas de call prontas para usar
- ✅ Acumula histórico imutável do mentorado
- ✅ Interface limpa, modo escuro, pronto para Vercel

---

## 🛠️ Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | Next.js 15 (App Router) | ^15.0.0 |
| **Styling** | Tailwind CSS | ^3.4.1 |
| **Icons** | Lucide React | ^0.408.0 |
| **Backend** | Supabase (PostgreSQL) | ^2.45.0 |
| **Auth** | Supabase JWT | Built-in |
| **IA** | Claude 3.5 Sonnet | via Anthropic SDK |
| **Deploy** | Vercel | Auto CI/CD |
| **VCS** | GitHub | Git |

---

## 📁 Estrutura de Pastas

```
mentoriaOS/
├── app/
│   ├── api/
│   │   └── analyze-checkin/
│   │       └── route.ts          # POST: Dispara análise Claude
│   ├── layout.tsx                # Root layout + metadata
│   ├── page.tsx                  # Dashboard principal
│   └── globals.css               # Tailwind + estilos globais
├── components/
│   ├── MenteeSelector.tsx        # Dropdown para escolher mentorado
│   ├── MetricsDisplay.tsx        # Cards de vendas, leads, tráfego
│   └── BriefingSection.tsx       # Markdown da análise IA
├── lib/
│   ├── supabase.ts              # Client Supabase + tipos
│   └── claude.ts                # Wrapper Claude API
├── schema.sql                    # Script SQL para Supabase
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.local.example            # Template de variáveis
├── .gitignore
└── README.md
```

---

## 🚀 Setup Local

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Conta na Anthropic (Claude API)
- Git

### Etapas

#### 1. Clonar e instalar

```bash
cd mentoriaOS
npm install
```

#### 2. Configurar Supabase

a) Criar projeto em [supabase.com](https://supabase.com)

b) Copiar credenciais:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

c) **Executar SQL** (ETAPA 1):
   - Abrir SQL Editor do Supabase
   - Copiar conteúdo de `schema.sql`
   - Colar e executar ✅

#### 3. Configurar Anthropic

a) Criar chave API em [console.anthropic.com](https://console.anthropic.com)

b) Copiar `ANTHROPIC_API_KEY`

#### 4. Variáveis de Ambiente

```bash
# Copiar template
cp .env.local.example .env.local

# Editar .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-v4-...
```

#### 5. Rodar localmente

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy na Vercel

### Etapas

#### 1. Push para GitHub

```bash
# Inicializar repo (se não feito)
git init
git add .
git commit -m "Initial mentoriaOS commit"

# Criar repo no GitHub (sem inicializar, apenas criar vazio)
# https://github.com/new

git remote add origin https://github.com/SEU_USER/mentoriaOS.git
git branch -M main
git push -u origin main
```

#### 2. Conectar Vercel

```bash
# Opção 1: Via CLI
npm i -g vercel
vercel
# Seguir prompts, conectar GitHub

# Opção 2: Via Web
# 1. Ir em https://vercel.com/new
# 2. Importar repositório do GitHub
# 3. Selecionar mentoriaOS
# 4. Configurar variáveis de ambiente (próximo passo)
```

#### 3. Configurar Variáveis de Ambiente no Vercel

No dashboard Vercel:
1. **Settings** → **Environment Variables**
2. Adicionar:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ANTHROPIC_API_KEY=sk-ant-v4-...
   ```
3. **Redeploy**

#### 4. Domínio Customizado

1. **Settings** → **Domains**
2. Adicionar domínio: `mentoriaOS.nexus-tecnolog.ia.br`
3. Seguir instruções de DNS
4. Ativar HTTPS (automático)

#### 5. Deploy Automático

Sempre que fazer `git push` → Deploy automático na Vercel ✅

---

## 📊 Fluxo Operacional

```
Mentorado (Semanal)
    ↓
[Checkin Form] → POST /api/checkins
    ↓
[Supabase] → INSERT checkins table
    ↓
[Webhook] → POST /api/analyze-checkin
    ↓
[Claude API] → Análise contextualizada
    ↓
[Supabase] → INSERT analises_ia table
    ↓
Mentor (Dashboard)
    ↓
[GETs via SPA] → React busca dados + análises
    ↓
[Exibe Briefing] → Markdown pronto para call
    ↓
Call Mentoria
    ↓
Resultado: Profundidade 10x + Zero contexto perdido
```

### Como Disparar Análise Manualmente

```bash
curl -X POST http://localhost:3000/api/analyze-checkin \
  -H "Content-Type: application/json" \
  -d '{
    "checkin_id": "UUID_DO_CHECKIN",
    "mentorado_id": "UUID_DO_MENTORADO"
  }'
```

---

## 🗄️ Documentação de Banco de Dados

### Tabelas Principais

#### `mentorados`
Identidade do mentorado.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| nome | VARCHAR(255) | Nome completo |
| nicho | VARCHAR(255) | Nicho de atuação (ex: Digital Marketing) |
| data_inicio | DATE | Quando começou mentoria |
| status | ENUM | Ativo / Inativo / Pausado |
| link_instagram | VARCHAR(500) | Perfil para rastrear |
| foco_macro | TEXT | Objetivo dos 12 meses |
| historico_acumulado | JSONB | Append-only log de eventos |

#### `checkins`
Dados semanais submetidos pelo mentorado.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| mentorado_id | UUID | FK → mentorados |
| data_envio | TIMESTAMP | Quando foi enviado |
| vendas_reais | DECIMAL | R$ vendido na semana |
| leads_gerados | INT | Leads qualificados |
| investimento_trafego | DECIMAL | R$ gasto em ads |
| videos_postados | INT | Quantidade de vídeos |
| dificuldades_texto | TEXT | Problemas relatados |
| tarefas_executadas | JSONB | Array de tarefas feitas |

#### `analises_ia`
Análises geradas pela IA após cada checkin.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | PK |
| checkin_id | UUID | FK → checkins (UNIQUE) |
| mentorado_id | UUID | FK → mentorados |
| data_analise | TIMESTAMP | Quando foi analisado |
| resumo_historico | TEXT | Síntese dos últimos dados |
| gargalo_identificado | TEXT | Problema crítico |
| evolucao_metricas | TEXT | Análise de tendências |
| sugestao_estrategica | TEXT | Ação tática |
| pauta_call_pronta | TEXT | **Pauta de call estruturada** |
| tokens_usados | INT | Tokens consumidos da API |
| modelo_ia | VARCHAR(100) | Ex: claude-3-5-sonnet |

### Views Úteis

- `vw_dashboard_mentor` → Resumo de cada mentorado + estatísticas
- `vw_ultimas_analises` → Últimas análises com contexto

### RLS (Row Level Security)

- **Mentor**: Vê seus mentorados e todos os dados associados
- **Admin**: Vê tudo
- **Checkins**: Qualquer um pode submeter (auth rule)

---

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública Supabase | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave privada Supabase | `eyJ...` |
| `ANTHROPIC_API_KEY` | Chave API Claude | `sk-ant-v4-...` |
| `NODE_ENV` | Ambiente (dev/prod) | `development` |

---

## 📈 Próximas Etapas

- [ ] **ETAPA 2**: Publicar Edge Function para webhook automático
- [ ] **ETAPA 3**: Integrar Stripe para pagamentos (Rule 5: Design Ético)
- [ ] **ETAPA 4**: Dashboard para Mentorado (auto-submit checkins)
- [ ] **ETAPA 5**: Analytics avançados (Potencial Score, Lei de Potência)
- [ ] **ETAPA 6**: Exportar pautas para PDF

---

## 🔒 Segurança

- ✅ Variáveis sensíveis em `.env.local` (ignored)
- ✅ RLS policies ativas no Supabase
- ✅ Headers de segurança no Next.js
- ✅ Sem exposição de service_role_key no frontend
- ✅ API routes protegidas

---

## 📞 Suporte

Para dúvidas ou bugs:
1. Verificar logs: `npm run dev` ou Vercel Logs
2. Testar SQL: Supabase SQL Editor
3. Validar env vars: `cat .env.local`
4. Check Claude API: https://console.anthropic.com

---

**Status**: ✅ MVP Pronto para Produção | **Próximo**: Deploy em mentoriaOS.nexus-tecnolog.ia.br
