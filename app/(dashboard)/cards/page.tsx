import { createClient } from '@/lib/supabase/server'
import { CreditCard } from '@/types'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CardsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: cards } = await supabase.from('credit_cards').select('*').eq('user_id', user?.id)

  const formatLKR = (val: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val).replace('LKR', 'LKR ')

  const getUtilColor = (p: number) => p < 30 ? 'var(--green)' : p < 70 ? 'var(--amber)' : 'var(--red)'

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">My Cards</div>
          <div className="page-sub">Manage all your credit cards in one place</div>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-[13px] h-[13px]" />
          Add New Card
        </button>
      </div>

      <div className="cards-grid">
        {cards?.map((card: CreditCard) => {
          const pct = Math.round(((card.current_balance || 0) / card.credit_limit) * 100)
          const avail = card.credit_limit - (card.current_balance || 0)
          const grad = `linear-gradient(135deg, ${card.card_color} 0%, ${card.card_color}cc 100%)`
          
          return (
            <div key={card.id}>
              <div 
                className="credit-card-vis" 
                style={{ 
                  background: grad,
                  color: '#fff',
                  marginBottom: '14px'
                }}
              >
                <div className="cc-top">
                  <div>
                    <div className="cc-bank">{card.bank_name}</div>
                    <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>{card.card_name}</div>
                  </div>
                  <div className="cc-network">VISA</div>
                </div>
                <div className="cc-number">**** **** **** {card.last_four}</div>
                <div className="cc-bottom">
                  <div>
                    <div className="cc-name">Available</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600 }}>{formatLKR(avail)}</div>
                  </div>
                  <div className="cc-limit">
                    <div className="cc-limit-val">{formatLKR(card.credit_limit)}</div>
                    <div className="cc-limit-lbl">Limit</div>
                  </div>
                </div>
                <div className="cc-util-bar">
                  <div 
                    className="cc-util-fill" 
                    style={{ 
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: pct > 70 ? 'var(--red)' : pct > 40 ? 'var(--amber)' : 'rgba(255,255,255,0.8)' 
                    }} 
                  />
                </div>
              </div>

              <div className="card-item-detail">
                <div className="card-item-header">
                  <div className="card-emoji">💳</div>
                  <div className="card-info">
                    <div className="card-info-name">{card.card_name}</div>
                    <div className="card-info-bank">{card.bank_name} Bank</div>
                  </div>
                  <span className="status-pill" style={{ background: 'var(--bg4)', color: 'var(--text3)' }}>
                    Active
                  </span>
                </div>
                <div className="card-stats">
                  <div className="cs-item">
                    <label>Balance</label>
                    <p style={{ color: 'var(--red)' }}>{formatLKR(card.current_balance || 0)}</p>
                  </div>
                  <div className="cs-item">
                    <label>Available</label>
                    <p style={{ color: 'var(--green)' }}>{formatLKR(avail)}</p>
                  </div>
                  <div className="cs-item">
                    <label>Limit</label>
                    <p>{formatLKR(card.credit_limit)}</p>
                  </div>
                  <div className="cs-item">
                    <label>Utilization</label>
                    <p style={{ color: getUtilColor(pct) }}>{pct}%</p>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="text-muted fs11">Utilization</span>
                    <span className="fs11" style={{ color: getUtilColor(pct) }}>{pct}%</span>
                  </div>
                  <div className="util-bar">
                    <div 
                      className="util-fill" 
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: getUtilColor(pct) }} 
                    />
                  </div>
                </div>
                <div className="flex gap-[8px]">
                  <button className="btn" style={{ flex: 1, justifyContent: 'center' }}>+ Add Tx</button>
                  <button className="btn" style={{ flex: 1, justifyContent: 'center' }}>View Details</button>
                </div>
              </div>
            </div>
          )
        })}
        <div
          style={{
            border: '1px dashed var(--border2)',
            borderRadius: 'var(--card-r)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '8px',
            minHeight: '200px',
            cursor: 'pointer',
            color: 'var(--text3)',
            transition: 'all 0.2s'
          }}
          className="hover:border-accent hover:text-accent"
        >
          <Plus className="w-[24px] h-[24px]" strokeWidth={1.5} />
          <span className="fs13">Add New Card</span>
        </div>
      </div>

      <div className="card mt-16">
        <div className="card-head">
          <div className="card-title">Card Comparison</div>
        </div>
        <div className="card-body p-0">
          <table className="tx-table">
            <thead>
              <tr>
                <th>Card</th>
                <th>Limit</th>
                <th>Balance</th>
                <th>Available</th>
                <th>Utilization</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {cards?.map((card: CreditCard) => {
                const pct = Math.round(((card.current_balance || 0) / card.credit_limit) * 100)
                const avail = card.credit_limit - (card.current_balance || 0)
                return (
                  <tr key={card.id}>
                    <td>
                      <div className="fw600">{card.bank_name} {card.card_name}</div>
                      <div className="text-muted fs11">····{card.last_four}</div>
                    </td>
                    <td className="mono">{formatLKR(card.credit_limit)}</td>
                    <td className="mono" style={{ color: 'var(--red)' }}>{formatLKR(card.current_balance || 0)}</td>
                    <td className="mono" style={{ color: 'var(--green)' }}>{formatLKR(avail)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, maxWidth: '80px' }}>
                          <div className="pct-bar">
                            <div 
                              className="pct-fill" 
                              style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: getUtilColor(pct) }} 
                            />
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', color: getUtilColor(pct) }}>{pct}%</span>
                      </div>
                    </td>
                    <td className="text-text2">Apr 15 (7d)</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
