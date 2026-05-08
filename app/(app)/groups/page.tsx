'use client'

import { useState, useEffect } from 'react'

interface Group {
  id: string
  name: string
  description: string | null
  coverUrl: string | null
  isPrivate: boolean
  memberCount: number
  postCount: number
  isMember: boolean
  role: string | null
  createdAt: string
}

interface Post {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    firstName: string
    lastName: string
    parserName: string | null
  }
  _count: { comments: number; likes: number }
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [groupPosts, setGroupPosts] = useState<Post[]>([])
  const [postContent, setPostContent] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  async function fetchGroups() {
    try {
      const res = await fetch('/api/groups')
      const data = await res.json()
      setGroups(data.groups || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!newName.trim() || creating) return
    setCreating(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDescription }),
      })
      if (res.ok) {
        setNewName('')
        setNewDescription('')
        setShowCreate(false)
        fetchGroups()
      }
    } catch {
      // silently fail
    } finally {
      setCreating(false)
    }
  }

  async function handleJoin(groupId: string) {
    try {
      const res = await fetch(`/api/groups/${groupId}/join`, { method: 'POST' })
      if (res.ok) {
        fetchGroups()
        // If we're viewing this group, refresh
        if (activeGroup?.id === groupId) {
          const data = await res.json()
          setActiveGroup(prev => prev ? { ...prev, isMember: data.joined } : null)
        }
      }
    } catch {
      // silently fail
    }
  }

  async function openGroup(group: Group) {
    setActiveGroup(group)
    try {
      const res = await fetch(`/api/groups/${group.id}/posts`)
      const data = await res.json()
      setGroupPosts(data.posts || [])
    } catch {
      setGroupPosts([])
    }
  }

  async function handleGroupPost() {
    if (!postContent.trim() || !activeGroup || posting) return
    setPosting(true)
    try {
      const res = await fetch(`/api/groups/${activeGroup.id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postContent }),
      })
      if (res.ok) {
        const data = await res.json()
        setGroupPosts(prev => [data.post, ...prev])
        setPostContent('')
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

  // If viewing a specific group
  if (activeGroup) {
    return (
      <>
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setActiveGroup(null)}
            style={{
              background: 'none', border: 'none', color: 'var(--blue-500)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
            }}
          >
            ← Back to Groups
          </button>
        </div>

        <div className="group-full-card" style={{ marginBottom: 24 }}>
          <div className="group-cover"></div>
          <div className="group-details">
            <div className="group-full-name" style={{ fontSize: '1.3rem' }}>{activeGroup.name}</div>
            {activeGroup.description && (
              <div className="group-description">{activeGroup.description}</div>
            )}
            <div className="group-stats" style={{ marginBottom: 12 }}>
              {activeGroup.memberCount} members · {activeGroup.postCount} posts
            </div>
            {activeGroup.isMember ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="status-tag status-preserved">Member</span>
                {activeGroup.role === 'admin' && (
                  <span className="status-tag status-info">Admin</span>
                )}
                <button
                  onClick={() => handleJoin(activeGroup.id)}
                  style={{
                    background: 'none', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem',
                    color: 'var(--text-muted)', cursor: 'pointer',
                  }}
                >
                  Leave
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                onClick={() => handleJoin(activeGroup.id)}
              >
                Join Group
              </button>
            )}
          </div>
        </div>

        {activeGroup.isMember && (
          <div className="compose-box">
            <textarea
              className="compose-input"
              placeholder={`Post in ${activeGroup.name}...`}
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGroupPost()
              }}
            />
            <div className="compose-actions">
              <div></div>
              <button
                className="btn btn-primary"
                onClick={handleGroupPost}
                disabled={!postContent.trim() || posting}
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        )}

        {groupPosts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            color: 'var(--text-muted)', fontSize: '0.9rem'
          }}>
            No posts in this group yet. {activeGroup.isMember ? 'Be the first to share!' : 'Join to start posting.'}
          </div>
        ) : (
          groupPosts.map(post => {
            const initials = `${post.author.firstName[0]}${post.author.lastName[0]}`.toUpperCase()
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
                  <button className="post-action">👍 {post._count.likes || ''}</button>
                  <button className="post-action">💬 {post._count.comments || ''}</button>
                </div>
              </div>
            )
          })
        )}
      </>
    )
  }

  return (
    <>
      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="view-title">Groups</h1>
          <p className="view-subtitle">Communities by interest</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? 'Cancel' : '+ Create Group'}
        </button>
      </div>

      {showCreate && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div className="auth-field">
            <label>Group Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g., Spatial Parsers United"
              style={{ width: '100%', padding: '10px 14px' }}
            />
          </div>
          <div className="auth-field" style={{ marginTop: 12 }}>
            <label>Description (optional)</label>
            <textarea
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="What's this group about?"
              style={{ width: '100%', padding: '10px 14px', minHeight: 80, resize: 'vertical' }}
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
          >
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Loading...
        </div>
      ) : groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No groups yet. Create the first one!
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map(group => (
            <div
              key={group.id}
              className="group-full-card"
              onClick={() => openGroup(group)}
            >
              <div className="group-cover"></div>
              <div className="group-details">
                <div className="group-full-name">{group.name}</div>
                {group.description && (
                  <div className="group-description">{group.description}</div>
                )}
                <div className="group-stats" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{group.memberCount} members · {group.postCount} posts</span>
                  {group.isMember ? (
                    <span className="status-tag status-preserved" style={{ fontSize: '0.6rem' }}>Joined</span>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '4px 12px', fontSize: '0.72rem' }}
                      onClick={e => {
                        e.stopPropagation()
                        handleJoin(group.id)
                      }}
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
