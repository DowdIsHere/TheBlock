import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user: supaUser } } = await supabase.auth.getUser()

    if (!supaUser?.email) {
      return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findUnique({
      where: { email: supaUser.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        bio: true,
        parserName: true,
        parserCode: true,
        onboardingComplete: true,
        _count: {
          select: {
            posts: true,
            groups: true,
            connections: { where: { status: 'accepted' } },
          }
        }
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ user: null })
  }
}
