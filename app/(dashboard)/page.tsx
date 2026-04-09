import { createClient } from '@/lib/supabase/server'
import { Transaction, CreditCard, Profile } from '@/types'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'
import { Badge } from '@/components/ui-creditlens/badge'
import Link from 'next/link'
import { History, PieChart as ChartIcon, BarChart3, Activity, TrendingUp, ShieldCheck, Calendar } from 'lucide-react'
import { SpendingChart } from '@/components/spending-chart'
import { StatCard } from '@/components/stat-card'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const [profileRes, cardsRes, txRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user?.id).single(),
    supabase.from('credit_cards').select('*').eq('user_id', user?.id),
    supabase.from('transactions').select('*').eq('user_id', user?.id).order('tx_date', { ascending: false }).limit(100)
  ])

  const profile = profileRes.data as Profile
  const cards = cardsRes.data as CreditCard[]
  const allTransactions = txRes.data as Transaction[]
  const recentTransactions = allTransactions?.slice(0, 6) || []

  // Real-time calculations
  const totalLimit = cards?.reduce((sum, card) => sum + card.credit_limit, 0) || 0
  const totalBalance = cards?.reduce((sum, card) => sum + (card.current_balance || 0), 0) || 0
  const avgUtilization = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0
  
  // Daily spending for the last 7 days
  const dailySpends = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const amount = allTransactions?.filter(tx => tx.tx_date === dateStr).reduce((s, t) => s + t.amount, 0) || 0
    return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), amount }
  }).reverse()

  const maxSpend = Math.max(...dailySpends.map(s => s.amount), 1000)

  const formatLKR = (val: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Financial Command Centre</div>
          <div className="page-sub">Comprehensive overview of your credit portfolio</div>
        </div>
        <div className="flex gap-2">
          <button className="btn">30 Days</button>
          <button className="btn btn-primary">Download Report</button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard 
          label="Total Balance"
          value={formatLKR(totalBalance)}
          meta="Combined across all cards"
          variant="red"
          icon={TrendingUp}
        />
        <StatCard 
          label="Available Credit"
          value={formatLKR(totalLimit - totalBalance)}
          meta={`Limit: ${formatLKR(totalLimit)}`}
          variant="green"
          icon={ShieldCheck}
        />
        <StatCard 
          label="Avg. Utilization"
          value={`${avgUtilization}%`}
          meta={avgUtilization > 30 ? "High usage warning" : "Utilization is healthy"}
          variant={avgUtilization > 30 ? "red" : "green"}
          icon={BarChart3}
        />
        <StatCard 
          label="Due Soon"
          value="4"
          meta="Cards due within 7 days"
          variant="amber"
          icon={Calendar}
        />
      </div>

      <div className="grid-60-40">
        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <BarChart3 className="w-3.5 h-3.5 text-accent" />
                Spending Velocity
              </div>
              <div className="tabs">
                <div className="tab active">Daily</div>
                <div className="tab">Monthly</div>
              </div>
            </div>
            <div className="card-body">
              <div className="chart-area" style={{ height: '200px' }}>
                {dailySpends.map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div 
                      className="chart-bar" 
                      style={{ height: `${(s.amount / maxSpend) * 100}%` }}
                      data-val={formatLKR(s.amount)}
                    />
                    <div className="text-[10px] text-muted uppercase mt-2">{s.day}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">Recent Transactions</div>
              <Link href="/transactions" className="card-link">View all</Link>
            </div>
            <div className="card-body p-0">
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>Merchant</th>
                    <th>Category</th>
                    <th>Card</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions?.map((tx: any) => {
                    const cat = CATEGORY_CONFIG[tx.category] || CATEGORY_CONFIG.other
                    const card = cards?.find(c => c.id === tx.card_id)
                    return (
                      <tr key={tx.id}>
                        <td>
                          <div className="tx-merchant">{tx.merchant || tx.description}</div>
                          <div className="tx-desc">{new Date(tx.tx_date).toLocaleDateString()}</div>
                        </td>
                        <td>
                          <span className="cat-badge" style={{ background: `${cat.color}15`, color: cat.color }}>
                            {cat.emoji} {cat.label}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted fs12">
                            {card?.bank_name} ···{card?.last_four}
                          </span>
                        </td>
                        <td className={`tx-amount ${tx.tx_type === 'debit' ? 'debit' : 'credit'}`}>
                          {tx.tx_type === 'debit' ? '-' : '+'}{formatLKR(tx.amount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-head">
              <div className="card-title">Category Distribution</div>
            </div>
            <div className="card-body">
              <SpendingChart data={allTransactions || []} />
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">Your Card Portfolio</div>
              <Link href="/cards" className="card-link">+ Add card</Link>
            </div>
            <div className="card-body p-0">
              <div className="flex flex-col divide-y divide-border">
                {cards?.map((card: any) => {
                  const pct = Math.round(((card.current_balance || 0) / card.credit_limit) * 100)
                  return (
                    <div key={card.id} className="p-4 flex items-center gap-4 hover:bg-bg3 transition-all">
                      <div className="w-2 h-8 rounded-full" style={{ backgroundColor: card.card_color }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[13px]">{card.bank_name} {card.card_name}</div>
                        <div className="util-bar mt-1.5 h-1">
                          <div 
                            className="util-fill" 
                            style={{ 
                              width: `${pct}%`, 
                              backgroundColor: pct > 70 ? 'var(--red)' : pct > 40 ? 'var(--amber)' : 'var(--green)' 
                            }} 
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[12px] font-bold text-green">{formatLKR(card.credit_limit - (card.current_balance || 0))}</div>
                        <div className="text-[10px] text-muted">available</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
