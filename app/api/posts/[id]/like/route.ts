import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const postId = params.id

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } }
    })

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } })
      return NextResponse.json({ liked: false })
    } else {
      await prisma.like.create({
        data: { userId, postId }
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
