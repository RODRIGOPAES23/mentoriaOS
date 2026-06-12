# 🚀 Go-Live — Fábrica de Vendas (spin-vendas)

Checklist pra colocar no ar. A fábrica (F0–F8) está pronta e o build de produção passa limpo.

---

## 1. Deploy na Vercel

### 1.1 Instalar e logar (uma vez)
```bash
npm i -g vercel
vercel login
```

### 1.2 Subir o projeto
```bash
cd spin-vendas
vercel            # primeira vez: cria o projeto (responda as perguntas)
vercel --prod     # publica em produção
```
> Next.js é autodetectado. Não precisa de `vercel.json`.

### 1.3 Variáveis de ambiente (Vercel → Project → Settings → Environment Variables)
Copie os valores do seu `.env.local`. **Obrigatórias** pra fábrica funcionar:

| Variável | Pra quê |
|---|---|
| `ANTHROPIC_API_KEY` | LLM via OpenRouter (cérebro do bot) |
| `NEXT_PUBLIC_SUPABASE_URL` | banco |
| `SUPABASE_SERVICE_ROLE_KEY` | store server-side (⚠️ secreta, nunca no client) |

**Stripe (item 3 — quando criar):**
| `STRIPE_SECRET_KEY` | conta Stripe |
| `STRIPE_WEBHOOK_SECRET` | verificação de assinatura do webhook |

**Meta (item 2 — amanhã):**
| `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp |
| `INSTAGRAM_VERIFY_TOKEN`, `INSTAGRAM_TOKEN` | Instagram |

> Depois de setar/alterar env vars, rode `vercel --prod` de novo (ou Redeploy) pra valer.

### 1.4 Pós-deploy — o que já fica no ar na hora
- **Chat do bot:** `https://SEU-DOMINIO/`
- **Isca calculadora:** `https://SEU-DOMINIO/isca/calculadora-churn`
- **CRM:** `https://SEU-DOMINIO/admin` · **Analytics:** `/admin/analytics` · **Aprendizado:** `/admin/aprendizado`
- **Widget pra qualquer site:** `<script src="https://SEU-DOMINIO/widget.js" async></script>`

> ⚠️ **Proteja o `/admin`** antes de divulgar — hoje é aberto. Mínimo: Vercel Password Protection no path, ou um gate por env (igual SUPERADMIN_KEY do CKlareza).

---

## 2. Stripe — fechar o ciclo de pagamento (item 3)
1. No Stripe: criar **Payment Link** do produto (ex: CKlareza R$297/mês).
2. Colar a URL em `produto.checkoutUrl` da campanha em `lib/campanhas.ts`.
3. Ao enviar o link a um lead, anexar a atribuição: `...?client_reference_id=<leadId>`.
4. Stripe → Developers → Webhooks → endpoint `https://SEU-DOMINIO/api/webhooks/stripe`, evento `checkout.session.completed`.
5. Copiar o **Signing secret** → `STRIPE_WEBHOOK_SECRET`, e a `STRIPE_SECRET_KEY` → Vercel.
6. Pronto: pagamento real marca o lead como `fechado`/pago e conta no GRATIDÃO 0→1.

---

## 3. WhatsApp + Instagram (item 2 — amanhã, com as creds)
Webhooks já prontos: `/api/webhooks/whatsapp` e `/api/webhooks/instagram`.
1. Meta → app → configurar webhook apontando pros endpoints acima.
2. Usar o mesmo `*_VERIFY_TOKEN` que você setou na Vercel (a verificação GET já trata).
3. Assinar os campos de mensagens (`messages` / `messaging`).
4. Colar `WHATSAPP_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID` e `INSTAGRAM_TOKEN` na Vercel.
5. Mandar uma DM de teste → o bot responde e o lead aparece no CRM (canal whatsapp/instagram).

---

## 4. Segurança RLS das 6 tabelas legadas (item 4) — APLICAR COM CUIDADO

✅ **VERIFICADO SEGURO (2026-06-09).** Auditei o código do CKlareza: todas as 6 tabelas são
acessadas **exclusivamente via service role** (`adminClient` / `SERVICE_ROLE_KEY`) em rotas
`/api/*` server-side — nunca via anon key no client. Trechos confirmados:
- `super_admins` → `app/api/me`, `app/auth/callback`, `lib/auth-guards` (todos `adminClient`)
- `gratidao_*` → `app/api/admin/gratidao`, `app/api/admin/analytics` (`adminClient`)
- `pagamentos_stripe` → `app/api/stripe/webhook` (`createClient` com `SERVICE_ROLE`)

Como service role **ignora RLS**, ligar RLS NÃO quebra o CKlareza. Mesmo assim, aplique
**uma tabela por vez testando o app** — é barato e é a prática segura.

### Policy proposta (tabelas internas → só servidor acessa)
Estratégia: ligar RLS e **não criar policy de leitura pública** = anon/authenticated bloqueados,
apenas o service role (servidor) acessa. Aplicar **uma de cada vez**, testando o CKlareza após cada.

```sql
-- Mais seguras primeiro (sem uso pelo app cliente):
alter table public._bkp_mentorados_20260603 enable row level security;  -- backup, ninguém lê via anon
alter table public.pagamentos_stripe        enable row level security;  -- 0 linhas, server-only

-- Testar o CKlareza. Se OK, seguir com as do GRATIDÃO/admin (verificar acesso antes!):
alter table public.gratidao_startups            enable row level security;
alter table public.gratidao_checklist           enable row level security;
alter table public.gratidao_memoria_aprendizado enable row level security;
alter table public.super_admins                 enable row level security;
```

> Se alguma tela do CKlareza parar de carregar após ligar RLS numa tabela, é porque ela
> era lida via anon key. Reverter com `alter table ... disable row level security;` e criar
> uma policy específica (ex: `create policy ... for select to authenticated using (true)`).

---

## Ordem recomendada amanhã
1. Deploy (passo 1) → site + isca + CRM no ar.
2. Proteger `/admin`.
3. Stripe (passo 2) → já consegue receber dinheiro.
4. Meta (passo 3) → liga WhatsApp/Instagram.
5. RLS (passo 4) → com calma, testando o CKlareza a cada tabela.
