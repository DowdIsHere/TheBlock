import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'

const VALID_CITIES = ['architecture', 'relations', 'assessment', 'clinical']

export async function POST(request: NextRequest) {
  try {
    const userId = getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { cities } = await request.json()

    if (!Array.isArray(cities) || cities.length === 0) {
      return NextResponse.json({ error: 'Select at least one area of interest' }, { status: 400 })
    }

    const validCities = cities.filter((c: string) => VALID_CITIES.includes(c))
    if (validCities.length === 0) {
      return NextResponse.json({ error: 'Invalid selection' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.contentInterest.deleteMany({ where: { userId } }),
      ...validCities.map((city: string) =>
        prisma.contentInterest.create({
          data: { userId, city },
        })
      ),
      prisma.user.update({
        where: { id: userId },
        data: { onboardingComplete: true },
      }),
    ])

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to save interests' }, { status: 500 })
  }
}
