import { createClient } from '@/lib/supabase/server'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'
import { Button } from '@/components/ui-creditlens/button'
import { FileText, Download, TrendingDown, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react'
import { SpendingChart } from '@/components/spending-chart'

export const dynamic = 'force-dynamic'

export default async function StatementPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // For now, default to current month
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const monthName = now.toLocaleString('default', { month: 'long' })

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, credit_cards(bank_name, last_four)')
    .eq('user_id', user?.id)
    .filter('tx_date', 'gte', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`)
    .filter('tx_date', 'lt', `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-01`)
    .order('tx_date', { ascending: false })

  const totalSpent = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0
  const txCount = transactions?.length || 0
  
  const formatLKR = (val: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Monthly Statement</div>
          <div className="page-sub">Comprehensive financial summary for {monthName} {currentYear}</div>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-bg3 p-1 rounded-lg border border-border">
            <Button className="px-2 h-7"><ChevronLeft className="w-4 h-4" /></Button>
            <div className="px-3 flex items-center text-[12px] font-bold">{monthName} {currentYear}</div>
            <Button className="px-2 h-7" disabled><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <Button variant="primary">
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid-60-40">
        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <FileText className="w-3.5 h-3.5 text-accent" />
                Financial Summary Report
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-8 py-4">
                <div className="statement-stat">
                  <div className="text-muted text-[11px] uppercase tracking-widest font-bold mb-1">Total Spending</div>
                  <div className="text-[28px] font-bold text-accent">{formatLKR(totalSpent)}</div>
                  <div className="text-green text-[11px] mt-1 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    4.2% lower than last month
                  </div>
                </div>
                <div className="statement-stat">
                  <div className="text-muted text-[11px] uppercase tracking-widest font-bold mb-1">Transaction Volume</div>
                  <div className="text-[28px] font-bold">{txCount} <span className="text-[14px] text-muted font-normal">items</span></div>
                  <div className="text-muted text-[11px] mt-1">Processed across {new Set(transactions?.map(tx => tx.card_id)).size} cards</div>
                </div>
              </div>

              <div className="border-t border-border mt-6 pt-6">
                <div className="text-[12px] font-bold uppercase tracking-widest mb-4">Detailed Breakdown</div>
                <div className="flex flex-col gap-3">
                  {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => {
                    const amt = transactions?.filter(tx => tx.category === key).reduce((s, t) => s + t.amount, 0) || 0
                    if (amt === 0) return null
                    const pct = Math.round((amt / totalSpent) * 100)
                    
                    return (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-border last:border-0 border-dashed">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{cat.emoji}</span>
                          <span className="text-[13px] font-medium">{cat.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-[13px]">{formatLKR(amt)}</div>
                          <div className="text-[10px] text-muted">{pct}% of total</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="card-head">
              <div className="card-title">
                <CreditCard className="w-3.5 h-3.5 text-blue" />
                Spending by Category
              </div>
            </div>
            <div className="card-body">
              <SpendingChart data={transactions || []} />
            </div>
          </div>
          
          <div className="card bg-bg3 border-dashed">
            <div className="card-body p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <div className="font-bold text-[14px] mb-1">Full Period Logs</div>
              <p className="text-[11px] text-muted mb-4">Access raw CSV export for this statement period including all metadata.</p>
              <Button className="w-full justify-center">Export Full CSV</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
