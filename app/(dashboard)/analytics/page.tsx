import { createClient } from '@/lib/supabase/server'
import { Transaction, CreditCard } from '@/types'
import { PieChart as ChartIcon, TrendingUp, Calendar, Filter } from 'lucide-react'
import { SpendingChart } from '@/components/spending-chart'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const [txRes, cardsRes] = await Promise.all([
    supabase.from('transactions').select('*').eq('user_id', user?.id).order('tx_date', { ascending: false }),
    supabase.from('credit_cards').select('*').eq('user_id', user?.id)
  ])

  const transactions = txRes.data as Transaction[]
  const cards = cardsRes.data as CreditCard[]

  const formatLKR = (val: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Analytics</div>
          <div className="page-sub">Deep dive into your financial habits</div>
        </div>
        <div className="flex gap-2">
          <select className="field w-auto">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Year to Date</option>
          </select>
          <button className="btn">
            <Filter className="w-3.5 h-3.5" />
            Advanced
          </button>
        </div>
      </div>

      <div className="grid-60-40">
        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                Monthly Spending Trend
              </div>
            </div>
            <div className="card-body">
              <div className="chart-area" style={{ height: '200px' }}>
                {[45, 62, 38, 55, 82, 49, 72, 58, 91, 65, 78, 52].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div 
                      className="chart-bar" 
                      style={{ height: `${v}%` }}
                      data-val={formatLKR(v * 5000)}
                    />
                    <div className="text-[10px] text-muted uppercase mt-2">
                      {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <ChartIcon className="w-3.5 h-3.5 text-blue" />
                Spending by Cards
              </div>
            </div>
            <div className="card-body">
              <div className="flex flex-col gap-4">
                {cards?.map(card => {
                  const spent = transactions
                    ?.filter(tx => tx.card_id === card.id)
                    .reduce((sum, tx) => sum + tx.amount, 0) || 0
                  const totalAmt = transactions?.reduce((s, t) => s + t.amount, 0) || 1
                  const pct = Math.round((spent / totalAmt) * 100)
                  
                  return (
                    <div key={card.id}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: card.card_color }} />
                          <span className="fs13 font-medium">{card.bank_name} {card.card_name}</span>
                        </div>
                        <span className="mono fs12">{formatLKR(spent)} ({pct}%)</span>
                      </div>
                      <div className="util-bar h-1.5">
                        <div 
                          className="util-fill" 
                          style={{ width: `${pct}%`, backgroundColor: card.card_color }} 
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <ChartIcon className="w-3.5 h-3.5 text-green" />
                Category Distribution
              </div>
            </div>
            <div className="card-body">
              <SpendingChart data={transactions || []} />
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <Calendar className="w-3.5 h-3.5 text-amber" />
                Insights
              </div>
            </div>
            <div className="card-body flex flex-col gap-3">
              {[
                { title: 'Dining Surge', desc: 'Your dining spend is up 22% compared to last month.', type: 'warning' },
                { title: 'New Low', desc: 'Entertainment expenses reached a 6-month low. Great job!', type: 'success' },
                { title: 'Uncategorized', desc: 'You have 4 transactions waiting for a category.', type: 'info' }
              ].map((insight, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-bg1/40 border border-border">
                  <div className={`w-1 h-full rounded-full ${insight.type === 'warning' ? 'bg-amber' : insight.type === 'success' ? 'bg-green' : 'bg-blue'}`} />
                  <div>
                    <div className="fs12 font-bold">{insight.title}</div>
                    <div className="text-[11px] text-muted">{insight.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
