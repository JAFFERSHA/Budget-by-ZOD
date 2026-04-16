import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { userUpdateSchema } from '@/lib/validations'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: {
      id: true, name: true, email: true, image: true,
      currency: true, monthlyIncome: true, lowBalanceAlert: true,
      role: true, createdAt: true,
    },
  })

  return NextResponse.json({ data: user })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = userUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data:  parsed.data,
    select: {
      id: true, name: true, email: true, image: true,
      currency: true, monthlyIncome: true, lowBalanceAlert: true,
    },
  })

  return NextResponse.json({ data: user })
}
