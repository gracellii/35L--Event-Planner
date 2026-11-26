import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

// Returns { user, loading, login, logout }
export function useAuth() {
  return useContext(AuthContext)
}
