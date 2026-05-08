'use client'

import { useState, useEffect, useCallback } from 'react'

const GENTLE_REMINDER_MIN = 30
const SECOND_REMINDER_MIN = 60

export function SessionTimer() {
  const [minutes, setMinutes] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [reminderLevel, setReminderLevel] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutes(m => m + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (minutes >= SECOND_REMINDER_MIN && reminderLevel < 2) {
      setReminderLevel(2)
      setDismissed(false)
    } else if (minutes >= GENTLE_REMINDER_MIN && reminderLevel < 1) {
      setReminderLevel(1)
      setDismissed(false)
    }
  }, [minutes, reminderLevel])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
  }, [])

  if (dismissed || reminderLevel === 0) return null

  const message = reminderLevel === 1
    ? "You've been here 30 minutes. Consider taking a short break — a walk, some water, or a few deep breaths."
    : "You've been online for an hour. Your well-being matters. Step away for a bit if you need to."

  return (
    <div className="session-reminder">
      <div className="session-reminder-content">
        <span className="session-reminder-icon">🌿</span>
        <p className="session-reminder-text">{message}</p>
      </div>
      <button className="session-reminder-dismiss" onClick={handleDismiss} aria-label="Dismiss">
        Got it
      </button>
    </div>
  )
}
