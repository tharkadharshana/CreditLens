import { createClient } from '@/lib/supabase/server'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'
import { History, ArrowLeftRight, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TransactionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, credit_cards(bank_name, last_four)')
    .eq('user_id', user?.id)
    .order('tx_date', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
          <History className="text-indigo-500" />
          Transaction History
        </h1>
        <p className="text-[#94a3b8]">Review every penny tracked across your cards</p>
      </div>

      <div className="bg-[#1a1a24] rounded-2xl border border-[#2d2d3d] overflow-hidden shadow-2xl shadow-black/40">
        {!transactions || transactions.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-[#22222f] rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-[#2d2d3d]">
              <ArrowLeftRight className="w-6 h-6 text-[#94a3b8]" />
            </div>
            <p className="text-[#94a3b8]">No transactions recorded yet.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#22222f] text-[#64748b] text-[10px] uppercase tracking-[0.15em] font-black">
              <tr>
                <th className="px-8 py-5">Date & Merchant</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Source Card</th>
                <th className="px-8 py-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d2d3d]">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {transactions.map((tx: any) => {
                const cat = CATEGORY_CONFIG[tx.category] || CATEGORY_CONFIG.other
                return (
                  <tr key={tx.id} className="hover:bg-[#22222f]/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                          {tx.merchant || tx.description}
                        </span>
                        <span className="text-[10px] text-[#94a3b8] flex items-center gap-1 mt-1 font-medium italic">
                          <Calendar className="w-3 h-3" />
                          {new Date(tx.tx_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span 
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold"
                        style={{ backgroundColor: `${cat.color}10`, color: cat.color, border: `1px solid ${cat.color}20` }}
                      >
                        <span className="mr-1.5">{cat.emoji}</span>
                        {cat.label}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs text-indigo-300/80 font-bold tracking-tight">
                          {tx.credit_cards?.bank_name}
                        </span>
                        <span className="text-[10px] text-[#55556d] font-mono">
                          **** {tx.credit_cards?.last_four}
                        </span>
                      </div>
                    </td>
                    <td className={`px-8 py-5 text-right font-black text-sm ${tx.tx_type === 'debit' ? 'text-white' : 'text-emerald-400'}`}>
                      {tx.tx_type === 'credit' ? '+' : ''}
                      {new Intl.NumberFormat('en-LK', { style: 'currency', currency: tx.currency, maximumFractionDigits: 0 }).format(tx.amount)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
