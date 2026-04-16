import { prisma } from './prisma'
import { NotificationType } from '@prisma/client'
import {
  sendBudgetExceededEmail,
  sendLowBalanceEmail,
} from './email'

interface CreateNotificationOpts {
  userId:  string
  title:   string
  message: string
  type:    NotificationType
}

export async function createNotification(opts: CreateNotificationOpts) {
  return prisma.notification.create({ data: opts })
}

export async function checkBudgetAlerts(userId: string): Promise<void> {
  const now   = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  const [user, budgets, transactions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.budget.findMany({ where: { userId, month, year } }),
    prisma.transaction.findMany({
      where: {
        userId,
        type: 'DEBIT',
        date: {
          gte: new Date(year, month - 1, 1),
          lt:  new Date(year, month, 1),
        },
      },
    }),
  ])

  if (!user) return

  // Aggregate spending per category
  const spent: Record<string, number> = {}
  for (const t of transactions) {
    spent[t.category] = (spent[t.category] ?? 0) + t.amount
  }

  for (const budget of budgets) {
    const categorySpent = spent[budget.category] ?? 0
    if (categorySpent > budget.amount) {
      // In-app notification
      await createNotification({
        userId:  userId,
        title:   `Budget Exceeded: ${budget.category}`,
        message: `You've spent ${user.currency} ${categorySpent.toFixed(2)} of your ${user.currency} ${budget.amount.toFixed(2)} budget for ${budget.category}.`,
        type:    NotificationType.BUDGET_EXCEEDED,
      })

      // Email notification
      if (user.email) {
        await sendBudgetExceededEmail({
          to:       user.email,
          name:     user.name ?? 'there',
          category: budget.category,
          spent:    categorySpent,
          budget:   budget.amount,
          currency: user.currency,
        }).catch(console.error)
      }
    }
  }
}

export async function checkLowBalanceAlert(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.lowBalanceAlert) return

  const [credits, debits] = await Promise.all([
    prisma.transaction.aggregate({
      where:   { userId, type: 'CREDIT' },
      _sum:    { amount: true },
    }),
    prisma.transaction.aggregate({
      where:   { userId, type: 'DEBIT' },
      _sum:    { amount: true },
    }),
  ])

  const balance =
    (credits._sum.amount ?? 0) - (debits._sum.amount ?? 0)

  if (balance < user.lowBalanceAlert) {
    await createNotification({
      userId:  userId,
      title:   'Low Balance Alert',
      message: `Your balance (${user.currency} ${balance.toFixed(2)}) is below your alert threshold of ${user.currency} ${user.lowBalanceAlert}.`,
      type:    NotificationType.LOW_BALANCE,
    })

    if (user.email) {
      await sendLowBalanceEmail({
        to:        user.email,
        name:      user.name ?? 'there',
        balance,
        threshold: user.lowBalanceAlert,
        currency:  user.currency,
      }).catch(console.error)
    }
  }
}
