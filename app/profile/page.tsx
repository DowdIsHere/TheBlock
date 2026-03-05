export default function ProfilePage() {
  return (
    <>
      <div className="profile-header-card">
        <div className="profile-cover"></div>
        <div className="profile-info-section">
          <div className="profile-avatar-large">?</div>
          <div className="profile-details">
            <div className="profile-name-large">Your Profile</div>
            <div className="profile-parser-tag">Parser not yet set</div>
            <div className="profile-bio">
              Complete the CogniMap assessment to discover your cognitive architecture and Parser Profile.
            </div>
            <div className="profile-stats">
              <div>
                <div className="profile-stat-value">0</div>
                <div className="profile-stat-label">Connections</div>
              </div>
              <div>
                <div className="profile-stat-value">0</div>
                <div className="profile-stat-label">Posts</div>
              </div>
              <div>
                <div className="profile-stat-value">0</div>
                <div className="profile-stat-label">Groups</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="view-header">
        <h2 className="view-title" style={{fontSize: '1.2rem'}}>Recent Posts</h2>
      </div>

      <div style={{
        textAlign: 'center',
        padding: '48px 20px',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        No posts yet. Share your first thought with the community.
      </div>
    </>
  )
}
