import './globals.css'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export const metadata = {
  title: 'The Cognition Block',
  description: 'Where cognition connects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  if (stored === 'dark' || stored === 'light') {
                    document.documentElement.classList.add(stored);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <div className="app-layout">
          {/* Left Sidebar */}
          <aside className="sidebar-left">
            <div className="logo">The Cognition Block</div>
            <div className="logo-sub">Where cognition connects</div>

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
                <span className="badge">3</span>
              </Link>
            </nav>

            <div className="nav-section">
              <div className="nav-label">My Groups</div>
              <Link href="/groups/cbi-researchers" className="nav-item">
                <span className="icon">🧠</span>
                <span>CBI Researchers</span>
              </Link>
              <Link href="/groups/book-club" className="nav-item">
                <span className="icon">📚</span>
                <span>Book Club</span>
              </Link>
              <Link href="/groups/tech-cognition" className="nav-item">
                <span className="icon">💼</span>
                <span>Tech & Cognition</span>
              </Link>
            </div>

            <div className="nav-spacer"></div>

            <ThemeToggle />

            <Link href="/settings" className="nav-item">
              <span className="icon">⚙️</span>
              <span>Settings</span>
            </Link>

            <Link href="/profile" className="user-card">
              <div className="avatar">You</div>
              <div>
                <div className="user-name">My Profile</div>
                <div className="user-parser">Set up your Parser</div>
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
              <div className="group-card">
                <div className="group-name">Neuroscience Daily</div>
                <div className="group-members">4.2k members</div>
              </div>
              <div className="group-card">
                <div className="group-name">Cognitive Wellness</div>
                <div className="group-members">2.1k members</div>
              </div>
            </div>

            <div className="sidebar-section">
              <div className="sidebar-title">Trending</div>
              <div className="trend-item">
                <div className="trend-category">Cognition</div>
                <div className="trend-topic">Parser Collisions at Work</div>
                <div className="trend-count">1.2k discussing</div>
              </div>
              <div className="trend-item">
                <div className="trend-category">Research</div>
                <div className="trend-topic">Gradient Mapping Studies</div>
                <div className="trend-count">843 discussing</div>
              </div>
              <div className="trend-item">
                <div className="trend-category">Education</div>
                <div className="trend-topic">Adaptive Learning</div>
                <div className="trend-count">567 discussing</div>
              </div>
            </div>
          </aside>
        </div>
      </body>
    </html>
  )
}
