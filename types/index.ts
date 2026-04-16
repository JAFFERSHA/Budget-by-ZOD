import type { Transaction, Budget, Notification, User } from '@prisma/client'

export type { Transaction, Budget, Notification, User }

export interface DashboardStats {
  totalIncome:   number
  totalExpenses: number
  balance:       number
  savingsRate:   number
  transactionCount: number
}

export interface CategoryTotal {
  category: string
  amount:   number
  color:    string
  icon:     string
  percent:  number
}

export interface MonthlyData {
  month:    string
  income:   number
  expenses: number
  balance:  number
}

export interface DailyData {
  date:     string
  amount:   number
  type:     'CREDIT' | 'DEBIT'
}

export interface BudgetWithSpent extends Budget {
  spent:   number
  percent: number
  status:  'safe' | 'warning' | 'exceeded'
}

export interface TransactionWithFormatted extends Transaction {
  formattedDate:   string
  formattedAmount: string
  categoryIcon:    string
  categoryColor:   string
}

export interface ApiResponse<T = unknown> {
  data?:    T
  error?:   string
  message?: string
}

export interface PaginatedResponse<T> {
  data:    T[]
  total:   number
  page:    number
  perPage: number
}

export type SortOrder = 'asc' | 'desc'

export interface TransactionFilters {
  type?:     'CREDIT' | 'DEBIT'
  category?: string
  dateFrom?: string
  dateTo?:   string
  search?:   string
}
