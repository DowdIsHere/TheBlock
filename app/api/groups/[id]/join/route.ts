import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

// POST — join/leave a group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const existing = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId: params.id } }
    })

    if (existing) {
      await prisma.groupMember.delete({ where: { id: existing.id } })
      return NextResponse.json({ joined: false })
    }

    await prisma.groupMember.create({
      data: { userId, groupId: params.id }
    })

    return NextResponse.json({ joined: true })
  } catch (error) {
    console.error('Join group error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
