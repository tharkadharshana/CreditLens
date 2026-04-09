import { createClient } from '@/lib/supabase/server'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'
import { Activity, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Live Feed</div>
          <div className="page-sub">Real-time stream of incoming transactions</div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-green uppercase tracking-widest pl-3 border-l border-border">
          <span className="w-2 h-2 rounded-full bg-green animate-pulse" /> Live Listening
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">
            <Activity className="w-3.5 h-3.5 text-accent" />
            Recent Activity
          </div>
          <div className="text-muted fs11 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last updated just now
          </div>
        </div>
        <div className="card-body p-0">
          <div className="flex flex-col">
            {transactions?.map((tx, i) => {
              const cat = CATEGORY_CONFIG[tx.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other
              const isNew = i < 2
              
              return (
                <div key={tx.id} className={cn("flex items-center gap-4 p-4 border-b border-border hover:bg-bg3 transition-all", isNew && "bg-accent/[0.03]")}>
                  <div className="w-10 h-10 rounded-full bg-bg4 flex items-center justify-center text-lg shrink-0 relative">
                    {cat.emoji}
                    {isNew && <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full border-2 border-bg2"></span>}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="fw600 fs13">{tx.merchant || tx.description}</span>
                      {isNew && <span className="cat-badge bg-accent text-white px-1.5 h-4">NEW</span>}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted uppercase tracking-wider mt-0.5 font-medium">
                      <span className="flex items-center gap-1">
                        {tx.credit_cards?.bank_name} ···{tx.credit_cards?.last_four}
                      </span>
                      <span>·</span>
                      <span>{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <div className={`tx-amount ${tx.tx_type === 'debit' ? 'debit' : 'credit'}`}>
                      {tx.tx_type === 'debit' ? '-' : '+'}{formatLKR(tx.amount)}
                    </div>
                    <span className="cat-badge" style={{ background: `${cat.color}15`, color: cat.color }}>
                      {cat.label}
                    </span>
                  </div>
                </div>
              )
            })}

            {transactions?.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-bg3 flex items-center justify-center border border-dashed border-border text-muted">
                  <Activity className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-muted italic fs12">Waiting for incoming data stream...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
