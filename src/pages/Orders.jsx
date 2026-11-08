import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { Badge, Alert, money, fmt } from '../components/Common'
export function MyOrders() {
  const [rows, setRows] = useState(null), [err, setErr] = useState('')
  useEffect(() => { api.myOrders().then(d => setRows(d.orders)).catch(e => setErr(e.message)) }, [])
  return <section className="wrap"><h1>My orders</h1><Alert>{err}</Alert>
    {rows && !rows.length && <p>No orders yet. <Link to="/order">Start your first order</Link>.</p>}
    <div className="grid3">{rows?.map(o => <Link key={o.id} to={`/my-orders/${o.id}`} className="card olink"><Badge status={o.status}/><h3>{o.subject}</h3>
      <p>#{o.id} · {o.serviceType}</p><p>Submitted {fmt(o.createdAt)} · Due {fmt(o.dueDate)}</p><p>{o.pages} pages · Est. {money(o.estimate)} · Final {money(o.finalPrice)}</p>
      {o.adminMessage && <p className="note-msg">{o.adminMessage}</p>}</Link>)}</div></section>
}
export function OrderDetail() {
  const { id } = useParams(), [o, setO] = useState(null), [err, setErr] = useState('')
  useEffect(() => { api.order(id).then(setO).catch(e => setErr(e.message)) }, [id])
  if (err) return <section className="wrap"><Alert>{err}</Alert></section>
  if (!o) return <p className="wrap">Loading…</p>
  const rows = [['Service', o.serviceType], ['Subject', o.subject], ['Topic', o.title], ['Submitted', fmt(o.createdAt)], ['Delivery date', fmt(o.dueDate)], ['Pages', o.pages], ['Drawings', o.drawings], ['Tables', o.tables], ['Graphs', o.graphs], ['Simple diagrams', o.simpleDiagrams], ['Detailed diagrams', o.detailedDiagrams], ['Estimated price', money(o.estimate)], ['Final price', money(o.finalPrice)], ['Instructions', o.comments]]
  return <section className="wrap narrow"><Link to="/my-orders">Back to orders</Link><h1>Order #{o.id} <Badge status={o.status}/></h1>
    {o.adminMessage && <p className="card note">{o.adminMessage}</p>}
    <dl className="card dl">{rows.filter(r => r[1] !== undefined && r[1] !== null && r[1] !== '').map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      {o.files?.length > 0 && <div><dt>Files</dt><dd>{o.files.map(f => <span key={f.id} className="file">{f.name}</span>)}</dd></div>}</dl></section>
}
