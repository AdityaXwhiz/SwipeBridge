import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('cp_token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/auth/me')
        .then(r => setUser(r.data.user))
        .catch(() => localStorage.removeItem('cp_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password })
    const { token, user } = r.data
    localStorage.setItem('cp_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  const signup = async (name, email, password) => {
    const r = await api.post('/auth/signup', { name, email, password })
    const { token, user } = r.data
    localStorage.setItem('cp_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('cp_token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const forgotPassword = async (email) => {
    return api.post('/auth/forgot-password', { email })
  }

  const googleAuth = async (credential) => {
    const r = await api.post('/auth/google', { credential })
    const { token, user } = r.data
    localStorage.setItem('cp_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, forgotPassword, googleAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
