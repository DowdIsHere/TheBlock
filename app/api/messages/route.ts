import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

// GET — list conversations (latest message per unique user)
export async function GET() {
  try {
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ conversations: [] })
    }

    const dbUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!dbUser) {
      return NextResponse.json({ conversations: [] })
    }

    // Get all messages involving this user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: dbUser.id },
          { receiverId: dbUser.id },
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, parserName: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, parserName: true } },
      }
    })

    // Group by the other user to get latest message per conversation
    const convMap = new Map<string, typeof messages[0]>()
    for (const msg of messages) {
      const otherId = msg.senderId === dbUser.id ? msg.receiverId : msg.senderId
      if (!convMap.has(otherId)) {
        convMap.set(otherId, msg)
      }
    }

    const conversations = Array.from(convMap.entries()).map(([otherId, msg]) => {
      const other = msg.senderId === dbUser.id ? msg.receiver : msg.sender
      return {
        userId: otherId,
        user: other,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        isRead: msg.senderId !== dbUser.id ? msg.read : true,
      }
    })

    return NextResponse.json({ conversations, currentUserId: dbUser.id })
  } catch (error) {
    console.error('Fetch conversations error:', error)
    return NextResponse.json({ conversations: [] })
  }
}
