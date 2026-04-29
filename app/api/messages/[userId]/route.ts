import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

// GET — fetch messages between current user and target user
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUserId = getSessionUserId()
    if (!currentUserId) {
      return NextResponse.json({ messages: [] })
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: params.userId },
          { senderId: params.userId, receiverId: currentUserId },
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      }
    })

    await prisma.message.updateMany({
      where: {
        senderId: params.userId,
        receiverId: currentUserId,
        read: false,
      },
      data: { read: true }
    })

    const otherUser = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, firstName: true, lastName: true, parserName: true }
    })

    return NextResponse.json({ messages, otherUser, currentUserId })
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
    const currentUserId = getSessionUserId()
    if (!currentUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { content } = await request.json()
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: currentUserId,
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
