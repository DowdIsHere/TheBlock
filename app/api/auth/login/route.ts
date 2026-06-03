import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    let user
    try {
      user = await prisma.user.findUnique({ where: { email } })
    } catch (dbError: any) {
      console.error('Database connection error:', dbError)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    createSession(user.id)

    return NextResponse.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 })
  }
}
