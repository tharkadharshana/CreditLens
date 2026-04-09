# CreditLens — Full Build Specification
### Senior Engineer Blueprint for Antigravity + Gemini Flash
**Target Deployment: Vercel | Stack: Next.js 14 App Router + Supabase + Tailwind CSS**

---

## TABLE OF CONTENTS

1. Project Overview & Architecture
2. Tech Stack & Folder Structure
3. Database Schema (Supabase/PostgreSQL)
4. Authentication System
5. Core Data Models & Types
6. API Routes (Next.js App Router)
7. Frontend Pages & Components
8. iPhone Shortcuts Integration
9. Family Management System
10. UI/UX Design System
11. Environment Variables & Config
12. Deployment on Vercel
13. Critical Code Snippets
14. Feature Checklist

---

## 1. PROJECT OVERVIEW & ARCHITECTURE

**App Name:** CreditLens
**Tagline:** "Your complete credit command centre"

### What the App Does
CreditLens is a multi-user, multi-card credit management platform. Users add their credit cards manually, set limits, track transactions fed from iPhone Shortcuts (via a REST API endpoint), monitor real-time statement balances, set spending alerts, and manage family finances together under one roof.

### Architecture Overview
```
iPhone Shortcuts → POST /api/ingest (API key auth)
                       ↓
                  Supabase DB
                       ↓
             Next.js App (Vercel)
                       ↓
              User's Browser/PWA
```

### Core Pillars
- **Multi-card:** N cards per user, each fully independent
- **Multi-user (Family):** Households share cards/budgets
- **Shortcut-fed:** Transactions come from iPhone Shortcuts
- **Real-time:** Supabase Realtime for live balance updates
- **Statement-aware:** Billing cycle logic built in

---

## 2. TECH STACK & FOLDER STRUCTURE

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL + Realtime) |
| Auth | Supabase Auth (email/password + magic link) |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Icons | Lucide React |
| Deployment | Vercel |
| Notifications | Supabase Edge Functions (email alerts) |

### Folder Structure
```
creditlens/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← Sidebar + navbar
│   │   ├── page.tsx                ← Dashboard home
│   │   ├── cards/
│   │   │   ├── page.tsx            ← All cards overview
│   │   │   ├── [cardId]/page.tsx   ← Single card detail
│   │   │   └── new/page.tsx        ← Add new card
│   │   ├── transactions/
│   │   │   ├── page.tsx            ← All transactions
│   │   │   └── [txId]/page.tsx
│   │   ├── statement/
│   │   │   └── page.tsx            ← Current statement view
│   │   ├── budget/
│   │   │   └── page.tsx            ← Budget & limits
│   │   ├── family/
│   │   │   ├── page.tsx            ← Family management
│   │   │   └── invite/page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── reports/
│   │       └── page.tsx
│   └── api/
│       ├── ingest/route.ts         ← iPhone Shortcut endpoint
│       ├── cards/route.ts
│       ├── cards/[cardId]/route.ts
│       ├── transactions/route.ts
│       ├── family/route.ts
│       └── alerts/route.ts
├── components/
│   ├── ui/                         ← shadcn primitives
│   ├── cards/
│   │   ├── CardWidget.tsx
│   │   ├── CardList.tsx
│   │   ├── AddCardForm.tsx
│   │   └── CardSpendRing.tsx
│   ├── transactions/
│   │   ├── TransactionTable.tsx
│   │   ├── TransactionRow.tsx
│   │   └── CategoryBadge.tsx
│   ├── dashboard/
│   │   ├── SummaryBar.tsx
│   │   ├── SpendChart.tsx
│   │   ├── AlertBanner.tsx
│   │   └── StatementSnapshot.tsx
│   ├── family/
│   │   ├── MemberList.tsx
│   │   ├── InviteForm.tsx
│   │   └── PermissionBadge.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── TopBar.tsx
│       └── MobileNav.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← Browser client
│   │   ├── server.ts               ← Server client
│   │   └── middleware.ts
│   ├── utils/
│   │   ├── currency.ts
│   │   ├── dates.ts
│   │   ├── categories.ts
│   │   └── statement.ts            ← Billing cycle logic
│   └── hooks/
│       ├── useCards.ts
│       ├── useTransactions.ts
│       └── useFamily.ts
├── types/
│   └── index.ts
├── middleware.ts                   ← Auth guard
└── supabase/
    └── migrations/
        └── 001_initial.sql
```

---

## 3. DATABASE SCHEMA (Supabase/PostgreSQL)

Run these in order in the Supabase SQL editor.

### Migration: `001_initial.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- HOUSEHOLDS (family/group unit)
-- =============================================
CREATE TABLE households (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  owner_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =============================================
-- PROFILES (extends Supabase auth.users)
-- =============================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  household_id  UUID REFERENCES households(id) ON DELETE SET NULL,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
  api_key       TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  currency      TEXT NOT NULL DEFAULT 'LKR',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CREDIT CARDS
-- =============================================
CREATE TABLE credit_cards (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id      UUID REFERENCES households(id) ON DELETE SET NULL,

  -- Card identity
  card_name         TEXT NOT NULL,           -- e.g. "HSBC Platinum"
  card_nickname     TEXT,                    -- e.g. "Daily card"
  bank_name         TEXT NOT NULL,
  card_network      TEXT CHECK (card_network IN ('visa','mastercard','amex','unionpay','other')),
  last_four         TEXT CHECK (last_four ~ '^\d{4}$'),
  card_color        TEXT DEFAULT '#1a1a2e',  -- hex for UI display
  card_emoji        TEXT DEFAULT '💳',

  -- Financial limits
  credit_limit      NUMERIC(15,2) NOT NULL,

  -- Statement cycle
  statement_day     INT CHECK (statement_day BETWEEN 1 AND 31),   -- day of month statement closes
  due_day           INT CHECK (due_day BETWEEN 1 AND 31),          -- payment due day

  -- Current balances (these get updated via transactions + manual sync)
  opening_balance   NUMERIC(15,2) DEFAULT 0,   -- start of statement period
  current_balance   NUMERIC(15,2) DEFAULT 0,   -- live running balance
  minimum_payment   NUMERIC(15,2) DEFAULT 0,

  -- Rewards/features
  reward_type       TEXT DEFAULT 'none' CHECK (reward_type IN ('cashback','points','miles','none')),
  reward_rate       NUMERIC(5,2) DEFAULT 0,    -- % or points per unit spend

  -- Metadata
  is_active         BOOLEAN DEFAULT TRUE,
  is_shared         BOOLEAN DEFAULT FALSE,     -- visible to household members
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TRANSACTIONS
-- =============================================
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id         UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id    UUID REFERENCES households(id) ON DELETE SET NULL,

  -- Core fields
  amount          NUMERIC(15,2) NOT NULL,
  currency        TEXT DEFAULT 'LKR',
  description     TEXT NOT NULL,
  merchant        TEXT,
  category        TEXT DEFAULT 'other',

  -- Source
  source          TEXT DEFAULT 'manual' CHECK (source IN ('shortcut','sms','manual','import')),
  raw_message     TEXT,       -- original SMS/notification text

  -- Type
  tx_type         TEXT NOT NULL DEFAULT 'debit' CHECK (tx_type IN ('debit','credit','refund','fee','interest')),

  -- Dates
  tx_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  posted_date     DATE,
  statement_period TEXT,       -- "2025-03" format for grouping

  -- Status
  is_pending      BOOLEAN DEFAULT FALSE,
  is_recurring    BOOLEAN DEFAULT FALSE,

  -- Family attribution
  added_by        UUID REFERENCES auth.users(id),
  family_member   TEXT,        -- human-readable name if added by family

  -- Metadata
  tags            TEXT[],
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BUDGETS / SPENDING LIMITS
-- =============================================
CREATE TABLE budgets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id    UUID REFERENCES households(id) ON DELETE SET NULL,
  card_id         UUID REFERENCES credit_cards(id) ON DELETE CASCADE,

  category        TEXT NOT NULL,
  period          TEXT NOT NULL CHECK (period IN ('monthly','weekly','statement')),
  limit_amount    NUMERIC(15,2) NOT NULL,
  alert_at_pct    INT DEFAULT 80,    -- alert when X% of budget used

  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ALERTS / NOTIFICATIONS
-- =============================================
CREATE TABLE alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id         UUID REFERENCES credit_cards(id) ON DELETE SET NULL,

  alert_type      TEXT NOT NULL CHECK (alert_type IN (
                    'limit_near','payment_due','budget_exceeded',
                    'large_transaction','statement_ready','custom'
                  )),
  threshold       NUMERIC(15,2),
  message         TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  triggered_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- HOUSEHOLD MEMBERS JOIN TABLE
-- =============================================
CREATE TABLE household_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id    UUID REFERENCES households(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'member' CHECK (role IN ('admin','member','viewer')),
  invited_by      UUID REFERENCES auth.users(id),
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- =============================================
-- CARD ACCESS (which members can see which cards)
-- =============================================
CREATE TABLE card_access (
  card_id         UUID REFERENCES credit_cards(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  can_add_tx      BOOLEAN DEFAULT TRUE,
  can_view        BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (card_id, user_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_tx_date ON transactions(tx_date DESC);
CREATE INDEX idx_transactions_statement ON transactions(statement_period);
CREATE INDEX idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX idx_alerts_user_id ON alerts(user_id, is_read);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Profiles: own row only
CREATE POLICY "users_own_profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Credit cards: own cards + household shared cards
CREATE POLICY "cards_owner" ON credit_cards
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "cards_household" ON credit_cards
  FOR SELECT USING (
    is_shared = TRUE AND household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Transactions: own + household
CREATE POLICY "tx_owner" ON transactions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "tx_household" ON transactions
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Budgets: own
CREATE POLICY "budgets_owner" ON budgets
  FOR ALL USING (auth.uid() = user_id);

-- Alerts: own
CREATE POLICY "alerts_owner" ON alerts
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- TRIGGER: Auto-update card balance on insert
-- =============================================
CREATE OR REPLACE FUNCTION update_card_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tx_type = 'debit' OR NEW.tx_type = 'fee' OR NEW.tx_type = 'interest' THEN
    UPDATE credit_cards
    SET current_balance = current_balance + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.card_id;
  ELSIF NEW.tx_type = 'credit' OR NEW.tx_type = 'refund' THEN
    UPDATE credit_cards
    SET current_balance = current_balance - NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.card_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_card_balance
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_card_balance();

-- TRIGGER: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 4. AUTHENTICATION SYSTEM

Use Supabase Auth with:
- Email + Password signup/login
- Magic Link (passwordless)
- Session stored in cookies via `@supabase/ssr`

### `middleware.ts` (root level)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = !request.nextUrl.pathname.startsWith('/login') &&
                      !request.nextUrl.pathname.startsWith('/register') &&
                      !request.nextUrl.pathname.startsWith('/api/ingest')

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 5. CORE DATA TYPES

### `types/index.ts`

```typescript
export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'unionpay' | 'other'
export type TransactionType = 'debit' | 'credit' | 'refund' | 'fee' | 'interest'
export type TransactionSource = 'shortcut' | 'sms' | 'manual' | 'import'
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface CreditCard {
  id: string
  user_id: string
  household_id: string | null
  card_name: string
  card_nickname: string | null
  bank_name: string
  card_network: CardNetwork
  last_four: string
  card_color: string
  card_emoji: string
  credit_limit: number
  statement_day: number
  due_day: number
  opening_balance: number
  current_balance: number
  minimum_payment: number
  reward_type: string
  reward_rate: number
  is_active: boolean
  is_shared: boolean
  notes: string | null
  created_at: string
  updated_at: string
  // Computed fields
  available_credit?: number      // credit_limit - current_balance
  utilization_pct?: number       // (current_balance / credit_limit) * 100
  days_until_due?: number
  current_statement_spend?: number
}

export interface Transaction {
  id: string
  card_id: string
  user_id: string
  household_id: string | null
  amount: number
  currency: string
  description: string
  merchant: string | null
  category: string
  source: TransactionSource
  raw_message: string | null
  tx_type: TransactionType
  tx_date: string
  posted_date: string | null
  statement_period: string
  is_pending: boolean
  is_recurring: boolean
  added_by: string | null
  family_member: string | null
  tags: string[]
  notes: string | null
  created_at: string
}

export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  household_id: string | null
  role: UserRole
  api_key: string
  currency: string
  created_at: string
}

export interface Household {
  id: string
  name: string
  owner_id: string
  created_at: string
  members?: Profile[]
}

export interface Budget {
  id: string
  user_id: string
  card_id: string
  category: string
  period: 'monthly' | 'weekly' | 'statement'
  limit_amount: number
  alert_at_pct: number
  is_active: boolean
}

export interface Alert {
  id: string
  user_id: string
  card_id: string | null
  alert_type: string
  threshold: number | null
  message: string | null
  is_read: boolean
  triggered_at: string
}

// For the ingest API
export interface IngestPayload {
  api_key: string
  card_id: string
  amount: number
  description: string
  merchant?: string
  category?: string
  tx_type?: TransactionType
  tx_date?: string
  raw_message?: string
  currency?: string
  family_member?: string
}

// Statement period helper
export interface StatementSummary {
  period: string                  // "2025-03"
  total_spend: number
  total_credits: number
  transaction_count: number
  top_categories: { category: string; amount: number }[]
  daily_breakdown: { date: string; amount: number }[]
}
```

---

## 6. API ROUTES

### A. iPhone Shortcut Ingest Endpoint
**`app/api/ingest/route.ts`** — THIS IS THE MOST CRITICAL ENDPOINT

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { IngestPayload } from '@/types'
import { inferCategory } from '@/lib/utils/categories'
import { getCurrentStatementPeriod } from '@/lib/utils/statement'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Use service role to bypass RLS
)

export async function POST(request: NextRequest) {
  try {
    const body: IngestPayload = await request.json()

    // 1. Validate API key → get user
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, household_id')
      .eq('api_key', body.api_key)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // 2. Validate card belongs to user or household
    const { data: card } = await supabaseAdmin
      .from('credit_cards')
      .select('id, household_id, statement_day')
      .eq('id', body.card_id)
      .single()

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // 3. Auto-categorize if category not provided
    const category = body.category || inferCategory(body.description, body.merchant || '')

    // 4. Determine statement period
    const statementPeriod = getCurrentStatementPeriod(
      body.tx_date ? new Date(body.tx_date) : new Date(),
      card.statement_day
    )

    // 5. Insert transaction
    const { data: tx, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        card_id: body.card_id,
        user_id: profile.id,
        household_id: profile.household_id,
        amount: Math.abs(body.amount),
        currency: body.currency || 'LKR',
        description: body.description,
        merchant: body.merchant || null,
        category,
        source: 'shortcut',
        raw_message: body.raw_message || null,
        tx_type: body.tx_type || 'debit',
        tx_date: body.tx_date || new Date().toISOString().split('T')[0],
        statement_period: statementPeriod,
        family_member: body.family_member || null,
        added_by: profile.id,
      })
      .select()
      .single()

    if (txError) {
      return NextResponse.json({ error: txError.message }, { status: 500 })
    }

    // 6. Check for budget alerts (fire and forget)
    checkBudgetAlerts(profile.id, body.card_id, category, supabaseAdmin)

    return NextResponse.json({
      success: true,
      transaction_id: tx.id,
      message: `Transaction of ${body.amount} recorded successfully`
    }, { status: 201 })

  } catch (err) {
    console.error('Ingest error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function checkBudgetAlerts(
  userId: string, cardId: string, category: string, supabase: any
) {
  // Get active budgets for this category
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .eq('category', category)
    .eq('is_active', true)

  for (const budget of budgets || []) {
    // Calculate current spend in period
    const startDate = new Date()
    if (budget.period === 'monthly') startDate.setDate(1)
    if (budget.period === 'weekly') startDate.setDate(startDate.getDate() - 7)

    const { data: txSum } = await supabase
      .from('transactions')
      .select('amount')
      .eq('card_id', cardId)
      .eq('category', category)
      .eq('tx_type', 'debit')
      .gte('tx_date', startDate.toISOString().split('T')[0])

    const totalSpend = (txSum || []).reduce((sum: number, t: any) => sum + t.amount, 0)
    const pctUsed = (totalSpend / budget.limit_amount) * 100

    if (pctUsed >= budget.alert_at_pct) {
      await supabase.from('alerts').insert({
        user_id: userId,
        card_id: cardId,
        alert_type: pctUsed >= 100 ? 'budget_exceeded' : 'limit_near',
        threshold: budget.limit_amount,
        message: `${category} budget is ${Math.round(pctUsed)}% used (${totalSpend} / ${budget.limit_amount})`,
      })
    }
  }
}
```

### B. Cards API
**`app/api/cards/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: cards, error } = await supabase
    .from('credit_cards')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Compute derived fields
  const enriched = cards.map(card => ({
    ...card,
    available_credit: card.credit_limit - card.current_balance,
    utilization_pct: card.credit_limit > 0
      ? Math.round((card.current_balance / card.credit_limit) * 100)
      : 0,
  }))

  return NextResponse.json({ cards: enriched })
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data: card, error } = await supabase
    .from('credit_cards')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ card }, { status: 201 })
}
```

### C. Transactions API
**`app/api/transactions/route.ts`**

Supports query params: `?card_id=X&period=2025-03&category=food&limit=50&offset=0`

```typescript
export async function GET(request: NextRequest) {
  // ... auth setup same as above
  const { searchParams } = new URL(request.url)
  const cardId = searchParams.get('card_id')
  const period = searchParams.get('period')
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .order('tx_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (cardId) query = query.eq('card_id', cardId)
  if (period) query = query.eq('statement_period', period)
  if (category) query = query.eq('category', category)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ transactions: data, total: count })
}
```

---

## 7. FRONTEND PAGES & COMPONENTS

### A. Dashboard Page (`app/(dashboard)/page.tsx`)

The main dashboard shows:

**Top summary bar (4 stat cards, horizontal):**
- Total credit limit across all cards
- Total current balance (all cards combined)
- Total available credit
- This month's total spend

**Below the summary bar (2-column layout):**
- Left (60%): Spend chart (line chart, last 30 days, colored by card)
- Right (40%): Alerts panel + Recent transactions (last 5)

**Bottom row:**
- Card widgets (one per card, horizontal scroll on mobile)
- Each card widget shows: card name, bank, last four, utilization ring, available credit

**Key components:**

```typescript
// components/dashboard/SummaryBar.tsx
// 4 stat cards in a responsive grid
// Props: { cards: CreditCard[] }
// Computes: totalLimit, totalBalance, totalAvailable, monthSpend

// components/cards/CardWidget.tsx
// Visual card with gradient background (user's chosen card_color)
// Shows: nickname, bank, ****XXXX, limit bar, available amount
// Clicking navigates to /cards/[cardId]
// Has a "utilization ring" — circular progress in corner

// components/dashboard/SpendChart.tsx
// Recharts LineChart
// X-axis: dates (last 30 days)
// Y-axis: amount in user's currency
// One line per card, colored by card_color
// Tooltip shows date + amount + card name
```

### B. Card Detail Page (`app/(dashboard)/cards/[cardId]/page.tsx`)

Sections (top to bottom):

1. **Card Hero** — Large card visual, key stats
   - Credit limit | Current balance | Available credit | Utilization %
   - Statement period dates (e.g. "Mar 1 – Mar 31")
   - Due date countdown (e.g. "Payment due in 8 days")
   - Minimum payment amount

2. **Statement Snapshot** — Current period summary
   - Total spend this period
   - # of transactions
   - Top 3 categories with bar chart

3. **Transactions Table** — Paginated, filterable by:
   - Date range
   - Category (multi-select)
   - Type (debit/credit/refund)
   - Search merchant/description
   - Export to CSV button

4. **Budget Section** — For this card
   - Show active budgets per category
   - Progress bars for each (colored: green < 70%, amber 70-90%, red > 90%)
   - "Add budget" button

5. **Settings Section**
   - Edit card details
   - Set statement day / due day
   - Manage sharing (toggle shared with household)
   - Get card_id (for iPhone Shortcut setup)
   - Danger zone: delete card

### C. All Cards Page (`app/(dashboard)/cards/page.tsx`)

Grid of all cards (2 columns desktop, 1 column mobile).

Each card in grid shows:
- Card visual widget
- Bank + card name
- Credit limit | Balance | Available
- Utilization ring
- Days until due
- This month's spend
- Quick-add transaction button

Filter/sort options at top:
- Sort: by bank, by available credit, by due date, by utilization
- Filter: active only, mine only, shared only

### D. Transactions Page (`app/(dashboard)/transactions/page.tsx`)

Full transactions list across ALL cards.

Features:
- Column headers: Date | Card | Merchant | Category | Amount | Type | Source
- Inline category badge (colored pill)
- Source badge: 📱 Shortcut | ✋ Manual | 📧 SMS
- Bulk select + delete
- CSV export (filtered)
- Month/period switcher at top
- Category summary sidebar (shows spend by category for selected period)
- Quick-edit: click any row to edit category, notes, tags

### E. Statement Page (`app/(dashboard)/statement/page.tsx`)

This is the "what is my situation RIGHT NOW" page.

**Current Statement Summary (for each card):**

For each active card, show a statement card:
```
[HSBC Platinum]
Statement period: Mar 1 – Mar 31, 2025
Opening balance:  LKR 45,200
Spend this period: LKR 23,450
Credits/payments: LKR 10,000
Closing balance:  LKR 58,650
Available:        LKR 91,350 / 150,000
Min payment due:  LKR 5,865
Payment due:      April 15, 2025 (8 days)
Status: ⚠️ 39% utilized
```

Below each card: Top 5 transactions this period.

A "Combined statement" toggle shows all cards merged.

### F. Budget Page (`app/(dashboard)/budget/page.tsx`)

**Per-card budget management:**

- Card selector tabs at top
- For selected card: category budget list
  - Each row: Category | Budget | Spent | Remaining | % bar | Alert threshold
  - Color coded: green/amber/red
- "Add budget" modal:
  - Select category (dropdown with icons)
  - Set amount
  - Set period (monthly/weekly/statement)
  - Set alert threshold %

**Global spending limits:**
- Total monthly spend cap across all cards
- Per-category global budget (e.g. "max LKR 20,000 on dining across all cards")

### G. Family Page (`app/(dashboard)/family/page.tsx`)

**My Household section:**
- Household name (editable)
- Member list with roles and avatars
- Each member: Name | Email | Role | Cards they can see | Last active
- Invite by email button → sends invitation link

**Shared cards:**
- Toggle which cards are shared with household
- Per-member card access control (can view / can add transactions)

**Family spend overview:**
- This month's spend: breakdown by member
- Bar chart: member comparison

**Roles & permissions:**
| Role | Add transactions | View all cards | Edit cards | Manage members |
|------|----------------|----------------|------------|----------------|
| Owner | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ❌ |
| Member | ✅ | Shared only | ❌ | ❌ |
| Viewer | ❌ | Shared only | ❌ | ❌ |

### H. Settings Page (`app/(dashboard)/settings/page.tsx`)

Sections:
1. **Profile** — Name, avatar, email, currency preference
2. **API Key** — Show masked key, copy button, regenerate button
3. **Shortcut Setup Guide** — Step-by-step setup instructions for iPhone
4. **Notification Preferences** — Toggle alerts by type
5. **Cards** — Quick links to each card's settings
6. **Danger Zone** — Delete account

### I. Reports Page (`app/(dashboard)/reports/page.tsx`)

- **Monthly trend chart** — 12-month bar chart of total spend per month
- **Category breakdown** — Pie/donut chart + table
- **Card comparison** — Which card used most, highest utilization
- **Merchant analysis** — Top 10 merchants by spend
- **Reward summary** — Estimated cashback/points earned
- **Export** — Download PDF statement or CSV

---

## 8. IPHONE SHORTCUTS INTEGRATION

### Overview

The app exposes a single POST endpoint. The iPhone Shortcut sends transaction data to it automatically after receiving a bank notification.

### Endpoint
```
POST https://your-app.vercel.app/api/ingest
Content-Type: application/json

{
  "api_key": "YOUR_API_KEY_HERE",
  "card_id": "uuid-of-your-card",
  "amount": 2500.00,
  "description": "Pizza Hut Colombo 3",
  "merchant": "Pizza Hut",
  "category": "food",
  "tx_type": "debit",
  "tx_date": "2025-03-15",
  "currency": "LKR",
  "raw_message": "Your HSBC card ending 4521 was used for LKR 2,500 at Pizza Hut"
}
```

### iPhone Shortcut Setup (Show this in UI)

**Shortcut 1: Manual Transaction Entry**

Step-by-step instructions to show in the app's Settings > Shortcut Setup:

```
1. Open iPhone Shortcuts app
2. Tap (+) to create new shortcut
3. Name it "Log Credit Transaction"

4. Add action: "Ask for Input"
   - Question: "Amount?"
   - Type: Number

5. Add action: "Ask for Input"
   - Question: "Description?"
   - Type: Text

6. Add action: "Choose from List"
   - Items: food, transport, shopping, entertainment,
             health, fuel, utilities, travel, other
   - Prompt: "Category?"

7. Add action: "Get Contents of URL"
   - URL: https://your-app.vercel.app/api/ingest
   - Method: POST
   - Headers: Content-Type: application/json
   - Body (JSON):
     {
       "api_key": "YOUR_API_KEY",
       "card_id": "YOUR_CARD_ID",
       "amount": [Amount from step 4],
       "description": [Description from step 5],
       "category": [Category from step 6],
       "tx_type": "debit",
       "currency": "LKR"
     }

8. Add action: "Show Result"
   - Show the response message

9. Add to Home Screen for quick access
```

**Shortcut 2: SMS/Notification Parser (Advanced)**

```
1. Create automation: "When I receive a notification from [Bank App]"

2. Add action: "Get Details of Notification"
   - Get: Body text

3. Add action: "Get Text from Input"
   - Use notification body

4. Add action: "Get Contents of URL"
   - URL: https://your-app.vercel.app/api/ingest
   - Method: POST
   - Body:
     {
       "api_key": "YOUR_API_KEY",
       "card_id": "YOUR_CARD_ID",
       "amount": [Parse from text - you'll need regex actions],
       "description": [Notification body],
       "raw_message": [Notification body],
       "source": "sms"
     }

IMPORTANT: For amount parsing, add a "Replace Text" action:
- Input: Notification Body
- Find: [regex to extract amount from your bank's format]
- For example, if bank sends "LKR 2,500.00 charged":
  - Use "Match Text" action with regex: (\d[\d,]*\.?\d*)
  - Get first match → that's your amount
```

**Shortcut 3: Quick Credit Card Payment Log**

```
Same structure as Shortcut 1 but:
- tx_type: "credit"
- Description: hardcoded "Credit card payment"
- Useful for logging when you make a payment
```

### App UI for Shortcut Setup

In Settings page, build a visual "Shortcut Setup Wizard":
1. Step 1: Show user's API key (masked, with copy button)
2. Step 2: Let user select which card → show that card's ID (copy button)
3. Step 3: Show the JSON template pre-filled with their key + card ID
4. Step 4: Link to download a pre-made `.shortcut` file (if feasible) OR show QR code with the URL
5. Step 5: Test connection button → sends a test transaction → confirms receipt

---

## 9. UTILITY FUNCTIONS

### `lib/utils/categories.ts`

```typescript
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ['restaurant','pizza','kfc','mcdonalds','cafe','coffee','dining','food','eat','hotel','delivery','swiggy','uber eats'],
  transport: ['uber','pickup','taxi','bus','train','fuel','petrol','shell','ceypetco','parking','toll'],
  shopping: ['amazon','keells','arpico','supermarket','store','shop','mall','clothe','fashion'],
  health: ['pharmacy','hospital','clinic','medical','doctor','health','drug','apollo','nawaloka'],
  entertainment: ['netflix','spotify','youtube','cinema','movie','game','steam'],
  utilities: ['electricity','water','telephone','slt','dialog','mobitel','airtel','internet'],
  travel: ['airline','srilankan','airport','hotel','booking','airbnb','expedia'],
  fuel: ['petrol','shell','ioc','ceypetco','fuel'],
  finance: ['interest','fee','charge','annual fee','late fee'],
}

export function inferCategory(description: string, merchant: string): string {
  const text = `${description} ${merchant}`.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) return category
  }
  return 'other'
}

export const CATEGORY_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  food:          { label: 'Food & Dining',   color: '#f97316', emoji: '🍔' },
  transport:     { label: 'Transport',        color: '#3b82f6', emoji: '🚗' },
  shopping:      { label: 'Shopping',         color: '#8b5cf6', emoji: '🛍️' },
  health:        { label: 'Health',           color: '#10b981', emoji: '💊' },
  entertainment: { label: 'Entertainment',    color: '#f59e0b', emoji: '🎬' },
  utilities:     { label: 'Utilities',        color: '#6b7280', emoji: '⚡' },
  travel:        { label: 'Travel',           color: '#06b6d4', emoji: '✈️' },
  fuel:          { label: 'Fuel',             color: '#ef4444', emoji: '⛽' },
  finance:       { label: 'Finance/Fees',     color: '#dc2626', emoji: '💰' },
  other:         { label: 'Other',            color: '#9ca3af', emoji: '📦' },
}
```

### `lib/utils/statement.ts`

```typescript
export function getCurrentStatementPeriod(date: Date, statementDay: number): string {
  const d = date.getDate()
  const year = date.getFullYear()
  const month = date.getMonth() // 0-indexed

  // If before statement close day, we're in previous month's statement
  if (d <= statementDay) {
    const stMonth = month === 0 ? 11 : month - 1
    const stYear = month === 0 ? year - 1 : year
    return `${stYear}-${String(stMonth + 1).padStart(2, '0')}`
  }
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export function getStatementDateRange(period: string, statementDay: number): { start: Date; end: Date } {
  const [year, month] = period.split('-').map(Number)
  const start = new Date(year, month - 1, statementDay + 1)
  const end = new Date(year, month, statementDay)
  return { start, end }
}

export function getDaysUntilDue(dueDay: number): number {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  let dueDate = new Date(currentYear, currentMonth, dueDay)
  if (dueDate < today) {
    dueDate = new Date(currentYear, currentMonth + 1, dueDay)
  }
  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
```

---

## 10. UI/UX DESIGN SYSTEM

### Design Philosophy
- **Dark theme with card gradients** — dashboard feels premium, not spreadsheet-like
- **Mobile-first** — designed for someone checking while shopping
- **Clear hierarchy** — most important number (available credit) always visible

### Color System
```css
/* globals.css */
:root {
  --bg-primary: #0f0f13;        /* Page background */
  --bg-card: #1a1a24;           /* Card surfaces */
  --bg-elevated: #22222f;       /* Modals, dropdowns */
  --accent-primary: #6366f1;    /* Indigo — primary actions */
  --accent-success: #10b981;    /* Green — credit, available */
  --accent-warning: #f59e0b;    /* Amber — warnings, near limit */
  --accent-danger: #ef4444;     /* Red — over limit, due soon */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #475569;
  --border: #2d2d3d;
}
```

### Card Color Presets (user picks one when adding card)
```typescript
export const CARD_COLOR_PRESETS = [
  { name: 'Midnight', value: '#1a1a2e', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
  { name: 'Ocean',    value: '#0f3460', gradient: 'linear-gradient(135deg, #0f3460 0%, #533483 100%)' },
  { name: 'Sunset',   value: '#e94560', gradient: 'linear-gradient(135deg, #e94560 0%, #f5a623 100%)' },
  { name: 'Forest',   value: '#134e4a', gradient: 'linear-gradient(135deg, #134e4a 0%, #065f46 100%)' },
  { name: 'Gold',     value: '#92400e', gradient: 'linear-gradient(135deg, #92400e 0%, #b45309 100%)' },
  { name: 'Slate',    value: '#334155', gradient: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)' },
]
```

### Card Widget Component Visual
The credit card widget should look like a real credit card:
```
┌────────────────────────────────────────┐
│  💳  HSBC Platinum           VISA      │  (gradient bg)
│                                        │
│  **** **** **** 4521                   │
│                                        │
│  Available: LKR 91,350      Limit: 150K│
│  Balance: LKR 58,650    [====----] 39% │
└────────────────────────────────────────┘
```

### Utilization Color Logic
```typescript
export function getUtilizationColor(pct: number): string {
  if (pct < 30) return 'text-green-400'
  if (pct < 60) return 'text-yellow-400'
  if (pct < 80) return 'text-orange-400'
  return 'text-red-400'
}
```

### Navigation Structure
```
Sidebar (desktop) / Bottom tabs (mobile):
  🏠 Dashboard
  💳 Cards
  📋 Transactions
  📊 Statement
  💰 Budget
  👨‍👩‍👧 Family
  📈 Reports
  ⚙️  Settings
```

### Key UI Rules
1. Currency always formatted: `LKR 1,250,000.50` (with locale formatting)
2. All monetary values in the user's preferred currency from profile
3. Dates in `MMM DD, YYYY` format (e.g. Mar 15, 2025)
4. Negative amounts (credits) shown in green with minus sign
5. Loading states: skeleton shimmer on all data cards
6. Empty states: friendly illustration + action button
7. Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
8. Sidebar collapses to icon-only at tablet, bottom nav at mobile

---

## 11. ENVIRONMENT VARIABLES

Create `.env.local` at project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Never expose client-side

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=CreditLens

# Optional: Email notifications via Resend
RESEND_API_KEY=re_xxxx
FROM_EMAIL=alerts@your-domain.com
```

In Vercel dashboard: Settings → Environment Variables → add all of the above.

---

## 12. VERCEL DEPLOYMENT

### `vercel.json`
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

### `package.json` scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### Deploy Steps
1. Push code to GitHub
2. Connect repo to Vercel (import project)
3. Set environment variables in Vercel dashboard
4. Deploy
5. Go to Supabase → run migrations
6. Enable Realtime on `transactions` and `alerts` tables in Supabase dashboard
7. Set up Supabase Auth email templates

---

## 13. SUPABASE REALTIME

Enable live updates for alerts and balance changes:

```typescript
// hooks/useRealtimeCards.ts
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeCards(userId: string, onUpdate: () => void) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('card-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'credit_cards',
        filter: `user_id=eq.${userId}`
      }, () => onUpdate())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
        filter: `user_id=eq.${userId}`
      }, () => onUpdate())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, onUpdate])
}
```

---

## 14. FEATURE CHECKLIST (Build in this order)

### Phase 1 — Foundation
- [ ] Next.js project setup with TypeScript + Tailwind + shadcn
- [ ] Supabase project + run migrations
- [ ] Auth: login, register, magic link pages
- [ ] Middleware route protection
- [ ] Profile auto-creation trigger
- [ ] Basic layout: sidebar + top bar

### Phase 2 — Core Cards
- [ ] Add credit card form (with color picker, network selector)
- [ ] Cards list page
- [ ] Card detail page (basic)
- [ ] API: GET/POST /api/cards
- [ ] Card widget component (visual credit card)

### Phase 3 — Transactions
- [ ] Manual add transaction form
- [ ] Transaction table component
- [ ] API: GET /api/transactions with filters
- [ ] Category auto-detection utility
- [ ] Statement period utility

### Phase 4 — iPhone Shortcut Ingest ⭐
- [ ] POST /api/ingest endpoint
- [ ] API key system (stored in profiles)
- [ ] Test the endpoint with curl/Postman
- [ ] Settings page: API key display + copy
- [ ] Settings page: Shortcut setup guide

### Phase 5 — Dashboard & Statement
- [ ] Dashboard with summary stats
- [ ] Spend chart (Recharts)
- [ ] Statement page
- [ ] Balance update trigger (database)
- [ ] Realtime subscription for live updates

### Phase 6 — Budget & Alerts
- [ ] Budget CRUD
- [ ] Alert creation in ingest endpoint
- [ ] Alerts panel in dashboard
- [ ] Budget progress bars
- [ ] Alert preferences in settings

### Phase 7 — Family
- [ ] Household creation
- [ ] Member invitation (email)
- [ ] Role-based access control
- [ ] Card sharing toggle
- [ ] Family spend overview

### Phase 8 — Reports & Polish
- [ ] Monthly trend chart
- [ ] Category breakdown
- [ ] CSV export
- [ ] Mobile responsive tweaks
- [ ] Empty states + loading skeletons
- [ ] PWA manifest (so it can be added to home screen)

---

## 15. ADDITIONAL NOTES FOR ANTIGRAVITY

### Critical Implementation Details

1. **Balance consistency:** The database trigger handles balance updates automatically. Never manually update `current_balance` in application code — always go through transactions.

2. **Statement period logic:** A transaction's `statement_period` is determined at insert time using the card's `statement_day`. This is crucial for correct statement grouping.

3. **API key security:** The `/api/ingest` endpoint uses `SUPABASE_SERVICE_ROLE_KEY` (server-only) to bypass RLS and validate via API key. Never expose service role key client-side.

4. **Currency formatting:** All monetary display must use `Intl.NumberFormat` with the user's currency from their profile. Default currency for Sri Lankan users = LKR.

5. **Card ID in Shortcuts:** Users need to copy their card's UUID to paste into iPhone Shortcuts. Make this easy in the Settings page — big copy button, QR code optional.

6. **Multiple cards, one Shortcut:** Users with multiple cards need a separate Shortcut per card (or a "Choose from List" step that maps card names to UUIDs).

7. **PWA:** Add `manifest.json` and service worker so users can install it on iPhone home screen. This makes the manual-entry Shortcut feel native.

8. **Pagination:** Transaction lists must be paginated (50 per page). Never load all transactions at once.

9. **RLS policies:** All data access goes through Supabase RLS. The service role key is only used in `/api/ingest`. All dashboard API routes use the anon key with the user's session.

10. **Error handling:** All API routes must return structured JSON errors. The ingest endpoint especially must never expose internal errors to the Shortcut.

---

*End of CreditLens Build Specification*
*Version 1.0 — Ready for Antigravity + Gemini Flash*
```
