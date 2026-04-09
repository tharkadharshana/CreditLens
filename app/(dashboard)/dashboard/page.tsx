import { createClient } from '@/lib/supabase/server'
import { Transaction, CreditCard, Profile } from '@/types'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, CreditCard as CardIcon, Smartphone, History, PieChart as ChartIcon } from 'lucide-react'
import { SummaryCards } from '@/components/summary-cards'
import { SpendingChart } from '@/components/spending-chart'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const [profileRes, cardsRes, txRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user?.id).single(),
    supabase.from('credit_cards').select('*').eq('user_id', user?.id),
    supabase.from('transactions').select('*').eq('user_id', user?.id).order('created_at', { ascending: false })
  ])

  const profile = profileRes.data as Profile
  const cards = cardsRes.data as CreditCard[]
  const allTransactions = txRes.data as Transaction[]
  const recentTransactions = allTransactions?.slice(0, 6) || []

  // Real-time calculations
  const totalLimit = cards?.reduce((sum, card) => sum + card.credit_limit, 0) || 0
  const totalSpent = cards?.reduce((sum, card) => sum + (card.current_balance || 0), 0) || 0
  
  const monthlySpent = allTransactions?.filter(tx => {
    const d = new Date(tx.tx_date)
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear()
  }).reduce((sum, tx) => sum + tx.amount, 0) || 0

  const dailySpent = allTransactions?.filter(tx => 
    new Date(tx.tx_date).toDateString() === new Date().toDateString()
  ).reduce((sum, tx) => sum + tx.amount, 0) || 0

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-[#1a1a24]/50 p-8 rounded-2xl border border-[#2d2d3d] backdrop-blur-sm shadow-xl shadow-black/20 text-white">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Hi, {profile?.full_name?.split(' ')[0] || 'User'} <span className="text-indigo-500">.</span>
          </h2>
          <p className="text-[#94a3b8] text-sm mt-1">Here&apos;s your credit health overview for today.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/setup">
            <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-all font-medium">
              <Smartphone className="w-4 h-4 mr-2" />
              Setup iPhone
            </Button>
          </Link>
          <Link href="/cards/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 px-6 font-medium border-none outline-none">
              <Plus className="w-4 h-4 mr-2" />
              Add Card
            </Button>
          </Link>
        </div>
      </div>

      <SummaryCards 
        totalLimit={totalLimit}
        totalSpent={totalSpent}
        monthlySpent={monthlySpent}
        dailySpent={dailySpent}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <History className="w-5 h-5 text-indigo-500" />
              Recent Transactions
            </h3>
            <Link href="/transactions" className="text-xs text-indigo-400 hover:underline">View all activity</Link>
          </div>
          
          <div className="bg-[#1a1a24] rounded-2xl border border-[#2d2d3d] overflow-hidden shadow-xl shadow-black/10">
            {!recentTransactions || recentTransactions.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-[#22222f] rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-[#2d2d3d]">
                  <History className="w-6 h-6 text-[#94a3b8]" />
                </div>
                <p className="text-[#94a3b8] text-sm italic">No recent activity detected.</p>
                <p className="text-xs text-[#64748b] mt-2 italic">Connect your iPhone to start tracking.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-[#22222f] text-[#64748b] text-[10px] uppercase tracking-[0.1em] font-semibold">
                  <tr>
                    <th className="px-8 py-4">Merchant / Source</th>
                    <th className="px-8 py-4">Category</th>
                    <th className="px-8 py-4 text-right">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d2d3d]">
                  {recentTransactions.map((tx: Transaction) => {
                    const cat = CATEGORY_CONFIG[tx.category] || CATEGORY_CONFIG.other
                    return (
                      <tr key={tx.id} className="hover:bg-[#22222f]/50 transition-all duration-200">
                        <td className="px-8 py-5 text-white">
                          <div className="font-semibold text-sm">{tx.merchant || tx.description}</div>
                          <div className="text-[10px] text-[#94a3b8] mt-0.5">{new Date(tx.tx_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-8 py-5">
                          <span 
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm"
                            style={{ backgroundColor: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}20` }}
                          >
                            <span className="mr-1.5">{cat.emoji}</span>
                            {cat.label}
                          </span>
                        </td>
                        <td className={`px-8 py-5 text-right font-bold text-sm ${tx.tx_type === 'debit' ? 'text-white' : 'text-emerald-400'}`}>
                          {tx.tx_type === 'credit' ? '+' : ''}{new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 }).format(tx.amount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <ChartIcon className="w-5 h-5 text-indigo-500" />
              Spending Mix
            </h3>
          </div>
          
          <Card className="border-[#2d2d3d] bg-[#1a1a24] text-white overflow-hidden shadow-xl shadow-black/20">
            <CardHeader className="bg-[#22222f] py-4">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">By Category</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-2">
              <SpendingChart data={allTransactions || []} />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <CardIcon className="w-5 h-5 text-indigo-500" />
              Your Cards
            </h3>
          </div>
          
          <div className="space-y-4">
            {!cards || cards.length === 0 ? (
              <div className="text-sm text-[#94a3b8] italic p-6 border border-dashed border-[#2d2d3d] rounded-2xl flex flex-col items-center gap-3 bg-[#11111a]">
                <Plus className="w-6 h-6 opacity-20" />
                No cards linked.
              </div>
            ) : (
              cards.map((card: CreditCard) => (
                <div key={card.id} className="p-6 bg-gradient-to-br from-[#1a1a24] to-[#22222f] border border-[#2d2d3d] rounded-2xl shadow-xl transition-transform hover:scale-[1.02] duration-200 cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">{card.bank_name}</span>
                      <div className="text-[10px] text-[#94a3b8] uppercase tracking-widest font-semibold">{card.card_name}</div>
                    </div>
                    <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 shadow-sm shadow-indigo-500/20">**** {card.last_four}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-[#64748b] italic">Utilization</span>
                      <span className="text-white font-bold">{new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(card.current_balance || 0)}</span>
                    </div>
                    <div className="w-full bg-[#0f0f13] h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="bg-indigo-500 h-full rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" 
                        style={{ width: `${Math.min(((card.current_balance || 0) / card.credit_limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
