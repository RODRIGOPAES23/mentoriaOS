# Sistema do Lead à Venda — Guia de Produção

Status: **Tracks A, B (dry-run) e C construídos e testados localmente.** Falta gerar
credenciais (Google/Meta) e publicar. Plano completo: `~/.claude/plans/encapsulated-forging-pike.md`.

## O que já funciona (testado local, porta 3100)
- **Dashboard** `/anuncios/admin/analytics` — funil SPIN + venda real Stripe + GRATIDÃO 0→1.
- **YouTube** `/anuncios/admin/distribuicao` — alvos + comentário IA anti-spam + cron 1/30min (dry-run sem token).
- **Instagram inbound** — webhook trata DM (SPIN), comentário com palavra-chave→DM+lead, e menção→lead.
- Tabelas Supabase: `oauth_tokens`, `distribuicao_targets`, `comments_log`.

---

## Passo 1 — Credenciais YouTube (Google Cloud)
1. console.cloud.google.com → criar projeto.
2. APIs & Services → Library → habilitar **YouTube Data API v3**.
3. OAuth consent screen → **External** → adicionar sua conta Google como **Test user** → escopo `.../auth/youtube.force-ssl`.
4. Credentials → Create credentials → OAuth client ID → **Web application**.
5. Authorized redirect URIs (os dois):
   - `http://localhost:3100/anuncios/api/oauth/youtube/callback`
   - `https://cklareza.com/anuncios/api/oauth/youtube/callback`
6. Copiar client_id/secret → env: `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REDIRECT_URI`, e definir `CRON_SECRET`.
7. Abrir `/anuncios/admin/distribuicao` → **Conectar YouTube** → consentir → token cai em `oauth_tokens`.

## Passo 2 — Credenciais Instagram (Meta)
1. developers.facebook.com → criar App → produtos **Instagram Graph API** + **Webhooks**.
2. Conectar Página do Facebook ↔ conta Instagram **Business/Creator**.
3. Permissões: `instagram_manage_messages`, `instagram_manage_comments`, `pages_manage_metadata`, `pages_read_engagement`.
4. Webhooks → Instagram → callback `https://cklareza.com/anuncios/api/webhooks/instagram`, Verify Token = valor de `INSTAGRAM_VERIFY_TOKEN`. Assinar campos: **messages, comments, mentions**.
5. Gerar **Page access token de longa duração** → env `INSTAGRAM_TOKEN`.
6. (opcional) ajustar `INSTAGRAM_KEYWORDS` e `INSTAGRAM_DM_LINK`.
7. App em modo dev: só testers disparam; submeter App Review p/ público.

## Passo 3 — Deploy
- **spin-vendas → Vercel** (mantém basePath `/anuncios`). Configurar todas as envs acima + Supabase + `ANTHROPIC_API_KEY` + `MPT_API_URL`.
- **mentoriaOS → Vercel** já existe. Definir `SPIN_VENDAS_ORIGIN` = URL pública do spin-vendas (substitui o fallback localhost:3100). O rewrite `/anuncios/:path*` já está no next.config.js.
- **MoneyPrinterTurbo → Railway** (Docker do `../moneyprinter`; NÃO roda em Vercel). Apontar `MPT_API_URL` para a URL do Railway.
- **Vercel Cron**: o `vercel.json` do spin-vendas já agenda `/api/cron/youtube` a cada 30 min. Garantir que `CRON_SECRET` está setado e que o cron envia o header (Vercel Cron manda automaticamente se o projeto tiver o secret) — ou usar `?secret=` para teste manual.
- **Stripe**: por último, trocar para chaves live (ver memória `cklareza-stripe-ativacao`).

## Verificação pós-deploy
- `/anuncios/admin/analytics` mostra dados reais (já cruzando Stripe).
- `/anuncios/admin/distribuicao` → status "YouTube conectado"; "Rodar agora" publica 1 comentário real num vídeo seu de teste.
- Comentar com palavra-chave num post do IG (como tester) → recebe DM + lead aparece no funil com fonte `instagram-dm`.

## Notas de segurança
- spin-vendas está FORA do git. Antes de qualquer commit/push: scan de segredos (`.env.local` tem chaves reais).
- `oauth_tokens` guarda o refresh do YouTube no Supabase (não em env) → o cron renova sozinho.
