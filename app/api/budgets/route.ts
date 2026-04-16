import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { budgetSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const month = Number(searchParams.get('month') ?? new Date().getMonth() + 1)
  const year  = Number(searchParams.get('year')  ?? new Date().getFullYear())

  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id, month, year },
    orderBy: { category: 'asc' },
  })

  // Enrich with actual spending
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      type:   'DEBIT',
      date: {
        gte: new Date(year, month - 1, 1),
        lt:  new Date(year, month, 1),
      },
    },
  })

  const spentByCategory: Record<string, number> = {}
  for (const t of transactions) {
    spentByCategory[t.category] = (spentByCategory[t.category] ?? 0) + t.amount
  }

  const enriched = budgets.map((b) => {
    const spent   = spentByCategory[b.category] ?? 0
    const percent = Math.min((spent / b.amount) * 100, 100)
    const status  = spent > b.amount ? 'exceeded' : spent > b.amount * 0.8 ? 'warning' : 'safe'
    return { ...b, spent, percent, status }
  })

  return NextResponse.json({ data: enriched })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = budgetSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const budget = await prisma.budget.upsert({
    where: {
      userId_category_month_year: {
        userId:   session.user.id,
        category: parsed.data.category,
        month:    parsed.data.month,
        year:     parsed.data.year,
      },
    },
    update: { amount: parsed.data.amount },
    create: { ...parsed.data, userId: session.user.id },
  })

  return NextResponse.json({ data: budget }, { status: 201 })
}
