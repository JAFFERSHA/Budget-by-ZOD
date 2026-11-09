# Budget-by-ZOD — project guide for Claude

Family budget tracker: income/expense transactions, monthly budgets per category, analytics charts and notifications.
Users belong to a family; the family's ADMIN manages members.

- Live: https://budget-by-zod.vercel.app (Vercel project `budget-by-zod`, auto-deploys on push to `main`)
- Skills: `/implement-ticket`, `/pr-review` (in `.claude/skills/`)

## Stack
- Next.js 14 (App Router) · React 18 · TypeScript · Tailwind 3 · react-hook-form + zod · TanStack Query · Recharts
- Prisma 5 (`lib/prisma.ts`), PostgreSQL (`public` schema). `DATABASE_URL` (pooled) + `DIRECT_URL` (direct) both required.
- Auth: NextAuth v5 beta (`lib/auth.ts` exports `auth`, `signIn`, `signOut`, `handlers`) — credentials (email+password, bcrypt) and Google OAuth; Prisma adapter.
- Email via nodemailer (`lib/email.ts`); in-app notifications (`lib/notifications.ts`).

## Layout
- `app/(auth)` login/register · `app/(dashboard)` dashboard, transactions, budget, analytics, notifications, settings
- `app/api/*` — auth, budgets, transactions, analytics, notifications, user
- `components/*` (charts, dashboard, layout, providers, transactions, ui) · `lib/*` · `types/*` · `prisma/schema.prisma`

## Auth & roles
- Roles: `ADMIN`, `MEMBER` (enum `Role`, default ADMIN). Data is scoped to the user's **family**.
- Every API route calls `await auth()` and must reject when there is no session; queries must filter by the session user's `familyId`/`userId` — never trust ids from the request body.
- Member-management actions are ADMIN-only.

## Commands & local setup
- Local DB: PostgreSQL `localhost:5432`, DB `budget_by_zod` (pgAdmin "Local PostgreSQL 18"). `.env` points there; production URLs only in `# CLOUD` comments / `.env.vercel` — **never use them**.
- Dev server: `npx next dev -p 3002`
- Schema change (no migrations folder — uses push): edit `prisma/schema.prisma` → `npm run db:push` (local) → `npx prisma generate`. List the production step for the owner.
- Google login locally needs `http://localhost:3002/api/auth/callback/google` as an authorised redirect in Google Cloud; otherwise test with email+password.

## Gates
1. `npx tsc --noEmit` — currently clean
2. Lint — **not configured** (`npm run lint` opens an interactive ESLint setup). Mark `SKIPPED (no ESLint config)`; don't set it up unasked.
3. `npm run build`
No automated test suite exists.

## Surfaces
Dashboard summary cards, transactions list/add/edit/delete, budgets per category, analytics charts, notifications,
settings (profile, family members), register/login, emails.

## Smoke flows
Register → login → add income + expense → dashboard totals update → set a budget → analytics shows it → notification on overspend.

## Gotchas
- Production DB moved from Supabase to Neon on 2026-11-09 and started empty (old data was lost).
- Amounts: keep currency math in integers/decimals consistently — check how existing code stores amounts before adding new fields.
