import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCategoryColor, getCategoryIcon, generateSavingsSuggestions } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const year = Number(searchParams.get('year') ?? new Date().getFullYear())

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: new Date(year, 0, 1),
        lt:  new Date(year + 1, 0, 1),
      },
    },
    orderBy: { date: 'asc' },
  })

  // ── Monthly data ────────────────────────────────────────────────
  const monthlyMap: Record<number, { income: number; expenses: number }> = {}
  for (let m = 1; m <= 12; m++) monthlyMap[m] = { income: 0, expenses: 0 }

  for (const t of transactions) {
    const m = new Date(t.date).getMonth() + 1
    if (t.type === 'CREDIT') monthlyMap[m].income   += t.amount
    else                     monthlyMap[m].expenses += t.amount
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthly = Object.entries(monthlyMap).map(([m, d]) => ({
    month:    months[Number(m) - 1],
    income:   d.income,
    expenses: d.expenses,
    balance:  d.income - d.expenses,
  }))

  // ── Category totals (expenses) ──────────────────────────────────
  const catMap: Record<string, number> = {}
  let totalExpenses = 0
  let totalIncome   = 0

  for (const t of transactions) {
    if (t.type === 'DEBIT') {
      catMap[t.category] = (catMap[t.category] ?? 0) + t.amount
      totalExpenses += t.amount
    } else {
      totalIncome += t.amount
    }
  }

  const categories = Object.entries(catMap)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amount]) => ({
      category: cat,
      amount,
      color:    getCategoryColor(cat),
      icon:     getCategoryIcon(cat),
      percent:  totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))

  // ── Daily spending (last 30 days) ───────────────────────────────
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recent = transactions.filter(
    (t) => new Date(t.date) >= thirtyDaysAgo && t.type === 'DEBIT'
  )

  const dailyMap: Record<string, number> = {}
  for (const t of recent) {
    const d = new Date(t.date).toISOString().split('T')[0]
    dailyMap[d] = (dailyMap[d] ?? 0) + t.amount
  }

  const daily = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }))

  // ── Stats ───────────────────────────────────────────────────────
  const balance     = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

  // ── Suggestions ─────────────────────────────────────────────────
  const suggestions = generateSavingsSuggestions(catMap, totalIncome, totalExpenses)

  return NextResponse.json({
    data: {
      monthly,
      categories,
      daily,
      stats: {
        totalIncome,
        totalExpenses,
        balance,
        savingsRate,
        transactionCount: transactions.length,
      },
      suggestions,
    },
  })
}
