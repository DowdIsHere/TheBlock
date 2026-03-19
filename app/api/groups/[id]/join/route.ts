import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

// POST — join a group
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

    // Check if already a member
    const existing = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: dbUser.id, groupId: params.id } }
    })

    if (existing) {
      // Leave group
      await prisma.groupMember.delete({ where: { id: existing.id } })
      return NextResponse.json({ joined: false })
    }

    // Join group
    await prisma.groupMember.create({
      data: { userId: dbUser.id, groupId: params.id }
    })

    return NextResponse.json({ joined: true })
  } catch (error) {
    console.error('Join group error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
