import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

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
