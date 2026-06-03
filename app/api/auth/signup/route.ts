import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession } from '@/lib/session'
import { MAX_LENGTHS } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Email, password, first name, and last name are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    if (firstName.trim().length > MAX_LENGTHS.name || lastName.trim().length > MAX_LENGTHS.name) {
      return NextResponse.json({ error: 'Name is too long' }, { status: 400 })
    }

    let existing
    try {
      existing = await prisma.user.findUnique({ where: { email } })
    } catch (dbError: any) {
      console.error('Database connection error:', dbError)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName },
    })

    createSession(user.id)

    return NextResponse.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }, { status: 201 })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 })
  }
}
