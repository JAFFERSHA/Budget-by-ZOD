import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  }).format(new Date(date))
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day:   'numeric',
  }).format(new Date(date))
}

export function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export const CATEGORIES = [
  { value: 'Food & Dining',     icon: '🍔', color: '#f97316' },
  { value: 'Transportation',    icon: '🚗', color: '#3b82f6' },
  { value: 'Shopping',          icon: '🛍️', color: '#a855f7' },
  { value: 'Entertainment',     icon: '🎬', color: '#ec4899' },
  { value: 'Health & Medical',  icon: '🏥', color: '#10b981' },
  { value: 'Education',         icon: '📚', color: '#f59e0b' },
  { value: 'Utilities',         icon: '💡', color: '#6366f1' },
  { value: 'Housing / Rent',    icon: '🏠', color: '#14b8a6' },
  { value: 'Personal Care',     icon: '💆', color: '#f43f5e' },
  { value: 'Travel',            icon: '✈️', color: '#0ea5e9' },
  { value: 'Savings',           icon: '💰', color: '#84cc16' },
  { value: 'Salary / Income',   icon: '💵', color: '#22c55e' },
  { value: 'Other',             icon: '📦', color: '#6b7280' },
] as const

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.color])
)

export const CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar'      },
  { code: 'EUR', symbol: '€',  name: 'Euro'           },
  { code: 'GBP', symbol: '£',  name: 'British Pound'  },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee'   },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham'    },
  { code: 'SAR', symbol: '﷼',  name: 'Saudi Riyal'   },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
]

export function getCategoryIcon(category: string): string {
  return CATEGORIES.find((c) => c.value === category)?.icon ?? '📦'
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#6b7280'
}

export function calculateSavingsRate(income: number, expenses: number): number {
  if (income === 0) return 0
  return Math.max(0, ((income - expenses) / income) * 100)
}

export function generateSavingsSuggestions(
  categoryTotals: Record<string, number>,
  income: number,
  totalExpenses: number
): string[] {
  const suggestions: string[] = []
  const savingsRate = calculateSavingsRate(income, totalExpenses)

  if (savingsRate < 10) {
    suggestions.push(
      '⚠️ Your savings rate is below 10%. Aim to save at least 20% of your income each month.'
    )
  }

  const sorted = Object.entries(categoryTotals)
    .filter(([cat]) => cat !== 'Salary / Income' && cat !== 'Savings')
    .sort(([, a], [, b]) => b - a)

  if (sorted[0]) {
    const [top, amount] = sorted[0]
    suggestions.push(
      `💡 Your biggest expense is ${top} (${formatCurrency(amount)}). Try reducing it by 15% to save ${formatCurrency(amount * 0.15)}/month.`
    )
  }

  if (categoryTotals['Food & Dining'] > income * 0.15) {
    suggestions.push('🍔 Food & Dining exceeds 15% of income. Meal prepping can cut this by 30%.')
  }

  if (categoryTotals['Entertainment'] > income * 0.05) {
    suggestions.push('🎬 Entertainment spend is high. Review subscriptions — cancel unused ones.')
  }

  if (categoryTotals['Shopping'] > income * 0.1) {
    suggestions.push('🛍️ Shopping is over 10% of income. Try a 48-hour rule before non-essential purchases.')
  }

  if (suggestions.length === 0) {
    suggestions.push('✅ Great job! Your spending looks balanced. Keep building your emergency fund.')
  }

  suggestions.push(
    `📊 Current savings rate: ${savingsRate.toFixed(1)}%. Target: 20%+ for financial health.`
  )

  return suggestions.slice(0, 4)
}
