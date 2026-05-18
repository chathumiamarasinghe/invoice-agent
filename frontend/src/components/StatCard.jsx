export default function StatCard({ label, value, sub, accent = 'var(--accent)' }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderTop: `2px solid ${accent}`,
      borderRadius: 12,
      padding: '20px 22px',
    }}>
      <div style={{
        fontSize: 28, fontWeight: 700, color: accent,
        marginBottom: 4, fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
      }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</div>}
    </div>
  )
}
