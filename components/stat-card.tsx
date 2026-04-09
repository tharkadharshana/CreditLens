'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  meta?: string
  variant?: 'red' | 'green' | 'blue' | 'amber' | 'accent'
  icon: LucideIcon
}

export function StatCard({ label, value, meta, variant, icon: Icon }: StatCardProps) {
  return (
    <div className={cn("stat-card", variant)}>
      <div className="stat-label">
        {label}
        {Icon && <Icon className="w-3 h-3" />}
      </div>
      <div className="stat-value">{value}</div>
      {meta && <div className="stat-meta">{meta}</div>}
    </div>
  )
}
