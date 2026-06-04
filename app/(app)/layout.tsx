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
            <div className="user-name">{user.firstName} {user.lastName}</div>
            <div className="user-parser">{user.parserName || 'Set up your Parser'}</div>
          </div>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <SessionTimer />
        {children}
      </main>

      {/* Right Sidebar */}
      <aside className="sidebar-right">
        <CrisisResources />

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

      <MobileNav />
    </div>
  )
}
