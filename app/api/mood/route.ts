import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user: supaUser } } = await supabase.auth.getUser()
    if (!supaUser?.email) {
      return NextResponse.json({ checkin: null })
    }

    const dbUser = await prisma.user.findUnique({ where: { email: supaUser.email } })
    if (!dbUser) {
      return NextResponse.json({ checkin: null })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const checkin = await prisma.moodCheckin.findFirst({
      where: {
        userId: dbUser.id,
        createdAt: { gte: today },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ checkin })
  } catch (error) {
    console.error('Mood checkin fetch error:', error)
    return NextResponse.json({ checkin: null })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: supaUser } } = await supabase.auth.getUser()
    if (!supaUser?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { email: supaUser.email } })
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { mood, note } = await request.json()
    if (!mood || mood < 1 || mood > 5) {
      return NextResponse.json({ error: 'Mood must be 1-5' }, { status: 400 })
    }

    const checkin = await prisma.moodCheckin.create({
      data: {
        mood,
        note: note?.trim() || null,
        userId: dbUser.id,
      },
    })

    return NextResponse.json({ checkin }, { status: 201 })
  } catch (error) {
    console.error('Mood checkin error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
