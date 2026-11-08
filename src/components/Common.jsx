import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
export const STATUSES = ['New','Accepted','Waiting List','In Progress','Completed','Cancelled','Rejected']
export const Badge = ({ status }) => <span className={`badge s-${String(status).toLowerCase().replace(/\s/g,'-')}`}>{status}</span>
export const Alert = ({ children }) => children ? <p role="alert" className="alert">{children}</p> : null
export const money = n => n == null ? '—' : '₹' + Number(n).toLocaleString('en-IN')
export const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
export function Protected({ children, admin }) {
  const { user, ready, expired } = useAuth(), loc = useLocation()
  if (!ready) return <p className="wrap">Loading…</p>
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname, expired }} replace />
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}
