import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { BudgetProgress } from '@/components/dashboard/BudgetProgress'
import { SavingsSuggestions } from '@/components/dashboard/SavingsSuggestions'
import { DailyCalculator } from '@/components/dashboard/DailyCalculator'
import { ExpenseBarChart } from '@/components/charts/ExpenseBarChart'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank,
} from 'lucide-react'
import {
  getCurrentMonth, getCurrentYear, getMonthName, getCategoryColor,
  getCategoryIcon, calculateSavingsRate, generateSavingsSuggestions,
} from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  const userId  = session!.user!.id as string

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { currency: true, name: true, monthlyIncome: true, lowBalanceAlert: true },
  })

  const currency = user?.currency ?? 'USD'
  const month    = getCurrentMonth()
  const year     = getCurrentYear()

  // Fetch data in parallel
  const [allTransactions, budgets, thisMonthTx] = await Promise.all([
    prisma.transaction.findMany({
      where:   { userId },
      orderBy: { date: 'desc' },
      take:    50,
    }),
    prisma.budget.findMany({ where: { userId, month, year } }),
    prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: new Date(year, month - 1, 1),
          lt:  new Date(year, month, 1),
        },
      },
    }),
  ])

  // Stats
  const totalIncome   = allTransactions.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = allTransactions.filter((t) => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0)
  const balance       = totalIncome - totalExpenses
  const savingsRate   = calculateSavingsRate(totalIncome, totalExpenses)

  // Monthly chart data
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthlyMap: Record<number, { income: number; expenses: number }> = {}
  for (let m = 1; m <= 12; m++) monthlyMap[m] = { income: 0, expenses: 0 }
  for (const t of allTransactions.filter((t) => new Date(t.date).getFullYear() === year)) {
    const m = new Date(t.date).getMonth() + 1
    if (t.type === 'CREDIT') monthlyMap[m].income   += t.amount
    else                     monthlyMap[m].expenses += t.amount
  }
  const monthlyData = Object.entries(monthlyMap).map(([m, d]) => ({
    month: months[Number(m) - 1], income: d.income, expenses: d.expenses, balance: d.income - d.expenses,
  }))

  // Category pie
  const catMap: Record<string, number> = {}
  for (const t of allTransactions.filter((t) => t.type === 'DEBIT')) {
    catMap[t.category] = (catMap[t.category] ?? 0) + t.amount
  }
  const catTotal   = Object.values(catMap).reduce((s, v) => s + v, 0)
  const categories = Object.entries(catMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([cat, amount]) => ({
      category: cat, amount,
      color:    getCategoryColor(cat),
      icon:     getCategoryIcon(cat),
      percent:  catTotal > 0 ? (amount / catTotal) * 100 : 0,
    }))

  // Budget with spent
  const debitsByCategory: Record<string, number> = {}
  for (const t of thisMonthTx.filter((t) => t.type === 'DEBIT')) {
    debitsByCategory[t.category] = (debitsByCategory[t.category] ?? 0) + t.amount
  }
  const budgetsWithSpent = budgets.map((b) => {
    const spent   = debitsByCategory[b.category] ?? 0
    const percent = (spent / b.amount) * 100
    return {
      ...b,
      spent,
      percent,
      status: spent > b.amount ? 'exceeded' : spent > b.amount * 0.8 ? 'warning' : 'safe',
    } as const
  })

  // Suggestions
  const suggestions = generateSavingsSuggestions(catMap, totalIncome, totalExpenses)

  return (
    <>
      <Header title={`Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, ${user?.name?.split(' ')[0] ?? 'there'} 👋`} />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Balance"  value={balance}        currency={currency} icon={Wallet}      color="blue"   subtitle="All time" />
          <StatsCard title="Total Income"   value={totalIncome}    currency={currency} icon={TrendingUp}   color="green"  subtitle="All time" />
          <StatsCard title="Total Expenses" value={totalExpenses}  currency={currency} icon={TrendingDown} color="red"    subtitle="All time" />
          <StatsCard title="Savings Rate"   value={savingsRate}    currency={currency} icon={PiggyBank}    color="purple" subtitle="% of income saved" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Income vs Expenses — {year}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ExpenseBarChart data={monthlyData} currency={currency} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CategoryPieChart data={categories} currency={currency} />
            </CardContent>
          </Card>
        </div>

        {/* Daily Spend Calculator */}
        <DailyCalculator transactions={allTransactions} currency={currency} />

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTransactions transactions={allTransactions} currency={currency} />
          </div>
          <div className="space-y-4">
            <BudgetProgress budgets={budgetsWithSpent as any} currency={currency} />
            <SavingsSuggestions suggestions={suggestions} />
          </div>
        </div>
      </div>
    </>
  )
}
