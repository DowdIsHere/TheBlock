import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'
import { MAX_LENGTHS } from '@/lib/validation'

// GET — list all groups
export async function GET() {
  try {
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ groups: [] })
    }

    const groups = await prisma.group.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { members: true, posts: true } },
        members: {
          where: { userId },
          select: { role: true },
        }
      }
    })

    const groupsWithMembership = groups.map(g => ({
      id: g.id,
      name: g.name,
      description: g.description,
      coverUrl: g.coverUrl,
      isPrivate: g.isPrivate,
      memberCount: g._count.members,
      postCount: g._count.posts,
      isMember: g.members.length > 0,
      role: g.members[0]?.role || null,
      createdAt: g.createdAt,
    }))

    return NextResponse.json({ groups: groupsWithMembership })
  } catch (error) {
    console.error('Fetch groups error:', error)
    return NextResponse.json({ groups: [] })
  }
}

// POST — create a group
export async function POST(request: NextRequest) {
  try {
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { name, description } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }
    if (name.trim().length > MAX_LENGTHS.groupName) {
      return NextResponse.json({ error: 'Group name is too long' }, { status: 400 })
    }
    if (typeof description === 'string' && description.trim().length > MAX_LENGTHS.groupDescription) {
      return NextResponse.json({ error: 'Group description is too long' }, { status: 400 })
    }

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        members: {
          create: { userId, role: 'admin' }
        }
      },
      include: {
        _count: { select: { members: true, posts: true } }
      }
    })

    return NextResponse.json({ group }, { status: 201 })
  } catch (error) {
    console.error('Create group error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
