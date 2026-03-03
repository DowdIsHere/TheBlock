export default function ProfilePage() {
  return (
    <>
      <div className="profile-header-card">
        <div className="profile-cover"></div>
        <div className="profile-info-section">
          <div className="profile-avatar-large">JM</div>
          <div className="profile-details">
            <div className="profile-name-large">J.D. Mercer</div>
            <div className="profile-parser-tag">Visionary • Abstract · Future · Self</div>
            <div className="profile-bio">
              Creator of the CBI Framework. Exploring how consciousness interfaces with spacetime.
            </div>
            <div className="profile-stats">
              <div>
                <div className="profile-stat-value">1.2k</div>
                <div className="profile-stat-label">Connections</div>
              </div>
              <div>
                <div className="profile-stat-value">847</div>
                <div className="profile-stat-label">Posts</div>
              </div>
              <div>
                <div className="profile-stat-value">12</div>
                <div className="profile-stat-label">Groups</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="view-header">
        <h2 className="view-title" style={{fontSize: '1.2rem'}}>Recent Posts</h2>
      </div>

      <div className="post-card">
        <div className="post-header">
          <div className="post-avatar">JM</div>
          <div>
            <div className="post-author">J.D. Mercer</div>
            <div className="post-meta">Visionary • AFS · 1d</div>
          </div>
        </div>
        <div className="post-content">
          The Parser Profile functions as a compression algorithm for CBI block accessibility. Your three coordinates predict which cognitive blocks you access most readily.
        </div>
        <div className="post-actions">
          <button className="post-action">👍 89</button>
          <button className="post-action">💬 34</button>
          <button className="post-action">↗️</button>
        </div>
      </div>

      <div className="post-card">
        <div className="post-header">
          <div className="post-avatar">JM</div>
          <div>
            <div className="post-author">J.D. Mercer</div>
            <div className="post-meta">Visionary • AFS · 3d</div>
          </div>
        </div>
        <div className="post-content">
          Anterior = Future. Posterior = Past. Ventral = Concrete. Dorsal = Abstract. Medial = Self. Lateral = Other. These aren't metaphors—they're neuroanatomical gradients.
        </div>
        <div className="post-actions">
          <button className="post-action">👍 156</button>
          <button className="post-action">💬 47</button>
          <button className="post-action">↗️</button>
        </div>
      </div>
    </>
  )
}
