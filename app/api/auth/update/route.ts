import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'
import { MAX_LENGTHS } from '@/lib/validation'

export async function PATCH(request: NextRequest) {
  try {
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { firstName, lastName, bio } = await request.json()

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 })
    }
    if (firstName.trim().length > MAX_LENGTHS.name || lastName.trim().length > MAX_LENGTHS.name) {
      return NextResponse.json({ error: 'Name is too long' }, { status: 400 })
    }
    if (typeof bio === 'string' && bio.trim().length > MAX_LENGTHS.bio) {
      return NextResponse.json({ error: 'Bio is too long' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio?.trim() || null,
      },
      select: { id: true, firstName: true, lastName: true, bio: true }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
