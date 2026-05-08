import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: supaUser } } = await supabase.auth.getUser()

    if (!supaUser?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { firstName, lastName, bio } = await request.json()

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { email: supaUser.email },
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
