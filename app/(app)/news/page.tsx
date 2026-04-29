import { prisma } from '@/lib/prisma'
import { isStale, refreshAllFeeds, pruneOldItems } from '@/lib/news'
import { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, type FeedCategory } from '@/lib/feeds'
import Link from 'next/link'
import { RefreshButton } from './RefreshButton'

const VALID: FeedCategory[] = ['brain', 'mental', 'gut', 'holistic']

function isValidCategory(value: string | undefined): value is FeedCategory {
  return !!value && (VALID as string[]).includes(value)
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  if (await isStale()) {
    try {
      await refreshAllFeeds()
      await pruneOldItems()
    } catch (err) {
      console.warn('News refresh on render failed:', err)
    }
  }

  const activeCategory: FeedCategory | null = isValidCategory(searchParams.category)
    ? searchParams.category
    : null

  const items = await prisma.newsItem.findMany({
    where: activeCategory ? { category: activeCategory } : {},
    orderBy: { publishedAt: 'desc' },
    take: 60,
  })

  return (
    <>
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="view-title">News</h2>
          <p className="view-subtitle">
            {activeCategory ? CATEGORY_DESCRIPTIONS[activeCategory] : 'Curated research and reporting on cognition, mental health, gut health, and whole-body wellness.'}
          </p>
        </div>
        <RefreshButton />
      </div>

      <div className="news-tabs">
        <Link
          href="/news"
          className={`news-tab ${!activeCategory ? 'news-tab-active' : ''}`}
        >
          All
        </Link>
        {VALID.map(c => (
          <Link
            key={c}
            href={`/news?category=${c}`}
            className={`news-tab ${activeCategory === c ? 'news-tab-active' : ''}`}
          >
            {CATEGORY_LABELS[c]}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="news-empty">
          <div className="news-empty-title">No articles yet</div>
          <p>Hit Refresh to pull the latest from our sources.</p>
        </div>
      ) : (
        <div className="news-list">
          {items.map(item => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-card"
            >
              {item.imageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.imageUrl}
                  alt=""
                  className="news-card-image"
                  loading="lazy"
                />
              )}
              <div className="news-card-body">
                <div className="news-card-meta">
                  <span className={`news-card-tag news-card-tag-${item.category}`}>
                    {CATEGORY_LABELS[item.category as FeedCategory] || item.category}
                  </span>
                  <span className="news-card-source">{item.source}</span>
                  <span className="news-card-dot">·</span>
                  <span className="news-card-time">{timeAgo(item.publishedAt)}</span>
                </div>
                <h3 className="news-card-title">{item.title}</h3>
                {item.summary && <p className="news-card-summary">{item.summary}</p>}
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  )
}
