# CreditLens AI Agent Instructions

This document provides AI agents (Copilot, Claude, etc.) with comprehensive context for developing the CreditLens credit card management platform. **All agents working on this project must read this first.**

---

## Project Overview

**CreditLens** is a Next.js 14 credit card analytics platform with Supabase backend and live transaction ingestion via iPhone Shortcut. The app is already deployed at `credit-lens-six.vercel.app`.

### What Already Works
- Next.js 14 App Router scaffold
- Supabase Auth: login and register pages are functional
- Production-ready auth middleware (`middleware.ts`) — do not modify
- Database schema exists (`supabase/migrations/`)
- All required packages installed: Recharts, Lucide React, date-fns, shadcn/ui (base-nova style, neutral color)
- HTML prototypes in repo root: `creditlens-ui.html` and `creditlens-landing.html` (reference only, not part of the app)

### What Does NOT Exist Yet
- Dashboard, cards, budgets, transactions, analytics, statement, family, shortcut, settings pages
- Data-fetching hooks (`useCards`, `useTransactions`, etc.)
- Design system CSS variables translated to Tailwind
- Landing page as a Next.js route

**Build Status:** Phase 0 (Foundation) — ready to begin.

---

## Strategic Decision: Do NOT Convert HTML Line-by-Line

**The `.html` files are visual specifications, NOT source code to copy-paste.**

### ❌ Wrong Approach
- Copy HTML, paste into `.tsx`, fix JSX syntax errors, add `useState` everywhere
- Result: unmaintainable spaghetti with inline styles, CSS duplicates, no type safety, 500-line components

### ✅ Right Approach
- Use HTML as design reference — observe the visual hierarchy, colors, spacing
- Build proper React components from scratch that match it 1:1 visually
- Structure components correctly for Next.js App Router + Supabase
- Centralize all design system values in CSS variables

---

## Phase 0: Foundation (Do This First)

**CRITICAL:** Complete all foundation steps before touching any page. These are blockers for all subsequent phases.

### Step 1: Design System CSS Variables ✅ COMPLETED

**File:** `app/globals.css`

CSS custom properties have been defined in `:root` selector. The app uses dark theme by default. CreditLens design system is mapped to shadcn's HSL variable names:

- `--background: 9 9 13` (#09090d - main bg)
- `--foreground: 240 10% 95%` (#eeeef5 - text)
- `--primary: 249 92% 70%` (#7c6cfa - accent purple)
- `--card: 9 9 20` (#111116 - card surface)
- `--border: 240 7% 12%` (#1e1e27 - borders)
- `--muted: 240 5% 15%` (#18181f - muted bg)
- `--muted-foreground: 240 5% 60%` (#9090a8 - muted text)
- `--cl-green: #1fd8a4`
- `--cl-red: #f4566a`
- `--cl-amber: #f5a623`
- `--cl-blue: #4a9eff`

### Step 2: Fonts ✅ COMPLETED

**File:** `app/layout.tsx`

Fonts imported from `next/font/google`:
- `DM_Sans` with weight 400-700
- `DM_Mono` with weight 400, 500
- `Syne` with weight 400-700

Fonts applied via CSS variables with proper font-family assignments for headings and code.

### Step 3: Folder Structure ✅ COMPLETED

Complete app directory structure has been created:

```
app/
  (auth)/
    layout.tsx              ← centered auth layout
    login/page.tsx          ← existing login page
    register/page.tsx       ← existing register page
  (dashboard)/
    layout.tsx              ← sidebar + topbar shell (PRIORITY)
    page.tsx                ← dashboard home
    cards/
      page.tsx              ← cards list
      new/page.tsx          ← add card flow
    budgets/page.tsx
    transactions/page.tsx
    analytics/page.tsx
    livefeed/page.tsx
    statement/page.tsx
    family/page.tsx
    shortcut/page.tsx
    settings/page.tsx
  page.tsx                  ← landing page (public/unauthenticated)
  api/
    ingest/route.ts         ← iPhone Shortcut endpoint (existing)

components/
  layout/
    Sidebar.tsx             ← 'use client' navigation
    TopBar.tsx              ← 'use client' user menu + stats
    DashboardShell.tsx      ← grid wrapper for sidebar + content
  cards/
    CardWidget.tsx          ← visual credit card component
    CardGrid.tsx            ← responsive 2-column grid
    AddCardForm.tsx         ← form in shadcn Dialog
  transactions/
    TransactionTable.tsx    ← paginated table
    TransactionRow.tsx      ← single row
    CategoryBadge.tsx       ← category label with color
  dashboard/
    StatCard.tsx            ← KPI card (Available Credit, etc.)
    SpendChart.tsx          ← LineChart via Recharts
    DonutChart.tsx          ← PieChart with innerRadius
  shared/
    UtilizationBar.tsx      ← progress bar for credit %
    Modal.tsx               ← wrapper if custom modals needed
    EmptyState.tsx          ← no data state

lib/
  hooks/
    useCards.ts             ← fetch cards + subscribe (new)
    useTransactions.ts      ← fetch transactions with filters (new)
    useBudgets.ts           ← fetch budgets (new)
    useProfile.ts           ← fetch user profile (new)
  utils/
    currency.ts             ← formatLKR() function (new)
    categories.ts           ← CATEGORY_CONFIG + inferCategory() (existing)
    dates.ts                ← date helpers (new)
```

---

## Phase 1: The Dashboard Shell (Most Critical - NEXT STEP)

The entire app lives inside `app/(dashboard)/layout.tsx`. This is the sidebar + topbar wrapper that all dashboard pages inherit.

### `app/(dashboard)/layout.tsx` — Server Component

```typescript
// This is a Server Component
// 1. Check auth via server client
// 2. Redirect to /login if not authenticated  
// 3. Pass user to DashboardShell client component

import { redirect } from 'next/navigation';
import { createServerClient } from '@lib/supabase/server';
import { DashboardShell } from '@components/layout/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
```

### `components/layout/DashboardShell.tsx` — Client Component

```typescript
// 'use client' - uses usePathname() for active nav item detection

import { DashboardSidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface DashboardShellProps {
  user: User;
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="grid grid-cols-[220px_1fr] h-screen overflow-hidden bg-background">
      <DashboardSidebar user={user} />
      <div className="flex flex-col overflow-hidden">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
```

### `components/layout/Sidebar.tsx` — Client Component

```typescript
// 'use client'
// Navigation items MUST use <Link href="..."> not <a>
// Active detection via usePathname() comparing current path to item href
// Active state: bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] + left border indicator

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/' },
  { label: 'Cards', href: '/cards' },
  { label: 'Budgets', href: '/budgets' },
  { label: 'Transactions', href: '/transactions' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Live Feed', href: '/livefeed' },
  { label: 'Statement', href: '/statement' },
  { label: 'Family', href: '/family' },
  { label: 'Shortcut Helper', href: '/shortcut' },
];

// Bottom items: Settings + Sign Out
// Sign Out: call supabase.auth.signOut() then router.push('/login')
```

---

## Phase 2: The Data Layer (Do This Before Pages)

**This is where most AI agents fail.** Do NOT inline data fetching into pages. Build hooks first.

### `lib/hooks/useCards.ts`

```typescript
// Custom React hook for fetching cards
// Returns { cards, loading, error, refetch }

// On mount:
// 1. Fetch SELECT * FROM credit_cards WHERE user_id = auth.uid()
// 2. Enrich cards with computed fields:
//    - available_credit = credit_limit - current_balance
//    - utilization_pct = Math.round((current_balance / credit_limit) * 100)
// 3. Subscribe to Supabase Realtime on credit_cards table for the current user
//    This ensures UI updates live when iPhone Shortcut sends transaction
```

### `lib/hooks/useTransactions.ts`

```typescript
// Options: { cardId?: string, period?: string, limit?: number, offset?: number }
// Fetch from transactions table with filters applied
// Returns { transactions, loading, error, totalCount, refetch }
```

### `lib/hooks/useBudgets.ts`

```typescript
// Fetch user's budgets with current period spend
// Returns { budgets, loading, error, refetch }
```

### `lib/hooks/useProfile.ts`

```typescript
// Fetch user's profile from profiles table
// Returns { profile, loading, error }
```

### `lib/utils/currency.ts`

```typescript
export function formatLKR(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
  }).format(amount);
}
```

---

## Phase 3: Build Pages in This Order

**Strict order:** Each phase depends on previous phases completing.

### 1. Dashboard Page (`app/(dashboard)/page.tsx`)

Server Component. Fetch user's cards and recent transactions server-side. Pass as props to client components.

**Layout (match `creditlens-ui.html` exactly):**
1. Page header: Greeting text + 2 CTA buttons (Add Card, Add Transaction)
2. 4-column StatCard grid: Available Credit (green), Monthly Spend (amber), Daily Avg (blue), Total Outstanding (red)
3. 60/40 grid: TransactionTable (left) | DonutChart + mini card list (right)
4. SpendChart full-width below

### 2. Cards Page (`app/(dashboard)/cards/page.tsx`)

Client Component using `useCards()` hook.

**Layout:**
1. 2-column CardGrid
2. Each card: CardWidget + stat breakdown + action buttons
3. Comparison table below grid
4. `+` add card tile at end opens AddCardForm modal

### 3. Transactions Page — filter controls (search, category, card, date range)

### 4. Statement Page — server-rendered, calculate period balances

### 5-9. Budgets, Analytics, Family, Shortcut Helper, Settings — in that order

---

## Phase 4: Landing Page

**File:** `app/page.tsx` (new) — replaces stub

**Auth check:** If user authenticated → redirect to `/dashboard`. If not → show landing.

**Content:** Convert `creditlens-landing.html` to Next.js. Sections:
- Hero
- Features
- How It Works
- Platform
- Pricing
- CTA
- Footer

**Links:** Replace all `<a href="#">` with `<Link href="/register">`.

**Styling:** Translate CSS from HTML → Tailwind utilities + existing CSS variables. Animated grid background, orbs, noise overlay can remain as inline styles or CSS classes.

---

## Phase 5: Auth Pages

**Files:** `app/(auth)/layout.tsx` (new), update `login/page.tsx` and `register/page.tsx`

**Styling:** Restyle to match dark theme. Layout centered with logo, form card uses `--bg2` surface, `--border` border, `border-radius: 12px`.

**Logic:** Keep existing Supabase auth (`signInWithPassword`, `signUp`) — only change visuals.

---

## Phase 6: Ingest API Route

**File:** `app/api/ingest/route.ts` (new)

This is the iPhone Shortcut endpoint. Exact spec in build strategy (validates API key, finds card, infers category, inserts transaction, triggers budget alerts). Implementation follows build specification document exactly.

---

## Critical Architecture Rules

**These are non-negotiable. Break these and the app breaks.**

### 1. Server vs Client Components

| Type | When | Usage |
|------|------|-------|
| Server Component | Data fetching, no user interaction | `app/(dashboard)/page.tsx`, layout.tsx |
| Client Component | User clicks, form inputs, modals, state | `Sidebar`, `TopBar`, charts, forms |

**Rule:** Do NOT add `'use client'` to page files unless they need it. Prefer passing server-fetched data as props to client components. This is critical for performance.

### 2. Supabase Clients — NOT Interchangeable

```typescript
// ✅ Server-only (Server Components, Route Handlers, middleware)
import { createServerClient } from '@supabase/ssr';

// ✅ Client-only ('use client' components)
import { createBrowserClient } from '@supabase/ssr';

// ❌ NEVER import server client into 'use client' component → BUILD ERROR
```

### 3. Design System — Use CSS Variables, Not Hex Colors

**❌ Wrong:**
```typescript
<div className="bg-[#7c6cfa] text-[#1fd8a4]">
```

**✅ Right:**
```typescript
<div className="bg-[hsl(var(--primary))] text-[var(--cl-green)]">
```

The design system is centralized in `globals.css`. Components reference it via CSS variable syntax. This ensures:
- Single source of truth for colors
- Easy future theme changes
- Type-safe (no color name typos)

Shadow colors, backgrounds, borders — all use `--*` variables.

### 4. Tailwind Config — Do NOT Replace

The existing `tailwind.config.ts` uses shadcn's HSL variable pattern. It is correct. Do NOT modify additions. Add ONLY the four custom colors if extending:

```typescript
  '--cl-green': 'hsl(160 76% 56%)', // #1fd8a4
  '--cl-red': 'hsl(357 97% 70%)',   // #f4566a
  '--cl-amber': 'hsl(39 100% 51%)',  // #f5a623
  '--cl-blue': 'hsl(213 100% 61%)',  // #4a9eff
```

### 5. Charts (Recharts)

Recharts is already installed. Charts must be in `'use client'` components — Recharts doesn't work server-side.

```typescript
'use client';
import { LineChart, ResponsiveContainer } from 'recharts';

interface SpendChartProps {
  data: { month: string; amount: number }[];
}

export function SpendChart({ data }: SpendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        {/* chart config */}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### 6. Modals

Use shadcn `Dialog` for all modals. Do NOT build custom modal logic.

```bash
npx shadcn add dialog
```

Example:
```typescript
'use client';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export function AddCardModal() {
  return (
    <Dialog>
      <DialogTrigger>Add Card</DialogTrigger>
      <DialogContent>
        <AddCardForm />
      </DialogContent>
    </Dialog>
  );
}
```

### 7. Reusable Component Contract

Build these as reusable, accept props for customization:

| Component | Reusable | Props |
|-----------|----------|-------|
| StatCard | Yes | `label`, `value`, `meta`, `color` ('green'\|'amber'\|'blue'\|'red') |
| CardWidget | Yes | `card: CreditCard` |
| TransactionTable | Yes | `transactions: Transaction[]`, `onRowClick?: (tx) => void` |
| CategoryBadge | Yes | `category: string` |
| UtilizationBar | Yes | `pct: number`, `size?: 'sm'\|'md'\|'lg'` |
| SpendChart | Yes | `data: { month: string; amount: number }[]` |
| DonutChart | Yes | `data: { category: string; amount: number }[]` |
| Sidebar | Not reusable | Page-specific nav structure |
| Page layouts | Not reusable | Each page is unique |

### 8. Type Safety

**File:** `types/index.ts` — define all Supabase row types

```typescript
export interface CreditCard {
  id: string;
  user_id: string;
  card_name: string;
  issuer: string;
  last_four: string;
  credit_limit: number;
  current_balance: number;
  due_date: string;
  card_type: 'credit' | 'debit';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  card_id: string;
  merchant: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
}

// ... add more types as phases progress
```

---

## Critical Do's and Don'ts

### ✅ DO
- Use CSS variables for all colors/spacing
- Check auth in Server Components before rendering
- Subscribe to Supabase Realtime for live updates
- Pass data as props from server to client components
- Use `<Link>` for navigation (next/link), not `<a>`
- Type your Supabase queries (use `types/index.ts`)
- Use hooks for data fetching (centralized in `lib/hooks/`)
- Run `next lint` regularly

### ❌ DON'T
- Hardcode hex colors anywhere
- Inline data fetching into every page
- Put `'use client'` on pages unnecessarily
- Import server client into client components
- Build custom modals when shadcn Dialog exists
- Replace `tailwind.config.ts`
- Use `<img>` without `next/image`
- Modify `middleware.ts` (it's production-ready)

---

## Testing Workflow

After each phase completes:

1. **Lint:** `npm run lint` → zero errors
2. **Visual:** Open `http://localhost:3000` → matches `creditlens-ui.html` design
3. **Auth:** Log out → redirects to `/login`. Log in → dashboard loads
4. **Real-time:** Open two browser tabs. Add transaction in one → appears in other instantly (Realtime working)
5. **Build:** `npm run build` → zero errors, `next start` runs
6. **Deploy:** Push to GitHub → vercel.app auto-deploys, passing

---

## Reference: Mock Data Shapes

The HTML prototypes contain mock data arrays that define the exact shape of data from Supabase:

- `CARDS` array in HTML → matches `CreditCard` type
- `TRANSACTIONS` array in HTML → matches `Transaction` type
- `BUDGETS` array in HTML → matches `Budget` type
- `CATEGORIES` array in HTML → matches `CATEGORY_CONFIG` in code

Use these as reference when querying Supabase.

---

## Cleanup After Implementation

Once all pages and components are built and match the HTML prototypes 1:1 visually:

1. Delete `creditlens-ui.html` from repo root
2. Delete `creditlens-landing.html` from repo root
3. Keep `CONTRIBUTING.md` or `ARCHITECTURE.md` if adding team docs
4. Update `README.md` with actual project description, not create-next-app template

These HTML files are reference-only. With the React app built, they become clutter.

---

## Quick Reference: Build Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build
npm run start     # Run production build locally
npm run lint      # TypeScript + ESLint checks

# Create UI components
npx shadcn add dialog                 # Add Dialog modal
npx shadcn add table                  # Add Table (if needed)
# (Other shadcn components as needed)
```

---

## Emergency Reference

**If auth is broken:** Check `middleware.ts` → it's production-ready, do not modify.

**If Supabase isn't updating:** Check Realtime subscriptions in `useCards` hook → ensure table and auth filters are correct.

**If design looks wrong:** Check `globals.css` for CSS variable definitions. All colors flow from there.

**If charts don't render:** Charts must be `'use client'` components. Check for missing directive.

**If build fails:** Run `npm run lint` → fix all TypeScript/ESLint errors. Do not ignore errors.

---

## References

- **Deployment:** https://credit-lens-six.vercel.app (already live)
- **HTML UI Prototype:** `creditlens-ui.html` in repo root — visual reference only
- **HTML Landing Prototype:** `creditlens-landing.html` in repo root — visual reference only
- **Supabase Docs:** https://supabase.io/docs
- **Next.js 14:** https://nextjs.org/docs/app
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com/
- **Recharts:** https://recharts.org/

---

**Last Updated:** April 9, 2026
**Status:** Phase 0 Foundation Complete - Ready for Phase 1
