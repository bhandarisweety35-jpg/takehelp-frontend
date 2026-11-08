import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { Badge, Alert, STATUSES, money, fmt } from '../components/Common'
const Tabs = () => <nav className="tabs" aria-label="Admin">{[['/admin', 'Dashboard'], ['/admin/orders', 'Orders'], ['/admin/pricing', 'Pricing'], ['/admin/settings', 'Settings']].map(([t, n]) => <Link key={t} to={t}>{n}</Link>)}</nav>
function useLoad(fn, deps = []) { const [d, setD] = useState(null), [e, setE] = useState(''); useEffect(() => { fn().then(setD).catch(x => setE(x.message)) }, deps); return [d, e, setD] }
export function AdminDash() {
  const [s, e] = useLoad(api.admin.stats)
  const cards = s && [['Active orders', s.active], ['Available slots', s.available], ['New', s.new], ['Waiting list', s.waiting], ['In progress', s.inProgress], ['Due soon', s.dueSoon], ['Completed', s.completed], ['Estimated revenue', money(s.estimatedRevenue)], ['Final revenue', money(s.finalRevenue)]]
  return <section className="wrap"><h1>Admin</h1><Tabs/><Alert>{e}</Alert><div className="grid3">{cards?.map(([k, v]) => <div className="card" key={k}><p>{k}</p><p className="num">{v}</p></div>)}</div></section>
}
const SORTS = [['due', 'Closest delivery date'], ['price', 'Highest price'], ['pages', 'Highest page count'], ['diagrams', 'Most drawings/diagrams'], ['newest', 'Newest order'], ['oldest', 'Oldest order']]
export function AdminOrders() {
  const [sort, setSort] = useState('due'), [filter, setFilter] = useState(''), [d, e] = useLoad(() => api.admin.orders(sort), [sort])
  const rows = d?.orders.filter(o => !filter || o.status === filter)
  return <section className="wrap"><h1>Orders</h1><Tabs/><Alert>{e}</Alert>
    <div className="row"><label>Sort <select value={sort} onChange={x => setSort(x.target.value)}>{SORTS.map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></label>
      <label>Status <select value={filter} onChange={x => setFilter(x.target.value)}><option value="">All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label></div>
    <div className="scroll"><table><thead><tr><th>ID</th><th>Subject</th><th>Due</th><th>Pages</th><th>Est.</th><th>Priority</th><th>Status</th></tr></thead>
      <tbody>{rows?.map(o => <tr key={o.id}><td><Link to={`/admin/orders/${o.id}`}>#{o.id}</Link></td><td>{o.subject}</td><td>{fmt(o.dueDate)}</td><td>{o.pages}</td><td>{money(o.estimate)}</td><td>{o.priority}</td><td><Badge status={o.status}/></td></tr>)}</tbody></table></div></section>
}
export function AdminOrder() {
  const { id } = useParams(), [o, e, setO] = useLoad(() => api.admin.order(id), [id]), [msg, setMsg] = useState(''), [err, setErr] = useState('')
  const [f, setF] = useState(null)
  useEffect(() => { if (o) setF({ adminMessage: o.adminMessage || '', finalPrice: o.finalPrice ?? '', priority: o.priority || 'MEDIUM' }) }, [o])
  async function act(body, ok) { setErr(''); setMsg(''); try { setO(await api.admin.update(id, body)); setMsg(ok) } catch (x) { setErr(x.message) } }
  if (!o || !f) return <section className="wrap"><Alert>{e}</Alert></section>
  const actions = [['Accept', 'Accepted'], ['Waiting list', 'Waiting List'], ['Start', 'In Progress'], ['Mark completed', 'Completed'], ['Cancel', 'Cancelled'], ['Reject', 'Rejected']]
  return <section className="wrap narrow"><h1>Order #{o.id} <Badge status={o.status}/></h1><Tabs/>
    <dl className="card dl"><div><dt>Student</dt><dd>{o.userName}</dd></div><div><dt>Subject</dt><dd>{o.subject}</dd></div><div><dt>Due</dt><dd>{fmt(o.dueDate)}</dd></div><div><dt>Pages</dt><dd>{o.pages}</dd></div><div><dt>Estimated</dt><dd>{money(o.estimate)}</dd></div><div><dt>Instructions</dt><dd>{o.comments || '—'}</dd></div></dl>
    <div className="row">{actions.map(([l, s]) => <button key={s} className="btn ghost" onClick={() => act({ status: s }, `Status set to ${s}.`)}>{l}</button>)}</div>
    <div className="card"><div className="field"><label htmlFor="fp">Final price (₹)</label><input id="fp" type="number" min="0" value={f.finalPrice} onChange={x => setF({ ...f, finalPrice: x.target.value })}/></div>
      <div className="field"><label htmlFor="pr">Priority</label><select id="pr" value={f.priority} onChange={x => setF({ ...f, priority: x.target.value })}><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></div>
      <div className="field"><label htmlFor="am">Message to student</label><textarea id="am" rows="3" value={f.adminMessage} onChange={x => setF({ ...f, adminMessage: x.target.value })}/></div>
      <button className="btn" onClick={() => act({ ...f, finalPrice: f.finalPrice === '' ? null : +f.finalPrice }, 'Saved.')}>Save changes</button>
      <Alert>{err}</Alert>{msg && <p role="status">{msg}</p>}</div></section>
}
function KV({ title, load, save, fields }) {
  const [d, e] = useLoad(load), [f, setF] = useState(null), [m, setM] = useState(''), [er, setEr] = useState('')
  useEffect(() => { if (d) setF(d) }, [d])
  async function go(ev) { ev.preventDefault(); setEr(''); setM(''); try { await save(Object.fromEntries(fields.map(([k]) => [k, +f[k]]))); setM('Saved.') } catch (x) { setEr(x.message) } }
  return <section className="wrap narrow"><h1>{title}</h1><Tabs/><Alert>{e}</Alert>{f && <form className="card" onSubmit={go}>
    {fields.map(([k, l]) => <div className="field" key={k}><label htmlFor={k}>{l}</label><input id={k} type="number" min="0" value={f[k] ?? ''} onChange={x => setF({ ...f, [k]: x.target.value })}/></div>)}
    <button className="btn">Save</button><Alert>{er}</Alert>{m && <p role="status">{m}</p>}</form>}</section>
}
export const AdminPricing = () => <KV title="Pricing" load={api.admin.pricing} save={api.admin.setPricing} fields={[['perPage', 'Price per page'], ['perDrawing', 'Price per drawing'], ['perTable', 'Price per table'], ['perGraph', 'Price per graph'], ['perSimpleDiagram', 'Price per simple diagram'], ['perDetailedDiagram', 'Price per detailed diagram']]}/>
export const AdminSettings = () => <KV title="Settings" load={api.admin.settings} save={api.admin.setSettings} fields={[['maxActive', 'Maximum active orders'], ['minDays', 'Minimum days before delivery'], ['minOrder', 'Minimum order amount (₹)']]}/>
