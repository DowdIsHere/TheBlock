'use client'

import { useState } from 'react'

export function CrisisResources() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="crisis-resources">
      <button
        className="crisis-toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span className="crisis-icon">♡</span>
        <span>Need support?</span>
      </button>

      {expanded && (
        <div className="crisis-panel">
          <p className="crisis-label">You are not alone. Help is available 24/7.</p>

          <a href="tel:988" className="crisis-link crisis-link-primary">
            <span className="crisis-link-icon">📞</span>
            <div>
              <div className="crisis-link-title">988 Suicide & Crisis Lifeline</div>
              <div className="crisis-link-sub">Call or text 988</div>
            </div>
          </a>

          <a href="sms:741741?body=HELLO" className="crisis-link">
            <span className="crisis-link-icon">💬</span>
            <div>
              <div className="crisis-link-title">Crisis Text Line</div>
              <div className="crisis-link-sub">Text HOME to 741741</div>
            </div>
          </a>

          <a
            href="https://www.samhsa.gov/find-help/national-helpline"
            target="_blank"
            rel="noopener noreferrer"
            className="crisis-link"
          >
            <span className="crisis-link-icon">🏥</span>
            <div>
              <div className="crisis-link-title">SAMHSA Helpline</div>
              <div className="crisis-link-sub">1-800-662-4357 (free, 24/7)</div>
            </div>
          </a>
        </div>
      )}
    </div>
  )
}
