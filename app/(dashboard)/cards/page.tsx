import { createClient } from '@/lib/supabase/server'
import { CreditCard } from '@/types'
import { Button } from '@/components/ui-creditlens/button'
import { CreditCardVis } from '@/components/ui-creditlens/credit-card-vis'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CardsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: cards } = await supabase.from('credit_cards').select('*').eq('user_id', user?.id)

  const formatLKR = (val: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val)

  const getUtilColor = (p: number) => p < 30 ? '#22d3a0' : p < 70 ? '#f5a623' : '#f4566a'

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">My Cards</div>
          <div className="page-sub">Manage all your credit cards in one place</div>
        </div>
        <Button variant="primary">
          <Plus className="w-3.5 h-3.5" />
          Add New Card
        </Button>
      </div>

      <div className="cards-grid">
        {cards?.map((card: CreditCard) => {
          const pct = Math.round(((card.current_balance || 0) / card.credit_limit) * 100)
          const avail = card.credit_limit - (card.current_balance || 0)
          
          return (
            <div key={card.id}>
              <div 
                className="credit-card-vis" 
                style={{ 
                  background: `linear-gradient(135deg, ${card.card_color} 0%, ${card.card_color}cc 100%)`,
                  color: '#fff'
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
                  <div className="flex flex-col items-end">
                    <div className="font-semibold text-[13px]">{formatLKR(card.credit_limit)}</div>
                    <div className="text-[10px] opacity-70 uppercase tracking-widest">Limit</div>
                  </div>
                </div>
                <div className="cc-util-bar">
                  <div 
                    className="cc-util-fill" 
                    style={{ 
                      width: `${pct}%`, 
                      backgroundColor: pct > 70 ? 'var(--red)' : pct > 40 ? 'var(--amber)' : 'rgba(255,255,255,0.8)' 
                    }} 
                  />
                </div>
              </div>

              <div className="card-item-detail mt-3.5">
                <div className="card-item-header">
                  <div className="w-9 h-9 flex items-center justify-center bg-bg4 rounded-lg text-lg">💳</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13px]">{card.card_name}</div>
                    <div className="text-[11px] text-muted">{card.bank_name} Bank</div>
                  </div>
                  <span className="status-pill bg-bg4 text-text3">Active</span>
                </div>
                <div className="card-stats grid grid-cols-2 gap-2 my-2">
                  <div className="cs-item">
                    <label className="text-[10px] text-muted uppercase tracking-widest">Balance</label>
                    <p className="text-[14px] font-semibold mono text-red">{formatLKR(card.current_balance || 0)}</p>
                  </div>
                  <div className="cs-item">
                    <label className="text-[10px] text-muted uppercase tracking-widest">Available</label>
                    <p className="text-[14px] font-semibold mono text-green">{formatLKR(avail)}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted text-[11px]">Utilization</span>
                    <span className="text-[11px] font-semibold" style={{ color: getUtilColor(pct) }}>{pct}%</span>
                  </div>
                  <div className="util-bar">
                    <div 
                      className="util-fill" 
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: getUtilColor(pct) }} 
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button className="flex-1 justify-center">Manage</Button>
                  <Button className="flex-1 justify-center">Statement</Button>
                </div>
              </div>
            </div>
          )
        })}
        <div className="border border-dashed border-border2 rounded-[12px] flex flex-col items-center justify-center gap-2 min-h-[200px] cursor-pointer text-text3 hover:border-accent hover:text-accent transition-all">
          <Plus className="w-6 h-6" />
          <span className="text-[13px]">Add New Card</span>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-head">
          <div className="card-title">Card Comparison</div>
        </div>
        <div className="card-body p-0">
          <table className="tx-table w-full">
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
                      <div className="font-semibold">{card.bank_name} {card.card_name}</div>
                      <div className="text-muted text-[11px]">····{card.last_four}</div>
                    </td>
                    <td className="mono">{formatLKR(card.credit_limit)}</td>
                    <td className="mono text-red">{formatLKR(card.current_balance || 0)}</td>
                    <td className="mono text-green">{formatLKR(avail)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[80px]">
                          <div className="pct-bar">
                            <div 
                              className="pct-fill" 
                              style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: getUtilColor(pct) }} 
                            />
                          </div>
                        </div>
                        <span className="text-[12px]" style={{ color: getUtilColor(pct) }}>{pct}%</span>
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
