import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getInvoiceDetail } from '../api'
import Pill from '../components/Pill'
import SageEntryForm from '../components/SageEntryForm'
import AuditCard from '../components/AuditCard'
import { destinationLabel, formatMoney } from '../utils'

export default function InvoiceDetail() {
  const { id } = useParams()
  const [inv, setInv] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getInvoiceDetail(id)
      .then(setInv)
      .catch((e) => setError(e.message || 'Invoice not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ color: 'var(--muted)', padding: 40 }}>Loading…</div>
  if (error) return <div style={{ color: 'var(--red)' }}>{error}</div>
  if (!inv) return null

  const audit = inv.audit

  return (
    <div style={{ maxWidth: 900 }}>
      <Link to="/dashboard" style={{ fontSize: 13, color: 'var(--muted)', display: 'inline-block', marginBottom: 16 }}>← Dashboard</Link>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>{inv.vendor}</h1>
      <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 20px' }}>Invoice #{inv.invoice_no} · {destinationLabel(inv.destination)}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[['PO', inv.po_number], ['Date', inv.invoice_date], ['Total', formatMoney(inv.total)], ['Paid', inv.is_paid ? 'Yes' : 'No']].map(([l, v]) => (
          <div key={l} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <SageEntryForm data={{
          po_number: inv.po_number, invoice_no: inv.invoice_no,
          invoice_date: inv.invoice_date, vendor: inv.vendor,
          total: inv.total, freight: inv.freight, payment_terms: inv.payment_terms || 'Net 30',
        }} />
      </div>

      {audit && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>Audit</span>
            <Pill ok={audit.verdict === 'ok'}>{audit.verdict === 'ok' ? 'OK' : 'Review needed'}</Pill>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px' }}>{audit.summary}</p>
          {audit.findings?.map((f, i) => <AuditCard key={i} finding={f} />)}
        </div>
      )}
    </div>
  )
}
