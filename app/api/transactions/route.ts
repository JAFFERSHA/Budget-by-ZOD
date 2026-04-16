import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transactionSchema } from '@/lib/validations'
import { checkBudgetAlerts, checkLowBalanceAlert } from '@/lib/notifications'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const type     = searchParams.get('type') as 'CREDIT' | 'DEBIT' | null
  const category = searchParams.get('category')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo   = searchParams.get('dateTo')
  const search   = searchParams.get('search')
  const page     = Number(searchParams.get('page')  ?? 1)
  const perPage  = Number(searchParams.get('perPage') ?? 20)

  const where: Record<string, unknown> = { userId: session.user.id }
  if (type)     where.type     = type
  if (category) where.category = category
  if (dateFrom || dateTo) {
    where.date = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo   ? { lte: new Date(dateTo)   } : {}),
    }
  }
  if (search) {
    where.description = { contains: search, mode: 'insensitive' }
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip:  (page - 1) * perPage,
      take:  perPage,
    }),
    prisma.transaction.count({ where }),
  ])

  return NextResponse.json({ data: transactions, total, page, perPage })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body   = await req.json()
    const parsed = transactionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        ...parsed.data,
        date:   new Date(parsed.data.date),
        userId: session.user.id,
      },
    })

    // Run alerts asynchronously (non-blocking)
    if (parsed.data.type === 'DEBIT') {
      checkBudgetAlerts(session.user.id).catch(console.error)
      checkLowBalanceAlert(session.user.id).catch(console.error)
    }

    return NextResponse.json({ data: transaction }, { status: 201 })
  } catch (err) {
    console.error('[POST /transactions]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
