# 🚀 START HERE — mentoriaOS em 5 minutos

> **Você tem**: MVP completo (código 100% pronto)  
> **Você precisa fazer**: Setup (Supabase + Anthropic + Vercel)

---

## 📋 CHECKLIST RÁPIDO

- [ ] **Minuto 1-2**: Ler esta página
- [ ] **Minuto 2-3**: Abrir SETUP.md
- [ ] **Hoje (1-2h)**: Executar ETAPA 4.1 a 4.4 do SETUP.md
- [ ] **Amanhã (1h)**: Executar ETAPA 4.5 (Vercel deploy)
- [ ] **Result**: mentoriaOS.nexus-tecnolog.ia.br LIVE ✅

---

## 🎯 O QUE VOCÊ TEM

```
✅ Next.js 15 (App Router)
✅ React 18 + Tailwind CSS
✅ Supabase PostgreSQL schema (3 tabelas + RLS)
✅ Claude API integration
✅ Dashboard mentor (pronto para usar)
✅ Análises automáticas via IA
✅ Documentação completa
```

**NÃO PRECISA FAZER**:
- ❌ Escrever código (já está feito)
- ❌ Desenhar UI (já está pronto)
- ❌ Integrar IA (já está pronto)
- ❌ Configurar banco (SQL pronto, só executar)

---

## 🎬 PRÓXIMO: SETUP (Ordem Exata)

### 1️⃣ GITHUB (5 min)

```powershell
cd C:\Users\rodri\Desktop\Projetos\NEXUS\mentoriaOS

git init
git add .
git commit -m "Initial mentoriaOS commit"
```

Depois:
1. Abra https://github.com/new
2. Nome: `mentoriaOS`
3. Privado ✅
4. Crie (não inicialize com README)
5. Copie a URL (ex: https://github.com/seu-user/mentoriaOS.git)

```powershell
git remote add origin https://github.com/SEU_USER/mentoriaOS.git
git branch -M main
git push -u origin main
```

### 2️⃣ SUPABASE (30 min)

1. Abra https://supabase.com
2. **New Project**
   - Name: `mentoriaOS`
   - Region: São Paulo (br-sao-1)
   - Clique **Create**
3. Aguarde 2-3 min até ficar verde
4. Copie credenciais:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

5. No dashboard: **SQL Editor** → **New Query**
6. Copie TODO o conteúdo de `schema.sql`
7. Cole no editor do Supabase
8. Clique **RUN** ✅

### 3️⃣ ANTHROPIC (5 min)

1. Abra https://console.anthropic.com
2. **API Keys** (esquerda)
3. **Create Key** → Nome: `mentoriaOS-prod`
4. Copie: `sk-ant-v4-...`

### 4️⃣ LOCAL (15 min)

```powershell
# Copiar template
cp .env.local.example .env.local

# Editar (abra em notepad ou VSCode)
notepad .env.local
```

Cole as credenciais:
```
NEXT_PUBLIC_SUPABASE_URL=https://[ABC].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-v4-...
NODE_ENV=development
```

```powershell
npm install
npm run dev
```

Abra http://localhost:3000 ✅

### 5️⃣ VERCEL (30 min — amanhã)

1. Abra https://vercel.com
2. **New Project** → Connect GitHub → Select `mentoriaOS`
3. **Environment Variables** → Cole as 4 credenciais acima
4. **Deploy** ✅

Vercel cria URL automática (ex: `mentorioos-abc.vercel.app`)

### 6️⃣ DOMÍNIO (Depois)

1. No Vercel: **Settings** → **Domains** → Add `mentoriaOS.nexus-tecnolog.ia.br`
2. Siga instruções DNS
3. Aguarde 5-30 min
4. HTTPS automático ✅

---

## 💡 PRONTO?

Se você chegou até aqui:
- ✅ Você entende o projeto
- ✅ Você tem um checklist claro
- ✅ Você sabe o tempo (2-3h hoje + 1h amanhã)

**Próximo**: Abra [SETUP.md](SETUP.md) e siga passo-a-passo.

---

## ❓ TÊM DÚVIDAS?

| Pergunta | Resposta |
|----------|----------|
| **"Preciso saber code?"** | Não, código já está pronto. |
| **"Quanto custa?"** | ~R$ 100-300/mês infraestrutura. R$ 997/mês por mentorado = lucro. |
| **"Quanto tempo até LIVE?"** | ~4-6h (spread over 2 dias). |
| **"Posso rodar local sem Vercel?"** | Sim, `npm run dev` roda tudo. |
| **"Como faço meu primeiro checkin?"** | SQL no Supabase + POST /api/analyze-checkin. |
| **"Posso customizar?"** | Sim, código é seu (GitHub privado). |

---

## 📚 DOCUMENTAÇÃO ADICIONAL

| Arquivo | Quando ler |
|---------|-----------|
| [SETUP.md](SETUP.md) | Agora (passo-a-passo) |
| [README.md](README.md) | Depois (referência) |
| [INDEX.md](INDEX.md) | Depois (mapa visual) |
| [DELIVERY.md](DELIVERY.md) | Depois (resumo handoff) |

---

## ✅ SUCESSO = QUANDO?

✅ **MVP está pronto HOJE** quando:
- [ ] Dashboard carrega em localhost:3000
- [ ] Dados de teste aparecem
- [ ] Nenhum erro no console

✅ **MVP está LIVE amanhã** quando:
- [ ] Vercel deploy ativo
- [ ] Domínio respondendo HTTPS
- [ ] Dashboard acessível em mentoriaOS.nexus-tecnolog.ia.br

---

## 🎉 VAMOS LÁ!

Abre [SETUP.md](SETUP.md) agora e começamos.

**Tempo**: 2-3h total | **Resultado**: Sistema de mentoria automatizado live ✅

---

**Framework**: GRATIDÃO v1.0 | **Desenvolvido por**: Claude Code (Eng. Sênior) | **Data**: 2026-05-28
