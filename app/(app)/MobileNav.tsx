'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MobileNav() {
  const pathname = usePathname()

  const tabs = [
    { href: '/feed', icon: '🏠', label: 'Feed' },
    { href: '/discover', icon: '🔍', label: 'Discover' },
    { href: '/groups', icon: '👥', label: 'Groups' },
    { href: '/messages', icon: '💬', label: 'Messages' },
    { href: '/profile', icon: '👤', label: 'Profile' },
  ]

  return (
    <nav className="mobile-nav">
      {tabs.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`mobile-nav-item${pathname === tab.href ? ' active' : ''}`}
        >
          <span className="mobile-nav-icon">{tab.icon}</span>
          <span className="mobile-nav-label">{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
}
