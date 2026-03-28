import { createContext, useContext, useState, useEffect } from 'react'
import { registerUser, loginUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount — check localStorage for existing session
  useEffect(() => {
    const savedToken = localStorage.getItem('smartcrop_token')
    const savedUser = localStorage.getItem('smartcrop_user')
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('smartcrop_token')
        localStorage.removeItem('smartcrop_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (phone, password) => {
    const result = await loginUser({ phone, password })
    localStorage.setItem('smartcrop_token', result.token)
    localStorage.setItem('smartcrop_user', JSON.stringify(result.user))
    setToken(result.token)
    setUser(result.user)
    return result
  }

  const register = async (phone, password, name) => {
    const result = await registerUser({ phone, password, name })
    localStorage.setItem('smartcrop_token', result.token)
    localStorage.setItem('smartcrop_user', JSON.stringify(result.user))
    setToken(result.token)
    setUser(result.user)
    return result
  }

  const logout = () => {
    localStorage.removeItem('smartcrop_token')
    localStorage.removeItem('smartcrop_user')
    setToken(null)
    setUser(null)
  }

  const updateUserName = (name) => {
    if (user) {
      const updated = { ...user, name }
      setUser(updated)
      localStorage.setItem('smartcrop_user', JSON.stringify(updated))
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token,
      login,
      register,
      logout,
      updateUserName,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
