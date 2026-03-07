import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Email, password, first name, and last name are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if user already exists
    let existing
    try {
      existing = await prisma.user.findUnique({ where: { email } })
    } catch (dbError: any) {
      console.error('Database connection error:', dbError)
      return NextResponse.json({ error: 'Database connection failed. Tables may not exist yet.' }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName },
    })

    // Sign in with Supabase for session management
    try {
      const supabase = createClient()
      const { error: supaError } = await supabase.auth.signUp({ email, password })
      if (supaError) {
        console.error('Supabase auth signup error (non-fatal):', supaError.message)
      }
    } catch (supaErr) {
      console.error('Supabase auth error (non-fatal):', supaErr)
    }

    return NextResponse.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }, { status: 201 })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: error?.message || 'Signup failed' }, { status: 500 })
  }
}
