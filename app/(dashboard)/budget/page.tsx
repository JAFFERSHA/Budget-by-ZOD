'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { budgetSchema, type BudgetInput } from '@/lib/validations'
import { CATEGORIES, cn, formatCurrency, getCategoryIcon, getCurrentMonth, getCurrentYear, getMonthName } from '@/lib/utils'
import type { BudgetWithSpent } from '@/types'

const categoryOptions = CATEGORIES
  .filter((c) => c.value !== 'Salary / Income')
  .map((c) => ({ value: c.value, label: `${c.icon} ${c.value}` }))

const statusConfig = {
  safe:     { bar: 'bg-emerald-500', badge: 'success' as const,  label: 'On Track'  },
  warning:  { bar: 'bg-amber-400',   badge: 'warning' as const,  label: 'Warning'   },
  exceeded: { bar: 'bg-rose-500',    badge: 'danger'  as const,  label: 'Exceeded'  },
}

export default function BudgetPage() {
  const [showForm, setShowForm] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const month = getCurrentMonth()
  const year  = getCurrentYear()

  const { data: budgetData, refetch } = useQuery({
    queryKey: ['budgets', month, year],
    queryFn:  async () => {
      const res = await fetch(`/api/budgets?month=${month}&year=${year}`)
      return res.json()
    },
  })

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn:  async () => (await fetch('/api/user')).json(),
  })

  const currency = userData?.data?.currency ?? 'USD'
  const budgets: BudgetWithSpent[] = budgetData?.data ?? []

  const totalBudget  = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent   = budgets.reduce((s, b) => s + b.spent,  0)
  const overallPct   = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { month, year },
  })

  const onSubmit = async (data: BudgetInput) => {
    setLoading(true); setError('')
    const res = await fetch('/api/budgets', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error ?? 'Failed to save budget.'); setLoading(false); return }
    setLoading(false); setShowForm(false); reset(); refetch()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
    refetch()
  }

  return (
    <>
      <Header title="Budget Planner" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">

        {/* Month header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {getMonthName(month)} {year}
            </h2>
            <p className="text-sm text-gray-500">{budgets.length} budget{budgets.length !== 1 ? 's' : ''} set</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Set Budget
          </Button>
        </div>

        {/* Overall progress */}
        {budgets.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Overall Budget Usage</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">
                    {formatCurrency(totalSpent, currency)}
                    <span className="text-base font-normal text-gray-400"> / {formatCurrency(totalBudget, currency)}</span>
                  </p>
                </div>
                <span className={cn('text-2xl font-bold', overallPct > 100 ? 'text-rose-600' : overallPct > 80 ? 'text-amber-500' : 'text-emerald-600')}>
                  {overallPct.toFixed(0)}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', overallPct > 100 ? 'bg-rose-500' : overallPct > 80 ? 'bg-amber-400' : 'bg-emerald-500')}
                  style={{ width: `${Math.min(overallPct, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Budget cards */}
        {budgets.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-3">🎯</p>
            <p className="font-medium">No budgets set for {getMonthName(month)}</p>
            <p className="text-sm mt-1">Set limits per category to track your spending.</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Set Your First Budget
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {budgets.map((b) => {
              const cfg = statusConfig[b.status]
              return (
                <Card key={b.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(b.category)}</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{b.category}</p>
                        <Badge variant={cfg.badge} className="mt-0.5">{cfg.label}</Badge>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-gray-300 hover:text-rose-500 p-1 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Spent</span>
                      <span className={cn('font-semibold', b.status === 'exceeded' ? 'text-rose-600' : 'text-gray-900')}>
                        {formatCurrency(b.spent, currency)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', cfg.bar)}
                        style={{ width: `${Math.min(b.percent, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{b.percent.toFixed(0)}% used</span>
                      <span>Budget: {formatCurrency(b.amount, currency)}</span>
                    </div>
                    {b.status === 'exceeded' && (
                      <p className="text-xs text-rose-600 font-medium">
                        Over by {formatCurrency(b.spent - b.amount, currency)}
                      </p>
                    )}
                    {b.status === 'safe' && (
                      <p className="text-xs text-emerald-600">
                        {formatCurrency(b.amount - b.spent, currency)} remaining
                      </p>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Add budget modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); reset(); setError('') }} title="Set Budget">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Category"
            options={categoryOptions}
            placeholder="Select category…"
            error={errors.category?.message}
            {...register('category')}
          />
          <Input
            label="Monthly Budget Limit"
            type="number"
            step="0.01"
            placeholder="0.00"
            prefix={currency === 'USD' ? '$' : currency}
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />
          <input type="hidden" value={month} {...register('month', { valueAsNumber: true })} />
          <input type="hidden" value={year}  {...register('year',  { valueAsNumber: true })} />

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => { setShowForm(false); reset() }} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
