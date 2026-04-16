import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const budget = await prisma.budget.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!budget) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.budget.delete({ where: { id: params.id } })
  return NextResponse.json({ message: 'Budget deleted.' })
}
