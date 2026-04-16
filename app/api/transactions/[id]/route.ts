import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transactionSchema } from '@/lib/validations'

async function getOwned(id: string, userId: string) {
  return prisma.transaction.findFirst({ where: { id, userId } })
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tx = await getOwned(params.id, session.user.id)
  if (!tx) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ data: tx })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getOwned(params.id, session.user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body   = await req.json()
  const parsed = transactionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const updated = await prisma.transaction.update({
    where: { id: params.id },
    data:  { ...parsed.data, date: new Date(parsed.data.date) },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getOwned(params.id, session.user.id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.transaction.delete({ where: { id: params.id } })

  return NextResponse.json({ message: 'Deleted successfully.' })
}
