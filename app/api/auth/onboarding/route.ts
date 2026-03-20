import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

const VALID_CITIES = ['architecture', 'relations', 'assessment', 'clinical']

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user: supaUser } } = await supabase.auth.getUser()

    if (!supaUser?.email) {
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

    const user = await prisma.user.findUnique({ where: { email: supaUser.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Upsert interests and mark onboarding complete in a transaction
    await prisma.$transaction([
      // Remove any existing interests (in case of re-onboarding)
      prisma.contentInterest.deleteMany({ where: { userId: user.id } }),
      // Create new interests
      ...validCities.map((city: string) =>
        prisma.contentInterest.create({
          data: { userId: user.id, city },
        })
      ),
      // Mark onboarding complete
      prisma.user.update({
        where: { id: user.id },
        data: { onboardingComplete: true },
      }),
    ])

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to save interests' }, { status: 500 })
  }
}
