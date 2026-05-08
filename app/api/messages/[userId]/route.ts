import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

// GET — fetch messages between current user and target user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user: supaUser } } = await supabase.auth.getUser()
    if (!supaUser?.email) {
      return NextResponse.json({ messages: [] })
    }

    const dbUser = await prisma.user.findUnique({ where: { email: supaUser.email } })
    if (!dbUser) {
      return NextResponse.json({ messages: [] })
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: dbUser.id, receiverId: params.userId },
          { senderId: params.userId, receiverId: dbUser.id },
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      }
    })

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        senderId: params.userId,
        receiverId: dbUser.id,
        read: false,
      },
      data: { read: true }
    })

    const otherUser = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, firstName: true, lastName: true, parserName: true }
    })

    return NextResponse.json({ messages, otherUser, currentUserId: dbUser.id })
  } catch (error) {
    console.error('Fetch messages error:', error)
    return NextResponse.json({ messages: [] })
  }
}

// POST — send a message
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const { content } = await request.json()
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: dbUser.id,
        receiverId: params.userId,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      }
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
