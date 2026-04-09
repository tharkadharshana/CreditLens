import { createClient } from '@/lib/supabase/server'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'

export const dynamic = 'force-dynamic'

export default async function LiveFeedPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, credit_cards(bank_name, last_four)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const formatLKR = (val: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val).replace('LKR', 'LKR ')

  const todayTransactions = transactions?.filter(tx => {
    const d = new Date(tx.tx_date)
    const today = new Date()
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  }) || []

  const totalToday = todayTransactions.reduce((s, t) => s + (t.tx_type === 'debit' ? t.amount : 0), 0)

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Live Feed</div>
          <div className="page-sub">Real-time transaction stream from iPhone Shortcuts</div>
        </div>
        <div className="flex items-center gap-[8px]">
          <div className="pulse-dot"></div>
          <span className="fs12 text-green">Connected · Listening</span>
        </div>
      </div>

      <div className="grid-60-40">
        <div className="card">
          <div className="card-head"><div className="card-title">Incoming Transactions</div><span className="card-link">Pause feed</span></div>
          <div id="live-feed-list">
            {transactions?.map(f => {
              const c = CATEGORY_CONFIG[f.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other;
              const d = new Date(f.created_at)
              const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              return (
                <div key={f.id} className="feed-item">
                  <div className="feed-icon" style={{ background: `${c.color}15` }}>{c.emoji}</div>
                  <div className="feed-content">
                    <div className="feed-title">{f.merchant}</div>
                    <div className="feed-meta">{f.credit_cards?.bank_name} ···{f.credit_cards?.last_four} · {timeStr}</div>
                  </div>
                  <div className="feed-amount" style={{ color: f.tx_type === 'debit' ? 'var(--red)' : 'var(--green)' }}>
                    {f.tx_type === 'debit' ? '-' : '+'}{formatLKR(f.amount)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div className="card-head"><div className="card-title">Today&apos;s Summary</div></div>
            <div className="card-body">
              <div className="stat-card" style={{ border: 'none', padding: 0, marginBottom: '12px' }}>
                <div className="stat-label">Total Today</div>
                <div className="stat-value" style={{ color: 'var(--red)', fontSize: '20px' }}>{formatLKR(totalToday)}</div>
              </div>
              <div className="stat-card" style={{ border: 'none', padding: 0, marginBottom: '12px' }}>
                <div className="stat-label">Transactions</div>
                <div className="stat-value" style={{ fontSize: '20px' }}>{todayTransactions.length}</div>
              </div>
              <div className="stat-card" style={{ border: 'none', padding: 0 }}>
                <div className="stat-label">Via Shortcut</div>
                <div className="stat-value" style={{ color: 'var(--green)', fontSize: '20px' }}>{todayTransactions.filter(t => t.source === 'shortcut').length}</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div className="card-title">Shortcut Status</div></div>
            <div className="card-body">
              <div className="toggle-row">
                <div className="toggle-info"><div className="toggle-name">Auto-ingest</div><div className="toggle-desc">Parse bank notifications</div></div>
                <div className="toggle on"></div>
              </div>
              <div className="toggle-row">
                <div className="toggle-info"><div className="toggle-name">Auto-categorise</div><div className="toggle-desc">AI category detection</div></div>
                <div className="toggle on"></div>
              </div>
              <div className="toggle-row">
                <div className="toggle-info"><div className="toggle-name">Alert on large spend</div><div className="toggle-desc">Over LKR 10,000</div></div>
                <div className="toggle"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
