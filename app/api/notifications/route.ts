import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const unreadOnly = searchParams.get('unread') === 'true'

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  })

  return NextResponse.json({ data: notifications, unreadCount })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Mark all as read
  await prisma.notification.updateMany({
    where:  { userId: session.user.id, read: false },
    data:   { read: true },
  })

  return NextResponse.json({ message: 'All notifications marked as read.' })
}
