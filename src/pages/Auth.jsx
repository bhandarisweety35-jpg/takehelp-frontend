import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Alert } from '../components/Common'
function Form({ mode }) {
  const { login, register } = useAuth(), nav = useNavigate(), loc = useLocation()
  const [f, setF] = useState({ name: '', email: '', password: '' }), [err, setErr] = useState(loc.state?.expired ? 'Your session has expired. Please log in again.' : ''), [busy, setBusy] = useState(false)
  const reg = mode === 'register', set = k => e => setF({ ...f, [k]: e.target.value })
  async function submit(e) {
    e.preventDefault(); setErr('')
    if (reg && f.password.length < 8) return setErr('Password must be at least 8 characters.')
    setBusy(true)
    try { await (reg ? register(f) : login({ email: f.email, password: f.password })); nav(loc.state?.from || '/my-orders', { replace: true }) }
    catch (x) { setErr(x.status === 401 ? 'Incorrect email or password.' : reg && x.status === 409 ? 'An account with this email already exists.' : x.message) }
    finally { setBusy(false) }
  }
  return <section className="wrap narrow"><h1>{reg ? 'Create your account' : 'Log in'}</h1>
    <form className="card" onSubmit={submit} noValidate>
      {reg && <div className="field"><label htmlFor="n">Full name</label><input id="n" required value={f.name} onChange={set('name')} autoComplete="name"/></div>}
      <div className="field"><label htmlFor="e">Email</label><input id="e" type="email" required value={f.email} onChange={set('email')} autoComplete="email"/></div>
      <div className="field"><label htmlFor="p">Password</label><input id="p" type="password" required value={f.password} onChange={set('password')} autoComplete={reg ? 'new-password' : 'current-password'}/></div>
      <Alert>{err}</Alert><button className="btn" disabled={busy}>{busy ? 'Please wait…' : reg ? 'Create account' : 'Log in'}</button>
      <p>{reg ? <>Already registered? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</p></form></section>
}
export const Login = () => <Form mode="login"/>
export const Register = () => <Form mode="register"/>
