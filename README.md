# Planify (Next.js + Supabase)

Aplicação SaaS de produtividade com autenticação, controle de acesso e painel admin.

## Stack

- Frontend e backend: Next.js (App Router + API Routes)
- Banco e auth: Supabase (PostgreSQL + RLS + Supabase Auth)
- Pagamento: Stripe Checkout + Webhook
- Deploy: Vercel

## Rodar local

1. Copie `.env.example` para `.env.local`
2. Preencha as variáveis
3. Execute:

```bash
npm install
npm run dev
```

## SQL (Supabase)

Execute o arquivo [`supabase/schema.sql`](../supabase/schema.sql) no SQL Editor do Supabase.
Depois execute também [`supabase/production-hardening.sql`](../supabase/production-hardening.sql) para índices e hardening incremental.

Esse schema já inclui:
- tabelas principais
- RLS
- `profiles.is_authorized` e `profiles.is_admin`
- trigger para criar profile automático no signup

## Fluxo de acesso

- Usuário sem login: redirecionado para `/auth`
- Usuário logado sem assinatura ativa: redirecionado para `/pagamento`
- Usuário admin: acesso também ao `/admin`
- Autorização padrão: somente por pagamento (Stripe webhook atualiza `billing_status` e `is_authorized`)

### Kiwify (página de vendas + checkout + entrega de acesso)

1. Defina `PAYMENT_PROVIDER=kiwify`.
2. Defina `NEXT_PUBLIC_CHECKOUT_URL` com o link de checkout da Kiwify.
3. Defina `KIWIFY_WEBHOOK_SECRET`.
4. Configure webhook na Kiwify para:
   - `POST https://SEU_DOMINIO/api/v1/kiwify/webhook`
5. Com pagamento aprovado, o webhook ativa:
   - `profiles.billing_status = active`
   - `profiles.is_authorized = true`
   - envia email de confirmação de compra
   - envia email com link para `/acesso` (redirecionamento para login)

### Emails transacionais (pós-compra)

Para enviar os dois emails pós-compra, configure:

- `SMTP_HOST` (ex.: `smtp.gmail.com`)
- `SMTP_PORT` (ex.: `465`)
- `SMTP_SECURE` (`true` para SSL)
- `SMTP_USER`
- `SMTP_PASS` (App Password do Gmail)
- `EMAIL_FROM`
- `EMAIL_REPLY_TO` (opcional)

### Modo somente pagantes

- `ALLOW_MANUAL_AUTHORIZATION=false` (padrão): painel admin não libera acesso manual.
- `ALLOW_LEGACY_MANUAL_AUTH=false` (padrão): `is_authorized` manual legado não concede acesso.
- Acesso real considera `billing_status` ativo (`active` ou `trialing`), com exceção de admin.

Proteção centralizada em [`src/middleware.ts`](./src/middleware.ts).

## Rotas novas

- `GET /api/v1/admin/users` lista usuários (admin)
- `PATCH /api/v1/admin/users/:id/authorization` libera/bloqueia usuário (admin)
- `POST /api/v1/billing/checkout` cria checkout Stripe
- `POST /api/v1/stripe/webhook` processa eventos Stripe

## Deploy Vercel

1. Suba o repositório no GitHub
2. Importe na Vercel
3. Configure variáveis de ambiente da `.env.example`
4. Deploy
5. No Stripe, configure webhook para:

```text
https://SEU_DOMINIO/api/v1/stripe/webhook
```

## Primeiro admin

No Supabase SQL Editor:

```sql
update public.profiles
set is_admin = true, is_authorized = true
where id = (
  select id from auth.users where email = 'seu-email@exemplo.com'
);
```

## Qualidade

- Testes unitários (Vitest): `npm run test:ci`
- Lint: `npm run lint`
- Build de produção: `npm run build`
- CI automático em GitHub Actions: [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)
