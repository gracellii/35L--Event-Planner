// Keeps track of who is logged in. Read it from components with useAuth()
// (in useAuth.js).

import { useEffect, useState, useCallback } from 'react';
import { api } from './api.js';
import { AuthContext } from './useAuth.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On page load, ask the server whether our cookie is still a valid session
  useEffect(() => {
    api
      .me()
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user } = await api.login({ email, password });
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}
