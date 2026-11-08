import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import Upload from '../components/Upload'
import { Alert, money } from '../components/Common'
const QTY = [['drawings', 'Drawings'], ['tables', 'Tables'], ['graphs', 'Graphs'], ['simpleDiagrams', 'Simple diagrams'], ['detailedDiagrams', 'Detailed diagrams']]
export default function Order() {
  const [sp] = useSearchParams(), nav = useNavigate()
  const [cfg, setCfg] = useState(null), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [quote, setQuote] = useState(null), [qerr, setQerr] = useState('')
  const [f, setF] = useState({ serviceType: sp.get('type') || 'Record', subject: '', title: '', dueDate: '', pages: 1, drawings: 0, tables: 0, graphs: 0, simpleDiagrams: 0, detailedDiagrams: 0, comments: '', sample: null, reference: null })
  useEffect(() => { api.config().then(setCfg).catch(e => setErr(e.message)) }, [])
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const minDate = cfg ? new Date(Date.now() + cfg.minDays * 864e5).toISOString().slice(0, 10) : ''
  const full = cfg && cfg.activeOrders >= cfg.maxActive
  const dateBad = f.dueDate && minDate && f.dueDate < minDate
  const payload = () => ({ ...f, pages: +f.pages, ...Object.fromEntries(QTY.map(([k]) => [k, +f[k] || 0])), sampleFileId: f.sample?.fileId, referenceFileId: f.reference?.fileId, sample: undefined, reference: undefined })
  useEffect(() => { // estimate comes from the backend only
    if (dateBad || !(+f.pages > 0)) return setQuote(null)
    const t = setTimeout(() => api.quote(payload()).then(q => { setQuote(q); setQerr('') }).catch(() => { setQuote(null); setQerr('Could not calculate the price right now.') }), 400)
    return () => clearTimeout(t)
  }, [f.serviceType, f.pages, f.drawings, f.tables, f.graphs, f.simpleDiagrams, f.detailedDiagrams, f.dueDate])
  async function submit(e) {
    e.preventDefault(); setErr('')
    if (!f.subject.trim()) return setErr('Please enter the subject name.')
    if (!f.dueDate || dateBad) return setErr('Orders must be submitted at least 6 days before the required delivery date.')
    setBusy(true)
    try { const o = await api.createOrder(payload()); nav(`/my-orders/${o.id}`) }
    catch (x) { setErr(x.status === 409 ? 'All 15 active slots are currently occupied. New orders are temporarily unavailable.' : x.status === 422 ? 'Orders must be submitted at least 6 days before the required delivery date.' : x.message) }
    finally { setBusy(false) }
  }
  return <section className="wrap narrow"><h1>New order</h1>
    {full && <Alert>All {cfg.maxActive} active slots are currently occupied. New orders are temporarily unavailable.</Alert>}
    <form onSubmit={submit} noValidate><fieldset className="card" disabled={full}><legend>Details</legend>
      <div className="field"><label htmlFor="st">Service type</label><select id="st" value={f.serviceType} onChange={set('serviceType')}><option value="Record">Record Writing</option><option value="Observation">Observation Writing</option><option value="Assignment">Assignment Writing</option></select></div>
      <div className="field"><label htmlFor="sb">Subject name</label><input id="sb" value={f.subject} onChange={set('subject')} required/></div>
      {f.serviceType === 'Assignment' && <div className="field"><label htmlFor="ti">Assignment title or topic</label><input id="ti" value={f.title} onChange={set('title')}/></div>}
      <div className="two"><div className="field"><label htmlFor="dd">Delivery date</label><input id="dd" type="date" min={minDate} value={f.dueDate} onChange={set('dueDate')} aria-invalid={!!dateBad} aria-describedby="ddh"/>
        <p id="ddh" className={dateBad ? 'err' : 'hint'}>Orders must be submitted at least 6 days before the required delivery date.</p></div>
      <div className="field"><label htmlFor="pg">Number of pages</label><input id="pg" type="number" min="1" value={f.pages} onChange={set('pages')}/></div></div></fieldset>
    <fieldset className="card" disabled={full}><legend>Files (PDF, JPG, PNG)</legend>
      <Upload id="u1" label="Sample file" value={f.sample} onChange={v => setF(s => ({ ...s, sample: v }))}/>
      <Upload id="u2" label="Reference / subject PDF" value={f.reference} onChange={v => setF(s => ({ ...s, reference: v }))}/></fieldset>
    <fieldset className="card" disabled={full}><legend>Extras</legend><div className="qty">{QTY.map(([k, l]) => <div className="field" key={k}><label htmlFor={k}>{l}</label><input id={k} type="number" min="0" value={f[k]} onChange={set(k)}/></div>)}</div>
      <div className="field"><label htmlFor="cm">Additional instructions</label><textarea id="cm" rows="4" value={f.comments} onChange={set('comments')}/></div></fieldset>
    <div className="card sum"><p>Estimated price: <b>{quote ? money(quote.estimate) : '—'}</b></p><p className="hint">Estimate only. The final price is confirmed after review. Minimum order {cfg ? money(cfg.minOrder) : '₹100'}.</p><Alert>{qerr}</Alert>
      <Alert>{err}</Alert><button className="btn" disabled={busy || full}>{busy ? 'Submitting…' : 'Place order'}</button></div></form></section>
}
