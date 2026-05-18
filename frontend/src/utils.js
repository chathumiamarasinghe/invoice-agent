const DESTINATION_LABELS = {
  process_to_sage500: 'Valid — auto-post to Sage',
  voucher_folder: 'No PO number found',
  bills_for_kim: 'Credit memo or card',
  statements_folder: 'Vendor statement',
  halley_folder: 'Unclear — human review',
  human_review: 'Validation failed',
}

export function destinationLabel(value) {
  if (!value) return '—'
  return DESTINATION_LABELS[value] || value.replace(/_/g, ' ')
}

export function formatMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return `$${Number(n).toFixed(2)}`
}
