import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Upload, LayoutDashboard, FileSearch, BarChart2 } from 'lucide-react'
import UploadPage from './pages/Upload'
import Dashboard from './pages/Dashboard'
import InvoiceDetail from './pages/InvoiceDetail'
import Accuracy from './pages/Accuracy'

const NAV = [
  { to: '/', label: 'Upload', icon: Upload, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/accuracy', label: 'Accuracy', icon: BarChart2 },
]

function NavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
        color: isActive ? 'var(--text)' : 'var(--muted)',
        background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
        border: isActive ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
      })}
    >
      <Icon size={16} />
      {label}
    </NavLink>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{
          width: 220, flexShrink: 0,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          padding: '20px 14px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ padding: '4px 14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileSearch size={22} color="var(--accent)" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>AP Invoice</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>Intelligence</div>
            </div>
          </div>
          {NAV.map((n) => <NavItem key={n.to} {...n} />)}
        </aside>
        <main style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invoice/:id" element={<InvoiceDetail />} />
            <Route path="/accuracy" element={<Accuracy />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
