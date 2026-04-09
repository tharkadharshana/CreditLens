'use client'

import { Transaction } from '@/types'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'

interface SpendingChartProps {
  data: Transaction[]
}

export function SpendingChart({ data }: SpendingChartProps) {
  // Group by category
  const totals = data.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount
    return acc
  }, {} as Record<string, number>)

  const total = Object.values(totals).reduce((sum, v) => sum + v, 0)
  
  // Convert to sorted array for donut segments
  const segments = Object.entries(totals)
    .map(([cat, amount]) => ({
      cat,
      amount,
      pct: (amount / (total || 1)) * 100,
      color: CATEGORY_CONFIG[cat]?.color || CATEGORY_CONFIG.other.color
    }))
    .sort((a, b) => b.amount - a.amount)

  let currentPct = 0

  return (
    <div className="donut-wrap">
      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          {segments.map((seg, i) => {
            const strokeDasharray = `${seg.pct} 100`
            const strokeDashoffset = -currentPct
            currentPct += seg.pct
            
            return (
              <circle
                key={seg.cat}
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke={seg.color}
                strokeWidth="3.5"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            )
          })}
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{Math.round(total / 1000)}k</div>
        </div>
      </div>

      <div className="donut-legend">
        {segments.slice(0, 5).map(seg => (
          <div key={seg.cat} className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: seg.color }} />
            <span style={{ color: 'var(--text2)', flex: 1 }}>{CATEGORY_CONFIG[seg.cat]?.label || seg.cat}</span>
            <span className="mono" style={{ fontSize: '11px' }}>{Math.round(seg.pct)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
