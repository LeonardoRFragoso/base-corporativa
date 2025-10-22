import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { api } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      // You could verify the token here with the backend if needed
      setUser({ username: 'user' }) // Placeholder, ideally get from token or API
    }
    setInitialized(true)
  }, [])

  async function login(username, password) {
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login/', { username, password })
      console.log('Login response:', res.data) // Debug log
      
      if (res.data.access && res.data.refresh) {
        localStorage.setItem('access_token', res.data.access)
        localStorage.setItem('refresh_token', res.data.refresh)
        setUser({ username })
        return true
      } else {
        console.error('Invalid response format:', res.data)
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const value = useMemo(() => ({ 
    user, 
    login, 
    logout, 
    loading, 
    initialized,
    isAuthenticated: !!user 
  }), [user, loading, initialized])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
