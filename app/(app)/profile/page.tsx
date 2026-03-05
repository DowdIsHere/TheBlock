import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user: supaUser } } = await supabase.auth.getUser()

  if (!supaUser?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: supaUser.email },
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

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

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
            <div className="profile-name-large">{user.name}</div>
            <div className="profile-parser-tag">{user.parserName || 'Parser not yet set'}</div>
            <div className="profile-bio">
              {user.bio || 'Complete the CogniMap assessment to discover your cognitive architecture and Parser Profile.'}
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
        <h2 className="view-title" style={{fontSize: '1.2rem'}}>Recent Posts</h2>
      </div>

      {user.posts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          No posts yet. Share your first thought with the community.
        </div>
      ) : (
        user.posts.map(post => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div className="post-avatar">{initials}</div>
              <div>
                <div className="post-author">{user.name}</div>
                <div className="post-meta">
                  {user.parserName || 'Parser not set'} · {timeAgo(post.createdAt)}
                </div>
              </div>
            </div>
            <div className="post-content">{post.content}</div>
            <div className="post-actions">
              <button className="post-action">👍 {post._count.likes || ''}</button>
              <button className="post-action">💬 {post._count.comments || ''}</button>
              <button className="post-action">🔗 Share</button>
            </div>
          </div>
        ))
      )}
    </>
  )
}
