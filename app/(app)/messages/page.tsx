export default function MessagesPage() {
  return (
    <>
      <div className="view-header">
        <h1 className="view-title">Messages</h1>
        <p className="view-subtitle">Your conversations</p>
      </div>

      <div className="messages-layout">
        <div className="conversations-list">
          <div className="conversations-header">Conversations</div>
          <div style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}>
            No conversations yet.
          </div>
        </div>

        <div className="chat-area">
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}>
            Select a conversation or start a new one.
          </div>
        </div>
      </div>
    </>
  )
}
