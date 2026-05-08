import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const postId = params.id

    // Check if already liked
    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: dbUser.id, postId } }
    })

    if (existing) {
      // Unlike
      await prisma.like.delete({ where: { id: existing.id } })
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.like.create({
        data: { userId: dbUser.id, postId }
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
