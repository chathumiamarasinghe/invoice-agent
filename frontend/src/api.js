import axios from 'axios'

export async function extractInvoice(file) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await axios.post('/extract', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function getDashboard() {
  return (await axios.get('/api/dashboard')).data
}

export async function getInvoices() {
  return (await axios.get('/api/invoices')).data
}

export async function getInvoiceDetail(id) {
  return (await axios.get(`/api/invoice/${id}`)).data
}

export async function getAccuracy() {
  return (await axios.get('/api/accuracy')).data
}
