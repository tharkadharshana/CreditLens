import { createClient } from '@/lib/supabase/server'
import { Transaction } from '@/types'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'
import { Button } from '@/components/ui-creditlens/button'
import { Badge } from '@/components/ui-creditlens/badge'
import { Input, Select } from '@/components/ui-creditlens/form'
import { Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TransactionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [txRes] = await Promise.all([
    supabase.from('transactions')
      .select('*, credit_cards(bank_name, last_four)')
      .eq('user_id', user?.id)
      .order('tx_date', { ascending: false }),
  ])

  const transactions = (txRes.data ?? []) as (Transaction & { credit_cards?: { bank_name: string; last_four: string } })[]

  const formatLKR = (val: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="page active">
      <div className="page-header-row">
        <div className="page-header">
          <div className="page-title">Transactions</div>
          <div className="page-sub">All spending across all cards</div>
        </div>
        <div className="flex gap-2">
          <button className="btn">
            <Plus className="w-3.5 h-3.5" />
            Add Manual
          </button>
          <button className="btn">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input placeholder="Search merchant or description…" className="field max-w-[280px]" />
        <select className="field w-auto">
          <option>All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
            <option key={key} value={key}>{cat.label}</option>
          ))}
        </select>
        <select className="field w-auto">
          <option>All Cards</option>
          <option>HSBC Platinum</option>
          <option>Sampath Visa</option>
        </select>
        <select className="field w-auto">
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 3 Months</option>
        </select>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <table className="tx-table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Category</th>
                <th>Card</th>
                <th>Source</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.map((tx: any) => {
                const cat = CATEGORY_CONFIG[tx.category] || CATEGORY_CONFIG.other
                return (
                  <tr key={tx.id}>
                    <td className="text-muted fs12">
                      {new Date(tx.tx_date).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="tx-merchant">{tx.merchant || tx.description}</div>
                      <div className="tx-desc">{tx.description || 'No description'}</div>
                    </td>
                    <td>
                      <span className="cat-badge" style={{ background: `${cat.color}15`, color: cat.color }}>
                        {cat.emoji} {cat.label}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted fs12">
                        {tx.credit_cards?.bank_name} ···{tx.credit_cards?.last_four}
                      </span>
                    </td>
                    <td>
                      <span className="source-badge">
                        {tx.source === 'shortcut' ? '📱 Shortcut' : '✋ Manual'}
                      </span>
                    </td>
                    <td className={`tx-amount ${tx.tx_type === 'debit' ? 'debit' : 'credit'}`}>
                      {tx.tx_type === 'debit' ? '-' : '+'}{formatLKR(tx.amount)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          <div className="px-5 py-3.5 flex items-center justify-between border-t border-border">
            <span className="text-muted fs12">
              Showing {transactions?.length || 0} transactions
            </span>
            <div className="flex gap-2">
              <button className="btn px-3">
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <button className="btn px-3">
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
