'use client'

import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ExpenseBarChart } from '@/components/charts/ExpenseBarChart'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { TrendLineChart } from '@/components/charts/TrendLineChart'
import { SavingsSuggestions } from '@/components/dashboard/SavingsSuggestions'
import { formatCurrency, getCurrentYear } from '@/lib/utils'

export default function AnalyticsPage() {
  const year = getCurrentYear()

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', year],
    queryFn:  async () => {
      const res = await fetch(`/api/analytics?year=${year}`)
      return res.json()
    },
  })

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn:  async () => (await fetch('/api/user')).json(),
  })

  const currency = userData?.data?.currency ?? 'USD'
  const d        = analyticsData?.data

  if (isLoading) {
    return (
      <>
        <Header title="Analytics" />
        <div className="flex-1 flex items-center justify-center text-gray-400">Loading analytics…</div>
      </>
    )
  }

  const stats = d?.stats ?? { totalIncome: 0, totalExpenses: 0, balance: 0, savingsRate: 0, transactionCount: 0 }

  return (
    <>
      <Header title="Analytics" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">

        {/* Top stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Income',     value: stats.totalIncome,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Total Expenses',   value: stats.totalExpenses, color: 'text-rose-600',    bg: 'bg-rose-50'    },
            { label: 'Net Balance',      value: stats.balance,       color: 'text-indigo-600',  bg: 'bg-indigo-50'  },
            { label: 'Savings Rate',     value: stats.savingsRate,   color: 'text-purple-600',  bg: 'bg-purple-50', suffix: '%' },
          ].map((s) => (
            <Card key={s.label} className="p-5">
              <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>
                {s.suffix
                  ? `${stats.savingsRate.toFixed(1)}%`
                  : formatCurrency(s.value, currency)
                }
              </p>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Income vs Expenses — {year}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ExpenseBarChart data={d?.monthly ?? []} currency={currency} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spending by Category (All Time)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CategoryPieChart data={d?.categories ?? []} currency={currency} />
            </CardContent>
          </Card>
        </div>

        {/* Daily trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Spending — Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <TrendLineChart data={d?.daily ?? []} currency={currency} />
          </CardContent>
        </Card>

        {/* Category breakdown table */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {(d?.categories ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No expense data yet.</p>
            ) : (
              <div className="space-y-3">
                {d?.categories.map((cat: any) => (
                  <div key={cat.category} className="flex items-center gap-3">
                    <span className="text-xl w-8 text-center">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(cat.amount, currency)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 w-10 text-right">{cat.percent.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggestions */}
        <SavingsSuggestions suggestions={d?.suggestions ?? []} />
      </div>
    </>
  )
}
