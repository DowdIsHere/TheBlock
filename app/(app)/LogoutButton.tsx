'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className="nav-item" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
      <span className="icon">🚪</span>
      <span>Log Out</span>
    </button>
  )
}
