export default function FeedPage() {
  return (
    <>
      <div className="view-header">
        <h1 className="view-title">Feed</h1>
        <p className="view-subtitle">Updates from connections and interests</p>
      </div>

      <div className="compose-box">
        <textarea className="compose-input" placeholder="What's on your mind?"></textarea>
        <div className="compose-actions">
          <div className="compose-tools">
            <button className="compose-tool">📷</button>
            <button className="compose-tool">🔗</button>
            <button className="compose-tool">📊</button>
          </div>
          <button className="btn btn-primary">Post</button>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        padding: '48px 20px',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        Your feed is empty. Follow people and join groups to see posts here.
      </div>
    </>
  )
}
