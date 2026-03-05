'use client'

import { useState, useEffect } from 'react'

interface Post {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    parserName: string | null
    avatarUrl: string | null
  }
  _count: {
    comments: number
    likes: number
  }
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const res = await fetch('/api/posts')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  async function handlePost() {
    if (!content.trim() || posting) return
    setPosting(true)

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        const data = await res.json()
        setPosts([data.post, ...posts])
        setContent('')
      }
    } catch {
      // silently fail
    } finally {
      setPosting(false)
    }
  }

  function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <>
      <div className="view-header">
        <h1 className="view-title">Feed</h1>
        <p className="view-subtitle">Updates from connections and interests</p>
      </div>

      <div className="compose-box">
        <textarea
          className="compose-input"
          placeholder="What's on your mind?"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <div className="compose-actions">
          <div className="compose-tools">
            <button className="compose-tool">📷</button>
            <button className="compose-tool">🔗</button>
            <button className="compose-tool">📊</button>
          </div>
          <button
            className="btn btn-primary"
            onClick={handlePost}
            disabled={!content.trim() || posting}
          >
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Loading...
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Your feed is empty. Share your first thought with the community.
        </div>
      ) : (
        posts.map(post => {
          const initials = post.author.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
          return (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-avatar">{initials}</div>
                <div>
                  <div className="post-author">{post.author.name}</div>
                  <div className="post-meta">
                    {post.author.parserName || 'Parser not set'} · {timeAgo(post.createdAt)}
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
          )
        })
      )}
    </>
  )
}
