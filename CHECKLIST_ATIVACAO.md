# ✅ CHECKLIST DE ATIVAÇÃO — mentoriaOS

**Tempo total estimado**: 10-15 minutos  
**Data de início**: 2026-05-28  
**Status**: 🟡 Aguardando ativação do banco

---

## 🎯 FASE 1: SETUP DO BANCO DE DADOS (5 minutos)

### ✋ PASSO 1: Executar Schema SQL no Supabase

- [ ] **1a.** Abrir link (clique aqui): 
  > **[🔗 Supabase SQL Editor](https://app.supabase.com/project/pywjcpsklvgpadxgotpn/sql/new)**

- [ ] **1b.** Você vê uma tela com:
  - Input branco vazio para código SQL
  - Botão **[New Query]** no topo
  - Botão **[Run]** verde ao lado

- [ ] **1c.** Copie TODO o arquivo `schema.sql`:
  ```
  📍 Localização: C:\Users\rodri\Desktop\Projetos\NEXUS\mentoriaOS\schema.sql
  ```
  **Tamanho**: ~9.3 KB
  
- [ ] **1d.** Cole todo o SQL no editor Supabase (Ctrl+A no editor → Ctrl+V)

- [ ] **1e.** Clique no botão **[Run]** (verde) ou pressione **Ctrl+Enter**

- [ ] **1f.** Aguarde até ver uma mensagem:
  ```
  ✅ Successfully executed 10 statements
  ```
  (ou similar indicando sucesso)

- [ ] **1g.** Você verá 3 abas no topo:
  - `mentorados` (tabela)
  - `checkins` (tabela)
  - `analises_ia` (tabela)

✅ **SUCESSO**: Schema criado!

---

### ✋ PASSO 2: Inserir Dados de Teste (2 minutos)

- [ ] **2a.** Abrir terminal/PowerShell

- [ ] **2b.** Navegar para o projeto:
  ```bash
  cd C:\Users\rodri\Desktop\Projetos\NEXUS\mentoriaOS
  ```

- [ ] **2c.** Verificar que existe o arquivo:
  ```bash
  ls insert_mentorados.sh
  ```
  **Esperado**: Mostra o arquivo

- [ ] **2d.** Executar o script:
  ```bash
  bash insert_mentorados.sh
  ```

- [ ] **2e.** Aguarde até ver algo como:
  ```
  Tentando inserir mentorados...
  [
    {"id":"...", "nome":"João Silva", ...},
    {"id":"...", "nome":"Maria Santos", ...},
    ...
  ]
  ```

- [ ] **2f.** Contar: 5 mentorados inseridos ✅

✅ **SUCESSO**: Dados populados!

---

### ✋ PASSO 3: Verificar Banco de Dados (1 minuto)

- [ ] **3a.** Voltar para Supabase (aba aberta anteriormente)

- [ ] **3b.** Clicar na aba **[mentorados]** (tabela)

- [ ] **3c.** Você vê:
  ```
  id | nome | nicho | data_inicio | status | ... (colunas)
  ---|------|-------|-------------|--------|----
  [5 linhas com dados dos mentorados]
  ```

✅ **SUCESSO**: Banco de dados VIVO!

---

## 🌐 FASE 2: TESTAR APLICAÇÃO (3 minutos)

### ✋ PASSO 4: Acessar Dashboard

- [ ] **4a.** Abrir navegador em:
  > **[🔗 https://mentoriaos.vercel.app](https://mentoriaos.vercel.app)**

- [ ] **4b.** Página carrega (pode demorar ~3-5 segundos na primeira vez)

- [ ] **4c.** Você vê:
  ```
  ┌─────────────────────────────────────┐
  │ 🎓 mentoriaOS                       │ (logo + subtitle)
  │ Sistema Operacional de Mentoria     │
  └─────────────────────────────────────┘
  
  Selecionar Mentorado
  [Dropdown ▼]  ← clique aqui
  ```

- [ ] **4d.** Clicar no dropdown

- [ ] **4e.** Aparecem 5 nomes:
  - João Silva
  - Maria Santos
  - Carlos Oliveira
  - Ana Costa
  - Bruno Ferreira

✅ **SUCESSO**: Dropdown funcionando!

---

### ✋ PASSO 5: Selecionar Mentorado

- [ ] **5a.** Clicar em qualquer mentorado (ex: "João Silva")

- [ ] **5b.** Página recarrega com dados:
  ```
  ┌─────────────────────────────────────┐
  │ Nicho: SaaS B2B                     │
  │ Foco Macro: Crescimento de Receita  │
  │ Status: Ativo (verde)               │
  └─────────────────────────────────────┘
  
  Métricas (Últimas 4 semanas)
  [Cards com: Vendas, Leads, Tráfego, Vídeos]
  ❌ Sem dados de checkin
  
  Análise da IA
  ❌ Nenhuma análise disponível
  ```

✅ **SUCESSO**: Dashboard carregando!

---

## 🎉 FASE 3: VALIDAÇÃO FINAL (1 minuto)

- [ ] **6a.** Todos os 5 mentorados podem ser selecionados
- [ ] **6b.** Cada mentorado mostra seus dados corretos
- [ ] **6c.** Não há erros vermelhos (F12 → Console)
- [ ] **6d.** Aplicação responde rápido (<2s por ação)

---

## 🎊 CONCLUSÃO

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ✅ MENTORIAOS ATIVADO E OPERACIONAL!               │
│                                                      │
│  ✓ Backend: Vercel (Next.js)                        │
│  ✓ Frontend: React 18 + Tailwind                    │
│  ✓ Database: Supabase PostgreSQL                    │
│  ✓ IA: Claude 3.5 Sonnet via OpenRouter            │
│  ✓ MCP: Supabase integrado                          │
│                                                      │
│  Status: 🟢 PRONTO PARA USAR                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📝 NOTAS IMPORTANTES

### Se algo não funcionar

**Erro**: "Cannot connect to Supabase"
→ Verifica `.env.local` tem URLs e chaves corretas

**Erro**: "Table mentorados not found"
→ Schema SQL não foi executado no passo 1a-1f

**Erro**: "No mentorados in dropdown"
→ insert_mentorados.sh não rodou ou falhou

**Erro**: Página branca em mentoriaos.vercel.app
→ F12 → Console → procura mensagem vermelha → screenshot + envie

---

## 🚀 PRÓXIMOS PASSOS (Opcional)

Quando tudo estiver funcionando, você pode:

1. **Submeter um checkin** (próxima fase - exige API endpoint)
2. **Configurar custom domain** (mentoriaOS.nexus.tecnolog.ia.br)
3. **Adicionar autenticação** (Google OAuth via Supabase Auth)
4. **Criar webhook** para análise automática

---

## 📞 RESUMO RÁPIDO

| O Quê | Comando/Link | Tempo |
|-------|--------------|-------|
| **Executar Schema** | [Supabase SQL Editor](https://app.supabase.com/project/pywjcpsklvgpadxgotpn/sql/new) → Cole schema.sql → Run | 2 min |
| **Inserir Dados** | `bash insert_mentorados.sh` | 1 min |
| **Testar App** | [https://mentoriaos.vercel.app](https://mentoriaos.vercel.app) | 2 min |
| **TOTAL** | | **5 min** |

---

**Começar agora?** ⬇️

1. ✋ [Abrir Supabase SQL Editor](https://app.supabase.com/project/pywjcpsklvgpadxgotpn/sql/new)
2. 📋 Copiar `schema.sql`
3. ▶️ Clicar [Run]
4. ⏳ Aguardar ✅
5. 🎉 Próximo passo!

---

*Checklist de Ativação v1.0 | 2026-05-28*
