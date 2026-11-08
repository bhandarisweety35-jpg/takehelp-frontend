const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
let token = sessionStorage.getItem('th_token')
export const setToken = t => { token = t; t ? sessionStorage.setItem('th_token', t) : sessionStorage.removeItem('th_token') }
let onExpired = () => {}
export const setOnExpired = f => { onExpired = f }
export class ApiError extends Error { constructor(m, status) { super(m); this.status = status } }
const FRIENDLY = { 400: 'Please check the details and try again.', 401: 'Your session has expired. Please log in again.', 403: "You don't have access to this page.", 404: 'We could not find that.', 409: 'That conflicts with an existing record.', 422: 'Some details are invalid.', 429: 'Too many attempts. Please wait a moment.' }
export async function request(path, { method = 'GET', body } = {}) {
  if (!BASE) throw new ApiError('The app is not connected to a server yet.', 0)
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'
  let res
  try { res = await fetch(BASE + path, { method, headers, credentials: 'include', body: body ? JSON.stringify(body) : undefined }) }
  catch { throw new ApiError('Server unavailable. Please try again shortly.', 0) }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && token) { setToken(null); onExpired() }
    const msg = (data && typeof data.message === 'string' && data.message.length < 200 && res.status < 500) ? data.message : (res.status >= 500 ? 'Something went wrong on our side. Please try again.' : FRIENDLY[res.status] || 'Request failed.')
    throw new ApiError(msg, res.status)
  }
  return data
}
export function upload(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!BASE) return reject(new ApiError('The app is not connected to a server yet.', 0))
    const fd = new FormData(); fd.append('file', file)
    const x = new XMLHttpRequest(); x.open('POST', BASE + '/api/uploads'); x.withCredentials = true
    if (token) x.setRequestHeader('Authorization', `Bearer ${token}`)
    x.upload.onprogress = e => e.lengthComputable && onProgress(Math.round(e.loaded / e.total * 100))
    x.onload = () => { try { const d = JSON.parse(x.responseText); x.status < 300 ? resolve(d) : reject(new ApiError('Upload failed. Please try again.', x.status)) } catch { reject(new ApiError('Upload failed. Please try again.', x.status)) } }
    x.onerror = () => reject(new ApiError('Upload failed. Check your connection.', 0))
    x.send(fd)
  })
}
export const api = {
  config: () => request('/api/config'),
  register: b => request('/api/auth/register', { method: 'POST', body: b }),
  login: b => request('/api/auth/login', { method: 'POST', body: b }),
  logout: () => request('/api/auth/logout', { method: 'POST' }).catch(() => {}),
  me: () => request('/api/auth/me'),
  quote: b => request('/api/orders/quote', { method: 'POST', body: b }),
  createOrder: b => request('/api/orders', { method: 'POST', body: b }),
  myOrders: () => request('/api/orders'),
  order: id => request(`/api/orders/${id}`),
  admin: {
    stats: () => request('/api/admin/stats'),
    orders: sort => request(`/api/admin/orders?sort=${sort}`),
    order: id => request(`/api/admin/orders/${id}`),
    update: (id, b) => request(`/api/admin/orders/${id}`, { method: 'PATCH', body: b }),
    pricing: () => request('/api/admin/pricing'),
    setPricing: b => request('/api/admin/pricing', { method: 'PUT', body: b }),
    settings: () => request('/api/admin/settings'),
    setSettings: b => request('/api/admin/settings', { method: 'PUT', body: b }),
  },
}
