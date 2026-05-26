import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'
import { MAX_LENGTHS } from '@/lib/validation'

export async function GET() {
  try {
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ checkin: null })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const checkin = await prisma.moodCheckin.findFirst({
      where: {
        userId,
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
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { mood, note } = await request.json()
    if (!mood || mood < 1 || mood > 5) {
      return NextResponse.json({ error: 'Mood must be 1-5' }, { status: 400 })
    }
    if (typeof note === 'string' && note.trim().length > MAX_LENGTHS.moodNote) {
      return NextResponse.json({ error: 'Note is too long' }, { status: 400 })
    }

    const checkin = await prisma.moodCheckin.create({
      data: {
        mood,
        note: note?.trim() || null,
        userId,
      },
    })

    return NextResponse.json({ checkin }, { status: 201 })
  } catch (error) {
    console.error('Mood checkin error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
