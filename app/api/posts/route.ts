import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user: supaUser } } = await supabase.auth.getUser()

    let currentUserId: string | null = null
    if (supaUser?.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: supaUser.email } })
      currentUserId = dbUser?.id || null
    }

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
    const supabase = createClient()
    const { data: { user: supaUser } } = await supabase.auth.getUser()

    if (!supaUser?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { email: supaUser.email } })
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { content } = await request.json()
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: { content: content.trim(), authorId: dbUser.id },
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
