import { createClient } from '@/lib/supabase/server'
import { Transaction, CreditCard } from '@/types'

export const dynamic = 'force-dynamic'

export default async function StatementPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const [cardsRes, txRes] = await Promise.all([
    supabase.from('credit_cards').select('*').eq('user_id', user?.id),
    supabase.from('transactions').select('*').eq('user_id', user?.id)
  ])

  const cards = (cardsRes.data as CreditCard[]) || []
  const transactions = (txRes.data as Transaction[]) || []

  const formatLKR = (val: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val).replace('LKR', 'LKR ')

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Current Statement</div>
          <div className="page-sub">Your live statement snapshot as of today</div>
        </div>
        <div className="flex gap-8">
          <select className="field" style={{ width: 'auto' }}>
            <option>April 2025</option>
            <option>March 2025</option>
            <option>February 2025</option>
          </select>
          <button className="btn">↓ Download PDF</button>
        </div>
      </div>

      <div id="statement-cards">
        {cards.map(c => {
          const pct = Math.round(((c.current_balance || 0) / c.credit_limit) * 100)
          // Mocking some statement values as they aren't fully in the DB yet or need complex logic
          const cardTxs = transactions.filter(t => t.card_id === c.id)
          const stmtSpend = cardTxs.filter(t => t.tx_type === 'debit').reduce((s, t) => s + t.amount, 0)
          const credits = cardTxs.filter(t => t.tx_type === 'credit').reduce((s, t) => s + t.amount, 0)
          const statusColor = pct > 70 ? '#f4566a' : pct > 40 ? '#f5a623' : '#22d3a0'
          const dueDays = 7 // Mocked

          return (
            <div key={c.id} className="stmt-card">
              <div className="stmt-card-head">
                <div className="stmt-card-name">💳 {c.bank_name} {c.card_name} <span className="text-muted" style={{ fontSize: '12px' }}>···{c.last_four}</span></div>
                <div className="flex gap-8">
                  <span className="status-pill" style={{ background: pct > 70 ? 'var(--red-bg)' : 'var(--green-bg)', color: statusColor }}>{pct}% used</span>
                  <span className="status-pill" style={{ background: dueDays <= 7 ? 'var(--red-bg)' : 'var(--bg4)', color: dueDays <= 7 ? 'var(--red)' : 'var(--text3)' }}>Due in {dueDays}d</span>
                </div>
              </div>
              <div className="stmt-grid">
                <div className="stmt-item"><label>Credit Limit</label><p>{formatLKR(c.credit_limit)}</p></div>
                <div className="stmt-item"><label>Opening Balance</label><p>{formatLKR((c.current_balance || 0) - stmtSpend + credits)}</p></div>
                <div className="stmt-item"><label>Spend This Period</label><p style={{ color: 'var(--red)' }}>{formatLKR(stmtSpend)}</p></div>
                <div className="stmt-item"><label>Credits / Payments</label><p style={{ color: 'var(--green)' }}>{formatLKR(credits)}</p></div>
                <div className="stmt-item"><label>Closing Balance</label><p className="fw600">{formatLKR(c.current_balance || 0)}</p></div>
                <div className="stmt-item"><label>Available Credit</label><p style={{ color: 'var(--green)' }}>{formatLKR(c.credit_limit - (c.current_balance || 0))}</p></div>
                <div className="stmt-item"><label>Min. Payment Due</label><p style={{ color: 'var(--amber)' }}>{formatLKR((c.current_balance || 0) * 0.1)}</p></div>
                <div className="stmt-item"><label>Payment Due Date</label><p style={{ color: dueDays <= 7 ? 'var(--red)' : 'var(--text)' }}>Apr {c.due_day || 15}, 2025</p></div>
                <div className="stmt-item"><label>Statement Day</label><p>Mar {c.statement_day || 25}</p></div>
              </div>
              <div style={{ marginTop: '14px' }}>
                <div className="pct-bar" style={{ height: '8px', borderRadius: '4px' }}>
                  <div className="pct-fill" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: statusColor, borderRadius: '4px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span className="text-muted fs11">LKR 0</span>
                  <span className="fs11" style={{ color: statusColor }}>{formatLKR(c.current_balance || 0)} used</span>
                  <span className="text-muted fs11">{formatLKR(c.credit_limit)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
