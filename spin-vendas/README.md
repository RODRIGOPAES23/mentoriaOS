# SPIN Vendas — Vendedor IA do CKlareza

Agente de vendas consultivo baseado em **SPIN Selling** (Neil Rackham), separado do `mentoriaOS`.
Hoje roda como **chat web de teste**; o mesmo "cérebro" será plugado depois em WhatsApp e Instagram.

## Arquitetura (em camadas)

```
[ Canal ]            [ Cérebro SPIN ]         [ LLM ]
chat web (hoje)  →   /api/spin (route.ts)  →  OpenRouter (claude-sonnet-4.5)
WhatsApp (depois) ↗  lib/spin-prompt.ts
Instagram (depois)↗
```

O cérebro é agnóstico de canal: recebe `{ messages: [{role, content}] }` e devolve `{ reply }`.
Para plugar WhatsApp/IG, basta um adaptador que traduz o webhook do canal nesse formato.

## Rodar local

```bash
cd spin-vendas
npm install
cp .env.local.example .env.local   # e cole sua chave OpenRouter em ANTHROPIC_API_KEY
npm run dev                         # http://localhost:3100
```

## Onde está o roteiro de venda

Tudo em `lib/spin-prompt.ts`:
- `PRODUTO` — dados do CKlareza (dores, ganhos, prova). **Edite aqui** para ajustar a oferta.
- `SPIN_SYSTEM_PROMPT` — as regras do vendedor (S → P → I → N → próximo passo).

## Próximos passos (não feitos ainda — aguardando decisão)
- [ ] Persistir conversas/leads (Supabase) e ver no painel
- [ ] Adaptador WhatsApp (Meta Cloud API)
- [ ] Adaptador Instagram DM (Graph API + App Review)
- [ ] Captura de dados do lead (nome, contato) e handoff pra humano
