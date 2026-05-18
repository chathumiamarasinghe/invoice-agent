import { useState, useRef } from 'react'
import { Upload as UploadIcon, FileText } from 'lucide-react'
import { extractInvoice } from '../api'
import SageEntryForm from '../components/SageEntryForm'
import Pill from '../components/Pill'
import AuditCard from '../components/AuditCard'
import { destinationLabel, formatMoney } from '../utils'

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{value ?? '—'}</div>
    </div>
  )
}

export default function Upload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef(null)

  async function handleExtract(f) {
    if (!f) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await extractInvoice(f)
      setResult(data)
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Extraction failed')
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') { setFile(f); handleExtract(f) }
    else setError('Please upload a PDF file')
  }

  const audit = result?.audit

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>Upload Invoice</h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>Drop a PDF — AI extracts fields, audits pricing, and prepares Sage 500 entry</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${drag ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 12, padding: 40, textAlign: 'center', cursor: 'pointer',
          background: drag ? 'rgba(59,130,246,0.06)' : 'var(--card)',
          marginBottom: 20, transition: 'all 0.2s',
        }}
      >
        <input ref={inputRef} type="file" accept=".pdf" hidden onChange={(e) => {
          const f = e.target.files[0]
          if (f) { setFile(f); handleExtract(f) }
        }} />
        <UploadIcon size={32} color="var(--muted)" style={{ marginBottom: 12 }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
          {file ? file.name : 'Drag & drop invoice PDF here'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>or click to browse</div>
      </div>

      {loading && <div style={{ textAlign: 'center', color: 'var(--accent)', padding: 20, animation: 'pulse 1.5s infinite' }}>Extracting with AI…</div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 12, color: 'var(--red)', marginBottom: 16, fontSize: 13 }}>{error}</div>}

      {result && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="var(--accent)" />
                <span style={{ fontSize: 15, fontWeight: 600 }}>Extracted Fields</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--teal)', background: 'rgba(20,184,166,0.1)', padding: '4px 10px', borderRadius: 6 }}>
                {destinationLabel(result.destination)}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <Field label="Vendor" value={result.vendor} />
              <Field label="Invoice No." value={result.invoice_no} />
              <Field label="PO Number" value={result.po_number} />
              <Field label="Date" value={result.invoice_date} />
              <Field label="Total" value={formatMoney(result.total)} />
              <Field label="Freight" value={formatMoney(result.freight)} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Sage 500 entry — automated
            </div>
            <SageEntryForm data={{
              po_number: result.po_number,
              invoice_no: result.invoice_no,
              invoice_date: result.invoice_date,
              vendor: result.vendor,
              total: result.total,
              freight: result.freight,
              payment_terms: result.payment_terms || 'Net 30',
            }} />
          </div>

          {audit && (
            <div style={{ background: 'var(--card)', border: `1px solid ${audit.verdict === 'ok' ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Audit Results</span>
                <Pill ok={audit.verdict === 'ok'}>{audit.verdict === 'ok' ? 'OK' : 'Review needed'}</Pill>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px' }}>{audit.summary}</p>
              {audit.estimated_saving > 0 && (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
                  💰 Estimated saving: {formatMoney(audit.estimated_saving)}
                </div>
              )}
              {audit.findings?.map((f, i) => <AuditCard key={i} finding={f} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
