import { useState, useEffect } from 'react'
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
const links = [['/', 'Home'], ['/order?type=Record', 'Record Writing'], ['/order?type=Observation', 'Observation'], ['/order?type=Assignment', 'Assignments'], ['/#how', 'How It Works'], ['/my-orders', 'My Orders']]
export default function Layout() {
  const { user, logout } = useAuth(), nav = useNavigate(), loc = useLocation(), [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [loc])
  const items = <>{links.map(([to, t]) => <NavLink key={t} to={to} end>{t}</NavLink>)}{user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}</>
  return <><a href="#main" className="skip">Skip to content</a>
    <header className="top"><div className="bar">
      <Link to="/" className="logo">TakeHelp<span>?</span></Link>
      <nav className="desk" aria-label="Main">{items}</nav>
      <div className="acct">
        {user ? <><span aria-label="Notifications" title="Notifications">🔔</span><span>{user.name}</span><button className="btn ghost" onClick={async () => { await logout(); nav('/') }}>Log out</button></>
          : <Link className="btn" to="/register">Get Started</Link>}
        <button className="burger" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>☰</button>
      </div></div>
      {open && <nav className="drawer" aria-label="Mobile">{items}{!user && <NavLink to="/login">Log in</NavLink>}</nav>}
    </header>
    <main id="main"><Outlet/></main>
    <footer className="wrap foot">TakeHelp? Handwritten-style records, observations and assignments.</footer></>
}
