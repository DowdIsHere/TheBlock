'use client'

import { useState, useEffect } from 'react'
import { MoodCheckin } from '../MoodCheckin'

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    firstName: string
    lastName: string
    parserName: string | null
  }
}

interface Post {
  id: string
  content: string
  createdAt: string
  liked: boolean
  author: {
    id: string
    firstName: string
    lastName: string
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
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({})
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({})
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set())

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

  async function handleLike(postId: string) {
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      return {
        ...p,
        liked: !p.liked,
        _count: { ...p._count, likes: p._count.likes + (p.liked ? -1 : 1) }
      }
    }))

    try {
      await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
    } catch {
      // Revert on failure
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        return {
          ...p,
          liked: !p.liked,
          _count: { ...p._count, likes: p._count.likes + (p.liked ? -1 : 1) }
        }
      }))
    }
  }

  async function toggleComments(postId: string) {
    const next = new Set(expandedComments)
    if (next.has(postId)) {
      next.delete(postId)
    } else {
      next.add(postId)
      // Load comments if not already loaded
      if (!postComments[postId]) {
        setLoadingComments(prev => new Set(prev).add(postId))
        try {
          const res = await fetch(`/api/posts/${postId}/comments`)
          const data = await res.json()
          setPostComments(prev => ({ ...prev, [postId]: data.comments || [] }))
        } catch {
          setPostComments(prev => ({ ...prev, [postId]: [] }))
        } finally {
          setLoadingComments(prev => {
            const s = new Set(prev)
            s.delete(postId)
            return s
          })
        }
      }
    }
    setExpandedComments(next)
  }

  async function handleComment(postId: string) {
    const text = commentTexts[postId]?.trim()
    if (!text) return

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })

      if (res.ok) {
        const data = await res.json()
        setPostComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment]
        }))
        setCommentTexts(prev => ({ ...prev, [postId]: '' }))
        // Update comment count
        setPosts(prev => prev.map(p => {
          if (p.id !== postId) return p
          return { ...p, _count: { ...p._count, comments: p._count.comments + 1 } }
        }))
      }
    } catch {
      // silently fail
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

      <MoodCheckin />

      <div className="compose-box">
        <textarea
          className="compose-input"
          placeholder="What's on your mind?"
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost()
          }}
        />
        <div className="compose-actions">
          <div className="compose-tools">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Ctrl+Enter to post
            </span>
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
          const initials = `${post.author.firstName[0]}${post.author.lastName[0]}`.toUpperCase()
          const commentsOpen = expandedComments.has(post.id)
          const comments = postComments[post.id] || []
          const isLoadingComments = loadingComments.has(post.id)

          return (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-avatar">{initials}</div>
                <div>
                  <div className="post-author">{post.author.firstName} {post.author.lastName}</div>
                  <div className="post-meta">
                    {post.author.parserName || 'Parser not set'} · {timeAgo(post.createdAt)}
                  </div>
                </div>
              </div>
              <div className="post-content">{post.content}</div>
              <div className="post-actions">
                <button
                  className="post-action"
                  onClick={() => handleLike(post.id)}
                  style={post.liked ? { color: 'var(--blue-500)', fontWeight: 600 } : undefined}
                >
                  {post.liked ? '👍' : '👍'} {post._count.likes || ''}
                  {post.liked && <span style={{ marginLeft: 2, fontSize: '0.75rem' }}>Liked</span>}
                </button>
                <button className="post-action" onClick={() => toggleComments(post.id)}>
                  💬 {post._count.comments || ''}
                </button>
                <button
                  className="post-action"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.origin + `/feed#post-${post.id}`)
                  }}
                >
                  🔗 Share
                </button>
              </div>

              {commentsOpen && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                  {isLoadingComments ? (
                    <div style={{ padding: '12px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Loading comments...
                    </div>
                  ) : comments.length === 0 ? (
                    <div style={{ padding: '12px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No comments yet. Be the first.
                    </div>
                  ) : (
                    <div style={{ paddingTop: 12 }}>
                      {comments.map(c => (
                        <div key={c.id} style={{
                          display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start'
                        }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--green-600), var(--accent-perceptual))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.6rem', fontWeight: 600, color: '#fff', flexShrink: 0,
                          }}>
                            {c.author.firstName[0]}{c.author.lastName[0]}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', marginBottom: 2 }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {c.author.firstName} {c.author.lastName}
                              </span>
                              <span style={{
                                fontFamily: "'IBM Plex Mono', monospace",
                                fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 8
                              }}>
                                {timeAgo(c.createdAt)}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                              {c.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentTexts[post.id] || ''}
                      onChange={e => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleComment(post.id)
                      }}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 8,
                        fontSize: '0.85rem', background: 'var(--bg-inset)',
                        border: '1px solid var(--border)', color: 'var(--text-primary)',
                      }}
                    />
                    <button
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                      onClick={() => handleComment(post.id)}
                      disabled={!commentTexts[post.id]?.trim()}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </>
  )
}
