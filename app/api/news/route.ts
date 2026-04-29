import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isStale, refreshAllFeeds, pruneOldItems } from '@/lib/news'
import { FEEDS } from '@/lib/feeds'

const VALID_CATEGORIES = new Set(['brain', 'mental', 'gut', 'holistic'])

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = Math.min(Number(searchParams.get('limit')) || 60, 200)

    // Lazy refresh on first call after the cache goes stale.
    if (await isStale()) {
      await refreshAllFeeds()
      await pruneOldItems()
    }

    const where = category && VALID_CATEGORIES.has(category) ? { category } : {}

    const items = await prisma.newsItem.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        url: true,
        summary: true,
        imageUrl: true,
        source: true,
        category: true,
        publishedAt: true,
      },
    })

    return NextResponse.json({ items, sources: FEEDS.map(f => ({ name: f.name, category: f.category })) })
  } catch (error) {
    console.error('Fetch news error:', error)
    return NextResponse.json({ items: [], sources: [] })
  }
}
