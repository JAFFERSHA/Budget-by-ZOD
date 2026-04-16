'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, User, Bell, DollarSign } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { userUpdateSchema, type UserUpdateInput } from '@/lib/validations'
import { CURRENCIES } from '@/lib/utils'

const currencyOptions = CURRENCIES.map((c) => ({
  value: c.code,
  label: `${c.symbol} ${c.code} — ${c.name}`,
}))

export default function SettingsPage() {
  const [saved,  setSaved]  = useState(false)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const { data: userData, refetch } = useQuery({
    queryKey: ['user'],
    queryFn:  async () => (await fetch('/api/user')).json(),
  })

  const user = userData?.data

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserUpdateInput>({
    resolver: zodResolver(userUpdateSchema),
  })

  useEffect(() => {
    if (user) {
      reset({
        name:            user.name            ?? '',
        currency:        user.currency        ?? 'USD',
        monthlyIncome:   user.monthlyIncome   ?? undefined,
        lowBalanceAlert: user.lowBalanceAlert ?? 500,
      })
    }
  }, [user, reset])

  const onSubmit = async (data: UserUpdateInput) => {
    setSaving(true); setError(''); setSaved(false)
    const res = await fetch('/api/user', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setError(json.error ?? 'Failed to save.'); return }
    setSaved(true); refetch()
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 overflow-auto p-4 md:p-6 max-w-2xl space-y-6">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <User className="h-4 w-4 text-indigo-600" />
                </div>
                <CardTitle>Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <Input
                label="Full Name"
                placeholder="Jane Smith"
                error={errors.name?.message}
                {...register('name')}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
              </div>
            </CardContent>
          </Card>

          {/* Finance */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <CardTitle>Finance Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <Select
                label="Currency"
                options={currencyOptions}
                error={errors.currency?.message}
                {...register('currency')}
              />
              <Input
                label="Monthly Income (optional)"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.monthlyIncome?.message}
                {...register('monthlyIncome', { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-400 -mt-2">Used to calculate your savings rate.</p>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-amber-600" />
                </div>
                <CardTitle>Alert Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <Input
                label="Low Balance Alert Threshold"
                type="number"
                step="1"
                placeholder="500"
                error={errors.lowBalanceAlert?.message}
                {...register('lowBalanceAlert', { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-400 -mt-2">
                You'll receive an in-app + email alert when your balance drops below this amount.
              </p>
            </CardContent>
          </Card>

          {error  && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {saved  && <p className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">✓ Settings saved successfully!</p>}

          <Button type="submit" loading={saving} className="w-full">
            <Save className="h-4 w-4" /> Save Settings
          </Button>
        </form>
      </div>
    </>
  )
}
