'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DiscoverUser {
  id: string
  firstName: string
  lastName: string
  bio: string | null
  parserName: string | null
  parserCode: string | null
  spatialAxis: string | null
  temporalAxis: string | null
  referenceAxis: string | null
  connectionStatus: string | null
  _count: {
    posts: number
    connections: number
  }
}

export default function DiscoverPage() {
  const [users, setUsers] = useState<DiscoverUser[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect(userId: string) {
    setConnecting(prev => new Set(prev).add(userId))
    try {
      const res = await fetch(`/api/connections/${userId}`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setUsers(prev => prev.map(u => {
          if (u.id !== userId) return u
          const status = data.action === 'accepted' ? 'accepted'
            : data.action === 'requested' ? 'pending'
            : u.connectionStatus
          return { ...u, connectionStatus: status }
        }))
      }
    } catch {
      // silently fail
    } finally {
      setConnecting(prev => {
        const s = new Set(prev)
        s.delete(userId)
        return s
      })
    }
  }

  function getConnectionButton(user: DiscoverUser) {
    const isLoading = connecting.has(user.id)

    if (user.connectionStatus === 'accepted') {
      return (
        <span className="status-tag status-preserved">Connected</span>
      )
    }
    if (user.connectionStatus === 'pending') {
      return (
        <span className="status-tag status-partial">Pending</span>
      )
    }
    return (
      <button
        className="btn btn-primary"
        style={{ padding: '6px 14px', fontSize: '0.78rem' }}
        onClick={() => handleConnect(user.id)}
        disabled={isLoading}
      >
        {isLoading ? '...' : 'Connect'}
      </button>
    )
  }

  if (loading) {
    return (
      <>
        <div className="view-header">
          <h1 className="view-title">Discover</h1>
          <p className="view-subtitle">Parsers whose cognitive architecture maps to yours.</p>
        </div>
        <div className="discovery-grid" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="discovery-card" aria-hidden="true">
              <div>
                <div className="skeleton skeleton-avatar" style={{ width: 68, height: 68, borderRadius: 22, margin: '0 auto 14px' }} />
                <div className="skeleton skeleton-line skeleton-line-md" style={{ margin: '0 auto 8px' }} />
                <div className="skeleton skeleton-line skeleton-line-sm" style={{ margin: '0 auto 14px' }} />
                <div className="skeleton skeleton-line skeleton-line-lg" style={{ marginBottom: 6 }} />
                <div className="skeleton skeleton-line skeleton-line-lg" />
              </div>
              <div className="skeleton" style={{ height: 32, borderRadius: 10, marginTop: 18 }} />
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="view-header">
        <h1 className="view-title">Discover</h1>
        <p className="view-subtitle">Parsers whose cognitive architecture maps to yours.</p>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">🧭</div>
          <div className="empty-state-title">No parsers in your orbit yet</div>
          <p className="empty-state-body">
            The community is still finding its shape. Invite a friend or share your profile to surface compatibility matches.
          </p>
        </div>
      ) : (
        <div className="discovery-grid">
          {users.map(user => {
            const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
            return (
              <div key={user.id} className="discovery-card">
                <div className="discovery-avatar">{initials}</div>
                <div className="discovery-name">{user.firstName} {user.lastName}</div>
                <div className="discovery-parser">
                  {user.parserName || 'Parser not set'}
                  {user.parserCode && ` · ${user.parserCode}`}
                </div>

                {user.bio && (
                  <p style={{
                    fontSize: '0.83rem', color: 'var(--text-secondary)',
                    lineHeight: 1.5, marginBottom: 12,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {user.bio}
                  </p>
                )}

                {(user.spatialAxis || user.temporalAxis || user.referenceAxis) && (
                  <div style={{
                    display: 'flex', gap: 6, justifyContent: 'center',
                    marginBottom: 12, flexWrap: 'wrap',
                  }}>
                    {user.spatialAxis && (
                      <span className="status-tag status-info">{user.spatialAxis}</span>
                    )}
                    {user.temporalAxis && (
                      <span className="status-tag status-partial">{user.temporalAxis}</span>
                    )}
                    {user.referenceAxis && (
                      <span className="status-tag status-preserved">{user.referenceAxis}</span>
                    )}
                  </div>
                )}

                <div style={{
                  display: 'flex', gap: 16, justifyContent: 'center',
                  marginBottom: 14,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '0.7rem', color: 'var(--text-muted)',
                }}>
                  <span>{user._count.posts} posts</span>
                  <span>{user._count.connections} connections</span>
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  {getConnectionButton(user)}
                  <Link
                    href={`/messages`}
                    onClick={() => {
                      // Store target user for new message
                      sessionStorage.setItem('messageUser', JSON.stringify({
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        parserName: user.parserName,
                      }))
                    }}
                    className="btn"
                    style={{
                      padding: '6px 14px', fontSize: '0.78rem',
                      border: '1px solid var(--border)', color: 'var(--text-secondary)',
                      textDecoration: 'none', borderRadius: 8,
                    }}
                  >
                    Message
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
