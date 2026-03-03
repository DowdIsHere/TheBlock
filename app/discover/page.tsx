export default function DiscoverPage() {
  const users = [
    { initials: 'AL', name: 'Alex Liu', parser: 'Harmonious • BFB', compat: 92, gradient: 'linear-gradient(135deg, #00d4aa, #ffc857)' },
    { initials: 'JP', name: 'Jordan Patel', parser: 'Foresighted • AFB', compat: 87, gradient: 'linear-gradient(135deg, #a855f7, #ffc857)' },
    { initials: 'RN', name: 'Riley Nguyen', parser: 'Collaborative • BFO', compat: 84, gradient: 'linear-gradient(135deg, #ffc857, #00d4aa)' },
    { initials: 'CT', name: 'Casey Thompson', parser: 'Reflective • APB', compat: 79, gradient: 'linear-gradient(135deg, #00d4aa, #ffc857)' },
    { initials: 'DW', name: 'Dana Williams', parser: 'Intuitive • APO', compat: 76, gradient: 'linear-gradient(135deg, #a855f7, #00d4aa)' },
    { initials: 'MK', name: 'Morgan Kim', parser: 'Actualized • BFS', compat: 73, gradient: 'linear-gradient(135deg, #ffc857, #a855f7)' },
  ]

  return (
    <>
      <div className="view-header">
        <h1 className="view-title">Discover</h1>
        <p className="view-subtitle">Parsers you may click with</p>
      </div>

      <div className="discovery-grid">
        {users.map((user, i) => (
          <div key={i} className="discovery-card">
            <div className="discovery-avatar" style={{background: user.gradient}}>
              {user.initials}
            </div>
            <div className="discovery-name">{user.name}</div>
            <div className="discovery-parser">{user.parser}</div>
            <div className="compat-bar">
              <div className="compat-fill" style={{width: `${user.compat}%`}}></div>
            </div>
            <div className="compat-text">{user.compat}% Compatible</div>
          </div>
        ))}
      </div>
    </>
  )
}
