'use client'

import { useState, useEffect } from 'react'

const MOODS = [
  { value: 1, emoji: '😔', label: 'Struggling' },
  { value: 2, emoji: '😕', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😊', label: 'Great' },
]

export function MoodCheckin() {
  const [todayMood, setTodayMood] = useState<number | null>(null)
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    async function checkToday() {
      try {
        const res = await fetch('/api/mood')
        const data = await res.json()
        if (data.checkin) {
          setTodayMood(data.checkin.mood)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    checkToday()
  }, [])

  async function handleSubmit() {
    if (!selectedMood || submitting) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: selectedMood, note }),
      })

      if (res.ok) {
        setTodayMood(selectedMood)
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || dismissed) return null

  if (todayMood) {
    const moodData = MOODS.find(m => m.value === todayMood)
    return (
      <div className="mood-checkin mood-checkin-done">
        <div className="mood-header">
          <span className="mood-today-emoji">{moodData?.emoji}</span>
          <div>
            <div className="mood-today-label">Today you're feeling <strong>{moodData?.label?.toLowerCase()}</strong></div>
            <div className="mood-today-sub">Check back tomorrow for your next check-in</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mood-checkin">
      <div className="mood-header">
        <span className="mood-title">How are you feeling today?</span>
        <button className="mood-dismiss" onClick={() => setDismissed(true)} aria-label="Dismiss">
          ×
        </button>
      </div>

      <div className="mood-options">
        {MOODS.map(m => (
          <button
            key={m.value}
            className={`mood-option${selectedMood === m.value ? ' selected' : ''}`}
            onClick={() => setSelectedMood(m.value)}
          >
            <span className="mood-emoji">{m.emoji}</span>
            <span className="mood-label">{m.label}</span>
          </button>
        ))}
      </div>

      {selectedMood && (
        <div className="mood-note-section">
          <input
            type="text"
            className="mood-note-input"
            placeholder="Add a note (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
          />
          <button
            className="btn btn-primary mood-submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Log Mood'}
          </button>
        </div>
      )}
    </div>
  )
}
