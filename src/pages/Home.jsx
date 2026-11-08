import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
const SERVICES = [
  ['Record', 'Record Writing', 'Subject, delivery date, pages, sample and reference PDFs, plus drawings, tables, graphs and diagrams.'],
  ['Observation', 'Observation Writing', 'Same details as a record, written up as your observation book.'],
  ['Assignment', 'Assignment Writing', 'Subject, topic, pages, reference material and any diagrams, tables or graphs you need.']]
export default function Home() {
  const [cfg, setCfg] = useState(null), [err, setErr] = useState('')
  useEffect(() => { api.config().then(setCfg).catch(e => setErr(e.message)) }, [])
  const left = cfg ? cfg.maxActive - cfg.activeOrders : null
  return <>
    <section className="wrap hero">
      <div><p className="tag">For college students</p>
        <h1>Need help getting done with College work? You found this!</h1>
        <p className="lead">Submit your record, observation, or assignment requirements and let us handle the writing work.</p>
        <div className="row"><Link className="btn" to="/order">Get Started</Link><a className="btn ghost" href="#how">How It Works</a></div></div>
      <aside className="stack">
        <div className="card note"><h2>Plan ahead: 6-day rule!</h2>
          <p>Orders must be submitted at least <b>{cfg?.minDays ?? 6} days before the required delivery date.</b> Near dates can't be accepted. It keeps your work neat and complete.</p></div>
        <div className="card"><h2>Current capacity: {cfg ? `${cfg.activeOrders} / ${cfg.maxActive}` : '…'}</h2>
          <p>{err || (cfg ? (left > 0 ? `${left} slots currently available.` : 'All slots are currently occupied.') : 'Checking availability…')}</p></div>
      </aside></section>
    {cfg && <ul className="wrap facts"><li>Submit {cfg.minDays} days ahead</li><li>₹{cfg.minOrder} minimum order</li><li>{cfg.maxActive} active slots</li></ul>}
    <section className="wrap"><h2 className="big">What do you need written?</h2>
      <div className="grid3">{SERVICES.map(([t, n, d]) => <article className="card" key={t}><h3>{n}</h3><p>{d}</p><Link className="btn" to={`/order?type=${t}`}>Get Started</Link></article>)}</div></section>
    <section id="how" className="wrap"><h2 className="big">How it works</h2>
      <ol className="steps"><li>Create an account and pick a service.</li><li>Upload your sample and reference files, then add quantities and instructions.</li><li>See the estimate. We confirm the final price after review.</li><li>Track your order under My Orders until it is completed.</li></ol></section></>
}
