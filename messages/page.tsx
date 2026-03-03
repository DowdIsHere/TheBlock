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
          
          <div className="conversation-item active">
            <div className="conv-avatar">SK</div>
            <div className="conv-info">
              <div className="conv-name">Sarah Kim</div>
              <div className="conv-preview">That's a great point about...</div>
            </div>
            <div className="conv-time">2m</div>
          </div>
          
          <div className="conversation-item">
            <div className="conv-avatar" style={{background: 'linear-gradient(135deg, #00d4aa, #a855f7)'}}>AL</div>
            <div className="conv-info">
              <div className="conv-name">Alex Liu</div>
              <div className="conv-preview">Let me know when you're free</div>
            </div>
            <div className="conv-time">1h</div>
          </div>
          
          <div className="conversation-item">
            <div className="conv-avatar" style={{background: 'linear-gradient(135deg, #a855f7, #ffc857)'}}>MR</div>
            <div className="conv-info">
              <div className="conv-name">Marcus Rivera</div>
              <div className="conv-preview">Thanks for sharing that article!</div>
            </div>
            <div className="conv-time">3h</div>
          </div>
        </div>

        <div className="chat-area">
          <div className="chat-header">
            <div className="conv-avatar">SK</div>
            <div>
              <div className="conv-name">Sarah Kim</div>
              <div style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>Coherent • BPB</div>
            </div>
          </div>
          
          <div className="chat-messages">
            <div className="message received">
              <div className="message-bubble">Hey! I saw your post about the gradient research. Have you looked at Snow 2016?</div>
              <div className="message-time">10:30 AM</div>
            </div>
            
            <div className="message sent">
              <div className="message-bubble">Yes! That's foundational to what I'm working on. The four-domain prefrontal model maps well to CBI blocks.</div>
              <div className="message-time">10:32 AM</div>
            </div>
            
            <div className="message received">
              <div className="message-bubble">That's a great point about the mapping. I've been trying to understand the medial-lateral gradient.</div>
              <div className="message-time">10:35 AM</div>
            </div>
          </div>
          
          <div className="chat-input-area">
            <input type="text" className="chat-input" placeholder="Type a message..." />
            <button className="btn btn-primary">Send</button>
          </div>
        </div>
      </div>
    </>
  )
}
