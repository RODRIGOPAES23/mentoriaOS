# 🚀 SETUP MENTORIAOS — GUIA PRÁTICO ETAPA 4

> **Status**: Código 100% gerado | **Próximo**: Suas ações

Digoo, segue passo-a-passo para colocar mentoriaOS **online em mentoriaOS.nexus-tecnolog.ia.br** com deploy automático via Vercel.

---

## ETAPA 4.1: Git & GitHub

### Passo 1: Inicializar repo Git local

```powershell
# No terminal PowerShell, dentro de C:\Users\rodri\Desktop\Projetos\NEXUS\mentoriaOS

git config --global user.name "Rodrigo Rafael"
git config --global user.email "seu.email@example.com"

git init
git add .
git commit -m "Initial mentoriaOS commit — MVP Pronto"
```

### Passo 2: Criar repo vazio no GitHub

1. Abrir https://github.com/new
2. **Nome**: `mentoriaOS`
3. **Descrição**: "Sistema Operacional de Mentoria — Centralizar 12 meses de mentorados"
4. **Privado** (para proteger código)
5. **NÃO inicializar** com README (já temos)
6. Clicar **Create Repository**

### Passo 3: Conectar GitHub ao local

```powershell
# Copie a URL do seu repo criado (ex: https://github.com/rodrigorspaes/mentoriaOS.git)

git remote add origin https://github.com/[SEU_USER]/mentoriaOS.git
git branch -M main
git push -u origin main
```

✅ Código agora está no GitHub (privado)

---

## ETAPA 4.2: Supabase — Banco de Dados

### Passo 1: Criar projeto

1. Abrir https://supabase.com
2. **Sign in** ou criar conta
3. **New Project**
   - **Organization**: Pessoal
   - **Name**: `mentoriaOS`
   - **Database Password**: Salvar em segurança
   - **Region**: São Paulo (br-sao-1)
4. Clicar **Create new project** e aguardar (2-3 min)

### Passo 2: Copiar credenciais

Quando pronto, no dashboard Supabase:
1. **Settings** → **API**
2. Copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

**Guardar num arquivo temporário de notas.**

### Passo 3: Executar SQL (Schema)

1. No dashboard Supabase, lado esquerdo: **SQL Editor**
2. **New Query**
3. Copiar todo conteúdo de `schema.sql` (do seu projeto local)
4. Colar na query do Supabase
5. Clicar **RUN** ✅

Deve aparecer verde: "Success"

Pronto! Tabelas criadas.

---

## ETAPA 4.3: Anthropic API — Claude

### Passo 1: Gerar API Key

1. Abrir https://console.anthropic.com
2. **API Keys** (lado esquerdo)
3. **Create Key**
4. Nome: `mentoriaOS-prod`
5. Copiar a chave completa: `sk-ant-v4-...`

**Guardar em segurança — não compartilhar!**

---

## ETAPA 4.4: Next.js Local — Teste Antes de Deploy

### Passo 1: Instalar dependências

```powershell
cd C:\Users\rodri\Desktop\Projetos\NEXUS\mentoriaOS
npm install
```

### Passo 2: Configurar .env.local

```powershell
# Copiar template
cp .env.local.example .env.local

# Editar .env.local no seu editor
# Colar as credenciais do Supabase e Anthropic
```

Exemplo final (substitua):
```
NEXT_PUBLIC_SUPABASE_URL=https://abcxyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-v4-xxxx...
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
WEBHOOK_SECRET=seu-secret-aqui
```

### Passo 3: Rodar localmente

```powershell
npm run dev
```

Deve aparecer:
```
  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
```

Abrir http://localhost:3000 no navegador ✅

**Testes**:
- [ ] Página carrega (dark mode)
- [ ] Dropdown de mentorados (pode estar vazio se nenhum no BD)
- [ ] Nenhum erro no console

### Passo 4: Inserir dados de teste (Supabase)

No SQL Editor do Supabase:

```sql
-- Inserir mentor (você)
INSERT INTO auth.users (email, encrypted_password)
VALUES ('mentor@mentoriaos.com', crypt('teste123', gen_salt('bf')));

-- Copiar o UUID gerado acima

-- Inserir mentorado de teste
INSERT INTO mentorados (
  nome, nicho, link_instagram, foco_macro, mentor_id, status
)
VALUES (
  'João Silva',
  'Digital Marketing',
  'https://instagram.com/joaosilva',
  'Aumentar leads em 50%',
  'UUID_DO_MENTOR_ACIMA',
  'Ativo'
);

-- Inserir checkin
INSERT INTO checkins (
  mentorado_id, vendas_reais, leads_gerados, investimento_trafego, videos_postados, dificuldades_texto
)
VALUES (
  'UUID_DO_MENTORADO_ACIMA',
  1500.00,
  12,
  300.00,
  3,
  'Dificuldade em conversão de leads para vendas'
);
```

Volta ao localhost:3000 e seleciona o mentorado ✅

---

## ETAPA 4.5: Vercel — Deploy & Domínio

### Passo 1: Conectar Vercel ao GitHub

1. Abrir https://vercel.com
2. **Sign in** (criar conta ou usar GitHub)
3. **New Project**
4. Conectar GitHub
5. Selecionar `mentoriaOS`
6. Clicar **Import**

### Passo 2: Configurar Variáveis de Ambiente

Na tela de import do Vercel, antes de fazer deploy:
1. **Environment Variables**
2. Adicionar cada um:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://...supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   SUPABASE_SERVICE_ROLE_KEY = eyJ...
   ANTHROPIC_API_KEY = sk-ant-v4-...
   ```
3. Clicar **Deploy**

Aguarda (30-60 segundos)

✅ **Live!** Vercel gera URL automática (ex: `mentorioos-abc123.vercel.app`)

### Passo 3: Configurar Domínio Customizado

1. Dashboard Vercel → Seu projeto
2. **Settings** → **Domains**
3. **Add Domain**
4. Digite: `mentoriaOS.nexus-tecnolog.ia.br`
5. Vercel mostra registros DNS

**Ação necessária**: Adicionar registros DNS no seu registrador (ex: Namecheap, AWS Route 53, etc.)

Exemplos de registros:
```
Name: mentoriaOS
Type: CNAME
Value: cname.vercel-dns.com.
```

Aguarda propagação (5-30 min)

### Passo 4: HTTPS Automático

Vercel ativa automaticamente via Let's Encrypt ✅

---

## ETAPA 4.6: Fluxo Contínuo (CI/CD)

Sempre que fizer mudanças:

```powershell
# Local
git add .
git commit -m "Descrição da mudança"
git push origin main
```

→ **Vercel detecta** → **Deploy automático** → **mentoriaOS.nexus-tecnolog.ia.br atualizado em ~1 min** ✅

---

## 📋 CHECKLIST FINAL

- [ ] GitHub repo criado e privado
- [ ] Supabase projeto criado
- [ ] `schema.sql` executado no SQL Editor
- [ ] Tabelas criadas (verifica em Data Editor)
- [ ] `.env.local` preenchido com credenciais
- [ ] `npm install` feito
- [ ] `npm run dev` rodando localmente
- [ ] Dados de teste inseridos
- [ ] Localhost:3000 carrega corretamente
- [ ] Vercel conectado ao GitHub
- [ ] Variáveis de ambiente adicionadas no Vercel
- [ ] Deploy inicial feito
- [ ] Domínio `mentoriaOS.nexus-tecnolog.ia.br` apontando para Vercel
- [ ] HTTPS ativo

---

## 🆘 TROUBLESHOOTING

### Problema: "Cannot find module @supabase/supabase-js"
**Solução**: `npm install` não foi feito ou falhou.
```bash
npm install
```

### Problema: "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Solução**: `.env.local` não foi criado ou está vazio.
```bash
# Verificar
cat .env.local

# Refazer
cp .env.local.example .env.local
# Editar manualmente
```

### Problema: "Analisa IA retorna 401"
**Solução**: `ANTHROPIC_API_KEY` está inválido ou vencido.
- Recriar em https://console.anthropic.com
- Atualizar no `.env.local` (local) e Vercel (prod)

### Problema: Dashboard vazio, sem mentorados
**Solução**: Sem dados no Supabase.
- Executar SQL de teste (veja ETAPA 4.4, Passo 4)
- Verificar RLS: deve permitir SELECT (auth)

### Problema: Deploy no Vercel "Build Failed"
**Solução**: Revisar logs:
1. Dashboard Vercel → **Deployments**
2. Clicar no deployment falhado
3. Ver **Build Logs**
4. Comum: variável de env ausente

---

## 📞 RESUMO DAS CREDENCIAIS

| Serviço | O quê | Onde |
|---------|-------|------|
| GitHub | Token/SSH | https://github.com/settings/tokens |
| Supabase | Project URL + Keys | Settings → API |
| Anthropic | API Key | https://console.anthropic.com |
| Vercel | Env Vars | Settings → Environment Variables |

---

## ✅ VOCÊ ESTÁ PRONTO

mentoriaOS está:
- ✅ **Código**: Pronto, estruturado, type-safe
- ✅ **Banco**: Schema SQL completo, RLS ativo
- ✅ **IA**: Integração Claude pronta
- ✅ **Deploy**: Vercel + domínio customizado
- ✅ **CI/CD**: Automático (git push = deploy)

**Próximas evoluções** (após verificar MVP):
- Integrar webhook automático (Supabase Functions)
- Dashboard para mentorado auto-submeter checkins
- Exportar pauta para PDF
- Stripe integration (Regra 5: Design Ético)

---

**Feito com** 🧠 GRATIDÃO | **Design**: Regra 3 | **Organização**: Regra 1 | **0→1**: Operacional
