import { useState, useRef } from 'react'

export default function SageEntryForm({ data }) {
  const [filled, setFilled] = useState({})
  const [status, setStatus] = useState('idle')
  const isFilling = useRef(false)

  const FIELDS = [
    { key: 'po_number', label: 'PO Number', required: true,
      value: () => data?.po_number || '' },
    { key: 'invoice_number', label: 'Invoice No.', required: true,
      value: () => data?.invoice_no || '' },
    { key: 'invoice_date', label: 'Invoice Date', required: true,
      value: () => data?.invoice_date || '' },
    { key: 'vendor', label: 'Vendor Name', required: true,
      value: () => data?.vendor || '' },
    { key: 'amount', label: 'Amount (USD)', required: true,
      value: () => data?.total ? `$${Number(data.total).toFixed(2)}` : '' },
    { key: 'freight', label: 'Freight Charges', required: false,
      value: () => data?.freight != null ? `$${Number(data.freight).toFixed(2)}` : '$0.00' },
    { key: 'terms', label: 'Payment Terms', required: false,
      value: () => data?.payment_terms || 'Net 30' },
  ]

  async function autoFill() {
    if (isFilling.current) return
    isFilling.current = true
    setStatus('filling')
    setFilled({})
    for (const field of FIELDS) {
      await new Promise((r) => setTimeout(r, 500))
      setFilled((prev) => ({ ...prev, [field.key]: field.value() }))
    }
    setStatus('done')
    isFilling.current = false
  }

  function reset() {
    setFilled({})
    setStatus('idle')
    isFilling.current = false
  }

  const filledCount = Object.keys(filled).length
  const totalFields = FIELDS.length

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ background: 'var(--subtle)', borderBottom: '1px solid var(--border)', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: status === 'done' ? 'var(--green)' : status === 'filling' ? 'var(--gold)' : 'var(--muted)', transition: 'background .3s' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Sage 500 — Enter Receipt of Invoice</span>
        </div>
        <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 4, fontWeight: 500 }}>Legacy system</span>
      </div>
      <div style={{ height: 3, background: 'var(--border)' }}>
        <div style={{ height: '100%', width: `${(filledCount / totalFields) * 100}%`, background: status === 'done' ? 'var(--green)' : 'var(--accent)', transition: 'width 0.4s ease, background 0.3s' }} />
      </div>
      <div style={{ padding: '20px 20px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 20 }}>
          {FIELDS.map((field) => {
            const isFilled = filled[field.key] !== undefined
            return (
              <div key={field.key}>
                <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {field.label}{field.required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <input readOnly value={filled[field.key] || ''} placeholder={status === 'filling' && !isFilled ? 'Waiting...' : ''} style={{ width: '100%', padding: '9px 36px 9px 12px', background: isFilled ? 'rgba(16,185,129,0.12)' : 'var(--subtle)', border: `1px solid ${isFilled ? 'var(--green)' : 'var(--border)'}`, borderRadius: 7, fontSize: 13, fontFamily: 'var(--font)', color: isFilled ? 'var(--text)' : 'var(--muted)', transition: 'all 0.35s ease', outline: 'none' }} />
                  {isFilled && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--green)', fontWeight: 700 }}>✓</span>}
                </div>
              </div>
            )
          })}
        </div>
        {status === 'done' && (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>All {totalFields} fields populated automatically</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>0 manual keystrokes · ~0 seconds vs ~2 minutes manual</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button type="button" onClick={autoFill} disabled={status === 'filling' || status === 'done'} style={{ flex: 1, padding: '10px 0', background: status === 'done' ? 'rgba(16,185,129,0.12)' : status === 'filling' ? 'var(--subtle)' : 'linear-gradient(135deg, var(--accent), var(--accent-d))', color: status === 'done' ? 'var(--green)' : status === 'filling' ? 'var(--muted)' : 'var(--text)', border: status === 'done' ? '1px solid rgba(16,185,129,0.25)' : 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: status === 'idle' ? 'pointer' : 'default', transition: 'all 0.3s' }}>
            {status === 'idle' && '▶  Auto-fill from AI extraction'}
            {status === 'filling' && `⏳  Filling fields... (${filledCount}/${totalFields})`}
            {status === 'done' && '✓  Ready to post to Sage 500'}
          </button>
          {status !== 'idle' && (
            <button type="button" onClick={reset} style={{ padding: '10px 16px', background: 'var(--subtle)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}>Reset</button>
          )}
        </div>
      </div>
    </div>
  )
}
