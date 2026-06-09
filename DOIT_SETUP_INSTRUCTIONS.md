# DOIT Setup — Guia Completo de Ativação

## ✅ Status: PRONTO PARA MVP

Todos os arquivos foram criados. Faltam apenas os passos de setup abaixo.

---

## 🚀 Próximos Passos (Ordem)

### 1️⃣ Executar Migrations SQL no Supabase

**Acesso**: https://pywjcpsklvgpadxgotpn.supabase.co → SQL Editor

**Copie e execute**:
```bash
cat mentoriaOS/migrations/doit_schema.sql
# ou abra o arquivo e copie o conteúdo inteiro
```

**Verificar**: Depois de executar, vá a **Tabelas** e confirme:
- ✅ `doit_projects`
- ✅ `doit_passos`
- ✅ `doit_gratidao_eventos`

---

### 2️⃣ Testa Localmente

```bash
cd mentoriaOS
npm run dev
# Server sobe em http://localhost:3000
```

**Navegar para**: `http://localhost:3000/doit`

---

### 3️⃣ Primeiro Teste

1. Escrever objetivo: `"Quero correr uma maratona de 42km"`
2. Clicar "EXECUTAR"
3. Aguardar 2-3 segundos (IA quebrando objetivo)
4. Ver Kanban aparecer com ~14 passos
5. Clicar em 1 passo → ver modal com detalhes
6. Marcar como "Finalizar (Humano)" ou "Finalizar (Máquina)"
7. Verificar progresso no topo

---

### 4️⃣ Verificar GRATIDÃO Events

```bash
# Terminal (Bash)
psql -h pywjcpsklvgpadxgotpn.supabase.co \
     -U postgres \
     -d postgres \
     -c "SELECT * FROM doit_gratidao_eventos ORDER BY criado_em DESC LIMIT 10;"
```

**Ou via Supabase UI**:
- Query → SQL Editor
- Escrever:
```sql
select evento_tipo, project_id, fase_numero, metadata 
from doit_gratidao_eventos 
order by criado_em desc limit 20;
```

---

### 5️⃣ Deploy no Vercel

```bash
cd mentoriaOS
git add .
git commit -m "feat: DOIT - AI Agentic Orchestrator 0→1"
git push origin main

# Vercel auto-deploy
# Check: https://mentoriaos.vercel.app/doit
```

---

## 📋 Arquivos Criados

| Arquivo | Propósito |
|---------|-----------|
| `mentoriaOS/migrations/doit_schema.sql` | Schema do banco |
| `mentoriaOS/app/api/doit/generate/route.ts` | POST: gera objetivo em passos |
| `mentoriaOS/app/api/doit/[projectId]/route.ts` | GET/PATCH: projeto |
| `mentoriaOS/app/api/doit/[projectId]/steps/[stepId]/route.ts` | PATCH: marca passo |
| `mentoriaOS/app/doit/page.tsx` | Frontend Kanban |
| `mentoriaOS/app/doit/README.md` | Docs de uso |
| `DOIT_GRATIDAO_INTEGRATION.md` | Como GRATIDÃO rastreia |
| `DOIT_SETUP_INSTRUCTIONS.md` | Este arquivo |

---

## 🧪 Teste com Seu Checklist SEATZERO

Você pode usar `_PRODUTOS/seatzero/seatzero_checklist.txt` como referência:

```bash
# Teste objetivo similar:
"Quero preparar meu projeto SEATZERO para lançamento em 30 dias com 10 pagamentos reais"

# DOIT deve gerar fases como:
# FASE 0: Organização
# FASE 1: MVP
# FASE 2: Sistema de Cadeiras
# ... etc
```

---

## ⚠️ Troubleshooting

### ❌ "Erro 401 — Não autenticado"
- Você não está logado no CKlareza
- **Solução**: Faça login em `/auth/login` primeiro

### ❌ "OpenRouter error: 401"
- `ANTHROPIC_API_KEY` está inválido
- **Solução**: Verificar `.env.local` → gerar novo token em https://openrouter.ai/

### ❌ "RLS policy error"
- Migrations não rodaram
- **Solução**: Executar SQL novamente em Supabase UI

### ❌ "TypeScript error: createServerClient"
- Import está errado
- **Solução**: Usar `import { createServerClient, adminClient } from "@/lib/supabase-server"`

---

## 📊 Métricas Esperadas (Depois de 5 Testes)

```
doit_projects:        5 registros
doit_passos:         ~70 passos (14 cada)
doit_gratidao_eventos: ~20 eventos
  - 5x criacao (um por projeto)
  - 10x passo_humano|passo_maquina
  - 0-5x validacao_completa (quando todos passos feitos)
```

---

## 🎯 Checklist de Ativação

- [ ] Executar migrations SQL
- [ ] Testar `/doit` localmente
- [ ] Criar 1 projeto teste
- [ ] Marcar 5 passos (mix humano/máquina)
- [ ] Verificar `doit_gratidao_eventos`
- [ ] Deploy Vercel
- [ ] Testar em produção
- [ ] Salvar tudo em memória

---

## 📝 Próximas Versões (Roadmap)

### v1.1: Webhooks Reais
- [ ] n8n integration (automaticamente chamar APIs)
- [ ] Make.com integration
- [ ] Webhook para notificações

### v1.2: GRATIDÃO Dashboard
- [ ] `/admin/gratidao` mostra stats DOIT
- [ ] Heatmap: humano vs máquina por tipo
- [ ] Sugestões de automação

### v2.0: Multi-Language
- [ ] PT/EN/ES (como CKlareza)
- [ ] Prompt system em 3 idiomas

### v2.1: Templates
- [ ] "Marketing Launch"
- [ ] "Product Development"
- [ ] "Fundraising"
- [ ] "Team Scaling"

### v3.0: Histórico + ML
- [ ] Dashboard de histórico de projetos
- [ ] ML: recomendar LLM por tipo
- [ ] Predição de tempo de projeto
- [ ] Auto-save backups

---

## 🏆 Integração GRATIDÃO — Lei da Fábrica

DOIT demonstra a **Lei da Fábrica** (Regra de Ouro 1):

```
PROJETO 0 (Ideação) ──→ PASSOS ──→ PROJETO 1 (Validação)

Cada projeto DOIT:
1. Começa como "0" (apenas ideia)
2. Cada passo concluído → evento registrado
3. Quando todos passos = "finalizado" → vira "1" (validado)
4. GRATIDÃO vê o workflow inteiro como prova de execução
```

---

## 📚 Referências

- **DOIT Docs**: `mentoriaOS/app/doit/README.md`
- **GRATIDÃO Integration**: `DOIT_GRATIDAO_INTEGRATION.md`
- **Regra de Ouro 1**: `regra_ouro_zero_para_um.md`
- **Seu Checklist**: `_PRODUTOS/seatzero/seatzero_checklist.txt`

---

**Data de Criação**: 2026-06-08  
**Status**: 🟢 Pronto para MVP  
**Criador**: Claude Code (Digoo)  
**Observer**: GRATIDÃO (rastreando 0→1)  

---

## 💬 Próximas Ações (Do Seu Lado)

1. **Executar migrations** (5 min)
2. **Testar localmente** (10 min)
3. **Dar feedback** (o que funcionou/o que melhorar)
4. **Deploy Vercel** (1 min)
5. **Atualizar memória** com lições aprendidas

**Pronto?** 🚀
