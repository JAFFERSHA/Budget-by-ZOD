import Link from 'next/link'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDateShort, getCategoryIcon } from '@/lib/utils'
import type { Transaction } from '@/types'

interface Props {
  transactions: Transaction[]
  currency:     string
}

export function RecentTransactions({ transactions, currency }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Recent Transactions</CardTitle>
        <Link href="/dashboard/transactions" className="text-xs text-indigo-600 hover:underline font-medium">
          View all →
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No transactions yet.</p>
            <p className="text-xs mt-1">Add your first transaction to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 8).map((tx) => (
              <div key={tx.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-base shrink-0">
                  {getCategoryIcon(tx.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {tx.description ?? tx.category}
                  </p>
                  <p className="text-xs text-gray-400">{formatDateShort(tx.date)} · {tx.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </p>
                  <Badge variant={tx.type === 'CREDIT' ? 'success' : 'danger'} className="text-[10px] mt-0.5">
                    {tx.type === 'CREDIT'
                      ? <><ArrowUpRight className="h-2.5 w-2.5" /> Credit</>
                      : <><ArrowDownLeft className="h-2.5 w-2.5" /> Debit</>
                    }
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
