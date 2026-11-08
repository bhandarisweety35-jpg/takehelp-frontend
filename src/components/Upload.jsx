import { useState } from 'react'
import { upload } from '../services/api'
const OK = ['application/pdf','image/jpeg','image/png'], MAX = 10 * 1024 * 1024
export default function Upload({ id, label, value, onChange }) {
  const [p, setP] = useState(0), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  async function pick(e) {
    const f = e.target.files[0]; if (!f) return; setErr('')
    if (!OK.includes(f.type)) return setErr('Only PDF, JPG, JPEG or PNG files are allowed.')
    if (f.size > MAX) return setErr('File is larger than 10 MB.')
    setBusy(true); setP(0)
    try { const d = await upload(f, setP); onChange({ fileId: d.fileId, name: f.name, size: f.size }) }
    catch (x) { setErr(x.message) } finally { setBusy(false); e.target.value = '' }
  }
  return <div className="field"><label htmlFor={id}>{label}</label>
    {!value && <input id={id} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={pick} disabled={busy}/>}
    {busy && <progress value={p} max="100" aria-label="Upload progress"/>}
    {value && <p className="file">✓ {value.name} ({(value.size/1024).toFixed(0)} KB) <button type="button" className="link" onClick={() => onChange(null)}>Remove</button></p>}
    <p role="alert" className="err">{err}</p></div>
}
