'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.user) {
        setName(data.user.name || '')
        setBio(data.user.bio || '')
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/auth/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio }),
      })

      if (res.ok) {
        setMessage('Profile updated.')
        router.refresh()
      } else {
        const data = await res.json()
        setMessage(data.error || 'Failed to save.')
      }
    } catch {
      setMessage('Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    )
  }

  return (
    <>
      <div className="view-header">
        <h1 className="view-title">Settings</h1>
        <p className="view-subtitle">Manage your account</p>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <form onSubmit={handleSave}>
          <div className="auth-field">
            <label htmlFor="name">Display Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px' }}
            />
          </div>

          <div className="auth-field" style={{ marginTop: '16px' }}>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              style={{ width: '100%', padding: '10px 14px', minHeight: '100px', resize: 'vertical' }}
            />
          </div>

          {message && (
            <p style={{ marginTop: '12px', fontSize: '0.85rem', color: message.includes('updated') ? 'var(--green-600)' : 'var(--status-compromised-text)' }}>
              {message}
            </p>
          )}

          <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </>
  )
}
