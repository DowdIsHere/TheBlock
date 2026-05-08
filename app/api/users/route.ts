import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

// GET — list all users for discovery (excluding current user)
export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user: supaUser } } = await supabase.auth.getUser()
    if (!supaUser?.email) {
      return NextResponse.json({ users: [] })
    }

    const dbUser = await prisma.user.findUnique({ where: { email: supaUser.email } })
    if (!dbUser) {
      return NextResponse.json({ users: [] })
    }

    const users = await prisma.user.findMany({
      where: { id: { not: dbUser.id } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        parserName: true,
        parserCode: true,
        spatialAxis: true,
        temporalAxis: true,
        referenceAxis: true,
        _count: {
          select: {
            posts: true,
            connections: { where: { status: 'accepted' } },
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Get current user's connections to show status
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: dbUser.id },
          { connectedId: dbUser.id },
        ]
      }
    })

    const connectionMap = new Map<string, string>()
    for (const conn of connections) {
      const otherId = conn.userId === dbUser.id ? conn.connectedId : conn.userId
      connectionMap.set(otherId, conn.status)
    }

    const usersWithStatus = users.map(u => ({
      ...u,
      connectionStatus: connectionMap.get(u.id) || null,
    }))

    return NextResponse.json({ users: usersWithStatus, currentUser: { id: dbUser.id, parserCode: dbUser.parserCode } })
  } catch (error) {
    console.error('Fetch users error:', error)
    return NextResponse.json({ users: [] })
  }
}
