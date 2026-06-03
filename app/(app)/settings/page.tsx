'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.user) {
        setFirstName(data.user.firstName || '')
        setLastName(data.user.lastName || '')
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
        body: JSON.stringify({ firstName, lastName, bio }),
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

  async function handleDelete() {
    if (confirmText !== 'DELETE' || deleting) return
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/auth/delete', { method: 'DELETE' })
      if (res.ok) {
        router.push('/signup')
        router.refresh()
      } else {
        const data = await res.json()
        setDeleteError(data.error || 'Failed to delete account.')
        setDeleting(false)
      }
    } catch {
      setDeleteError('Something went wrong. Please try again.')
      setDeleting(false)
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
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px' }}
            />
          </div>

          <div className="auth-field" style={{ marginTop: '16px' }}>
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
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

      <div className="card" style={{ padding: '24px', marginTop: '20px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Your data</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Download a copy of everything tied to your account, including your posts, messages, and mood history.
        </p>
        <a href="/api/auth/export" className="btn" style={{
          display: 'inline-block', padding: '10px 16px', fontSize: '0.85rem',
          border: '1px solid var(--border)', color: 'var(--text-secondary)',
          textDecoration: 'none', borderRadius: 8,
        }}>
          Download my data
        </a>
      </div>

      <div className="card" style={{ padding: '24px', marginTop: '20px', borderColor: 'var(--status-compromised-text)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px', color: 'var(--status-compromised-text)' }}>
          Delete account
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          This permanently removes your account and all of your data — posts, comments, messages, and mood history. This cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: '10px 16px', fontSize: '0.85rem', cursor: 'pointer',
              border: '1px solid var(--status-compromised-text)', borderRadius: 8,
              background: 'none', color: 'var(--status-compromised-text)', fontWeight: 500,
            }}
          >
            Delete my account
          </button>
        ) : (
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Type <strong>DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{ width: '100%', maxWidth: 240, padding: '10px 14px', marginBottom: '12px' }}
            />
            {deleteError && (
              <p style={{ fontSize: '0.82rem', color: 'var(--status-compromised-text)', marginBottom: '12px' }}>
                {deleteError}
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || deleting}
                style={{
                  padding: '10px 16px', fontSize: '0.85rem', borderRadius: 8, border: 'none',
                  background: 'var(--status-compromised-text)', color: '#fff', fontWeight: 600,
                  cursor: confirmText === 'DELETE' && !deleting ? 'pointer' : 'not-allowed',
                  opacity: confirmText === 'DELETE' && !deleting ? 1 : 0.5,
                }}
              >
                {deleting ? 'Deleting...' : 'Permanently delete'}
              </button>
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setConfirmText(''); setDeleteError('') }}
                disabled={deleting}
                style={{
                  padding: '10px 16px', fontSize: '0.85rem', borderRadius: 8, cursor: 'pointer',
                  border: '1px solid var(--border)', background: 'none', color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
