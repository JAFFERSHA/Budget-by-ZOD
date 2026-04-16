import Link from 'next/link'
import { cn, formatCurrency, getCategoryIcon } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { BudgetWithSpent } from '@/types'

interface Props {
  budgets:  BudgetWithSpent[]
  currency: string
}

const statusColors = {
  safe:     'bg-emerald-500',
  warning:  'bg-amber-400',
  exceeded: 'bg-rose-500',
}

export function BudgetProgress({ budgets, currency }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Budget Overview</CardTitle>
        <Link href="/dashboard/budget" className="text-xs text-indigo-600 hover:underline font-medium">
          Manage →
        </Link>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {budgets.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p className="text-sm">No budgets set yet.</p>
            <Link href="/dashboard/budget" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
              Set your first budget →
            </Link>
          </div>
        ) : (
          budgets.slice(0, 6).map((b) => (
            <div key={b.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{getCategoryIcon(b.category)}</span>
                  <span className="text-sm font-medium text-gray-700">{b.category}</span>
                </div>
                <div className="text-xs text-gray-500">
                  <span className={b.status === 'exceeded' ? 'text-rose-600 font-semibold' : ''}>
                    {formatCurrency(b.spent, currency)}
                  </span>
                  {' / '}{formatCurrency(b.amount, currency)}
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', statusColors[b.status])}
                  style={{ width: `${Math.min(b.percent, 100)}%` }}
                />
              </div>
              {b.status === 'exceeded' && (
                <p className="text-xs text-rose-600 mt-0.5">
                  Over by {formatCurrency(b.spent - b.amount, currency)}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
