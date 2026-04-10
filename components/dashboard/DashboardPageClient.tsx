'use client'

import { Transaction, CreditCard, Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, CreditCard as CardIcon, Smartphone, History, PieChart as ChartIcon } from 'lucide-react'
import { SummaryCards } from '@/components/summary-cards'
import { SpendingChart } from '@/components/spending-chart'

interface DashboardPageClientProps {
  profile: Profile | null
  cards: CreditCard[]
  allTransactions: Transaction[]
}

export function DashboardPageClient({ profile, cards, allTransactions }: DashboardPageClientProps) {
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
                  {recentTransactions.map((tx: Transaction) => (
                    <tr key={tx.id} className="hover:bg-[#22222f] transition-colors">
                      <td className="px-8 py-4 text-sm text-white font-medium">{tx.merchant}</td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 text-xs rounded-full bg-indigo-500/10 text-indigo-300 font-medium">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right text-sm font-semibold text-rose-400">
                        LKR {tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-white">
              <CardIcon className="w-5 h-5 text-indigo-500" />
              Active Cards
            </h3>
            <div className="space-y-3">
              {cards && cards.length > 0 ? (
                cards.map((card: CreditCard) => (
                  <Card key={card.id} className="bg-[#1a1a24] border-[#2d2d3d]">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-medium text-white">{card.card_name}</p>
                          <p className="text-xs text-[#94a3b8]">**** {card.last_four}</p>
                        </div>
                        <p className="text-xs font-semibold text-indigo-400">{card.card_type === 'credit' ? 'Credit' : 'Debit'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#64748b]">Balance</span>
                          <span className="text-white font-semibold">LKR {(card.current_balance || 0).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-[#22222f] rounded-full h-2">
                          <div 
                            className="bg-indigo-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((card.current_balance / card.credit_limit) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-[#1a1a24] border-[#2d2d3d]">
                  <CardContent className="p-6 text-center">
                    <p className="text-[#94a3b8] text-sm">No cards added yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-white">
              <ChartIcon className="w-5 h-5 text-indigo-500" />
              Spending Trend
            </h3>
            <SpendingChart transactions={allTransactions} />
          </div>
        </div>
      </div>
    </div>
  )
}
