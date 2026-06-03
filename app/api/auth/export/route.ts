import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

// GET — export all data associated with the current user as a JSON download.
export async function GET() {
  try {
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const [user, posts, comments, likes, moodCheckins, sentMessages, receivedMessages, groupMemberships, interests, connections] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true, email: true, firstName: true, lastName: true, bio: true,
            avatarUrl: true, parserName: true, parserCode: true,
            spatialAxis: true, temporalAxis: true, referenceAxis: true,
            onboardingComplete: true, createdAt: true, updatedAt: true,
          },
        }),
        prisma.post.findMany({ where: { authorId: userId }, orderBy: { createdAt: 'asc' } }),
        prisma.comment.findMany({ where: { authorId: userId }, orderBy: { createdAt: 'asc' } }),
        prisma.like.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
        prisma.moodCheckin.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
        prisma.message.findMany({ where: { senderId: userId }, orderBy: { createdAt: 'asc' } }),
        prisma.message.findMany({ where: { receiverId: userId }, orderBy: { createdAt: 'asc' } }),
        prisma.groupMember.findMany({ where: { userId }, include: { group: { select: { id: true, name: true } } } }),
        prisma.contentInterest.findMany({ where: { userId } }),
        prisma.connection.findMany({ where: { OR: [{ userId }, { connectedId: userId }] } }),
      ])

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const data = {
      exportedAt: new Date().toISOString(),
      profile: user,
      posts,
      comments,
      likes,
      moodCheckins,
      messages: { sent: sentMessages, received: receivedMessages },
      groupMemberships,
      interests,
      connections,
    }

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="cognition-block-data.json"',
      },
    })
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json({ error: 'Failed to export data. Please try again.' }, { status: 500 })
  }
}
