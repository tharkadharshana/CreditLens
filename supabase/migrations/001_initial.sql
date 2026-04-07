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
