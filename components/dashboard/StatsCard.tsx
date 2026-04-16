import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/Card'

interface StatsCardProps {
  title:     string
  value:     number
  currency:  string
  icon:      LucideIcon
  color:     'green' | 'red' | 'blue' | 'purple'
  trend?:    number
  subtitle?: string
}

const colors = {
  green:  { bg: 'bg-emerald-50', icon: 'text-emerald-600', value: 'text-emerald-700' },
  red:    { bg: 'bg-rose-50',    icon: 'text-rose-600',    value: 'text-rose-700'    },
  blue:   { bg: 'bg-blue-50',    icon: 'text-blue-600',    value: 'text-blue-700'    },
  purple: { bg: 'bg-purple-50',  icon: 'text-purple-600',  value: 'text-purple-700'  },
}

export function StatsCard({ title, value, currency, icon: Icon, color, trend, subtitle }: StatsCardProps) {
  const c = colors[color]

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={cn('text-2xl font-bold mt-1', c.value)}>
            {formatCurrency(value, currency)}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', trend >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend).toFixed(1)}% vs last month
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', c.bg)}>
          <Icon className={cn('h-6 w-6', c.icon)} />
        </div>
      </div>
    </Card>
  )
}
