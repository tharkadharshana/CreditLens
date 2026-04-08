import { createClient } from '@/lib/supabase/server'
import { Transaction, CreditCard, Profile } from '@/types'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'
import { Badge } from '@/components/ui-creditlens/badge'
import Link from 'next/link'
import { History, PieChart as ChartIcon, CreditCard as CardIcon, Activity } from 'lucide-react'
import { SummaryCards } from '@/components/summary-cards'
import { SpendingChart } from '@/components/spending-chart'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const [profileRes, cardsRes, txRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user?.id).single(),
    supabase.from('credit_cards').select('*').eq('user_id', user?.id),
    supabase.from('transactions').select('*').eq('user_id', user?.id).order('tx_date', { ascending: false }).limit(50)
  ])

  const profile = profileRes.data as Profile
  const cards = cardsRes.data as CreditCard[]
  const allTransactions = txRes.data as Transaction[]
  const recentTransactions = allTransactions?.slice(0, 6) || []

  // Real-time calculations
  const totalLimit = cards?.reduce((sum, card) => sum + card.credit_limit, 0) || 0
  const totalSpent = cards?.reduce((sum, card) => sum + (card.current_balance || 0), 0) || 0
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const monthlySpent = allTransactions?.filter(tx => {
    const d = new Date(tx.tx_date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).reduce((sum, tx) => sum + tx.amount, 0) || 0

  const dailySpent = allTransactions?.filter(tx => 
    new Date(tx.tx_date).toDateString() === new Date().toDateString()
  ).reduce((sum, tx) => sum + tx.amount, 0) || 0

  const formatLKR = (val: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">
            Hi, {profile?.full_name?.split(' ')[0] || 'User'} <span style={{ color: 'var(--accent)' }}>·</span>
          </div>
          <div className="page-sub">Here&apos;s your credit health overview for today.</div>
        </div>
      </div>

      <SummaryCards 
        totalLimit={totalLimit}
        totalSpent={totalSpent}
        monthlySpent={monthlySpent}
        dailySpent={dailySpent}
      />

      <div className="grid-60-40">
        {/* Recent Transactions */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <History className="w-3.5 h-3.5 text-accent" />
              Recent Transactions
            </div>
            <Link href="/transactions" className="card-link">View all activity →</Link>
          </div>
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
              {recentTransactions.map((tx: Transaction) => {
                const cat = CATEGORY_CONFIG[tx.category] || CATEGORY_CONFIG.other
                const card = cards?.find(c => c.id === tx.card_id)
                return (
                  <tr key={tx.id}>
                    <td>
                      <div className="tx-merchant">{tx.merchant || tx.description}</div>
                      <div className="tx-desc">{new Date(tx.tx_date).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <Badge 
                        type="category"
                        style={{ background: `${cat.color}15`, color: cat.color }}
                      >
                        {cat.emoji} {cat.label}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-muted fs12">
                        {card ? `${card.bank_name} ···${card.last_four}` : 'Unknown Card'}
                      </span>
                    </td>
                    <td className={`tx-amount ${tx.tx_type === 'debit' ? 'debit' : 'credit'}`} style={{ textAlign: 'right' }}>
                      {tx.tx_type === 'debit' ? '-' : '+'}{formatLKR(tx.amount)}
                    </td>
                  </tr>
                )
              })}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-muted italic">
                    No recent transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Spending Mix */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <ChartIcon className="w-3.5 h-3.5 text-accent" />
                Spending Mix
              </div>
            </div>
            <div className="card-body">
              <SpendingChart data={allTransactions || []} />
            </div>
          </div>

          {/* Your Cards */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <CardIcon className="w-3.5 h-3.5 text-accent" />
                Your Cards
              </div>
              <Link href="/cards" className="card-link">Manage →</Link>
            </div>
            <div className="px-5 py-3 flex flex-col gap-2.5">
              {cards?.map((card) => {
                const pct = Math.round(((card.current_balance || 0) / card.credit_limit) * 100)
                const avail = card.credit_limit - (card.current_balance || 0)
                const getUtilColor = (p: number) => p < 30 ? '#22d3a0' : p < 70 ? '#f5a623' : '#f4566a'
                
                return (
                  <div key={card.id} className="flex items-center gap-2.5 py-2 border-b border-border last:border-0">
                    <div 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: card.card_color || 'var(--accent)' }} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13px]">{card.bank_name} {card.card_name}</div>
                      <div className="pct-bar mt-1">
                        <div 
                          className="pct-fill" 
                          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: getUtilColor(pct) }} 
                        />
                      </div>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <div className="mono text-[12px] text-emerald-400">{formatLKR(avail)}</div>
                      <div className="text-muted text-[10px]">available</div>
                    </div>
                  </div>
                )
              })}
              <Link href="/cards" className="text-center pt-2">
                <span className="card-link text-[12px]">+ Add new card</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Spend chart */}
      <div className="card mt-4">
        <div className="card-head">
          <div className="card-title">
            <Activity className="w-3.5 h-3.5 text-accent" />
            30-Day Spend Trend
          </div>
          <div className="flex gap-2">
            <div className="tabs">
              <div className="tab active">30 Days</div>
              <div className="tab">3 Months</div>
              <div className="tab">Year</div>
            </div>
          </div>
        </div>
        <div className="card-body pb-2">
          <div className="chart-area h-[180px]">
            <div className="flex items-end gap-1 h-full w-full">
              {[12, 34, 9, 52, 21, 48, 18, 62, 31, 29, 44, 72, 15, 38, 26, 54].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div 
                    className="w-full rounded-t-[3px] bg-gradient-to-t from-accent to-accent2 min-h-[4px] relative cursor-pointer"
                    style={{ height: `${(v / 80) * 150}px` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-bg4 border border-border2 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap z-10 mono">
                      {formatLKR(v * 100)}
                    </div>
                  </div>
                  <div className="text-[9px] text-muted">{i % 3 === 0 ? (i + 1) : ''}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
