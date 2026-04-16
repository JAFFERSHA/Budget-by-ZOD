'use client'

import { useQuery } from '@tanstack/react-query'
import { Bell, BellOff, Check, Trash2, AlertTriangle, TrendingDown, BarChart2, Info } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { Notification } from '@/types'

const typeConfig: Record<string, { icon: typeof Bell; color: string; badge: 'danger' | 'warning' | 'info' | 'success' }> = {
  BUDGET_EXCEEDED: { icon: AlertTriangle, color: 'text-rose-500',   badge: 'danger'  },
  LOW_BALANCE:     { icon: TrendingDown,  color: 'text-amber-500',  badge: 'warning' },
  WEEKLY_SUMMARY:  { icon: BarChart2,     color: 'text-indigo-500', badge: 'info'    },
  GENERAL:         { icon: Info,          color: 'text-blue-500',   badge: 'info'    },
}

export default function NotificationsPage() {
  const { data, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn:  async () => (await fetch('/api/notifications')).json(),
    refetchInterval: 30_000,
  })

  const notifications: Notification[] = data?.data ?? []
  const unreadCount = data?.unreadCount ?? 0

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    refetch()
  }

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
    refetch()
  }

  const deleteOne = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
    refetch()
  }

  return (
    <>
      <Header title="Notifications" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllRead}>
              <Check className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BellOff className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No notifications yet</p>
            <p className="text-sm mt-1">You'll be alerted when budgets are exceeded or balance is low.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const cfg   = typeConfig[n.type] ?? typeConfig.GENERAL
              const Icon  = cfg.icon
              return (
                <Card
                  key={n.id}
                  className={`transition-all ${!n.read ? 'border-indigo-200 bg-indigo-50/30' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-2 rounded-lg bg-white border border-gray-100 ${cfg.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                          <Badge variant={cfg.badge} className="ml-auto">{n.type.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!n.read && (
                          <button
                            onClick={() => markRead(n.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                            title="Mark as read"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteOne(n.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
