import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const userId = getSessionUserId()
  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          _count: { select: { comments: true, likes: true } }
        }
      },
      _count: {
        select: {
          posts: true,
          groups: true,
          connections: { where: { status: 'accepted' } },
        }
      }
    }
  })

  if (!user) redirect('/login')

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()

  function timeAgo(date: Date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <>
      <div className="profile-header-card">
        <div className="profile-cover"></div>
        <div className="profile-info-section">
          <div className="profile-avatar-large">{initials}</div>
          <div className="profile-details">
            <div className="profile-name-large">{user.firstName} {user.lastName}</div>
            <div className="profile-parser-tag">{user.parserName || 'Parser not yet set'}</div>
            <div className="profile-bio">
              {user.bio || 'Take the CogniMap assessment to surface your cognitive architecture and unlock your Parser Profile.'}
            </div>
            <div className="profile-stats">
              <div>
                <div className="profile-stat-value">{user._count.connections}</div>
                <div className="profile-stat-label">Connections</div>
              </div>
              <div>
                <div className="profile-stat-value">{user._count.posts}</div>
                <div className="profile-stat-label">Posts</div>
              </div>
              <div>
                <div className="profile-stat-value">{user._count.groups}</div>
                <div className="profile-stat-label">Groups</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="view-header">
        <h2 className="view-title" style={{fontSize: '1.45rem'}}>Recent posts</h2>
      </div>

      {user.posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">✎</div>
          <div className="empty-state-title">Nothing posted yet</div>
          <p className="empty-state-body">
            Your first post sets the tone for who finds you. Drop a question, a field note, or what you&apos;re working on.
          </p>
        </div>
      ) : (
        user.posts.map(post => (
          <article key={post.id} className="post-card">
            <div className="post-header">
              <div className="post-avatar">{initials}</div>
              <div>
                <div className="post-author">{user.firstName} {user.lastName}</div>
                <div className="post-meta">
                  {user.parserName || 'Parser not set'} · {timeAgo(post.createdAt)}
                </div>
              </div>
            </div>
            <div className="post-content">{post.content}</div>
            <div className="post-actions" role="group" aria-label="Post reactions">
              <button className="post-action" data-react="like">
                <span aria-hidden="true">👍</span>
                <span>Like</span>
                {post._count.likes > 0 && (
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.74rem', opacity: 0.75 }}>
                    {post._count.likes}
                  </span>
                )}
              </button>
              <button className="post-action" data-react="comment">
                <span aria-hidden="true">💬</span>
                <span>Comment</span>
                {post._count.comments > 0 && (
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.74rem', opacity: 0.75 }}>
                    {post._count.comments}
                  </span>
                )}
              </button>
              <button className="post-action" data-react="share">
                <span aria-hidden="true">↗</span>
                <span>Share</span>
              </button>
            </div>
          </article>
        ))
      )}
    </>
  )
}
