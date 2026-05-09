import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

// GET — posts in a group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const posts = await prisma.post.findMany({
      where: { groupId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, parserName: true }
        },
        _count: { select: { comments: true, likes: true } }
      }
    })

    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { members: true } }
      }
    })

    return NextResponse.json({ posts, group })
  } catch (error) {
    console.error('Fetch group posts error:', error)
    return NextResponse.json({ posts: [], group: null })
  }
}

// POST — create a post in a group
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
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: userId,
        groupId: params.id,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, parserName: true }
        },
        _count: { select: { comments: true, likes: true } }
      }
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Create group post error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
