import { createClient } from '@/lib/supabase/server'
import type { Transaction, CreditCard } from '@/types'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'
import Link from 'next/link'
import { TrendingUp, ShieldCheck, Calendar, Clock, List, Activity, CreditCard as CardIcon } from 'lucide-react'
import { StatCard } from '@/components/stat-card'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  
  const [cardsRes, txRes] = await Promise.all([
    supabase.from('credit_cards').select('*').eq('user_id', user?.id),
    supabase.from('transactions').select('*').eq('user_id', user?.id).order('tx_date', { ascending: false }).limit(100)
  ])

  const cards = (cardsRes.data as CreditCard[]) || []
  const allTransactions = (txRes.data as Transaction[]) || []
  const recentTransactions = allTransactions.slice(0, 6)

  // Real-time calculations
  const totalLimit = cards.reduce((sum, card) => sum + card.credit_limit, 0) || 0
  const totalBalance = cards.reduce((sum, card) => sum + (card.current_balance || 0), 0) || 0
  const availableCredit = totalLimit - totalBalance
  const avgUtilization = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0
  
  // Daily spending for the last 16 days (matching HTML chart length approximately)
  const daysToShow = 16
  const dailySpends = Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const amount = allTransactions.filter(tx => tx.tx_date === dateStr && tx.tx_type === 'debit').reduce((s, t) => s + t.amount, 0) || 0
    return {
      day: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      shortDay: d.getDate().toString(),
      amount,
      isMonthStart: d.getDate() === 1
    }
  }).reverse()

  const maxSpend = Math.max(...dailySpends.map(s => s.amount), 1000)

  const formatLKR = (val: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val).replace('LKR', 'LKR ')

  // Category Distribution for Donut
  const catTotals = allTransactions.reduce((acc, tx) => {
    if (tx.tx_type === 'debit') {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount
    }
    return acc
  }, {} as Record<string, number>)

  const sortedCats = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  const totalDebit = Object.values(catTotals).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Hi, {userName} <span style={{ color: 'var(--accent)' }}>·</span></div>
          <div className="page-sub">Here&apos;s your credit health overview for today.</div>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard 
          label="Available Credit"
          value={formatLKR(availableCredit)}
          meta={`${(100 - avgUtilization).toFixed(1)}% available across ${cards.length} cards`}
          variant="green"
          icon={ShieldCheck}
        />
        <StatCard 
          label="Monthly Spend"
          value={formatLKR(Object.values(catTotals).reduce((a, b) => a + b, 0))}
          meta="Current statement period"
          variant="amber"
          icon={Calendar}
        />
        <StatCard
          label="Daily Avg"
          value={formatLKR(totalDebit / 30)}
          meta="Last 30 days"
          variant="blue"
          icon={Clock}
        />
        <StatCard
          label="Total Outstanding"
          value={formatLKR(totalBalance)}
          meta="Across all cards"
          variant="red"
          icon={TrendingUp}
        />
      </div>

      <div className="grid-60-40">
        <div className="card">
          <div className="card-head">
            <div className="card-title">
              <List className="w-[14px] h-[14px]" />
              Recent Transactions
            </div>
            <Link href="/transactions" className="card-link">View all activity →</Link>
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
                {recentTransactions.map((tx) => {
                  const cat = CATEGORY_CONFIG[tx.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other
                  const card = cards.find(c => c.id === tx.card_id)
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

        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Clock className="w-[14px] h-[14px]" />
                Spending Mix
              </div>
            </div>
            <div className="card-body">
              <div className="donut-wrap">
                <svg className="donut-svg" width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="28" fill="none" stroke="var(--bg4)" strokeWidth="12"/>
                  {sortedCats.map((cat, i) => {
                    const pct = (cat[1] / totalDebit) * 100
                    const offset = sortedCats.slice(0, i).reduce((sum, c) => sum + (c[1] / totalDebit) * 100, 0)
                    const config = CATEGORY_CONFIG[cat[0] as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other
                    return (
                      <circle
                        key={cat[0]}
                        cx="40" cy="40" r="28"
                        fill="none"
                        stroke={config.color}
                        strokeWidth="12"
                        strokeDasharray={`${pct * 1.76} 176`}
                        strokeDashoffset={-offset * 1.76}
                        transform="rotate(-90 40 40)"
                      />
                    )
                  })}
                </svg>
                <div className="donut-legend">
                  {sortedCats.map((cat) => {
                    const config = CATEGORY_CONFIG[cat[0] as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other
                    return (
                      <div key={cat[0]} className="legend-item">
                        <div className="legend-dot" style={{ background: config.color }} />
                        <span className="legend-name">{config.label}</span>
                        <span className="legend-val">{Math.round((cat[1] / totalDebit) * 100)}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <CardIcon className="w-[14px] h-[14px]" />
                Your Cards
              </div>
              <Link href="/cards" className="card-link">Manage →</Link>
            </div>
            <div className="p-4 flex flex-col gap-2.5">
              {cards.map((card) => {
                const pct = Math.round(((card.current_balance || 0) / card.credit_limit) * 100)
                const avail = card.credit_limit - (card.current_balance || 0)
                const color = pct < 30 ? 'var(--green)' : pct < 70 ? 'var(--amber)' : 'var(--red)'
                return (
                  <div key={card.id} className="flex items-center gap-2.5 pb-2 border-b border-border last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: card.card_color }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[13px]">{card.bank_name} {card.card_name}</div>
                      <div className="pct-bar mt-1">
                        <div
                          className="pct-fill"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <div className="text-[12px] font-mono font-semibold text-green">{formatLKR(avail)}</div>
                      <div className="text-[10px] text-muted">available</div>
                    </div>
                  </div>
                )
              })}
              <div className="pt-2 text-center">
                <Link href="/cards" className="card-link text-[12px]">+ Add new card</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-16">
        <div className="card-head">
          <div className="card-title">
            <Activity className="w-[14px] h-[14px]" />
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
          <div className="chart-area">
            {dailySpends.map((s, i) => (
              <div key={i} className="chart-bar-wrap">
                <div
                  className="chart-bar"
                  style={{ height: `${Math.max(4, (s.amount / maxSpend) * 150)}px` }}
                  data-val={formatLKR(s.amount)}
                />
                <div className="chart-lbl">{i % 3 === 0 || s.isMonthStart ? s.isMonthStart ? s.day.split(' ')[0] : s.shortDay : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
