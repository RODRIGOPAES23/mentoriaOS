# 🏭 Fábrica de Vendas NEXUS — Blueprint Completo

> **Regra de Ouro 3 — Design sobre Blueprint:** este documento é o canvas obrigatório.
> Nenhuma estação vira código antes de estar desenhada aqui.
>
> Projeto: `spin-vendas/` · Stack: Next.js 14 + OpenRouter (Gemini Flash) + Stripe + Supabase (futuro).
> Status atual: **Estação 4 (bot SPIN) + parte da 5 (persistência/painel) já construídas.**
> Decisões do Rodrigo (2026-06-09): motor **genérico/multiproduto**, persistência **JSON local por ora** (schema já desenhado p/ Supabase), começar pelo **plano escrito**.

---

## 0. Princípio fundador

> **Leads crus entram de um lado, clientes pagantes saem do outro.**
> Cada estação é automatizada; humano só onde dá lucro marginal.

A alavanca **NÃO é volume** — é **ICP certo × conversa boa**. 100 leads do nicho certo com bot SPIN afiado batem 10.000 frios (Regra 1 — Dominação de Nicho). A fábrica é **agressiva em eficiência, limpa em método**.

```
 ESTAÇÃO 1     ESTAÇÃO 2       ESTAÇÃO 3     ESTAÇÃO 4      ESTAÇÃO 5      ESTAÇÃO 6     ESTAÇÃO 7
 CAPTAÇÃO  →  ENRIQUECIMENTO → ABORDAGEM  →  CONVERSA   →  CRM/PIPELINE → FECHAMENTO →  PÓS/ANALYTICS
 (sourcing)   (score ICP)      (1º toque)    (SPIN ✅)     (kanban)       (Stripe)      (GRATIDÃO 0→1)
```

---

## 1. Motor genérico / multiproduto (decisão-chave)

A fábrica não é "do CKlareza". É um **motor configurável** que vende qualquer produto. Tudo que muda entre produtos vive num objeto de **Campanha**.

```ts
// lib/campanhas.ts  (uma campanha = um produto + um ICP + um roteiro)
export type Campanha = {
  id: string
  nome: string                    // "CKlareza - Mentores"
  produto: {
    nome: string
    oneLiner: string
    dores: string[]
    ganhos: string[]
    prova: string
    precoLabel: string            // "R$ 297/mês"
    checkoutUrl: string           // Stripe Payment Link
  }
  icp: {                          // Perfil de Cliente Ideal — alimenta o score
    descricao: string
    sinaisPositivos: string[]     // "tem alunos pagantes", "cobra recorrente"
    sinaisNegativos: string[]     // "hobby", "sem audiência"
  }
  spinPromptExtra?: string        // ajustes finos do roteiro p/ esse produto
  canais: ("web"|"whatsapp"|"instagram"|"email")[]
}
```

> Hoje o `lib/spin-prompt.ts` tem o produto hardcoded. **Refactor planejado:** o produto vira parâmetro vindo da Campanha. O bot, o score e a abordagem leem da mesma fonte. Trocar de produto = trocar de campanha, zero código novo.

---

## 2. Modelo de dados (CRM)

Desenhado já no formato Supabase (mesmo rodando em JSON agora — o `lib/store.ts` espelha isso).

```sql
-- LEADS: a entidade central da fábrica
create table leads (
  id            uuid primary key default gen_random_uuid(),
  campanha_id   text not null,
  -- identidade
  nome          text,
  whatsapp      text,
  email         text,
  instagram     text,
  empresa       text,
  -- origem
  fonte         text,            -- 'inbound' | 'google_places' | 'instagram' | 'manual'
  canal_entrada text,            -- 'web' | 'whatsapp' | 'instagram' | 'email'
  -- qualificação
  score_icp     int default 0,   -- 0..100 (Estação 2)
  estagio       text default 'novo',
                -- novo→contatado→qualificado→quente→demo→fechado→perdido
  motivo_perda  text,
  -- dados de negócio (genérico via JSON)
  enriquecimento jsonb,          -- {mentorados:12, ...} campos por campanha
  -- gestão
  responsavel   text,            -- humano dono do lead (null = bot)
  proxima_acao  text,
  proxima_acao_em timestamptz,
  criado_em     timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- CONVERSAS: histórico de cada interação (já existe em JSON)
create table conversas (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads(id),
  campanha_id text,
  canal       text,
  sinal_compra boolean default false,
  messages    jsonb,             -- [{role, content, em}]
  criado_em   timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- EVENTOS: trilha p/ analytics + GRATIDÃO 0→1
create table eventos (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads(id),
  tipo        text,              -- 'lead_criado'|'mudou_estagio'|'msg'|'checkout'|'pago'
  de          text, para text,   -- mudança de estágio
  metadata    jsonb,
  em          timestamptz default now()
);
```

**Estágios do pipeline (máquina de estados):**
`novo → contatado → qualificado → quente → demo → fechado` (ou `→ perdido` de qualquer ponto).
Transições disparadas por: resposta do bot, sinal de compra, clique no checkout, webhook de pagamento.

---

## 3. As 7 estações (especificação)

### Estação 1 — CAPTAÇÃO (sourcing)
Objetivo: **encher o topo do funil com lead que importa.**

| Fonte | Legal? | Como | Esforço |
|---|---|---|---|
| **Inbound** (isca + landing) | 🟢 | Form → `POST /api/leads` (fonte='inbound') | Médio |
| **Google Places API** | 🟢 | Busca negócios por nicho+região, dados públicos de contato | Médio |
| **Importação CSV** | 🟢 | Sobe lista que você já tem (opt-in) | Baixo |
| **Instagram (perfis públicos)** | 🟡 | Só com base legal + opt-out; **nunca disparo em massa** | Alto/risco |

> **Isca inbound recomendada:** "Calculadora de Churn da sua Mentoria" — o mentor coloca nº de alunos e ticket, recebe quanto perde por mês com churn. Captura e-mail/WhatsApp em troca do resultado. Lead que chega já sentindo a dor = entrada perfeita pro SPIN.

### Estação 2 — ENRIQUECIMENTO + SCORE ICP
Objetivo: **separar ouro de lixo automaticamente.**
- Agente LLM (Gemini Flash) recebe o lead + ICP da campanha → devolve `score 0–100` + justificativa.
- Score alto fura a fila; score baixo é arquivado (sem gastar abordagem).
- `POST /api/leads/:id/score` (interno, roda na criação do lead).

### Estação 3 — ABORDAGEM (primeiro toque)
Objetivo: **abrir conversa sem parecer robô nem spam.**
- Gera mensagem de abertura personalizada (nome + gancho do ICP) por canal.
- **Guardrail:** só dispara pra quem tem base legal (inbound/opt-in). Frio = só canais que permitem (e-mail B2B com opt-out, ou aguardar inbound).
- Entrega ao canal → vira `conversa` → entra no bot SPIN.

### Estação 4 — CONVERSA (bot SPIN) ✅ **JÁ CONSTRUÍDA**
- `POST /api/spin` conduz SPIN, fecha no sinal de compra, captura dados.
- Refactor pendente: ler `produto` da Campanha em vez de hardcode.

### Estação 5 — CRM / PIPELINE 🟡 **PARCIAL**
Objetivo: **enxergar e operar a fábrica inteira numa tela.**
- **Kanban** por estágio (já temos a base do painel `/admin`).
- Card mostra: nome, score 🔥, canal, última msg, próxima ação.
- Conversa do bot **move o card sozinho** (sinal de compra → coluna "quente").
- Ações manuais: arrastar estágio, atribuir responsável, marcar perdido c/ motivo.
- Filtros: por campanha, por estágio, por score, "só quentes".

### Estação 6 — FECHAMENTO
Objetivo: **transformar quente em pago.**
- Lead quente → bot/humano envia **Stripe Payment Link** (`checkoutUrl` da campanha).
- **Webhook Stripe** (`/api/webhooks/stripe`) → marca lead `fechado` + evento `pago`.
- Handoff humano opcional: botão "assumir" tira o lead do bot.

### Estação 7 — PÓS / ANALYTICS + GRATIDÃO
Objetivo: **medir a fábrica e fechar o loop 0→1.**
- Funil: entraram → qualificados → quentes → demos → **pagos**. Taxa por estágio.
- Métricas: conversão por canal, por campanha, tempo médio até fechar, CAC.
- Cada `pago` é o **"1"** da Lei da Fábrica → evento pro GRATIDÃO consolidar o workflow replicável.

---

## 4. Arquitetura de pastas (alvo)

```
spin-vendas/
├─ lib/
│  ├─ campanhas.ts        # motor multiproduto (NOVO)
│  ├─ spin-prompt.ts      # roteiro SPIN (refactor: lê da campanha)
│  ├─ store.ts            # persistência (JSON→Supabase) — leads/conversas/eventos
│  ├─ extract.ts          # captura estruturada do lead ✅
│  ├─ score.ts            # score ICP (NOVO — Estação 2)
│  └─ abordagem.ts        # geração do 1º toque (NOVO — Estação 3)
├─ app/
│  ├─ page.tsx            # chat web (lead) ✅
│  ├─ admin/
│  │  ├─ page.tsx         # kanban CRM (evolui do painel atual)
│  │  ├─ leads/[id]/      # ficha do lead + timeline
│  │  └─ campanhas/       # CRUD de campanhas (multiproduto)
│  ├─ isca/[slug]/        # landing das iscas (Estação 1)
│  └─ api/
│     ├─ spin/            # bot ✅
│     ├─ leads/           # CRUD + score
│     ├─ admin/           # dados do painel ✅ (evolui)
│     ├─ captacao/        # google places / csv (Estação 1)
│     └─ webhooks/stripe/ # fechamento (Estação 6)
└─ docs/
   └─ FABRICA_DE_VENDAS_BLUEPRINT.md  # este arquivo
```

---

## 5. Roadmap de construção (fases)

| Fase | Entrega | Estações | Depende de |
|---|---|---|---|
| **F0** ✅ | Bot SPIN + chat + painel + captura lead | 4, parte 5 | — |
| **F1** ✅ | Motor de Campanha (multiproduto) + refactor SPIN | base | — |
| **F2** ✅ | CRM Kanban real (estágios, mover card, ficha do lead) | 5 | F1 |
| **F3** ✅ | Captação inbound (isca calculadora + landing + form) | 1 | F1 |
| **F4** ✅ | Score ICP automático na entrada | 2 | F2 |
| **F5** ✅ | Fechamento Stripe + webhook + estágio 'fechado' | 6 | F2 |
| **F6** ✅ | Analytics/funil + eventos GRATIDÃO | 7 | F2,F5 |
| **F7a** ✅ | Supabase (tabela `fv_conversas`, store migrado, RLS on) | infra | tudo |
| **F7b** ✅ | Adaptadores de canal: WhatsApp + Instagram + Site embed (widget.js) | 3 | F7a |
| **F8** ✅ | Loop de aprendizado (playbook de vendas vencedoras, aprovação humana) | — | F7a |

> **Sequência recomendada:** F1 → F2 → F3 → F5 → F4 → F6 → F7.
>
> **Setup Stripe p/ produção (F5):** (1) criar Payment Link no Stripe e colar em `checkoutUrl` da campanha; (2) gerar o link com `?client_reference_id=<leadId>` p/ atribuição; (3) configurar webhook apontando p/ `/api/webhooks/stripe`; (4) **adicionar verificação de assinatura** com a lib `stripe` (`constructEvent` + `STRIPE_WEBHOOK_SECRET`) antes de ir ao ar.
> Racional: primeiro o esqueleto (campanha+CRM), depois enche de lead (inbound), depois fecha venda (Stripe) — assim você tem **dinheiro entrando** antes de investir em score e canais.

---

## 6. Guardrails de LGPD / Meta (não-negociável)

Alinhado à **Regra de Ouro 5 (Design Comportamental Ético)**:

1. **WhatsApp:** só opt-in. Nada de disparo em lote pra número frio → ban + multa. A fábrica converte quem levantou a mão.
2. **Instagram scraping:** viola ToS Meta; dado pessoal = LGPD. Se usar, só dado público + base legal + opt-out claro. Nunca "raspa 10k e dispara".
3. **Base legal + opt-out** em todo lead frio. Todo contato sai com forma de descadastro.
4. **Sem dark patterns:** nada de falsa escassez/pressão. Se o produto não serve, o bot diz.
5. **Dados criptografados, acesso auditado** (mesma régua do CKlareza).

> A fábrica é desenhada pra ser **defensável** — agressiva no método de qualificação/conversa, limpa na captação. É o que escala sem explodir.

---

## 7. Métricas que importam (o painel de comando)

- **Topo:** leads/dia por fonte · score médio
- **Meio:** taxa novo→quente · tempo médio no estágio
- **Fundo:** taxa quente→pago · CAC · ticket médio · **receita real (o "1")**
- **GRATIDÃO:** cada pago consolida o passo como workflow replicável (Lei da Fábrica 0→1).

---

## 8. Próxima decisão

Com o blueprint aprovado, a primeira pedra é **F1 — Motor de Campanha** (torna tudo multiproduto e destrava o resto). Aguardando "bora F1" do Rodrigo.
