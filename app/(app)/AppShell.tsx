'use client'

import { useEffect } from 'react'

export function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const selector = '.post-card, .discovery-card, .group-full-card, .news-card'

    function handleMove(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target) return
      const card = target.closest<HTMLElement>(selector)
      if (!card) return
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`)
      card.style.setProperty('--my', `${e.clientY - rect.top}px`)
    }

    document.addEventListener('mousemove', handleMove, { passive: true })
    return () => document.removeEventListener('mousemove', handleMove)
  }, [])

  return <>{children}</>
}
