'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/feed', icon: '🏠', label: 'Feed' },
  { href: '/news', icon: '📰', label: 'News' },
  { href: '/discover', icon: '🔍', label: 'Discover' },
  { href: '/groups', icon: '👥', label: 'Groups' },
  { href: '/messages', icon: '💬', label: 'Messages' },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="nav-section">
      {ITEMS.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
