import Link from 'next/link'
import { ThemeToggle } from '../ThemeToggle'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/session'
import { redirect } from 'next/navigation'
import { LogoutButton } from './LogoutButton'
import { MobileNav } from './MobileNav'
import { SidebarNav } from './SidebarNav'
import { CrisisResources } from './CrisisResources'
import { SessionTimer } from './SessionTimer'
import { AppShell } from './AppShell'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userId = getSessionUserId()
  if (!userId) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true, parserName: true }
  })

  if (!user) {
    redirect('/login')
  }

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <aside className="sidebar-left">
        <div className="logo">The Cognition Block</div>
        <div className="logo-sub">Let's talk about it...</div>

        <SidebarNav />
    <AppShell>
      <a href="#main-content" className="skip-link">Skip to content</a>

      <div className="app-layout">
        <aside className="sidebar-left" aria-label="Primary">
          <div className="logo">The Cognition Block</div>
          <div className="logo-sub">Let&apos;s talk about it...</div>

          <nav className="nav-section" aria-label="Main navigation">
            <Link href="/feed" className="nav-item">
              <span className="icon" aria-hidden="true">🏠</span>
              <span>Feed</span>
            </Link>
            <Link href="/news" className="nav-item">
              <span className="icon" aria-hidden="true">📰</span>
              <span>News</span>
            </Link>
            <Link href="/discover" className="nav-item">
              <span className="icon" aria-hidden="true">🔍</span>
              <span>Discover</span>
            </Link>
            <Link href="/groups" className="nav-item">
              <span className="icon" aria-hidden="true">👥</span>
              <span>Groups</span>
            </Link>
            <Link href="/messages" className="nav-item">
              <span className="icon" aria-hidden="true">💬</span>
              <span>Messages</span>
            </Link>
          </nav>

          <div className="nav-section">
            <div className="nav-label">My Groups</div>
            <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', padding: '4px 14px', lineHeight: 1.5}}>
              Join groups to see them here.
            </p>
          </div>

          <div className="nav-spacer"></div>

          <ThemeToggle />

          <Link href="/settings" className="nav-item">
            <span className="icon" aria-hidden="true">⚙️</span>
            <span>Settings</span>
          </Link>

          <LogoutButton />

          <Link href="/profile" className="user-card">
            <div className="avatar">{initials}</div>
            <div>
              <div className="user-name">{user.firstName} {user.lastName}</div>
              <div className="user-parser">{user.parserName || 'Set up your Parser'}</div>
            </div>
          </Link>
        </aside>

        <main className="main-content" id="main-content">
          <header className="app-header" role="banner">
            <div className="app-header-search" role="search">
              <label htmlFor="cb-global-search" className="sr-only" style={{position:'absolute',width:1,height:1,padding:0,margin:-1,overflow:'hidden',clip:'rect(0,0,0,0)',border:0}}>
                Search The Cognition Block
              </label>
              <input
                id="cb-global-search"
                type="search"
                placeholder="Search parsers, groups, posts…"
                autoComplete="off"
              />
              <span className="app-header-kbd" aria-hidden="true">⌘K</span>
            </div>
            <div className="app-header-actions">
              <button type="button" className="icon-btn" aria-label="Notifications" data-dot>🔔</button>
              <Link href="/messages" className="icon-btn" aria-label="Messages">✉️</Link>
              <Link href="/profile" className="icon-btn" aria-label="Profile" style={{padding:0, overflow:'hidden'}}>
                <div className="avatar" style={{width:'100%', height:'100%', borderRadius:11, fontSize:'0.7rem'}}>{initials}</div>
              </Link>
            </div>
          </header>

          <SessionTimer />
          {children}
        </main>

        <aside className="sidebar-right" aria-label="Secondary">
          <CrisisResources />

          <div className="sidebar-section">
            <div className="sidebar-title">Parsers you may click with</div>
            <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.55, marginTop: 4}}>
              Connect with others to surface compatibility matches.
            </p>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Suggested groups</div>
            <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.55, marginTop: 4}}>
              Groups will appear here as the community grows.
            </p>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Trending</div>
            <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.55, marginTop: 4}}>
              Nothing trending yet. Check back soon.
            </p>
          </div>
        </aside>

        <MobileNav />
      </div>
    </AppShell>
  )
}
