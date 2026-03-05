import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        author: {
          select: { id: true, name: true, parserName: true, avatarUrl: true }
        },
        _count: { select: { comments: true, likes: true } }
      }
    })

    return NextResponse.json({ posts })
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
          select: { id: true, name: true, parserName: true, avatarUrl: true }
        },
        _count: { select: { comments: true, likes: true } }
      }
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
