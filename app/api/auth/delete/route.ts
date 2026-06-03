import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId, clearSession } from '@/lib/session'

// DELETE — permanently delete the current user's account and all related data.
// User relations cascade on delete (see schema), so removing the User row
// also removes their posts, comments, likes, messages, mood check-ins,
// group memberships, connections, and interests.
export async function DELETE() {
  try {
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await prisma.user.delete({ where: { id: userId } })
    clearSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete account. Please try again.' }, { status: 500 })
  }
}
