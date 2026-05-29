# 🚀 Guia de Deployment - mentoriaOS Dashboard

## Status Atual
- ✅ **Código**: 100% pronto (componentes React/Next.js)
- ✅ **Ambiente**: Variáveis configuradas em `.env.local`
- ✅ **Design**: Dashboard completo com Tailwind CSS
- 🔗 **Deploy**: Pronto para Vercel ou auto-hospedagem

---

## Opção 1: Deploy para Vercel (RECOMENDADO - 2 minutos)

### Passo 1: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Passo 2: Login no Vercel
```bash
vercel login
```

### Passo 3: Deploy Automático
```bash
cd C:\Users\rodri\Desktop\Projetos\NEXUS\mentoriaOS
vercel deploy --prod
```

### Passo 4: Configurar Domínio Customizado
Após deploy, ir para Vercel Dashboard → Project Settings → Domains
- Remover domínio padrão (mentoriaos.vercel.app)
- Adicionar: `mentoriaOS.nexus.tecnolog.ia.br`
- Seguir instruções de DNS (CNAME record)

**URL Final**: https://mentoriaOS.nexus.tecnolog.ia.br

---

## Opção 2: Deploy Manual em VPS/Servidor Próprio

### Passo 1: Instalar Dependências
```bash
cd mentoriaOS
npm install
```

### Passo 2: Build Otimizado
```bash
npm run build
```

### Passo 3: Iniciar Production Server
```bash
npm run start
```

Server rodará em `http://localhost:3000`

### Passo 4: Configurar Nginx como Proxy Reverso
```nginx
server {
    listen 80;
    server_name mentoriaOS.nexus.tecnolog.ia.br;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Passo 5: SSL com Let's Encrypt
```bash
sudo certbot --nginx -d mentoriaOS.nexus.tecnolog.ia.br
```

---

## Variáveis de Ambiente (já configuradas)

```env
NEXT_PUBLIC_SUPABASE_URL=https://pywjcpsklvgpadxgotpn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<seu-service-role-key>
ANTHROPIC_API_KEY=<sua-openrouter-key>  # via openrouter.ai
NEXT_PUBLIC_APP_URL=https://mentoriaOS.nexus.tecnolog.ia.br
```

---

## Verificação Pré-Deploy

```bash
# 1. Verificar sintaxe TypeScript
npm run type-check

# 2. Build teste
npm run build

# 3. Verificar tamanho bundle
npm run build
# Verificar pasta .next/static

# 4. Listar componentes criados
ls -la components/dashboard/
# ✅ Navbar.tsx
# ✅ Sidebar.tsx
# ✅ MainContent.tsx
```

---

## Após Deploy: Testar Dashboard

### URL de Acesso
```
https://mentoriaOS.nexus.tecnolog.ia.br/dashboard-v2
```

### Funcionalidades a Verificar
- ✅ Navbar renderiza com logo e search
- ✅ Sidebar lista mentorados
- ✅ MainContent mostra métricas
- ✅ Dados fallback aparecem (se Supabase vazio)
- ✅ Seleção de mentorado funciona
- ✅ Responsive em mobile

---

## Troubleshooting

### Erro: "Missing Supabase environment variables"
**Solução**: Verificar se `.env.local` existe e tem valores:
```bash
cat .env.local | grep SUPABASE_URL
```

### Erro: "Cannot find module"
**Solução**: Reinstalar dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 3000 already in use"
**Solução**: 
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

---

## Monitoramento Pós-Deploy

### Métricas Recomendadas
- Performance: Vercel Analytics (automático)
- Uptime: Uptime Robot ou similar
- Logs: Vercel Logs ou servidor local

### URLs Úteis
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Console**: https://app.supabase.com
- **Analytics**: Vercel → Project → Analytics

---

## Próximos Passos

1. ✅ **Escolher método de deploy** (Vercel ou VPS)
2. ✅ **Executar deploy**
3. ✅ **Testar em produção**
4. ✅ **Configurar domínio**
5. ✅ **Ativar analytics**

---

## Suporte Rápido

**Dashboard Preview Estático**: `DASHBOARD_PREVIEW.html` (abre no navegador)

**Comandos Essenciais**:
```bash
npm run dev          # Dev mode local
npm run build        # Build production
npm run start        # Run production
npm run type-check   # Verificar tipos TypeScript
npm run lint         # Linter
```

---

**Status**: 🟢 Pronto para Deploy
**Última Atualização**: 2026-05-28
