'use client'

import { Transaction, CreditCard, Profile } from '@/types'
import Link from 'next/link'
import { Plus, Smartphone, History, PieChart as ChartIcon } from 'lucide-react'
import { SpendingChart } from '@/components/spending-chart'
import { formatLKR } from '@/lib/utils/currency'

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
    const d = new Date(tx.tx_date || new Date())
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear()
  }).reduce((sum, tx) => sum + tx.amount, 0) || 0

  const dailyAvg = allTransactions && allTransactions.length > 0 
    ? Math.round(allTransactions.reduce((sum, tx) => sum + tx.amount, 0) / Math.max(allTransactions.length, 1))
    : 0

  const availableCredit = totalLimit - totalSpent

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b0b0f]">
      {/* Main Content */}
      <div className="p-8 space-y-8">
        
        {/* Header */}
        <div className="space-y-1 mb-8">
          <h1 className="text-4xl font-bold text-white">
            Hi, {profile?.full_name?.split(' ')[0] || 'User'} <span className="text-[#7c6cfa]">.</span>
          </h1>
          <p className="text-[#9090a8]">Here's your credit health overview for today.</p>
        </div>

        {/* CTAs */}
        <div className="flex gap-4 justify-end mb-4">
          <Link href="/dashboard/setup">
            <button className="flex items-center gap-2 px-4 py-2 border border-[#7c6cfa]/30 text-[#7c6cfa] rounded-lg hover:bg-[#7c6cfa]/5 transition-all font-medium text-sm">
              <Smartphone size={16} />
              Setup iPhone
            </button>
          </Link>
          <Link href="/dashboard/cards/new">
            <button className="flex items-center gap-2 px-6 py-2 bg-[#7c6cfa] text-white rounded-lg hover:bg-[#6055d8] transition-all font-medium text-sm shadow-lg shadow-[#7c6cfa]/20">
              <Plus size={16} />
              Add Card
            </button>
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#111116] border border-[#2a2a35] rounded-lg p-4">
            <p className="text-[#9090a8] text-xs font-semibold uppercase tracking-widest mb-2">Available Credit</p>
            <p className="text-2xl font-bold text-[#22d3a0]">{formatLKR(availableCredit)}</p>
            <p className="text-xs text-[#5a5a70] mt-1">of {formatLKR(totalLimit)}</p>
          </div>

          <div className="bg-[#111116] border border-[#2a2a35] rounded-lg p-4">
            <p className="text-[#9090a8] text-xs font-semibold uppercase tracking-widest mb-2">Monthly Spend</p>
            <p className="text-2xl font-bold text-[#f5a623]">{formatLKR(monthlySpent)}</p>
            <p className="text-xs text-[#5a5a70] mt-1">This month</p>
          </div>

          <div className="bg-[#111116] border border-[#2a2a35] rounded-lg p-4">
            <p className="text-[#9090a8] text-xs font-semibold uppercase tracking-widest mb-2">Daily Average</p>
            <p className="text-2xl font-bold text-[#4a9eff]">{formatLKR(dailyAvg)}</p>
            <p className="text-xs text-[#5a5a70] mt-1">per day</p>
          </div>

          <div className="bg-[#111116] border border-[#2a2a35] rounded-lg p-4">
            <p className="text-[#9090a8] text-xs font-semibold uppercase tracking-widest mb-2">Total Outstanding</p>
            <p className="text-2xl font-bold text-[#f4566a]">{formatLKR(totalSpent)}</p>
            <p className="text-xs text-[#5a5a70] mt-1">across all cards</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Left: Transaction Table (2 columns) */}
          <div className="col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History size={18} className="text-[#7c6cfa]" />
                Recent Transactions
              </h2>
              <Link href="/dashboard/transactions" className="text-xs text-[#7c6cfa] hover:underline">
                View all activity
              </Link>
            </div>

            <div className="bg-[#111116] border border-[#2a2a35] rounded-lg overflow-hidden">
              {!recentTransactions || recentTransactions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-[#18181f] rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-[#2a2a35]">
                    <History size={24} className="text-[#9090a8]" />
                  </div>
                  <p className="text-[#9090a8] text-sm italic">No recent activity detected.</p>
                  <p className="text-xs text-[#5a5a70] mt-2 italic">Connect your iPhone to start tracking.</p>
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-[#18181f] border-b border-[#2a2a35]">
                    <tr>
                      <th className="px-6 py-3 text-left text-[#9090a8] font-semibold uppercase tracking-widest">Merchant</th>
                      <th className="px-6 py-3 text-left text-[#9090a8] font-semibold uppercase tracking-widest">Category</th>
                      <th className="px-6 py-3 text-right text-[#9090a8] font-semibold uppercase tracking-widest">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a35]">
                    {recentTransactions.map((tx: Transaction) => (
                      <tr key={tx.id} className="hover:bg-[#18181f] transition-colors">
                        <td className="px-6 py-3 font-medium text-white">{tx.merchant || 'Unknown'}</td>
                        <td className="px-6 py-3">
                          <span className="px-3 py-1 text-xs rounded-full bg-[#7c6cfa]/10 text-[#7c6cfa] font-medium">
                            {tx.category || 'Other'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right font-mono font-semibold text-[#f4566a]">
                          {formatLKR(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right: Cards & Chart (1 column) */}
          <div className="space-y-6">
            {/* Active Cards */}
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Plus size={18} className="text-[#7c6cfa]" />
                Active Cards
              </h2>
              <div className="space-y-3">
                {cards && cards.length > 0 ? (
                  cards.map((card: CreditCard) => (
                    <div key={card.id} className="bg-[#111116] border border-[#2a2a35] rounded-lg p-4 hover:border-[#7c6cfa]/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-white text-sm">{card.card_name}</p>
                          <p className="text-xs text-[#5a5a70]">**** {card.last_four}</p>
                        </div>
                        <p className="text-xs font-semibold text-[#7c6cfa] uppercase">{card.card_network || 'CARD'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#5a5a70]">Balance</span>
                          <span className="text-white font-mono font-semibold">{formatLKR(card.current_balance)}</span>
                        </div>
                        <div className="w-full bg-[#18181f] rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-[#7c6cfa] to-[#22d3a0] h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((card.current_balance / card.credit_limit) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#111116] border border-[#2a2a35] rounded-lg p-4 text-center">
                    <p className="text-[#9090a8] text-sm">No cards added yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Spending Chart */}
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <ChartIcon size={18} className="text-[#7c6cfa]" />
                Spending Trend
              </h2>
              <div className="bg-[#111116] border border-[#2a2a35] rounded-lg p-4">
                <SpendingChart data={allTransactions} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
