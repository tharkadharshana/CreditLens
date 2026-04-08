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
          <Button>
            <Plus className="w-3.5 h-3.5" />
            Add Manual
          </Button>
          <Button>
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Input placeholder="Search merchant or description…" className="max-w-[280px]" />
        <Select className="w-auto">
          <option>All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
            <option key={key} value={key}>{cat.label}</option>
          ))}
        </Select>
        <Select className="w-auto">
          <option>All Cards</option>
          <option>HSBC Platinum</option>
          <option>Sampath Visa</option>
        </Select>
        <Select className="w-auto">
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 3 Months</option>
        </Select>
      </div>

      <div className="card">
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
            {transactions?.map((tx: Transaction & { credit_cards?: { bank_name: string; last_four: string } }) => {
              const cat = CATEGORY_CONFIG[tx.category] || CATEGORY_CONFIG.other
              return (
                <tr key={tx.id}>
                  <td className="text-muted text-[12px]">
                    {new Date(tx.tx_date).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="font-semibold text-[13px]">{tx.merchant || tx.description}</div>
                    <div className="text-muted text-[11px]">{tx.description || 'No description'}</div>
                  </td>
                  <td>
                    <Badge type="category" style={{ background: `${cat.color}15`, color: cat.color }}>
                      {cat.emoji} {cat.label}
                    </Badge>
                  </td>
                  <td>
                    <span className="text-muted text-[12px]">
                      {tx.credit_cards?.bank_name} ···{tx.credit_cards?.last_four}
                    </span>
                  </td>
                  <td>
                    <Badge type="source">
                      {tx.source === 'shortcut' ? '📱 Shortcut' : '✋ Manual'}
                    </Badge>
                  </td>
                  <td className={`tx-amount ${tx.tx_type === 'debit' ? 'debit' : 'credit'}`} style={{ textAlign: 'right' }}>
                    {tx.tx_type === 'debit' ? '-' : '+'}{formatLKR(tx.amount)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        <div className="px-5 py-3.5 flex items-center justify-between border-t border-border">
          <span className="text-muted text-[12px]">
            Showing {transactions?.length || 0} transactions
          </span>
          <div className="flex gap-2">
            <Button className="px-3">
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            <Button className="px-3">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
