export default function Pill({ ok, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: ok ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
      color: ok ? 'var(--green)' : 'var(--gold)',
      border: `1px solid ${ok ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
    }}>
      {ok ? '✓' : '⚠'} {children}
    </span>
  )
}
