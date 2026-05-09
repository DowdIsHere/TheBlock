import { NextRequest, NextResponse } from 'next/server'
import { refreshAllFeeds, pruneOldItems } from '@/lib/news'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Triggered by Vercel cron (see vercel.json) or manually by a logged-in user
// via the Refresh button on /news. Vercel cron requests include
// Authorization: Bearer <CRON_SECRET>.
export async function GET(request: NextRequest) {
  return handle(request)
}

export async function POST(request: NextRequest) {
  return handle(request)
}

async function handle(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      // Allow unauthenticated manual refresh from the app for now — gated by
      // session in a future iteration. Cron requests must match the secret.
      const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron')
      if (isVercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
  }

  try {
    const result = await refreshAllFeeds()
    await pruneOldItems()
    return NextResponse.json(result)
  } catch (error) {
    console.error('News refresh error:', error)
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 })
  }
}
