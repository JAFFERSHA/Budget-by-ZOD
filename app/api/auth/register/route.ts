import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    const hashed = await bcrypt.hash(password, 12)
    const user   = await prisma.user.create({
      data: { name, email, password: hashed },
    })

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ to: email, name }).catch(console.error)

    return NextResponse.json(
      { message: 'Account created successfully.', userId: user.id },
      { status: 201 }
    )
  } catch (err) {
    console.error('[REGISTER]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
