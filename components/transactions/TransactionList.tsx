'use client'

import { useState } from 'react'
import { Pencil, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { formatCurrency, formatDate, getCategoryIcon } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TransactionForm } from './TransactionForm'
import type { Transaction } from '@/types'

interface Props {
  transactions: Transaction[]
  currency:     string
  onRefresh:    () => void
}

export function TransactionList({ transactions, currency, onRefresh }: Props) {
  const [editing,  setEditing]  = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
    if (res.ok) { onRefresh(); setDeleting(null) }
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-5xl mb-3">💸</p>
        <p className="text-sm font-medium">No transactions found.</p>
        <p className="text-xs mt-1">Add your first transaction above.</p>
      </div>
    )
  }

  return (
    <>
      <div className="divide-y divide-gray-100">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center gap-3 py-3 px-1 hover:bg-gray-50 rounded-lg transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg shrink-0">
              {getCategoryIcon(tx.category)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {tx.description ?? tx.category}
              </p>
              <p className="text-xs text-gray-400">{formatDate(tx.date)} · {tx.category}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className={`text-sm font-bold ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </p>
                <Badge variant={tx.type === 'CREDIT' ? 'success' : 'danger'} className="text-[10px] mt-0.5">
                  {tx.type === 'CREDIT'
                    ? <><ArrowUpRight className="h-2.5 w-2.5" /> Credit</>
                    : <><ArrowDownLeft className="h-2.5 w-2.5" /> Debit</>
                  }
                </Badge>
              </div>

              <div className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={() => setEditing(tx)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleting(tx.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit Transaction"
      >
        {editing && (
          <TransactionForm
            initial={editing}
            currency={currency}
            onSuccess={() => { setEditing(null); onRefresh() }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete Transaction"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={() => deleting && handleDelete(deleting)} className="flex-1">
            Delete
          </Button>
        </div>
      </Modal>
    </>
  )
}
