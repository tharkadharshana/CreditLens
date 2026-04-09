import { createClient } from '@/lib/supabase/server'
import { Budget, Transaction, CreditCard } from '@/types'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'
import { Plus, Target, Wallet, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BudgetsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const [budgetsRes, txRes, cardsRes] = await Promise.all([
    supabase.from('budgets').select('*').eq('user_id', user?.id).eq('is_active', true),
    supabase.from('transactions').select('*').eq('user_id', user?.id).order('tx_date', { ascending: false }),
    supabase.from('credit_cards').select('*').eq('user_id', user?.id)
  ])

  const budgets = budgetsRes.data as Budget[]
  const transactions = txRes.data as Transaction[]
  const cards = cardsRes.data as CreditCard[]

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  // Calculate spent for each budget category
  const budgetsWithSpent = budgets?.map(budget => {
    const spent = transactions
      ?.filter(tx => {
        const d = new Date(tx.tx_date)
        return (
          tx.category === budget.category &&
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
  }) || []

  const totalBudget = budgets?.reduce((sum, b) => sum + b.limit_amount, 0) || 0
  const totalSpent = budgetsWithSpent.reduce((sum, b) => sum + b.spent, 0) || 0
  const remaining = totalBudget - totalSpent

  const formatLKR = (val: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Budgets</div>
          <div className="page-sub">Monitor and control your category-wise spending</div>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-3.5 h-3.5" />
          Add Budget
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-label">Total Budget <Target className="w-3 h-3" /></div>
          <div className="stat-value">{formatLKR(totalBudget)}</div>
          <div className="stat-meta">{budgets?.length || 0} active categories</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-label">Total Spent <Wallet className="w-3 h-3" /></div>
          <div className="stat-value">{formatLKR(totalSpent)}</div>
          <div className="stat-meta">Current month spending</div>
        </div>
        <div className="stat-card" style={{ '--card-glow': remaining >= 0 ? 'var(--green-bg)' : 'var(--red-bg)' } as React.CSSProperties}>
          <div className="stat-label">Remaining <AlertCircle className="w-3 h-3" /></div>
          <div className="stat-value" style={{ color: remaining >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatLKR(remaining)}</div>
          <div className="stat-meta">{remaining >= 0 ? "Budget health is good" : "Over budget!"}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Category-wise Breakdown</div>
        </div>
        <div className="card-body p-0">
          <div className="flex flex-col">
            {budgetsWithSpent.map(budget => {
              const cat = CATEGORY_CONFIG[budget.category] || CATEGORY_CONFIG.other
              const pct = Math.round((budget.spent / budget.limit_amount) * 100)
              const card = cards?.find(c => c.id === budget.card_id)
              const col = pct >= 90 ? 'var(--red)' : pct >= 70 ? 'var(--amber)' : cat.color
              
              return (
                <div key={budget.id} className="budget-item">
                  <div className="budget-header">
                    <div className="budget-name">
                      <span className="text-xl">{cat.emoji}</span>
                      <div>
                        <div className="fw600 fs13">{cat.label}</div>
                        <div className="text-[10px] text-muted uppercase">
                          {budget.period} {card ? `on ${card.bank_name}` : 'global'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="fw600 fs13">{formatLKR(budget.spent)} / <span className="text-muted">{formatLKR(budget.limit_amount)}</span></div>
                      <div className="fs11 fw600" style={{ color: col }}>{pct}% used</div>
                    </div>
                  </div>
                  <div className="budget-bar">
                    <div 
                      className="budget-fill" 
                      style={{ 
                        width: `${Math.min(pct, 100)}%`, 
                        backgroundColor: col
                      }} 
                    />
                  </div>
                </div>
              )
            })}
            
            {budgetsWithSpent.length === 0 && (
              <div className="text-center py-20 text-muted italic">
                No active budgets found. Start by adding one!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
