import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'
import { MAX_LENGTHS } from '@/lib/validation'

export async function GET() {
  try {
    const currentUserId = getSessionUserId()

    const posts = await prisma.post.findMany({
      where: { groupId: null }, // Only feed posts, not group posts
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, parserName: true, avatarUrl: true }
        },
        _count: { select: { comments: true, likes: true } },
        likes: currentUserId
          ? { where: { userId: currentUserId }, select: { id: true } }
          : false,
      }
    })

    const postsWithLiked = posts.map(post => ({
      ...post,
      liked: Array.isArray(post.likes) ? post.likes.length > 0 : false,
      likes: undefined, // Don't send the likes array
    }))

    return NextResponse.json({ posts: postsWithLiked, currentUserId })
  } catch (error) {
    console.error('Fetch posts error:', error)
    return NextResponse.json({ posts: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { content } = await request.json()
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 })
    }
    if (content.trim().length > MAX_LENGTHS.post) {
      return NextResponse.json({ error: 'Post is too long' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: { content: content.trim(), authorId: userId },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, parserName: true, avatarUrl: true }
        },
        _count: { select: { comments: true, likes: true } }
      }
    })

    return NextResponse.json({ post: { ...post, liked: false } }, { status: 201 })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
