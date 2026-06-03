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
        <p className="view-subtitle">Signals, questions, and field notes from your network.</p>
      </div>

      <div className="story-rail" aria-label="Highlights">
        <div className="story-card is-add" role="button" tabIndex={0} aria-label="Add a highlight">+</div>
        <div className="story-card" data-tint="blue">
          <div className="story-card-avatar">MK</div>
          <div className="story-card-label">Parser of the week</div>
        </div>
        <div className="story-card" data-tint="teal">
          <div className="story-card-avatar">PT</div>
          <div className="story-card-label">Periodic Table thread</div>
        </div>
        <div className="story-card" data-tint="amber">
          <div className="story-card-avatar">SF</div>
          <div className="story-card-label">Spatial frame · live</div>
        </div>
        <div className="story-card" data-tint="rose">
          <div className="story-card-avatar">MC</div>
          <div className="story-card-label">MAET case study</div>
        </div>
        <div className="story-card" data-tint="green">
          <div className="story-card-avatar">OC</div>
          <div className="story-card-label">Oscillatory coherence</div>
        </div>
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
          aria-label="Compose a new post"
        />
        <div className="compose-actions">
          <div className="compose-tools" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            ⌘ + Enter to post
          </div>
          <button
            className="btn btn-primary"
            onClick={handlePost}
            disabled={!content.trim() || posting}
          >
            {posting ? 'Posting…' : 'Share thought'}
          </button>
        </div>
      </div>

      {loading ? (
        <div aria-busy="true" aria-label="Loading feed">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-post" aria-hidden="true">
              <div className="skeleton-row">
                <div className="skeleton skeleton-avatar" />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-line skeleton-line-md" style={{ marginBottom: 8 }} />
                  <div className="skeleton skeleton-line skeleton-line-sm" />
                </div>
              </div>
              <div className="skeleton skeleton-line skeleton-line-lg" style={{ marginBottom: 8 }} />
              <div className="skeleton skeleton-line skeleton-line-lg" style={{ marginBottom: 8, width: '92%' }} />
              <div className="skeleton skeleton-line skeleton-line-md" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">✦</div>
          <div className="empty-state-title">Your feed is quiet</div>
          <p className="empty-state-body">
            Share the first thought, question, or observation. The conversation grows from a single voice.
          </p>
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
              <div className="post-actions" role="group" aria-label="Post reactions">
                <button
                  className="post-action"
                  data-react="like"
                  aria-pressed={post.liked}
                  onClick={() => handleLike(post.id)}
                >
                  <span aria-hidden="true">{post.liked ? '💙' : '👍'}</span>
                  <span>{post.liked ? 'Liked' : 'Like'}</span>
                  {post._count.likes > 0 && (
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.74rem', opacity: 0.75 }}>
                      {post._count.likes}
                    </span>
                  )}
                </button>
                <button
                  className="post-action"
                  data-react="comment"
                  onClick={() => toggleComments(post.id)}
                  aria-expanded={commentsOpen}
                >
                  <span aria-hidden="true">💬</span>
                  <span>Comment</span>
                  {post._count.comments > 0 && (
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.74rem', opacity: 0.75 }}>
                      {post._count.comments}
                    </span>
                  )}
                </button>
                <button
                  className="post-action"
                  data-react="share"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.origin + `/feed#post-${post.id}`)
                  }}
                >
                  <span aria-hidden="true">↗</span>
                  <span>Share</span>
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
                            width: 32, height: 32, borderRadius: 11,
                            background: 'var(--blue-600)',
                            backgroundImage: 'radial-gradient(120% 120% at 25% 15%, rgba(255,255,255,0.14) 0%, transparent 55%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'Geist', 'IBM Plex Sans', sans-serif",
                            fontSize: '0.68rem', fontWeight: 600, letterSpacing: '-0.01em',
                            color: '#fff', flexShrink: 0,
                            boxShadow: 'var(--shadow-sm)',
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
