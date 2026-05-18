import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../api'
import StatCard from '../components/StatCard'
import BarChart from '../components/BarChart'
import Pill from '../components/Pill'
import { formatMoney } from '../utils'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => setError(e.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: 'var(--muted)', padding: 40, textAlign: 'center' }}>Loading dashboard…</div>
  if (error) return <div style={{ color: 'var(--red)', padding: 20 }}>{error}</div>
  if (!data) return null

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 24px' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Invoices" value={data.total} accent="var(--accent)" />
        <StatCard label="Flagged for Review" value={data.flagged} accent="var(--gold)" />
        <StatCard label="Total Savings" value={formatMoney(data.total_saving)} accent="var(--green)" sub="from audit findings" />
        <StatCard label="Vendors" value={data.by_vendor?.length || 0} accent="var(--teal)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', color: 'var(--muted)' }}>SPEND BY VENDOR</h2>
          <BarChart data={data.by_vendor} />
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px', color: 'var(--muted)' }}>QUICK ACTIONS</h2>
          <Link to="/" style={{ display: 'block', padding: '12px 16px', background: 'var(--subtle)', borderRadius: 8, marginBottom: 8, fontSize: 13, border: '1px solid var(--border)' }}>
            ↑ Upload new invoice
          </Link>
          <Link to="/accuracy" style={{ display: 'block', padding: '12px 16px', background: 'var(--subtle)', borderRadius: 8, fontSize: 13, border: '1px solid var(--border)' }}>
            Compare AI vs human accuracy
          </Link>
        </div>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Recent Audit Findings</h2>
        </div>
        {!data.audits?.length ? (
          <p style={{ padding: 20, color: 'var(--muted)', fontSize: 13, margin: 0 }}>No audit findings yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--subtle)' }}>
                {['Vendor', 'Verdict', 'Summary', 'Saving'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--muted)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.audits.map((a, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>{a.vendor}</td>
                  <td style={{ padding: '12px 16px' }}><Pill ok={a.verdict === 'ok'}>{a.verdict === 'ok' ? 'OK' : 'Review'}</Pill></td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{a.summary}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--green)', fontWeight: 600 }}>{formatMoney(a.saving)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
