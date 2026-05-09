'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CITIES = [
  {
    id: 'architecture',
    name: 'How the mind works',
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
    icon: '\u{1F9E0}',
    blurb: 'Curious about thinking, attention, memory, and what makes us tick. Articles and conversations on cognition.',
  },
  {
    id: 'relations',
    name: 'People & relationships',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    icon: '\u{1F91D}',
    blurb: 'Friendships, family, work, communication. How we connect with the people around us.',
  },
  {
    id: 'assessment',
    name: 'Know yourself',
    color: '#D97706',
    gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
    icon: '\u{1F50D}',
    blurb: 'Personality, strengths, blind spots. Quizzes and reflections to learn about yourself.',
  },
  {
    id: 'clinical',
    name: 'Mental wellness',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #34D399)',
    icon: '\u{1F33F}',
    blurb: 'Anxiety, mood, stress, support. Tools and community for taking care of your mental health.',
  },
]

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function toggleCity(cityId: string) {
    setSelected(prev =>
      prev.includes(cityId)
        ? prev.filter(c => c !== cityId)
        : [...prev, cityId]
    )
  }

  async function handleContinue() {
    if (selected.length === 0) {
      setError('Please select at least one area of interest.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cities: selected }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      router.push('/feed')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="onboarding-card">
        <div className="auth-logo">The Cognition Block</div>
        <div className="auth-logo-sub">Let's talk about it...</div>

        <h1 className="auth-title">What would you like to talk about?</h1>
        <p className="onboarding-subtitle">
          Pick a few that sound interesting. You can change these any time.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <div className="city-grid">
          {CITIES.map(city => {
            const isSelected = selected.includes(city.id)
            return (
              <button
                key={city.id}
                type="button"
                className={`city-card ${isSelected ? 'city-card-selected' : ''}`}
                onClick={() => toggleCity(city.id)}
                style={{
                  '--city-color': city.color,
                  '--city-gradient': city.gradient,
                } as React.CSSProperties}
              >
                <div className="city-card-header">
                  <span className="city-card-icon">{city.icon}</span>
                  <div className="city-card-check">
                    {isSelected && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.3 4.3L6 11.6 2.7 8.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <div className="city-card-name">{city.name}</div>
                <p className="city-card-blurb">{city.blurb}</p>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="btn btn-primary auth-submit"
          disabled={loading || selected.length === 0}
          onClick={handleContinue}
        >
          {loading ? 'Setting up your experience...' : `Continue${selected.length > 0 ? ` (${selected.length} selected)` : ''}`}
        </button>

        <button
          type="button"
          className="onboarding-skip"
          onClick={() => { router.push('/feed'); router.refresh() }}
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
