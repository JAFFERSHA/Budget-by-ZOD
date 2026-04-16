import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notif = await prisma.notification.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!notif) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.notification.update({
    where: { id: params.id },
    data:  { read: true },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notif = await prisma.notification.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!notif) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.notification.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Deleted.' })
}
