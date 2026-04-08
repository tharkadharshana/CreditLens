import { createClient } from '@/lib/supabase/server'
import { Budget, Transaction, CreditCard } from '@/types'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'
import { Button } from '@/components/ui-creditlens/button'
import { Plus, Target, Wallet, AlertCircle } from 'lucide-react'
import { StatCard } from '@/components/summary-cards'

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
        <Button variant="primary">
          <Plus className="w-3.5 h-3.5" />
          Add Budget
        </Button>
      </div>

      <div className="stat-grid mb-6">
        <StatCard 
          variant="blue"
          label="Total Budget"
          value={formatLKR(totalBudget)}
          meta={`${budgets?.length || 0} active categories`}
          icon={Target}
        />
        <StatCard 
          variant="amber"
          label="Total Spent"
          value={formatLKR(totalSpent)}
          meta="Current month spending"
          icon={Wallet}
        />
        <StatCard 
          variant={remaining >= 0 ? "green" : "red"}
          label="Remaining"
          value={formatLKR(remaining)}
          meta={remaining >= 0 ? "Budget health is good" : "Over budget!"}
          icon={AlertCircle}
        />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Category-wise Breakdown</div>
        </div>
        <div className="card-body">
          <div className="flex flex-col gap-6">
            {budgetsWithSpent.map(budget => {
              const cat = CATEGORY_CONFIG[budget.category] || CATEGORY_CONFIG.other
              const pct = Math.round((budget.spent / budget.limit_amount) * 100)
              const card = cards?.find(c => c.id === budget.card_id)
              
              return (
                <div key={budget.id} className="budget-item">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-bg3 border border-border"
                        style={{ color: cat.color }}
                      >
                        {cat.emoji}
                      </div>
                      <div>
                        <div className="font-semibold text-[14px]">{cat.label}</div>
                        <div className="text-[11px] text-muted">
                          {budget.period} {card ? `on ${card.bank_name}` : 'across all cards'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[14px]">{formatLKR(budget.spent)} <span className="text-muted font-normal">/ {formatLKR(budget.limit_amount)}</span></div>
                      <div className={`text-[11px] font-semibold ${pct > 90 ? 'text-red' : pct > 70 ? 'text-amber' : 'text-green'}`}>
                        {pct}% utilized
                      </div>
                    </div>
                  </div>
                  <div className="util-bar h-2">
                    <div 
                      className="util-fill" 
                      style={{ 
                        width: `${Math.min(pct, 100)}%`, 
                        backgroundColor: pct > 90 ? 'var(--red)' : pct > 70 ? 'var(--amber)' : 'var(--green)' 
                      }} 
                    />
                  </div>
                </div>
              )
            })}
            
            {budgetsWithSpent.length === 0 && (
              <div className="text-center py-12 text-muted italic">
                No active budgets found. Start by adding one!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
