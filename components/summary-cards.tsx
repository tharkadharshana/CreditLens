import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingDown, Clock, ShieldCheck } from 'lucide-react'

interface SummaryCardsProps {
  totalLimit: number
  totalSpent: number
  monthlySpent: number
  dailySpent: number
}

export function SummaryCards({ totalLimit, totalSpent, monthlySpent, dailySpent }: SummaryCardsProps) {
  const remaining = totalLimit - totalSpent
  const utilization = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0

  const items = [
    {
      label: 'Available Credit',
      value: remaining,
      icon: ShieldCheck,
      color: 'text-emerald-400',
      description: `${utilization.toFixed(1)}% Utilization`,
    },
    {
      label: 'Monthly Spend',
      value: monthlySpent,
      icon: Wallet,
      color: 'text-indigo-400',
      description: 'Current Statement',
    },
    {
      label: 'Daily Avg',
      value: dailySpent,
      icon: Clock,
      color: 'text-sky-400',
      description: 'Last 24 hours',
    },
    {
      label: 'Total Outstanding',
      value: totalSpent,
      icon: TrendingDown,
      color: 'text-rose-400',
      description: 'Across all cards',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card key={item.label} className="border-[#2d2d3d] bg-[#1a1a24] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-[#94a3b8]">
              {item.label}
            </CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(item.value)}
            </div>
            <p className="text-[10px] text-[#94a3b8] mt-1 flex items-center gap-1">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
