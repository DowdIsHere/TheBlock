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

      <div className="post-card">
        <div className="post-header">
          <div className="post-avatar">SK</div>
          <div>
            <div className="post-author">Sarah Kim</div>
            <div className="post-meta">Coherent • BPB · 2h</div>
          </div>
        </div>
        <div className="post-content">
          Just finished reading the latest on prefrontal gradient mapping. The connection between anterior-posterior orientation and temporal processing is fascinating.
        </div>
        <div className="post-actions">
          <button className="post-action">👍 24</button>
          <button className="post-action">💬 8</button>
          <button className="post-action">↗️</button>
        </div>
      </div>

      <div className="post-card">
        <div className="post-header">
          <div className="post-avatar" style={{background: 'linear-gradient(135deg, #00d4aa, #a855f7)'}}>MR</div>
          <div>
            <div className="post-author">Marcus Rivera</div>
            <div className="post-meta">Sharp • CPS · 5h</div>
          </div>
        </div>
        <div className="post-content">
          Had an interesting collision moment today with a colleague. Classic Concrete vs Abstract strategy session friction. Once we named it, everything shifted.
        </div>
        <div className="post-actions">
          <button className="post-action">👍 47</button>
          <button className="post-action">💬 12</button>
          <button className="post-action">↗️</button>
        </div>
      </div>

      <div className="post-card">
        <div className="post-header">
          <div className="post-avatar" style={{background: 'linear-gradient(135deg, #ffc857, #00d4aa)'}}>EL</div>
          <div>
            <div className="post-author">Elena Torres</div>
            <div className="post-meta">Empathetic • BPO · 8h</div>
          </div>
        </div>
        <div className="post-content">
          Question for educators: How are you adapting lesson delivery based on Parser diversity? I'm experimenting with offering the same content in Concrete and Abstract entry points.
        </div>
        <div className="post-actions">
          <button className="post-action">👍 31</button>
          <button className="post-action">💬 23</button>
          <button className="post-action">↗️</button>
        </div>
      </div>
    </>
  )
}
