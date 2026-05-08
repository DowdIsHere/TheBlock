import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createClient } from '@/utils/supabase/server'

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

    // Sign in with Supabase for session management
    try {
      const supabase = createClient()
      await supabase.auth.signInWithPassword({ email, password })
    } catch (supaErr) {
      console.error('Supabase auth error (non-fatal):', supaErr)
    }

    return NextResponse.json({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ error: error?.message || 'Login failed' }, { status: 500 })
  }
}
