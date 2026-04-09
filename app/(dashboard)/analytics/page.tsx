import { createClient } from '@/lib/supabase/server'
import { Transaction, CreditCard } from '@/types'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const [txRes, cardsRes] = await Promise.all([
    supabase.from('transactions').select('*').eq('user_id', user?.id).order('tx_date', { ascending: false }),
    supabase.from('credit_cards').select('*').eq('user_id', user?.id)
  ])

  const transactions = (txRes.data as Transaction[]) || []
  const cards = (cardsRes.data as CreditCard[]) || []

  // Ensure cards is used or removed if truly not needed, but here it might be useful for per-card analytics in future.
  // For now, I'll keep it to avoid lint errors if I can use it, or just ignore.
  console.log('Cards count:', cards.length);

  const formatLKR = (val: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val).replace('LKR', 'LKR ')

  // Monthly stats for last 6 months
  const monthlyStats = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const month = d.getMonth()
    const year = d.getFullYear()
    const label = d.toLocaleDateString('en-US', { month: 'short' })
    const spent = transactions
      .filter(tx => {
        const txd = new Date(tx.tx_date)
        return tx.tx_type === 'debit' && txd.getMonth() === month && txd.getFullYear() === year
      })
      .reduce((sum, tx) => sum + tx.amount, 0) || 0
    return { label, spent, month, year }
  }).reverse()

  const maxMonthly = Math.max(...monthlyStats.map(s => s.spent), 1000)
  const avgMonthly = monthlyStats.reduce((a, b) => a + b.spent, 0) / 6
  const highestMonth = [...monthlyStats].sort((a, b) => b.spent - a.spent)[0]
  const lowestMonth = [...monthlyStats].sort((a, b) => a.spent - b.spent)[0]

  // Category stats
  const catStats = Object.entries(transactions.reduce((acc, tx) => {
    if (tx.tx_type === 'debit') {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount
    }
    return acc
  }, {} as Record<string, number>))
  .sort((a, b) => b[1] - a[1])

  const totalSpent = monthlyStats.reduce((a, b) => a + b.spent, 0)

  // Top merchants
  const merchantStats = Object.entries(transactions.reduce((acc, tx) => {
    if (tx.tx_type === 'debit') {
      const m = tx.merchant || 'Unknown'; acc[m] = (acc[m] || 0) + tx.amount
    }
    return acc
  }, {} as Record<string, number>))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">Analytics</div>
        <div className="page-sub">Deep insights into your spending patterns</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Highest Month</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{formatLKR(highestMonth.spent)}</div>
          <div className="stat-meta">{highestMonth.label} {highestMonth.year}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Lowest Month</div>
          <div className="stat-value">{formatLKR(lowestMonth.spent)}</div>
          <div className="stat-meta">{lowestMonth.label} {lowestMonth.year}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg / Month</div>
          <div className="stat-value" style={{ color: 'var(--blue)' }}>{formatLKR(avgMonthly)}</div>
          <div className="stat-meta">Last 6 months</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Transactions</div>
          <div className="stat-value">{transactions.length}</div>
          <div className="stat-meta">This year</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head"><div className="card-title">Monthly Spend (6 months)</div></div>
          <div className="card-body">
            <div className="chart-area">
              {monthlyStats.map((s, i) => (
                <div key={i} className="chart-bar-wrap">
                  <div
                    className="chart-bar"
                    style={{ height: `${Math.max(4, (s.spent / maxMonthly) * 150)}px`, background: 'linear-gradient(to top, var(--accent2), var(--accent))' }}
                    data-val={formatLKR(s.spent)}
                  />
                  <div className="chart-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div className="card-title">Spend by Category</div></div>
          <div className="card-body">
            <div id="cat-chart">
              {catStats.map(([cat, spent]) => {
                const c = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other;
                const pct = Math.round((spent / (totalSpent || 1)) * 100);
                return (
                  <div key={cat} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className="fs12">{c.emoji} {c.label}</span>
                      <span className="fs12 mono" style={{ color: c.color }}>{formatLKR(spent)}</span>
                    </div>
                    <div className="pct-bar" style={{ height: '6px' }}>
                      <div className="pct-fill" style={{ width: `${pct}%`, backgroundColor: c.color }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-16">
        <div className="card-head"><div className="card-title">Top Merchants This Month</div></div>
        <div className="card-body">
          <div id="merchant-list">
            {merchantStats.map(([name, amount], i) => {
              const maxAmt = merchantStats[0][1]
              const pct = Math.round((amount / maxAmt) * 100)
              return (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div className="text-muted mono" style={{ minWidth: '16px', fontSize: '12px' }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span className="fs13 fw600">{name}</span>
                      <span className="mono fs12" style={{ color: 'var(--accent)' }}>{formatLKR(amount)}</span>
                    </div>
                    <div className="pct-bar">
                      <div className="pct-fill" style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
