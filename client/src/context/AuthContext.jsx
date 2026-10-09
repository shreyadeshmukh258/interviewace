import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('ia_token'));

  const logout = useCallback(() => {
    localStorage.removeItem('ia_token');
    setUser(null);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('ia_token')) return;
    api.get('/auth/me').then((r) => setUser(r.user)).catch(logout).finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener('ia:logout', logout);
    return () => window.removeEventListener('ia:logout', logout);
  }, [logout]);

  const authenticate = useCallback(async (path, payload) => {
    const r = await api.post(path, payload);
    localStorage.setItem('ia_token', r.token);
    setUser(r.user);
    return r.user;
  }, []);

  const value = useMemo(
    () => ({
      user, loading, setUser, logout,
      login: (d) => authenticate('/auth/login', d),
      register: (d) => authenticate('/auth/register', d),
      resetPassword: (token, password) => authenticate(`/auth/reset-password/${token}`, { password }),
    }),
    [user, loading, logout, authenticate]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
