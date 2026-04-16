'use client'

import {
  PieChart, Pie, Cell, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import type { CategoryTotal } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  data:     CategoryTotal[]
  currency: string
}

const CustomTooltip = ({ active, payload, currency }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-sm">
      <p className="font-semibold text-gray-800">
        {d.icon} {d.category}
      </p>
      <p className="text-gray-600">{formatCurrency(d.amount, currency)}</p>
      <p className="text-gray-400">{d.percent.toFixed(1)}% of expenses</p>
    </div>
  )
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function CategoryPieChart({ data, currency }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No expense data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={50}
          paddingAngle={2}
          labelLine={false}
          label={CustomLabel}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend
          formatter={(value) => {
            const item = data.find((d) => d.category === value)
            return (
              <span className="text-xs text-gray-600">
                {item?.icon} {value}
              </span>
            )
          }}
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
