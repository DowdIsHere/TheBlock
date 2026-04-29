import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

// POST — send/accept connection request
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const targetId = params.userId

    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { userId, connectedId: targetId },
          { userId: targetId, connectedId: userId },
        ]
      }
    })

    if (existing) {
      if (existing.status === 'pending' && existing.connectedId === userId) {
        const updated = await prisma.connection.update({
          where: { id: existing.id },
          data: { status: 'accepted' }
        })
        return NextResponse.json({ connection: updated, action: 'accepted' })
      }
      return NextResponse.json({ connection: existing, action: 'exists' })
    }

    const connection = await prisma.connection.create({
      data: {
        userId,
        connectedId: targetId,
        status: 'pending',
      }
    })

    return NextResponse.json({ connection, action: 'requested' }, { status: 201 })
  } catch (error) {
    console.error('Connection error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// DELETE — remove connection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await prisma.connection.deleteMany({
      where: {
        OR: [
          { userId, connectedId: params.userId },
          { userId: params.userId, connectedId: userId },
        ]
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete connection error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
