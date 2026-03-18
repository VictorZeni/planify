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

Esse schema já inclui:
- tabelas principais
- RLS
- `profiles.is_authorized` e `profiles.is_admin`
- trigger para criar profile automático no signup

## Fluxo de acesso

- Usuário sem login: redirecionado para `/auth`
- Usuário logado sem autorização: redirecionado para `/pagamento`
- Usuário admin: acesso também ao `/admin`

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

