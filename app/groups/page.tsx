import Link from 'next/link'

export default function GroupsPage() {
  return (
    <>
      <div className="view-header">
        <h1 className="view-title">Groups</h1>
        <p className="view-subtitle">Communities by interest</p>
      </div>

      <div style={{
        textAlign: 'center',
        padding: '48px 20px',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        No groups yet. Groups will appear here as the community grows.
      </div>
    </>
  )
}
