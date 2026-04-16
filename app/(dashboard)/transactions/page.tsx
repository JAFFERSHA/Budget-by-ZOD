'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Filter } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent } from '@/components/ui/Card'
import { CATEGORIES } from '@/lib/utils'

const categoryOptions = [
  { value: '', label: 'All Categories' },
  ...CATEGORIES.map((c) => ({ value: c.value, label: `${c.icon} ${c.value}` })),
]

const typeOptions = [
  { value: '',       label: 'All Types' },
  { value: 'CREDIT', label: '↑ Income (Credit)' },
  { value: 'DEBIT',  label: '↓ Expense (Debit)' },
]

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [search,   setSearch]   = useState('')
  const [type,     setType]     = useState('')
  const [category, setCategory] = useState('')
  const [page,     setPage]     = useState(1)

  const queryKey = ['transactions', search, type, category, page]

  const { data, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), perPage: '25' })
      if (search)   params.set('search',   search)
      if (type)     params.set('type',     type)
      if (category) params.set('category', category)
      const res = await fetch(`/api/transactions?${params}`)
      return res.json()
    },
  })

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      return res.json()
    },
  })

  const currency     = userData?.data?.currency ?? 'USD'
  const transactions = data?.data   ?? []
  const total        = data?.total  ?? 0

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <>
      <Header title="Transactions" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <Select
              options={typeOptions}
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1) }}
              className="w-40"
            />
            <Select
              options={categoryOptions}
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1) }}
              className="w-48"
            />
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex gap-2 text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded-full">
            {total} transaction{total !== 1 ? 's' : ''}
          </span>
          {type     && <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{type}</span>}
          {category && <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{category}</span>}
        </div>

        {/* List */}
        <Card>
          <CardContent className="py-2">
            {isLoading ? (
              <div className="py-16 text-center text-gray-400 text-sm">Loading transactions…</div>
            ) : (
              <TransactionList
                transactions={transactions}
                currency={currency}
                onRefresh={handleRefresh}
              />
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {total > 25 && (
          <div className="flex justify-center gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="px-3 py-1.5 text-sm text-gray-600">
              Page {page} of {Math.ceil(total / 25)}
            </span>
            <Button variant="secondary" size="sm" disabled={page >= Math.ceil(total / 25)} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Transaction">
        <TransactionForm
          currency={currency}
          onSuccess={() => { setShowForm(false); handleRefresh() }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </>
  )
}
