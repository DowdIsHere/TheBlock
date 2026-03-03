export default function GroupsPage() {
  const groups = [
    { name: 'CBI Researchers', description: 'Discussing the science behind cognitive architecture', members: '2.4k', posts: 15, gradient: 'linear-gradient(135deg, #00d4aa, #a855f7)' },
    { name: 'Educators & Learning', description: 'Applying Parser insights to teaching', members: '1.8k', posts: 8, gradient: 'linear-gradient(135deg, #ffc857, #00d4aa)' },
    { name: 'MS & Neurological', description: 'Support and strategies for cognitive conditions', members: '920', posts: 12, gradient: 'linear-gradient(135deg, #a855f7, #ffc857)' },
    { name: 'Tech & Cognition', description: 'Building tools that adapt to cognitive architecture', members: '1.2k', posts: 6, gradient: 'linear-gradient(135deg, #00d4aa, #a855f7)' },
    { name: 'Relationships & Parsers', description: 'Navigating collisions in personal relationships', members: '3.1k', posts: 22, gradient: 'linear-gradient(135deg, #ffc857, #a855f7)' },
    { name: 'Parents & Kids', description: 'Understanding your child\'s cognitive architecture', members: '1.5k', posts: 11, gradient: 'linear-gradient(135deg, #00d4aa, #ffc857)' },
  ]

  return (
    <>
      <div className="view-header">
        <h1 className="view-title">Groups</h1>
        <p className="view-subtitle">Communities by interest</p>
      </div>

      <div className="groups-grid">
        {groups.map((group, i) => (
          <div key={i} className="group-full-card">
            <div className="group-cover" style={{background: group.gradient}}></div>
            <div className="group-details">
              <div className="group-full-name">{group.name}</div>
              <div className="group-description">{group.description}</div>
              <div className="group-stats">{group.members} members · {group.posts} posts today</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
