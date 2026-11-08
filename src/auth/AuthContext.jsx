import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, setToken, setOnExpired } from '../services/api'
const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false), [expired, setExpired] = useState(false)
  useEffect(() => { setOnExpired(() => { setUser(null); setExpired(true) }); api.me().then(d => setUser(d.user)).catch(() => {}).finally(() => setReady(true)) }, [])
  const signIn = useCallback(async (fn, body) => { const d = await fn(body); setToken(d.token || null); setUser(d.user); setExpired(false) }, [])
  const value = { user, ready, expired,
    login: b => signIn(api.login, b), register: b => signIn(api.register, b),
    logout: async () => { await api.logout(); setToken(null); setUser(null) } }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
