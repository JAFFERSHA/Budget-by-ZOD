import { startOfDay, startOfWeek, startOfMonth, subDays, format } from 'date-fns'
import { TrendingDown, Calendar, CalendarDays, CalendarRange } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatCurrency, getCategoryIcon } from '@/lib/utils'
import type { Transaction } from '@/types'

interface Props {
  transactions: Transaction[]
  currency:     string
}

function sum(txs: Transaction[]) {
  return txs.filter((t) => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0)
}

export function DailyCalculator({ transactions, currency }: Props) {
  const now       = new Date()
  const todayStart     = startOfDay(now)
  const yesterdayStart = startOfDay(subDays(now, 1))
  const weekStart      = startOfWeek(now, { weekStartsOn: 1 })
  const monthStart     = startOfMonth(now)

  const todayTx     = transactions.filter((t) => new Date(t.date) >= todayStart)
  const yesterdayTx = transactions.filter((t) => {
    const d = new Date(t.date)
    return d >= yesterdayStart && d < todayStart
  })
  const weekTx  = transactions.filter((t) => new Date(t.date) >= weekStart)
  const monthTx = transactions.filter((t) => new Date(t.date) >= monthStart)

  const todaySpend     = sum(todayTx)
  const yesterdaySpend = sum(yesterdayTx)
  const weekSpend      = sum(weekTx)
  const monthSpend     = sum(monthTx)

  // Build last-7-days daily breakdown
  const last7: { label: string; amount: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const dayStart = startOfDay(subDays(now, i))
    const dayEnd   = startOfDay(subDays(now, i - 1))
    const dayTxs   = transactions.filter((t) => {
      const d = new Date(t.date)
      return d >= dayStart && d < dayEnd
    })
    last7.push({
      label:  i === 0 ? 'Today' : i === 1 ? 'Yesterday' : format(dayStart, 'EEE'),
      amount: sum(dayTxs),
    })
  }

  const maxDay = Math.max(...last7.map((d) => d.amount), 1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </div>
          <CardTitle>Daily Spend Calculator</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-5">

        {/* Summary pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Today',     amount: todaySpend,     icon: Calendar,      color: 'bg-rose-50 text-rose-700'     },
            { label: 'Yesterday', amount: yesterdaySpend, icon: CalendarDays,  color: 'bg-amber-50 text-amber-700'   },
            { label: 'This Week', amount: weekSpend,      icon: CalendarRange, color: 'bg-indigo-50 text-indigo-700' },
            { label: 'This Month',amount: monthSpend,     icon: CalendarRange, color: 'bg-purple-50 text-purple-700' },
          ].map(({ label, amount, icon: Icon, color }) => (
            <div key={label} className={`rounded-xl p-3 ${color.split(' ')[0]}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`h-3.5 w-3.5 ${color.split(' ')[1]}`} />
                <span className={`text-xs font-medium ${color.split(' ')[1]}`}>{label}</span>
              </div>
              <p className={`text-lg font-bold ${color.split(' ')[1]}`}>
                {formatCurrency(amount, currency)}
              </p>
            </div>
          ))}
        </div>

        {/* Last 7 days bar */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-3">Last 7 Days</p>
          <div className="flex items-end gap-1.5 h-20">
            {last7.map((day) => {
              const pct     = maxDay > 0 ? (day.amount / maxDay) * 100 : 0
              const isToday = day.label === 'Today'
              return (
                <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative flex items-end" style={{ height: '56px' }}>
                    <div
                      className={`w-full rounded-t-md transition-all ${isToday ? 'bg-rose-500' : 'bg-rose-200'}`}
                      style={{ height: `${Math.max(pct, 4)}%` }}
                      title={formatCurrency(day.amount, currency)}
                    />
                  </div>
                  <span className={`text-[10px] ${isToday ? 'font-bold text-rose-600' : 'text-gray-400'}`}>
                    {day.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Today's transactions */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">
            Today&apos;s Transactions
            {todayTx.length > 0 && (
              <span className="ml-1 text-gray-400">({todayTx.length})</span>
            )}
          </p>
          {todayTx.length === 0 ? (
            <p className="text-sm text-gray-400 py-2 text-center">No transactions today yet.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
              {todayTx.map((tx) => (
                <div key={tx.id} className="flex items-center gap-2">
                  <span className="text-base">{getCategoryIcon(tx.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {tx.description ?? tx.category}
                    </p>
                    <p className="text-[10px] text-gray-400">{tx.category}</p>
                  </div>
                  <span className={`text-xs font-bold shrink-0 ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  )
}
