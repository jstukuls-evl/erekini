# erekini

Latvijas tirgus SaaS e-rēķiniem un vieglai grāmatvedības sagatavošanai (B2B / B2G).

**Stack:** Next.js App Router · TypeScript · Tailwind CSS · Supabase (Auth + multi-tenant RLS)

## Setup

### 1. Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project
- Optional: [Supabase CLI](https://supabase.com/docs/guides/cli) for `supabase db push`

### 2. Install

```bash
npm install
cp .env.example .env.local
```

### 3. Configure environment

Fill `.env.local` (never commit real values):

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → `service_role` (server only) |
| `NEXT_PUBLIC_SITE_URL` | e.g. `http://localhost:3000` |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Resend dashboard (Phase 2) |
| `UR_OPEN_DATA_BASE_URL` | Chosen UR open-data base URL (Phase 1) |

### 4. Apply database schema + RLS

Migration source of truth:

```
supabase/migrations/00001_init.sql
```

**Option A — Supabase CLI**

```bash
# Link your project, then:
supabase db push
```

**Option B — SQL Editor**

1. Open Supabase Dashboard → SQL Editor
2. Paste and run `supabase/migrations/00001_init.sql`

This creates organizations, memberships, profiles, company profiles, customers, bank accounts, invoices / lines, public institution e-invoice addresses (seeded LV municipalities/agencies), plans/subscriptions stubs, LV VAT enums (`21/12/5/0/neapliekams`), and RLS so users only access orgs they belong to.

### 5. Auth providers

1. Supabase → Authentication → Providers → enable **Email**
2. Enable **Google** and set Client ID / Secret in the Supabase dashboard
3. Add redirect URL: `{NEXT_PUBLIC_SITE_URL}/auth/callback`

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## App map

| Path | Purpose |
|------|---------|
| `/` | Marketing landing (LV) |
| `/pricing` | Pricing |
| `/login`, `/signup` | Auth |
| `/auth/callback` | OAuth / magic-link exchange |
| `/dashboard` | Org-aware shell |
| `/invoices`, `/invoices/new` | Invoice list + editor skeleton |
| `/customers` | Counterparties + UR search combobox |
| `/institutions` | B2G address directory |
| `/settings` | Company rekvizīti / banks (stubs) |

## Phase notes / TODOs

- **UR open data:** `lib/ur/search.ts` + `GET /api/ur/search` return stubs until `UR_OPEN_DATA_BASE_URL` and a real client are wired.
- **EN 16931 XML:** `lib/einvoice/*` stubs only.
- **Resend:** `lib/email/resend.ts` + webhook route are stubs; need `RESEND_API_KEY`.
- **Types:** replace `lib/supabase/types.ts` with `supabase gen types typescript` when linked.

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```
