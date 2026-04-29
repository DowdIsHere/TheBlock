import Parser from 'rss-parser'
import { prisma } from './prisma'
import { FEEDS, type Feed } from './feeds'

const parser = new Parser({
  timeout: 10_000,
  headers: { 'User-Agent': 'TheCognitionBlock/1.0 (+https://thecognitionblock.com)' },
})

const PER_FEED_LIMIT = 25

function stripHtml(html: string | undefined | null): string | null {
  if (!html) return null
  const text = html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  return text || null
}

function truncate(text: string | null, max: number): string | null {
  if (!text) return null
  if (text.length <= max) return text
  return text.slice(0, max - 1).trimEnd() + '…'
}

function extractImage(item: any): string | null {
  if (item.enclosure?.url && /\.(jpe?g|png|gif|webp)/i.test(item.enclosure.url)) {
    return item.enclosure.url
  }
  if (item['media:content']?.$?.url) return item['media:content'].$.url
  if (item['media:thumbnail']?.$?.url) return item['media:thumbnail'].$.url
  const html = item['content:encoded'] || item.content || ''
  const match = String(html).match(/<img[^>]+src=["']([^"']+)["']/i)
  return match?.[1] || null
}

async function fetchFeed(feed: Feed): Promise<{ feed: Feed; count: number; error?: string }> {
  try {
    const parsed = await parser.parseURL(feed.url)
    const items = (parsed.items || []).slice(0, PER_FEED_LIMIT)

    let count = 0
    for (const item of items) {
      const url = item.link?.trim()
      const title = item.title?.trim()
      if (!url || !title) continue

      const publishedAt = item.isoDate ? new Date(item.isoDate)
        : item.pubDate ? new Date(item.pubDate)
        : new Date()
      if (Number.isNaN(publishedAt.getTime())) continue

      const summary = truncate(stripHtml(item.contentSnippet || item.content || item.summary || ''), 400)
      const imageUrl = extractImage(item)

      try {
        await prisma.newsItem.upsert({
          where: { url },
          create: {
            title: truncate(title, 280)!,
            url,
            summary,
            imageUrl,
            source: feed.name,
            category: feed.category,
            publishedAt,
          },
          update: {
            title: truncate(title, 280)!,
            summary,
            imageUrl,
            source: feed.name,
            category: feed.category,
            publishedAt,
          },
        })
        count++
      } catch (err) {
        // duplicate URL or transient DB issue — skip this item
        console.warn(`[news] upsert failed for ${url}:`, err instanceof Error ? err.message : err)
      }
    }

    return { feed, count }
  } catch (err) {
    return { feed, count: 0, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function refreshAllFeeds() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed))
  const summary = results.map((r, i) =>
    r.status === 'fulfilled'
      ? { name: FEEDS[i].name, count: r.value.count, error: r.value.error }
      : { name: FEEDS[i].name, count: 0, error: r.reason?.message || String(r.reason) }
  )
  const total = summary.reduce((acc, s) => acc + s.count, 0)
  return { total, sources: summary }
}

const STALE_AFTER_MS = 30 * 60 * 1000 // 30 minutes

export async function isStale(): Promise<boolean> {
  const latest = await prisma.newsItem.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } })
  if (!latest) return true
  return Date.now() - latest.createdAt.getTime() > STALE_AFTER_MS
}

// Caps total stored items by deleting the oldest beyond the cap.
export async function pruneOldItems(keepLatest = 600) {
  const total = await prisma.newsItem.count()
  if (total <= keepLatest) return
  const oldest = await prisma.newsItem.findMany({
    orderBy: { publishedAt: 'asc' },
    take: total - keepLatest,
    select: { id: true },
  })
  if (oldest.length === 0) return
  await prisma.newsItem.deleteMany({ where: { id: { in: oldest.map(o => o.id) } } })
}
