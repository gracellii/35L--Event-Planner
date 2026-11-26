import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

// Any component can call useAuth() to get { user, loading, login, logout }.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
