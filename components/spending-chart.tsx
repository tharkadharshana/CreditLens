'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CATEGORY_CONFIG } from '@/lib/utils/categories'

interface ChartData {
  name: string
  value: number
  color: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SpendingChart({ data }: { data: any[] }) {
  // Group data by category
  const grouped = data.reduce((acc: Record<string, number>, tx) => {
    const cat = tx.category || 'other'
    acc[cat] = (acc[cat] || 0) + tx.amount
    return acc
  }, {})

  const chartData: ChartData[] = Object.entries(grouped).map(([key, value]) => ({
    name: CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG]?.label || key,
    value,
    color: CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG]?.color || '#94a3b8'
  }))

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-[#94a3b8] italic text-sm">
        No spending data to visualize.
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #2d2d3d', borderRadius: '8px' }}
            itemStyle={{ color: '#fff', fontSize: '12px' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            formatter={(value) => <span className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
