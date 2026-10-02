import { createContext, useContext, useState, useEffect } from 'react'
import { api, authAPI, profileAPI } from '../api/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('mindflip-token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await profileAPI.getProfile()
          setUser(res.data)
        } catch (err) {
          console.error("Auth init failed:", err)
          localStorage.removeItem('mindflip-token')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [token])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { access_token, user } = res.data
    localStorage.setItem('mindflip-token', access_token)
    setToken(access_token)
    setUser(user)
    return user
  }

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password })
    const { access_token, user } = res.data
    localStorage.setItem('mindflip-token', access_token)
    setToken(access_token)
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('mindflip-token')
    setToken(null)
    setUser(null)
  }

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
