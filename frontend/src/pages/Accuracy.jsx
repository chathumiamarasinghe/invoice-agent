import { useEffect, useState } from 'react'
import { getAccuracy } from '../api'

export default function Accuracy() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAccuracy()
      .then(setData)
      .catch((e) => setError(e.message || 'Failed to load accuracy data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: 'var(--muted)', padding: 40, textAlign: 'center' }}>Loading…</div>
  if (error) return <div style={{ color: 'var(--red)' }}>{error}</div>
  if (!data) return null

  const pct = data.accuracy_pct ?? 0
  const accent = pct >= 97 ? 'var(--green)' : pct >= 90 ? 'var(--teal)' : 'var(--gold)'

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>AI vs Human Accuracy</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 28px' }}>Comparing AI extraction against manual Sage 500 entry</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 28 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: accent }}>{pct}%</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{data.correct_fields}/{data.total_fields} fields correct</div>
          <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: accent }}>{data.grade}</div>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Field Comparison</h2>
          {!data.errors?.length ? (
            <p style={{ color: 'var(--green)', fontSize: 13 }}>All fields match human entry</p>
          ) : (
            data.errors.map((e) => (
              <div key={e.field} style={{ background: 'var(--subtle)', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 13 }}>
                <strong style={{ color: 'var(--text)' }}>{e.field}</strong>
                <div style={{ color: 'var(--muted)', marginTop: 4 }}>AI: {e.ai_said} · Human: {e.human}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
