'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { transactionSchema, type TransactionInput } from '@/lib/validations'
import { CATEGORIES } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Transaction } from '@/types'

interface Props {
  onSuccess:  () => void
  onCancel:   () => void
  initial?:   Transaction
  currency:   string
}

export function TransactionForm({ onSuccess, onCancel, initial, currency }: Props) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type:        initial?.type        ?? 'DEBIT',
      amount:      initial?.amount      ?? undefined,
      category:    initial?.category    ?? '',
      description: initial?.description ?? '',
      date:        initial?.date
        ? format(new Date(initial.date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
    },
  })

  const txType = watch('type')

  const onSubmit = async (data: TransactionInput) => {
    setLoading(true)
    setError('')
    try {
      const url    = initial ? `/api/transactions/${initial.id}` : '/api/transactions'
      const method = initial ? 'PUT' : 'POST'

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) { setError(json.error ?? 'Something went wrong.'); return }
      onSuccess()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = CATEGORIES.map((c) => ({
    value: c.value,
    label: `${c.icon} ${c.value}`,
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 p-1 gap-1">
        {(['DEBIT', 'CREDIT'] as const).map((t) => (
          <label
            key={t}
            className={`flex-1 text-center py-2 rounded-lg text-sm font-medium cursor-pointer transition-all
              ${txType === t
                ? t === 'CREDIT'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            <input type="radio" value={t} {...register('type')} className="sr-only" />
            {t === 'CREDIT' ? '↑ Income (Credit)' : '↓ Expense (Debit)'}
          </label>
        ))}
      </div>

      <Input
        label="Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        prefix={currency === 'USD' ? '$' : currency}
        error={errors.amount?.message}
        {...register('amount', { valueAsNumber: true })}
      />

      <Select
        label="Category"
        options={categoryOptions}
        placeholder="Select category…"
        error={errors.category?.message}
        {...register('category')}
      />

      <Input
        label="Date"
        type="date"
        error={errors.date?.message}
        {...register('date')}
      />

      <Input
        label="Description (optional)"
        placeholder="e.g. Grocery run, Monthly salary…"
        {...register('description')}
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
          variant={txType === 'CREDIT' ? 'success' : 'primary'}
        >
          {initial ? 'Update' : 'Add'} Transaction
        </Button>
      </div>
    </form>
  )
}
