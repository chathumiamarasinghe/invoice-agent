export default function AuditCard({ finding }) {
  return (
    <div style={{
      background: 'var(--subtle)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '12px 14px',
      marginBottom: 8,
    }}>
      <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 4 }}>
        {finding.description}
      </div>
      {finding.saving > 0 && (
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>
          Potential saving: ${Number(finding.saving).toFixed(2)}
        </div>
      )}
    </div>
  )
}
