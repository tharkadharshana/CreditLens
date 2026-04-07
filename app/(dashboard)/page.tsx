import { createClient } from '@/lib/supabase/server'
import { Transaction } from '@/types'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'
import { format } from 'date-fns' // I might need to install date-fns, let me check if I did.

// Actually I didn't install date-fns yet. I'll use native Intl for now to avoid breaking.

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <p className="text-[#94a3b8]">Verify your ingested transactions here</p>
        </div>
      </div>

      <div className="bg-[#1a1a24] rounded-xl border border-[#2d2d3d] overflow-hidden">
        {error ? (
          <div className="p-6 text-red-400">Error loading transactions: {error.message}</div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#94a3b8] mb-4">No transactions found yet.</p>
            <p className="text-sm">Use the /api/ingest endpoint to send data from your iPhone.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#22222f] text-[#94a3b8] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d2d3d]">
              {transactions.map((tx: Transaction) => {
                const cat = CATEGORY_CONFIG[tx.category] || CATEGORY_CONFIG.other
                return (
                  <tr key={tx.id} className="hover:bg-[#22222f] transition-colors">
                    <td className="px-6 py-4 text-sm">
                      {new Date(tx.tx_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{tx.description}</div>
                      <div className="text-xs text-[#94a3b8]">{tx.merchant}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        {cat.emoji} {cat.label}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold ${tx.tx_type === 'debit' ? 'text-white' : 'text-emerald-400'}`}>
                      {tx.tx_type === 'debit' ? '' : '-'}{new Intl.NumberFormat('en-LK', { style: 'currency', currency: tx.currency }).format(tx.amount)}
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
