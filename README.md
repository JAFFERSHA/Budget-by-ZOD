# 💰 Budget by ZOD — Family Finance Tracker

A modern, full-stack personal finance tracker built with **Next.js 14**, designed for families and individuals to manage income, track expenses, set budgets, and get smart savings insights.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Dashboard** | Balance, income, expenses, savings rate at a glance |
| 💳 **Transactions** | Add, edit, delete credit/debit transactions with categories |
| 🎯 **Budget Planner** | Set monthly limits per category with visual progress bars |
| 📈 **Analytics** | Bar charts, pie charts, daily trend lines |
| 🔔 **Smart Alerts** | In-app + email alerts for budget exceeded & low balance |
| 💡 **CFO Insights** | Personalised savings suggestions based on your spending |
| 🔐 **Auth** | Email/password + Google OAuth |
| 📱 **Responsive** | Works on desktop, tablet, and mobile |

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router) — frontend + API in one
- **Database**: PostgreSQL via [Supabase](https://supabase.com)
- **ORM**: Prisma
- **Auth**: NextAuth.js v5 (Email + Google)
- **Validation**: Zod
- **UI**: Tailwind CSS + Recharts
- **Email**: Resend
- **Deploy**: Vercel

---

## 🚀 Quick Start

### 1. Clone & install
```bash
git clone https://github.com/JAFFERSHA/budget-by-zod.git
cd budget-by-zod
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```
Fill in all values (see guide below).

### 3. Push database schema
```bash
npx prisma db push
```

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables Guide

### Supabase (Database) — Free
1. Go to [supabase.com](https://supabase.com) → New project
2. Settings → Database → Connection string (URI mode)
3. Copy **Transaction pooler** URL → `DATABASE_URL`
4. Copy **Session pooler** URL → `DIRECT_URL`

### NextAuth Secret
```bash
openssl rand -base64 32
```

### Google OAuth — Free
1. [console.cloud.google.com](https://console.cloud.google.com)
2. New project → APIs & Services → Credentials → OAuth 2.0 Client ID
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourdomain.vercel.app/api/auth/callback/google` (prod)

### Resend (Email) — Free (3,000 emails/month)
1. [resend.com](https://resend.com) → Sign up → API Keys → Create key
2. Paste as `RESEND_API_KEY`

---

## 🌐 Deploy to Vercel

1. Push code to GitHub (already done)
2. [vercel.com](https://vercel.com) → Import repository
3. Add all environment variables from `.env.example`
4. Deploy — Vercel auto-deploys on every push to `main`

After first deploy, run:
```bash
npx prisma db push
```

---

## 📂 Project Structure

```
app/
├── (auth)/         → Login, Register pages
├── (dashboard)/    → All protected dashboard pages
│   ├── dashboard/  → Main overview
│   ├── transactions/
│   ├── budget/
│   ├── analytics/
│   ├── notifications/
│   └── settings/
└── api/            → All API route handlers

components/
├── charts/         → Recharts components
├── dashboard/      → Dashboard widgets
├── layout/         → Sidebar, Header, MobileNav
├── transactions/   → Transaction form & list
└── ui/             → Button, Card, Input, Modal, etc.

lib/
├── auth.ts         → NextAuth config
├── email.ts        → Resend email templates
├── notifications.ts→ Alert logic
├── prisma.ts       → Prisma client
├── utils.ts        → Helpers, categories, suggestions
└── validations.ts  → Zod schemas

prisma/
└── schema.prisma   → Database schema
```

---

## 📱 Coming Soon
- React Native mobile app (iOS & Android)
- CSV export
- Family member invites
- Recurring transactions

---

Built with ❤️ as a full-stack CFO-grade finance tool.
