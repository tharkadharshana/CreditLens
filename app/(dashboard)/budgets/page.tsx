import { createClient } from '@/lib/supabase/server'
import { Budget, Transaction } from '@/types'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BudgetsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const [budgetsRes, txRes] = await Promise.all([
    supabase.from('budgets').select('*').eq('user_id', user?.id).eq('is_active', true),
    supabase.from('transactions').select('*').eq('user_id', user?.id).order('tx_date', { ascending: false }),
    supabase.from('credit_cards').select('*').eq('user_id', user?.id)
  ])

  const budgets = (budgetsRes.data as Budget[]) || []
  const transactions = (txRes.data as Transaction[]) || []
  // const cards = (cardsRes.data as CreditCard[]) || []

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  // Calculate spent for each budget category
  const budgetsWithSpent = budgets.map(budget => {
    const spent = transactions
      .filter(tx => {
        const d = new Date(tx.tx_date)
        return (
          tx.category === budget.category &&
          tx.tx_type === 'debit' &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear &&
          (budget.card_id ? tx.card_id === budget.card_id : true)
        )
      })
      .reduce((sum, tx) => sum + tx.amount, 0) || 0

    return {
      ...budget,
      spent
    }
  })

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit_amount, 0) || 0
  const totalSpent = budgetsWithSpent.reduce((sum, b) => sum + b.spent, 0) || 0
  const remaining = totalBudget - totalSpent

  const formatLKR = (val: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val).replace('LKR', 'LKR ')

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Budgets</div>
          <div className="page-sub">Set spending limits and track against them</div>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-[13px] h-[13px]" />
          Add Budget
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Budgeted</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{formatLKR(totalBudget)}</div>
          <div className="stat-meta">Per month across all cards</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Spent So Far</div>
          <div className="stat-value">{formatLKR(totalSpent)}</div>
          <div className="stat-meta">{totalBudget > 0 ? Math.round((totalSpent/totalBudget)*100) : 0}% of total budget</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Remaining</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{formatLKR(remaining)}</div>
          <div className="stat-meta">Until end of month</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">Alerts Triggered</div>
          <div className="stat-value">{budgetsWithSpent.filter(b => (b.spent/b.limit_amount) >= 0.8).length}</div>
          <div className="stat-meta">Categories near limit</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Active Budgets</div>
          <div className="flex gap-8">
            <div className="tabs">
              <div className="tab active">Monthly</div>
              <div className="tab">Statement</div>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          {budgetsWithSpent.map(b => {
            const c = CATEGORY_CONFIG[b.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other;
            const pct = Math.min(100, Math.round((b.spent / b.limit_amount) * 100));
            const col = pct >= 90 ? 'var(--red)' : pct >= 70 ? 'var(--amber)' : c.color;
            return (
              <div key={b.id} className="budget-item">
                <div className="budget-header">
                  <div className="budget-name">{c.emoji} {c.label}</div>
                  <div className="budget-amounts">
                    {formatLKR(b.spent)} / {formatLKR(b.limit_amount)}
                    <span style={{ color: col }}> ({pct}%)</span>
                  </div>
                </div>
                <div className="budget-bar">
                  <div className="budget-fill" style={{ width: `${pct}%`, backgroundColor: col }}></div>
                </div>
              </div>
            )
          })}
          {budgetsWithSpent.length === 0 && (
            <div className="empty">
              <Plus />
              <p>No active budgets</p>
              <small>Add your first budget to start tracking</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
