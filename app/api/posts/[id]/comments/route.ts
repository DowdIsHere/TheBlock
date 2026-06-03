import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'
import { MAX_LENGTHS } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, parserName: true }
        }
      }
    })
    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Fetch comments error:', error)
    return NextResponse.json({ comments: [] })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { content } = await request.json()
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
    }
    if (content.trim().length > MAX_LENGTHS.comment) {
      return NextResponse.json({ error: 'Comment is too long' }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: userId,
        postId: params.id,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, parserName: true }
        }
      }
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
