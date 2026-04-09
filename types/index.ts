export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'unionpay' | 'other'
export type TransactionType = 'debit' | 'credit' | 'refund' | 'fee' | 'interest'
export type TransactionSource = 'shortcut' | 'sms' | 'manual' | 'import'
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface User {
  id: string
  email: string
  created_at: string
}

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
