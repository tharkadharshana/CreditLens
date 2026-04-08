import React from 'react'
import { cn } from '@/lib/utils'
import { ShieldCheck, Wallet, Clock, TrendingDown, LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  meta: string
  icon: LucideIcon
  variant?: 'green' | 'amber' | 'blue' | 'red'
}

export function StatCard({ label, value, meta, icon: Icon, variant }: StatCardProps) {
  return (
    <div className={cn("stat-card", variant)}>
      <div className="stat-label">
        {label}
        <Icon className="w-3.5 h-3.5 opacity-60" />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-meta">{meta}</div>
    </div>
  )
}

interface SummaryCardsProps {
  totalLimit: number
  totalSpent: number
  monthlySpent: number
  dailySpent: number
}

export function SummaryCards({ totalLimit, totalSpent, monthlySpent, dailySpent }: SummaryCardsProps) {
  const remaining = totalLimit - totalSpent
  const utilization = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0
  
  const formatLKR = (val: number) => 
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val)

  return (
    <div className="stat-grid">
      <StatCard 
        variant="green"
        label="Available Credit"
        value={formatLKR(remaining)}
        meta={`${(100 - utilization).toFixed(1)}% available across cards`}
        icon={ShieldCheck}
      />
      <StatCard 
        variant="amber"
        label="Monthly Spend"
        value={formatLKR(monthlySpent)}
        meta="Current statement period"
        icon={Wallet}
      />
      <StatCard 
        variant="blue"
        label="Daily Avg"
        value={formatLKR(dailySpent)}
        meta="Last 24 hours"
        icon={Clock}
      />
      <StatCard 
        variant="red"
        label="Total Outstanding"
        value={formatLKR(totalSpent)}
        meta="Across all cards"
        icon={TrendingDown}
      />
    </div>
  )
}
