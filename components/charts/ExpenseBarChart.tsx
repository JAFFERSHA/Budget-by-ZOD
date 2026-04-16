'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { MonthlyData } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  data:     MonthlyData[]
  currency: string
}

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }} className="flex justify-between gap-8">
          <span className="capitalize">{p.name}</span>
          <span className="font-medium">{formatCurrency(p.value, currency)}</span>
        </p>
      ))}
    </div>
  )
}

export function ExpenseBarChart({ data, currency }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${currency === 'USD' ? '$' : ''}${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
          formatter={(v) => <span className="text-gray-600 capitalize">{v}</span>}
        />
        <Bar dataKey="income"   name="income"   fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
        <Bar dataKey="expenses" name="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
