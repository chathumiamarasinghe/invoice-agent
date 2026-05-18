export default function BarChart({ data }) {
  if (!data?.length) {
    return <div style={{ color: 'var(--muted)', fontSize: 13 }}>No vendor data yet</div>
  }
  const max = Math.max(...data.map((d) => d.total || 0), 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, paddingTop: 8 }}>
      {data.map((item) => {
        const h = Math.max(8, (item.total / max) * 130)
        return (
          <div key={item.vendor} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>${Number(item.total).toFixed(0)}</div>
            <div style={{
              width: '100%', maxWidth: 48, height: h,
              background: 'linear-gradient(180deg, var(--accent), var(--accent-d))',
              borderRadius: '6px 6px 0 0',
              transition: 'height 0.4s ease',
            }} />
            <div style={{
              fontSize: 10, color: 'var(--muted)', textAlign: 'center',
              maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {item.vendor}
            </div>
          </div>
        )
      })}
    </div>
  )
}
