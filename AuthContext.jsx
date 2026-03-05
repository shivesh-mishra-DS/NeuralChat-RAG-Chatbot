/**
 * context/AuthContext.jsx
 * Global auth state: token, username, login(), logout()
 */
import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Initialise from localStorage so the session survives a page refresh
  const [token,    setToken]    = useState(() => localStorage.getItem('token')    || null)
  const [username, setUsername] = useState(() => localStorage.getItem('username') || null)

  const login = useCallback((newToken, newUsername) => {
    localStorage.setItem('token',    newToken)
    localStorage.setItem('username', newUsername)
    setToken(newToken)
    setUsername(newUsername)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    setToken(null)
    setUsername(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, username, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

// Convenience hook
export function useAuth() {
  return useContext(AuthContext)
}
