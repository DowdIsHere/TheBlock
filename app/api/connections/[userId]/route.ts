import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

// POST — send/accept connection request
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

    const targetId = params.userId

    // Check if connection already exists in either direction
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { userId: dbUser.id, connectedId: targetId },
          { userId: targetId, connectedId: dbUser.id },
        ]
      }
    })

    if (existing) {
      if (existing.status === 'pending' && existing.connectedId === dbUser.id) {
        // Accept incoming request
        const updated = await prisma.connection.update({
          where: { id: existing.id },
          data: { status: 'accepted' }
        })
        return NextResponse.json({ connection: updated, action: 'accepted' })
      }
      return NextResponse.json({ connection: existing, action: 'exists' })
    }

    // Create new connection request
    const connection = await prisma.connection.create({
      data: {
        userId: dbUser.id,
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
    const supabase = createClient()
    const { data: { user: supaUser } } = await supabase.auth.getUser()
    if (!supaUser?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { email: supaUser.email } })
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.connection.deleteMany({
      where: {
        OR: [
          { userId: dbUser.id, connectedId: params.userId },
          { userId: params.userId, connectedId: dbUser.id },
        ]
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete connection error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
