'use client'

import { useState, useEffect, useRef } from 'react'

interface UserInfo {
  id: string
  firstName: string
  lastName: string
  parserName: string | null
}

interface Conversation {
  userId: string
  user: UserInfo
  lastMessage: string
  lastMessageAt: string
  isRead: boolean
}

interface Message {
  id: string
  content: string
  createdAt: string
  senderId: string
  sender: { id: string; firstName: string; lastName: string }
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeUserId, setActiveUserId] = useState<string | null>(null)
  const [activeUser, setActiveUser] = useState<UserInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [allUsers, setAllUsers] = useState<UserInfo[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages when in a conversation
  useEffect(() => {
    if (!activeUserId) return
    const interval = setInterval(() => {
      fetchMessages(activeUserId, true)
    }, 5000)
    return () => clearInterval(interval)
  }, [activeUserId])

  async function fetchConversations() {
    try {
      const res = await fetch('/api/messages')
      const data = await res.json()
      setConversations(data.conversations || [])
      setCurrentUserId(data.currentUserId || null)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  async function fetchMessages(userId: string, silent = false) {
    try {
      const res = await fetch(`/api/messages/${userId}`)
      const data = await res.json()
      setMessages(data.messages || [])
      if (data.otherUser) setActiveUser(data.otherUser)
      if (data.currentUserId) setCurrentUserId(data.currentUserId)
    } catch {
      if (!silent) setMessages([])
    }
  }

  async function openConversation(userId: string) {
    setActiveUserId(userId)
    setShowNewMessage(false)
    await fetchMessages(userId)
  }

  async function handleSend() {
    if (!messageText.trim() || !activeUserId || sending) return
    setSending(true)

    try {
      const res = await fetch(`/api/messages/${activeUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageText }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        setMessageText('')
        // Update conversation list
        fetchConversations()
      }
    } catch {
      // silently fail
    } finally {
      setSending(false)
    }
  }

  async function openNewMessage() {
    setShowNewMessage(true)
    setActiveUserId(null)
    setMessages([])
    // Load users
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setAllUsers(data.users || [])
    } catch {
      setAllUsers([])
    }
  }

  function startConversationWith(user: UserInfo) {
    setActiveUserId(user.id)
    setActiveUser(user)
    setShowNewMessage(false)
    setMessages([])
    fetchMessages(user.id)
  }

  function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 60) return 'now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const filteredUsers = allUsers.filter(u =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <div className="view-header">
        <h1 className="view-title">Messages</h1>
        <p className="view-subtitle">Your conversations</p>
      </div>

      <div className="messages-layout">
        <div className="conversations-list">
          <div className="conversations-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Conversations</span>
            <button
              onClick={openNewMessage}
              style={{
                background: 'var(--blue-500)', color: '#fff', border: 'none',
                borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              + New
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading...
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No conversations yet. Start one!
            </div>
          ) : (
            conversations.map(conv => {
              const initials = `${conv.user.firstName[0]}${conv.user.lastName[0]}`.toUpperCase()
              return (
                <div
                  key={conv.userId}
                  className={`conversation-item${activeUserId === conv.userId ? ' active' : ''}`}
                  onClick={() => openConversation(conv.userId)}
                >
                  <div className="conv-avatar">{initials}</div>
                  <div className="conv-info">
                    <div className="conv-name" style={!conv.isRead ? { fontWeight: 700 } : undefined}>
                      {conv.user.firstName} {conv.user.lastName}
                    </div>
                    <div className="conv-preview">{conv.lastMessage}</div>
                  </div>
                  <div className="conv-time">{timeAgo(conv.lastMessageAt)}</div>
                </div>
              )
            })
          )}
        </div>

        <div className="chat-area">
          {showNewMessage ? (
            <>
              <div className="chat-header">
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>New Message</span>
              </div>
              <div style={{ padding: 16 }}>
                <input
                  type="text"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    background: 'var(--bg-inset)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: '0.88rem',
                  }}
                />
                <div style={{ marginTop: 12, maxHeight: 400, overflowY: 'auto' }}>
                  {filteredUsers.map(u => {
                    const initials = `${u.firstName[0]}${u.lastName[0]}`.toUpperCase()
                    return (
                      <div
                        key={u.id}
                        onClick={() => startConversationWith(u)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 8px', borderRadius: 8, cursor: 'pointer',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-inset)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div className="conv-avatar" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>{initials}</div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{u.firstName} {u.lastName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                            {u.parserName || 'Parser not set'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {filteredUsers.length === 0 && (
                    <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {allUsers.length === 0 ? 'No other users yet.' : 'No matches found.'}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : activeUserId && activeUser ? (
            <>
              <div className="chat-header">
                <div className="conv-avatar" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>
                  {activeUser.firstName[0]}{activeUser.lastName[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {activeUser.firstName} {activeUser.lastName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                    {activeUser.parserName || 'Parser not set'}
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '100%', color: 'var(--text-muted)', fontSize: '0.9rem',
                  }}>
                    Start the conversation.
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'}`}
                    >
                      <div className="message-bubble">{msg.content}</div>
                      <div className="message-time">{formatTime(msg.createdAt)}</div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-area">
                <input
                  className="chat-input"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSend}
                  disabled={!messageText.trim() || sending}
                  style={{ padding: '10px 20px' }}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', fontSize: '0.9rem',
            }}>
              Select a conversation or start a new one.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
