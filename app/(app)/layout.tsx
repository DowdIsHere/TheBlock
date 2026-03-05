import Link from 'next/link'
import { ThemeToggle } from '../ThemeToggle'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { LogoutButton } from './LogoutButton'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user: supaUser } } = await supabase.auth.getUser()

  if (!supaUser?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: supaUser.email },
    select: { id: true, name: true, parserName: true }
  })

  if (!user) {
    redirect('/login')
  }

  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <aside className="sidebar-left">
        <div className="logo">The Cognition Block</div>
        <div className="logo-sub">Let's talk about it...</div>

        <nav className="nav-section">
          <Link href="/feed" className="nav-item">
            <span className="icon">🏠</span>
            <span>Feed</span>
          </Link>
          <Link href="/discover" className="nav-item">
            <span className="icon">🔍</span>
            <span>Discover</span>
          </Link>
          <Link href="/groups" className="nav-item">
            <span className="icon">👥</span>
            <span>Groups</span>
          </Link>
          <Link href="/messages" className="nav-item">
            <span className="icon">💬</span>
            <span>Messages</span>
          </Link>
        </nav>

        <div className="nav-section">
          <div className="nav-label">My Groups</div>
          <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', padding: '4px 12px'}}>
            Join groups to see them here.
          </p>
        </div>

        <div className="nav-spacer"></div>

        <ThemeToggle />

        <Link href="/settings" className="nav-item">
          <span className="icon">⚙️</span>
          <span>Settings</span>
        </Link>

        <LogoutButton />

        <Link href="/profile" className="user-card">
          <div className="avatar">{initials}</div>
          <div>
            <div className="user-name">{user.name}</div>
            <div className="user-parser">{user.parserName || 'Set up your Parser'}</div>
          </div>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Right Sidebar */}
      <aside className="sidebar-right">
        <div className="sidebar-section">
          <div className="sidebar-title">Parsers You May Click With</div>
          <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
            Connect with others to see compatibility matches.
          </p>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Suggested Groups</div>
          <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
            Groups will appear here as the community grows.
          </p>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Trending</div>
          <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
            Nothing trending yet. Check back soon.
          </p>
        </div>
      </aside>
    </div>
  )
}
